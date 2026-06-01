"""POST /recommend/jobs (+ /recommend/users stub) — the core scoring call.

Called once per student during the backend recompute (ComputeRecommendationsHandler
→ ScoringService → IMlClient.recommendJobs). Phase 1: look up the student's stored
vector (the worker already embedded it), cosine it against each candidate offer's stored
vector → semanticScore. cfScore/finalMlScore stay 0 so the backend does the
0.6*content + 0.4*semantic blend. No live embedding here — the worker owns the text.
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
from app.services.qdrant_service import OFFERS, STUDENTS

router = APIRouter()


@router.post(
    "/recommend/jobs",
    response_model=RecommendJobsResponse,
    dependencies=[Depends(require_internal_token)],
)
async def recommend_jobs(req: RecommendJobsRequest, request: Request) -> RecommendJobsResponse:
    candidate_ids = [c.offerId for c in req.contentCandidates]
    if not candidate_ids:
        return RecommendJobsResponse(offers=[])

    qdrant = request.app.state.qdrant
    # Cold-start: student not embedded yet (new/changed <5 min ago) → no semantic signal this
    # run. Backend falls to content-only; self-heals on the next worker sweep + recompute.
    student_vecs = await qdrant.retrieve_vectors(STUDENTS, [req.studentId])
    student_vec = student_vecs.get(req.studentId)
    if student_vec is None:
        return RecommendJobsResponse(offers=[])

    offer_vecs = await qdrant.retrieve_vectors(OFFERS, candidate_ids)

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
