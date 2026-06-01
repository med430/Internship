"""Env-backed settings (pydantic-settings). Imported by every module in app/ and trainer/."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
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


@lru_cache
def get_settings() -> Settings:
    return Settings()
