"""CF interaction matrix — turns EVERY behavioral signal into a weighted (student × offer)
confidence matrix for LightFM / ALS.

Signals (all keyed on User.id = the recommendation studentId):
  - Application  → strongest positive (status-scaled). NB: Application.studentId is a
    StudentProfile.id, so we join StudentProfile to recover userId.
  - OfferBookmark → strong (active) / weak (later removed).
  - OfferView    → base × dwell factor (log1p of total dwell) × position factor (a click at a
    DEEPER rank overcame more position bias → stronger signal).
  - OfferImpression with no view → a soft negative ("shown, skipped") that dampens confidence.

The weighting function is pure and unit-tested; the SQL + scipy matrix build are lazy so this
module imports without asyncpg/scipy. Used by trainer/train_lightfm.py and train_als.py.
"""

import math
from dataclasses import dataclass

# Signal weights (relative confidence contributions).
W_APPLY = 5.0
W_BOOKMARK = 3.0
W_BOOKMARK_REMOVED = 0.5
W_VIEW = 1.0
W_SKIP = 0.5
# Shape params.
DWELL_REF_S = 30.0      # ~30s of reading ≈ full dwell credit
POS_REF = 20.0          # position-bias normalization
POS_BONUS_CAP = 0.5     # deepest-position views worth at most +50%
DWELL_CAP = 1.5


@dataclass(frozen=True)
class PairSignals:
    view_count: int = 0
    total_dwell_ms: int = 0
    best_position: int | None = None          # lowest (top-most) rank the offer was clicked at
    bookmarked_active: bool = False
    bookmarked_removed: bool = False
    application_status: str | None = None      # None = never applied
    impressions_without_view: int = 0


def _status_factor(status: str | None) -> float:
    if status is None:
        return 0.0
    s = status.upper()
    if s in ("ACCEPTED", "HIRED", "INTERVIEW", "INTERVIEWING", "OFFER"):
        return 1.0
    if s in ("REJECTED", "DECLINED", "WITHDRAWN"):
        return 0.8     # they still chose to apply — strong intent regardless of outcome
    return 0.9         # PENDING / submitted / unknown


def interaction_weight(s: PairSignals) -> float:
    """Confidence weight (≥0) for one (student, offer) pair, fused from all signals."""
    dwell_s = s.total_dwell_ms / 1000.0
    dwell_factor = min(DWELL_CAP, 0.5 + 0.5 * math.log1p(dwell_s) / math.log1p(DWELL_REF_S))
    if s.best_position is not None:
        position_factor = 1.0 + min(POS_BONUS_CAP, max(0, s.best_position - 1) / POS_REF)
    else:
        position_factor = 1.0

    view_component = W_VIEW * dwell_factor * position_factor if s.view_count > 0 else 0.0
    apply_component = W_APPLY * _status_factor(s.application_status)
    if s.bookmarked_active:
        book_component = W_BOOKMARK
    elif s.bookmarked_removed:
        book_component = W_BOOKMARK_REMOVED
    else:
        book_component = 0.0
    skip_penalty = W_SKIP * (min(s.impressions_without_view, 5) / 5.0)

    return max(0.0, apply_component + book_component + view_component - skip_penalty)


# ── SQL + matrix build (lazy deps) ───────────────────────────────────────────

_INTERACTIONS_SQL = """
WITH v AS (
    SELECT "studentId" AS uid, "offerId" AS oid,
           count(*) AS views, COALESCE(SUM("durationMs"), 0) AS dwell_ms, MIN("position") AS best_pos
    FROM "OfferView" GROUP BY 1, 2),
b AS (
    SELECT "studentId" AS uid, "offerId" AS oid,
           bool_or("removedAt" IS NULL) AS active, bool_or("removedAt" IS NOT NULL) AS removed
    FROM "OfferBookmark" GROUP BY 1, 2),
a AS (
    SELECT sp."userId" AS uid, ap."offerId" AS oid, MIN(ap.status::text) AS status
    FROM "Application" ap JOIN "StudentProfile" sp ON sp.id = ap."studentId"
    WHERE ap."deletedAt" IS NULL GROUP BY 1, 2),
imp AS (
    SELECT "studentId" AS uid, "offerId" AS oid, count(*) AS impressions
    FROM "OfferImpression" GROUP BY 1, 2),
keys AS (
    SELECT uid, oid FROM v UNION SELECT uid, oid FROM b
    UNION SELECT uid, oid FROM a UNION SELECT uid, oid FROM imp)
SELECT k.uid AS student_id, k.oid AS offer_id,
       COALESCE(v.views, 0) AS view_count, COALESCE(v.dwell_ms, 0) AS total_dwell_ms, v.best_pos AS best_position,
       COALESCE(b.active, false) AS bookmarked_active, COALESCE(b.removed, false) AS bookmarked_removed,
       a.status AS application_status, COALESCE(imp.impressions, 0) AS impressions
FROM keys k
LEFT JOIN v ON v.uid = k.uid AND v.oid = k.oid
LEFT JOIN b ON b.uid = k.uid AND b.oid = k.oid
LEFT JOIN a ON a.uid = k.uid AND a.oid = k.oid
LEFT JOIN imp ON imp.uid = k.uid AND imp.oid = k.oid
"""


def _row_to_signals(row) -> PairSignals:
    impressions = row["impressions"] or 0
    views = row["view_count"] or 0
    return PairSignals(
        view_count=views,
        total_dwell_ms=row["total_dwell_ms"] or 0,
        best_position=row["best_position"],
        bookmarked_active=row["bookmarked_active"],
        bookmarked_removed=row["bookmarked_removed"],
        application_status=row["application_status"],
        impressions_without_view=max(0, impressions - views),
    )


_OFFER_FEATURES_SQL = """
SELECT o.id AS offer_id, o.domain,
       COALESCE(array_agg(sk.name) FILTER (WHERE sk.name IS NOT NULL), '{}') AS skills
FROM "Offer" o
LEFT JOIN "SkillRequirement" sr ON sr."offerId" = o.id
LEFT JOIN "Skill" sk ON sk.id = sr."skillId"
GROUP BY o.id
"""

_STUDENT_FEATURES_SQL = """
SELECT sp."userId" AS student_id, sp."preferredDomains" AS domains,
       COALESCE((SELECT array_agg(sk.name) FROM "SkillAssignment" sa
                 JOIN "Skill" sk ON sk.id = sa."skillId"
                 WHERE sa."studentProfileId" = sp.id), '{}') AS skills
FROM "StudentProfile" sp
"""


async def fetch_interactions(pool) -> list:
    """Returns asyncpg rows from _INTERACTIONS_SQL (one per (student, offer) with any signal)."""
    async with pool.acquire() as con:
        return await con.fetch(_INTERACTIONS_SQL)


async def fetch_offer_features(pool) -> dict[str, list[str]]:
    """offerId → feature tokens (domain + skills) for LightFM hybrid mode."""
    async with pool.acquire() as con:
        rows = await con.fetch(_OFFER_FEATURES_SQL)
    return {r["offer_id"]: _tokens(r["domain"], r["skills"]) for r in rows}


async def fetch_student_features(pool) -> dict[str, list[str]]:
    """studentId (User.id) → feature tokens (preferred domains + skills)."""
    async with pool.acquire() as con:
        rows = await con.fetch(_STUDENT_FEATURES_SQL)
    feats = {}
    for r in rows:
        domains = list(r["domains"] or [])
        toks = [f"domain:{d}" for d in domains] + [f"skill:{s}" for s in (r["skills"] or [])]
        feats[r["student_id"]] = toks
    return feats


def _tokens(domain, skills) -> list[str]:
    toks = []
    if domain:
        toks.append(f"domain:{domain}")
    toks += [f"skill:{s}" for s in (skills or [])]
    return toks


def build_matrix(rows):
    """Build a CSR confidence matrix + id↔index maps. Lazy scipy import (training-only dep)."""
    from scipy.sparse import csr_matrix  # lazy: only needed at train time

    student_ids = sorted({r["student_id"] for r in rows})
    offer_ids = sorted({r["offer_id"] for r in rows})
    s_idx = {sid: i for i, sid in enumerate(student_ids)}
    o_idx = {oid: i for i, oid in enumerate(offer_ids)}

    data, rs, cs = [], [], []
    for r in rows:
        w = interaction_weight(_row_to_signals(r))
        if w > 0:
            rs.append(s_idx[r["student_id"]])
            cs.append(o_idx[r["offer_id"]])
            data.append(w)
    mat = csr_matrix((data, (rs, cs)), shape=(len(student_ids), len(offer_ids)))
    return mat, student_ids, offer_ids
