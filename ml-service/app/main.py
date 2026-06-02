"""FastAPI entrypoint for the ML sidecar (uvicorn target, see Dockerfile).

Loads BGE-M3 + Qdrant always. For the M7 advanced pipeline it also opens a small serving DB pool
(popularity + interaction-count features) and loads the CF models — both GUARDED so a DB hiccup or
a missing CF artifact degrades gracefully (features empty / cfScore 0) instead of downing the
sidecar. Serving stays usable in M6 mode regardless.
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import get_settings
from app.models.cf_base import CFEnsemble
from app.models.embedder import Embedder
from app.services.feature_service import FeatureService
from app.services.qdrant_service import QdrantService


def _load_cf(settings, log) -> CFEnsemble:
    from app.models.als_model import ALSModel
    from app.models.lightfm_model import LightFMModel

    lf = LightFMModel().load(os.path.join(settings.artifact_dir, "lightfm.pkl"))
    als = ALSModel().load(os.path.join(settings.artifact_dir, "als.pkl"))
    ensemble = CFEnsemble([lf, als])
    log.info("CF ready=%s (lightfm=%s, als=%s)", ensemble.ready, lf.ready, als.ready)
    return ensemble


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logging.basicConfig(level=settings.log_level)
    log = logging.getLogger("ml-service")

    log.info("loading embedder %s", settings.bge_model)
    app.state.embedder = Embedder()
    app.state.qdrant = QdrantService()
    await app.state.qdrant.ensure_collections()

    # Serving DB pool for live features — guarded; the sidecar must survive a DB hiccup.
    app.state.db_pool = None
    app.state.features = FeatureService(None)
    try:
        from trainer import db
        app.state.db_pool = await db.create_pool()
        app.state.features = FeatureService(app.state.db_pool)
    except Exception as e:
        log.warning("serving DB pool unavailable (%s) — popularity/interaction features empty", e)

    # CF models — graceful: ready=False (cfScore 0) until libs installed + artifacts trained.
    app.state.cf = _load_cf(settings, log)

    log.info("ml-service ready (advanced=%s, modelVersion=%s)",
             settings.reco_pipeline_advanced, settings.model_version)
    yield

    await app.state.qdrant.close()
    if app.state.db_pool is not None:
        await app.state.db_pool.close()


app = FastAPI(title="recommendation-ml-service", lifespan=lifespan)
from app.routes import embed, feedback, health, recommend, similar  # noqa: E402

for module in (health, embed, recommend, similar, feedback):
    app.include_router(module.router)
