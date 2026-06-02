"""Live feature reads for the serving pipeline: segment popularity (a retrieval generator + a
blend signal) and per-student interaction count `n` (drives the cf ramp). Reads the same NeonDB
the trainer does, via a small asyncpg pool created at startup (app/main.py lifespan).
"""

import logging

log = logging.getLogger("ml-service")

# Popularity = weighted engagement on active offers (apply ≫ bookmark ≫ view), newest-eligible.
_POPULARITY_SQL = """
SELECT o.id AS offer_id,
       COALESCE(v.cnt, 0) * 1 + COALESCE(b.cnt, 0) * 3 + COALESCE(a.cnt, 0) * 5 AS pop
FROM "Offer" o
LEFT JOIN (SELECT "offerId", count(*) cnt FROM "OfferView" GROUP BY 1) v ON v."offerId" = o.id
LEFT JOIN (SELECT "offerId", count(*) cnt FROM "OfferBookmark" WHERE "removedAt" IS NULL GROUP BY 1) b ON b."offerId" = o.id
LEFT JOIN (SELECT "offerId", count(*) cnt FROM "Application" WHERE "deletedAt" IS NULL GROUP BY 1) a ON a."offerId" = o.id
WHERE o."deletedAt" IS NULL
  AND (o."applicationDeadline" IS NULL OR o."applicationDeadline" > now())
ORDER BY pop DESC, o."createdAt" DESC
LIMIT $1
"""

# Distinct offers a student has engaged with (views ∪ active bookmarks ∪ applications).
_INTERACTION_COUNT_SQL = """
SELECT count(DISTINCT oid) AS n FROM (
    SELECT "offerId" AS oid FROM "OfferView" WHERE "studentId" = $1
    UNION SELECT "offerId" FROM "OfferBookmark" WHERE "studentId" = $1 AND "removedAt" IS NULL
    UNION SELECT ap."offerId" FROM "Application" ap
           JOIN "StudentProfile" sp ON sp.id = ap."studentId"
           WHERE sp."userId" = $1 AND ap."deletedAt" IS NULL
) t
"""


class FeatureService:
    def __init__(self, pool) -> None:
        self._pool = pool

    async def popularity_candidates(self, student_id: str, limit: int) -> list[str]:
        """Top active offers by popularity. Global for now (segment-aware is a later refinement)."""
        try:
            async with self._pool.acquire() as con:
                rows = await con.fetch(_POPULARITY_SQL, limit)
            return [r["offer_id"] for r in rows]
        except Exception as e:                     # popularity is best-effort — never break scoring
            log.warning("popularity query failed: %s", e)
            return []

    async def interaction_count(self, student_id: str) -> int:
        """`n` for the cf ramp: how warm this student is."""
        try:
            async with self._pool.acquire() as con:
                row = await con.fetchrow(_INTERACTION_COUNT_SQL, student_id)
            return int(row["n"]) if row else 0
        except Exception as e:
            log.warning("interaction-count query failed: %s", e)
            return 0
