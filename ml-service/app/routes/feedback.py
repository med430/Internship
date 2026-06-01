"""POST /feedback — backend fires this opportunistically; response is ignored. The
durable event source is the NeonDB tables, so M6 just acks. Becomes a Redis-stream
push + cache invalidation once a serving cache exists (deferred)."""

from fastapi import APIRouter, Depends

from app.schemas.requests import FeedbackRequest
from app.schemas.responses import FeedbackResponse
from app.security import require_internal_token

router = APIRouter()


@router.post(
    "/feedback",
    response_model=FeedbackResponse,
    dependencies=[Depends(require_internal_token)],
)
async def feedback(req: FeedbackRequest) -> FeedbackResponse:
    return FeedbackResponse(ok=True)
