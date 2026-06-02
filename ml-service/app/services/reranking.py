"""Stage 3 — re-ranking: MMR diversity + slate rules.

MMR trades relevance for diversity so the top of the feed isn't five near-identical offers.
Slate rules then enforce display constraints (no company/domain flooding, urgent deadlines
floated up). Pure functions (cosine in stdlib, no numpy) so they unit-test on any host.

The MMR value each offer earns becomes its `finalMlScore` (greedy selection makes the values
non-increasing, so when Nest sorts by finalScore it reproduces this diversity-aware order — that
is how the re-rank survives the score-based persistence).
"""

import math
from collections import defaultdict
from dataclasses import dataclass

import numpy as np


def _cosine(a: list[float], b: list[float]) -> float:
    """Reference cosine (used by tests). Production MMR uses the vectorized path below."""
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na > 0 and nb > 0 else 0.0


def mmr_rerank(
    scored: list[tuple[str, float]],
    vectors: dict[str, list[float]],
    lam: float,
    pool: int,
) -> list[tuple[str, float]]:
    """Maximal Marginal Relevance over the top `pool` by relevance — numpy-vectorized.

    scored: (offerId, relevance) sorted by relevance desc. Returns (offerId, mmr_score) in
    selection order; the `pool` head is diversified, the tail keeps its relevance order but is
    pushed strictly below the head so the overall order is preserved.

    Pure-Python cosine here was O(pool²·dim) and cost ~2s/call at 1024 dims, which serialized the
    concurrent recompute and blew the client timeout. We precompute the cosine similarity matrix
    once (one matmul) and run a vectorized greedy selection → milliseconds.
    """
    head = scored[:pool]
    tail = scored[pool:]
    n = len(head)
    selected: list[tuple[str, float]] = []

    if n > 0:
        ids = [oid for oid, _ in head]
        rels = np.array([r for _, r in head], dtype=np.float64)
        dim = next((len(vectors[o]) for o in ids if o in vectors and vectors[o] is not None), None)

        if dim is None:
            # No vectors to diversify on → keep relevance order.
            selected = [(ids[i], max(0.0, float(rels[i]))) for i in range(n)]
        else:
            mat = np.zeros((n, dim), dtype=np.float64)
            for i, oid in enumerate(ids):
                v = vectors.get(oid)
                if v is not None:
                    mat[i] = v
            norms = np.linalg.norm(mat, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            unit = mat / norms
            sim = unit @ unit.T                       # cosine similarity matrix (n×n)

            chosen = np.zeros(n, dtype=bool)
            max_sim = np.zeros(n, dtype=np.float64)    # max similarity to anything already chosen
            for _ in range(n):
                vals = lam * rels - (1.0 - lam) * max_sim
                vals[chosen] = -np.inf
                i = int(np.argmax(vals))
                chosen[i] = True
                selected.append((ids[i], max(0.0, float(vals[i]))))
                max_sim = np.maximum(max_sim, sim[:, i])

    # Tail sits below the lowest selected score, keeping its own relevance order.
    floor = selected[-1][1] if selected else 1.0
    for j, (oid, rel) in enumerate(tail):
        selected.append((oid, max(0.0, floor - (j + 1) * 1e-6)))
    return selected


@dataclass(frozen=True)
class OfferMeta:
    company: str | None
    domain: str | None
    deadline_days: float | None   # days until deadline; None = no deadline


def apply_slate(
    ordered: list[str],
    meta: dict[str, OfferMeta],
    *,
    max_per_company: int,
    company_window: int,
    max_per_domain: int,
    domain_window: int,
) -> list[str]:
    """Enforce diversity caps in the top windows. Offers that would breach a cap are deferred
    (appended after), not dropped. Order otherwise preserved."""
    kept: list[str] = []
    deferred: list[str] = []
    company_count: dict[str, int] = defaultdict(int)
    domain_count: dict[str, int] = defaultdict(int)

    for oid in ordered:
        m = meta.get(oid)
        pos = len(kept)
        comp = m.company if m else None
        dom = m.domain if m else None
        over_company = comp is not None and pos < company_window and company_count[comp] >= max_per_company
        over_domain = dom is not None and pos < domain_window and domain_count[dom] >= max_per_domain
        if over_company or over_domain:
            deferred.append(oid)
            continue
        kept.append(oid)
        if comp:
            company_count[comp] += 1
        if dom:
            domain_count[dom] += 1
    return kept + deferred


def pin_urgent(ordered: list[str], meta: dict[str, OfferMeta], pin_days: int, max_pins: int) -> list[str]:
    """Float up to `max_pins` soon-to-close offers (deadline within `pin_days`) to the front,
    preserving relative order on both sides."""
    urgent, rest = [], []
    for oid in ordered:
        m = meta.get(oid)
        d = m.deadline_days if m else None
        if d is not None and 0 <= d < pin_days and len(urgent) < max_pins:
            urgent.append(oid)
        else:
            rest.append(oid)
    return urgent + rest
