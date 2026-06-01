"""X-Internal-Token guard. Used as a FastAPI dependency on every route; the token
must match the backend's ML_INTERNAL_TOKEN (the sidecar is never public)."""

from fastapi import Header, HTTPException, status

from app.config import get_settings


async def require_internal_token(x_internal_token: str | None = Header(default=None)) -> None:
    if x_internal_token != get_settings().ml_internal_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid internal token",
        )
