"""POST /recommend/jobs — toggle-gated by reco_pipeline_advanced.

OFF (M6): look up the student's stored vector, cosine it against Nest's content candidates,
         return semanticScore with finalMlScore=0 → Nest blends 0.6*content + 0.4*semantic.
ON  (M7): multi-source retrieval (content + semantic ANN + CF + popularity) → RRF → 3-signal
         blend → MMR + slate; return the fused finalMlScore>0 (Nest uses it directly). Flip the
         env flag + recompute to compare the two techniques.
"""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request

from app.config import get_settings
from app.models.embedder import cosine
from app.schemas.requests import RecommendJobsRequest, RecommendUsersRequest
from app.schemas.responses import (
    MlOfferScore,
    RecommendJobsResponse,
    RecommendUsersResponse,
)
from app.security import require_internal_token
from app.services import retrieval
from app.services.qdrant_service import OFFERS, STUDENTS
from app.services.reranking import OfferMeta, apply_slate, mmr_rerank, pin_urgent
from app.services.scoring import SignalScores, blend

router = APIRouter()
log = logging.getLogger("ml-service")

_FINAL_FLOOR = 1e-4  # keep finalMlScore strictly > 0 so Nest trusts the sidecar's fused score


@router.post(
    "/recommend/jobs",
    response_model=RecommendJobsResponse,
    dependencies=[Depends(require_internal_token)],
)
async def recommend_jobs(req: RecommendJobsRequest, request: Request) -> RecommendJobsResponse:
    settings = get_settings()
    state = request.app.state
    candidate_ids = [c.offerId for c in req.contentCandidates]
    if not candidate_ids:
        return RecommendJobsResponse(offers=[])

    student_vecs = await state.qdrant.retrieve_vectors(STUDENTS, [req.studentId])
    student_vec = student_vecs.get(req.studentId)

    if not settings.reco_pipeline_advanced:
        return await _simple_jobs(state, candidate_ids, student_vec)
    return await _advanced_jobs(req, state, settings, candidate_ids, student_vec)


async def _simple_jobs(state, candidate_ids: list[str], student_vec) -> RecommendJobsResponse:
    """M6 path. Cold-start (no student vector) → empty → Nest content-only."""
    if student_vec is None:
        return RecommendJobsResponse(offers=[])
    offer_vecs = await state.qdrant.retrieve_vectors(OFFERS, candidate_ids)
    offers = [
        MlOfferScore(
            offerId=oid, semanticScore=cosine(student_vec, offer_vecs[oid]),
            cfScore=0.0, finalMlScore=0.0,
        )
        for oid in candidate_ids
        if oid in offer_vecs
    ]
    return RecommendJobsResponse(offers=offers)


async def _advanced_jobs(req, state, settings, candidate_ids, student_vec) -> RecommendJobsResponse:
    content_score = {c.offerId: c.contentScore for c in req.contentCandidates}
    cf_model = getattr(state, "cf", None)

    # Stage 1 — multi-source retrieval + RRF.
    pool = await retrieval.retrieve(
        content_candidates=candidate_ids, student_vector=student_vec,
        qdrant=state.qdrant, cf_model=cf_model, feature_service=state.features,
        student_id=req.studentId, settings=settings,
    )
    if not pool:
        return RecommendJobsResponse(offers=[])

    full = await state.qdrant.retrieve_full(OFFERS, pool)
    vectors = {oid: full[oid]["vector"] for oid in pool if oid in full and full[oid]["vector"]}
    cf_scores = cf_model.predict(req.studentId, pool) if (cf_model and cf_model.ready) else {}
    n = await state.features.interaction_count(req.studentId)
    pop_list = await state.features.popularity_candidates(req.studentId, settings.retrieval_limit)
    pop_rank = {oid: i for i, oid in enumerate(pop_list)}
    pop_n = max(1, len(pop_list))

    weights = dict(
        w_content=settings.w_content, w_semantic=settings.w_semantic,
        w_cf=settings.w_cf, w_popularity=settings.w_popularity,
        cf_midpoint=settings.cf_ramp_midpoint, cf_steepness=settings.cf_ramp_steepness,
    )

    # Stage 2 — blend over PRESENT signals only. None = not computed (unknown) → excluded so the
    # candidate isn't punished for a signal its source didn't provide; a real 0.0 still counts.
    sem_by: dict[str, float] = {}
    scored: list[tuple[str, float]] = []
    for oid in pool:
        vec = vectors.get(oid)
        sem = cosine(student_vec, vec) if (student_vec is not None and vec is not None) else None
        sem_by[oid] = sem if sem is not None else 0.0   # response field is a plain float
        pop = (max(0.0, 1.0 - pop_rank[oid] / pop_n)) if oid in pop_rank else None
        sig = SignalScores(
            content=content_score.get(oid),   # None when not in Nest's content candidates
            semantic=sem,                      # None only for a cold student (no stored vector)
            cf=cf_scores.get(oid),             # None when no CF model or the pair is cold
            popularity=pop,                    # None when not computed for this offer
        )
        scored.append((oid, blend(sig, n, **weights)))
    scored.sort(key=lambda kv: -kv[1])

    # Stage 3 — MMR diversity + slate rules give the ORDER; the blend relevance gives the MAGNITUDE.
    # (Using the raw MMR objective as the score is wrong — it can go negative and collapse to ties.)
    blend_by = dict(scored)
    reranked = mmr_rerank(scored, vectors, settings.mmr_lambda, settings.mmr_pool) if settings.enable_mmr else scored
    order = [oid for oid, _ in reranked]
    meta = _build_meta(full)
    order = apply_slate(
        order, meta,
        max_per_company=settings.slate_max_per_company, company_window=settings.slate_company_window,
        max_per_domain=settings.slate_max_per_domain, domain_window=settings.slate_domain_window,
    )
    order = pin_urgent(order, meta, settings.deadline_pin_days, max_pins=3)

    # Stage 4 — response. finalMlScore = blend relevance, forced just-barely non-increasing along
    # the final order (tiny epsilon) so Nest's sort reproduces the pipeline order while keeping the
    # relevance magnitude intact for the displayed match %.
    offers: list[MlOfferScore] = []
    prev = 1.0
    for oid in order:
        base = max(_FINAL_FLOOR, blend_by.get(oid, _FINAL_FLOOR))
        val = max(_FINAL_FLOOR, min(base, prev - 1e-9))
        offers.append(MlOfferScore(
            offerId=oid, semanticScore=sem_by.get(oid, 0.0),
            cfScore=cf_scores.get(oid, 0.0), finalMlScore=val,
        ))
        prev = val
    return RecommendJobsResponse(offers=offers)


def _build_meta(full: dict) -> dict:
    """OfferMeta (company / domain / days-to-deadline) from Qdrant payloads, for slate rules."""
    now = datetime.now(timezone.utc)
    meta: dict[str, OfferMeta] = {}
    for oid, rec in full.items():
        p = rec.get("payload") or {}
        days = None
        dl = p.get("deadline")
        if dl:
            try:
                d = datetime.fromisoformat(dl)
                if d.tzinfo is None:
                    d = d.replace(tzinfo=timezone.utc)
                days = (d - now).total_seconds() / 86400.0
            except (ValueError, TypeError):
                days = None
        meta[oid] = OfferMeta(company=p.get("company"), domain=p.get("domain"), deadline_days=days)
    return meta


@router.post(
    "/recommend/users",
    response_model=RecommendUsersResponse,
    dependencies=[Depends(require_internal_token)],
)
async def recommend_users(req: RecommendUsersRequest) -> RecommendUsersResponse:
    # Recruiter side ships in M9; valid empty shape for now.
    return RecommendUsersResponse(students=[])
