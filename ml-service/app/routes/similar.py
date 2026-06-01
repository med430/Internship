"""POST /similar/jobs — offer→offer similarity. Stub for M6 (backend doesn't call it
on the core path yet); real ANN lookup lands with the retrieval work in M7."""

from fastapi import APIRouter, Depends

from app.schemas.requests import SimilarJobsRequest
from app.schemas.responses import SimilarJobsResponse
from app.security import require_internal_token

router = APIRouter()


@router.post(
    "/similar/jobs",
    response_model=SimilarJobsResponse,
    dependencies=[Depends(require_internal_token)],
)
async def similar_jobs(req: SimilarJobsRequest) -> SimilarJobsResponse:
    return SimilarJobsResponse(offers=[])
