"""Env-backed settings (pydantic-settings). Imported by every module in app/ and trainer/."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    #override attributes defaults with .env or env vars (e.g. in Kubernetes); see .env.example for docs and dev defaults.
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = ""

    qdrant_host: str = "qdrant"
    qdrant_port: int = 6333

    ml_internal_token: str = "dev-token"

    # BGE-M3: multilingual (FR/AR/EN), 8192 ctx (handles long job posts), dense+sparse+ColBERT.
    bge_model: str = "BAAI/bge-m3"
    embed_dim: int = 1024
    embed_batch_size: int = 16
    embed_max_length: int = 2048
    # Fixed path so the weights persist in the model-cache Docker volume across rebuilds.
    model_cache_dir: str = "/app/.cache/models"

    # Must differ from the mock's "content-only" so the backend audit trail shows we went live.
    model_version: str = "bge-m3-v1"

    sync_interval_minutes: int = 5
    # Overlap window so a row written on the watermark boundary is never missed (upsert is idempotent).
    sync_overlap_seconds: int = 30

    # 0 keeps asyncpg working through the Neon PgBouncer pooler.
    db_statement_cache_size: int = 0

    log_level: str = "INFO"

    # ── M7 advanced pipeline (retrieval + CF + RRF + MMR) ─────────────────────
    # Master switch. Off → M6 behavior (semantic only, finalMlScore=0, Nest blends).
    # On → sidecar runs Stages 1–3 and returns finalMlScore>0 (the fused, reranked score).
    reco_pipeline_advanced: bool = False
    # CF needs no manual switch: auto-gated by artifact presence (cfScore=0 when no model is
    # trained) and weighted by the cf ramp below (by interaction count). One master toggle only.
    enable_mmr: bool = True
    # Hybrid dense+sparse retrieval is SCAFFOLDED only in M7 (needs a Qdrant re-index to enable).
    enable_hybrid_sparse: bool = False

    # Blend base weights (scoring.py renormalizes once the cf ramp scales the cf term).
    w_content: float = 0.5
    w_semantic: float = 0.4
    w_cf: float = 0.33      # max cf weight, reached only as interactions grow (see ramp)
    w_popularity: float = 0.1
    # Smooth cf ramp cf_weight(n) = 1/(1+e^-((n-mid)/steep)); n = student interaction count.
    # mid=20: n=0→0.6%, n=10→3.8%, n=20→14.2%, n=41→24.5% — opens slowly, needs ~20 interactions
    # before CF meaningfully contributes (appropriate while the model is sparse/untrained).
    cf_ramp_midpoint: float = 20.0
    cf_ramp_steepness: float = 5.0

    # Retrieval / rerank knobs.
    rrf_k: int = 60                 # Reciprocal Rank Fusion constant
    retrieval_limit: int = 200      # merged candidate pool size
    mmr_lambda: float = 0.65        # MMR relevance vs diversity
    mmr_pool: int = 50              # rerank only the top-N by relevance
    # Slate rules.
    slate_max_per_company: int = 2  # within the top `slate_company_window`
    slate_company_window: int = 10
    slate_max_per_domain: int = 5   # within the top `slate_domain_window`
    slate_domain_window: int = 20
    deadline_pin_days: int = 3      # offers due within N days floated toward the top

    # CF training.
    artifact_dir: str = "/app/artifacts"   # Docker volume (gitignored)
    cf_min_interactions: int = 20           # below this, trainers warn (signal is noise)


@lru_cache
def get_settings() -> Settings:
    return Settings()
