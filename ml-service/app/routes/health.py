"""GET /health — reachability probe. Hit by the backend admin "Check ML health"
button (POST /admin/recommendations/ml-health → IMlClient.health)."""

from fastapi import APIRouter, Request

from app.config import get_settings
from app.schemas.responses import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    loaded = ["embedder"] if getattr(request.app.state, "embedder", None) else []
    status = "ok" if loaded else "degraded"
    return HealthResponse(
        status=status,
        modelVersion=get_settings().model_version,
        modelsLoaded=loaded,
    )
