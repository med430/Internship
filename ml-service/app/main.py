"""FastAPI entrypoint for the ML sidecar (uvicorn target, see Dockerfile).

Loads BGE-M3 once and bootstraps Qdrant collections at startup, then serves the
contract the NestJS backend calls. No DB pool here — only the trainer reads NeonDB.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import get_settings
from app.models.embedder import Embedder
from app.routes import embed, feedback, health, recommend, similar
from app.services.qdrant_service import QdrantService


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logging.basicConfig(level=settings.log_level)
    log = logging.getLogger("ml-service")

    log.info("loading embedder %s", settings.bge_model)
    app.state.embedder = Embedder()
    app.state.qdrant = QdrantService()
    await app.state.qdrant.ensure_collections()
    log.info("ml-service ready (modelVersion=%s)", settings.model_version)

    yield

    await app.state.qdrant.close()


app = FastAPI(title="recommendation-ml-service", lifespan=lifespan)
for module in (health, embed, recommend, similar, feedback):
    app.include_router(module.router)
