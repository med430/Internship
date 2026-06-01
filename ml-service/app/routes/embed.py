"""POST /embed — text → 1024-dim BGE-M3 vectors. Exposed for the backend/trainer
and for debugging; the worker embeds in-process rather than calling this."""

from fastapi import APIRouter, Depends, Request

from app.schemas.requests import EmbedRequest
from app.schemas.responses import EmbedResponse
from app.security import require_internal_token

router = APIRouter()


@router.post("/embed", response_model=EmbedResponse, dependencies=[Depends(require_internal_token)])
async def embed(req: EmbedRequest, request: Request) -> EmbedResponse:
    return EmbedResponse(embeddings=request.app.state.embedder.embed(req.texts))
