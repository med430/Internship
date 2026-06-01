"""POST /recommend/jobs (+ /recommend/users stub) — the core scoring call.

Called once per student during the backend recompute (ComputeRecommendationsHandler
→ ScoringService → IMlClient.recommendJobs). Phase 1: embed the student text, cosine
it against each candidate offer's stored vector → semanticScore. cfScore/finalMlScore
stay 0 so the backend does the 0.6*content + 0.4*semantic blend.
"""

from fastapi import APIRouter, Depends, Request

from app.models.embedder import cosine
from app.schemas.requests import RecommendJobsRequest, RecommendUsersRequest
from app.schemas.responses import (
    MlOfferScore,
    RecommendJobsResponse,
    RecommendUsersResponse,
)
from app.security import require_internal_token
from app.services.qdrant_service import OFFERS

router = APIRouter()


@router.post(
    "/recommend/jobs",
    response_model=RecommendJobsResponse,
    dependencies=[Depends(require_internal_token)],
)
async def recommend_jobs(req: RecommendJobsRequest, request: Request) -> RecommendJobsResponse:
    candidate_ids = list(req.contentScores.keys())
    if not candidate_ids:
        return RecommendJobsResponse(offers=[])

    student_vec = request.app.state.embedder.embed_one(req.studentText)
    offer_vecs = await request.app.state.qdrant.retrieve_vectors(OFFERS, candidate_ids)

    # Offers not yet in the index are omitted → backend treats them as no ML signal.
    offers = [
        MlOfferScore(
            offerId=oid,
            semanticScore=cosine(student_vec, offer_vecs[oid]),
            cfScore=0.0,
            finalMlScore=0.0,
        )
        for oid in candidate_ids
        if oid in offer_vecs
    ]
    return RecommendJobsResponse(offers=offers)


@router.post(
    "/recommend/users",
    response_model=RecommendUsersResponse,
    dependencies=[Depends(require_internal_token)],
)
async def recommend_users(req: RecommendUsersRequest) -> RecommendUsersResponse:
    # Recruiter side ships in M9; valid empty shape for now.
    return RecommendUsersResponse(students=[])
