"""Stage 1 — multi-source candidate retrieval + Reciprocal Rank Fusion.

Each generator proposes a ranked list of offerIds by its OWN signal (content, semantic ANN, CF,
popularity). RRF fuses the lists by RANK into one candidate pool. This decides *which* offers are
considered — not their final order (that's scoring.py). Fusing by rank (not raw score) lets us
combine incomparable signals (cosine vs cf logit vs view count) without normalizing them.

At ~117 offers the pool is effectively the whole catalog, so retrieval mostly guarantees no
source's good picks are hidden by another (e.g. a strong-semantic offer that content ranked low);
the narrowing only bites at scale. The async generators are run in parallel via asyncio.gather.
"""

import asyncio
import logging
from collections import defaultdict

log = logging.getLogger("ml-service")


def rrf_merge(ranked_lists: list[list[str]], k: int, limit: int) -> list[str]:
    """Reciprocal Rank Fusion: RRF(o) = Σ_lists 1/(k + rank), rank 1-based per list.

    Returns offerIds sorted by fused score desc, tie-broken by id for determinism, truncated to
    `limit`. An offer appearing high in several lists beats one ranked top in a single list.
    """
    scores: dict[str, float] = defaultdict(float)
    for lst in ranked_lists:
        for rank, oid in enumerate(lst):
            scores[oid] += 1.0 / (k + rank + 1)  # +1 → 1-based rank
    ordered = sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))
    return [oid for oid, _ in ordered[:limit]]


async def retrieve(
    *,
    content_candidates: list[str],
    student_vector: list[float] | None,
    qdrant,
    cf_model,
    feature_service,
    student_id: str,
    settings,
) -> list[str]:
    """Run the enabled generators in parallel and RRF-merge them into the candidate pool.

    `content_candidates` are already ranked by content score (Nest sends them sorted), so they
    enter RRF as the content source. Generators that have nothing to offer (no student vector, no
    CF model, empty popularity) simply contribute no list.
    """
    from app.services.qdrant_service import OFFERS  # lazy: keeps rrf_merge importable without qdrant_client

    limit = settings.retrieval_limit
    lists: list[list[str]] = []

    # Content source — Nest's top-K, already content-ranked.
    if content_candidates:
        lists.append(content_candidates)

    # I/O generators run concurrently.
    async def semantic() -> list[str]:
        if student_vector is None:
            return []
        hits = await qdrant.search(OFFERS, student_vector, limit)
        return [oid for oid, _ in hits]

    async def popularity() -> list[str]:
        return await feature_service.popularity_candidates(student_id, limit)

    sem_list, pop_list = await asyncio.gather(semantic(), popularity())
    if sem_list:
        lists.append(sem_list)
    if pop_list:
        lists.append(pop_list)

    # CF source — sync model predict; ready==False (no artifact) → contributes nothing.
    if cf_model is not None and getattr(cf_model, "ready", False):
        cf_list = cf_model.top_offers(student_id, limit)
        if cf_list:
            lists.append(cf_list)

    # Hybrid dense+sparse: scaffolded; needs a Qdrant re-index to enable (see plan).
    if settings.enable_hybrid_sparse:
        log.debug("enable_hybrid_sparse set but sparse vectors not indexed yet — skipping")

    return rrf_merge(lists, settings.rrf_k, limit)
