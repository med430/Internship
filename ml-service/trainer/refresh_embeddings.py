"""Incremental embedding sync: NeonDB deltas → BGE-M3 → idempotent Qdrant upsert.

The heart of the worker. Each run pulls only rows changed since the per-collection
watermark (epoch on first run = full backfill), embeds them, upserts by entity id,
and advances the watermark per batch. Run by trainer/scheduler.py; also runnable
standalone: `python -m trainer.refresh_embeddings [--full]`.
"""

import argparse
import asyncio
import logging
from datetime import timedelta

from app.config import get_settings
from app.models.embedder import Embedder
from app.services.qdrant_service import OFFERS, STUDENTS, QdrantService
from app.services.text_builder import build_offer_text, build_student_text
from trainer import db, sync_state

log = logging.getLogger("ml-worker")


def _iso(dt) -> str | None:
    return dt.isoformat() if dt else None


def _offer_point(row) -> tuple[str, str, dict]:
    text = build_offer_text(
        title=row["title"],
        description=row["description"],
        domain=row["domain"],
        skill_names=list(row["skill_names"]),
        languages_required=list(row["languages_required"] or []),
    )
    payload = {
        "offer_id": row["point_id"],
        "company": row["company"],
        "location": row["location"],
        "domain": row["domain"],
        "work_mode": row["work_mode"],
        "is_paid": row["is_paid"],
        "type": row["type"],
        "languages": list(row["languages_required"] or []),
        "skills": list(row["skill_names"]),
        "deadline": _iso(row["deadline"]),
        "start_date": _iso(row["start_date"]),
        "positions_count": row["positions_count"],
        "deleted": row["deleted"],
    }
    return row["point_id"], text, payload


def _student_point(row) -> tuple[str, str, dict]:
    text = build_student_text(
        skill_names=list(row["skill_names"]),
        preferred_domains=list(row["preferred_domains"] or []),
        preferred_cities=list(row["preferred_cities"] or []),
        current_year=row["current_year"],
        current_program=row["current_program"],
        bio=row["bio"],
        projects=list(row["projects"]),
        experiences=list(row["experiences"]),
        educations=list(row["educations"]),
        certifications=list(row["cert_names"]),
    )
    payload = {
        "student_id": row["point_id"],
        "skills": list(row["skill_names"]),
        "preferred_domains": list(row["preferred_domains"] or []),
        "deleted": row["deleted"],
    }
    return row["point_id"], text, payload


async def _sync(pool, qdrant, embedder, collection, fetch, to_point, full) -> int:
    s = get_settings()
    since = sync_state.EPOCH if full else max(
        sync_state.EPOCH,
        (await sync_state.get_watermark(pool, collection))
        - timedelta(seconds=s.sync_overlap_seconds),
    )
    rows = await fetch(pool, since)
    batch = s.embed_batch_size
    total = 0
    for i in range(0, len(rows), batch):
        chunk = rows[i : i + batch]
        built = [to_point(r) for r in chunk]
        vectors = embedder.embed([text for _, text, _ in built])
        points = [(pid, vec, payload) for (pid, _, payload), vec in zip(built, vectors)]
        total += await qdrant.upsert(collection, points)
        # Rows are ordered by updatedAt ASC, so the last one is the batch max.
        await sync_state.set_watermark(pool, collection, chunk[-1]["updated_at"])
    return total


async def run(full: bool = False) -> dict:
    logging.basicConfig(level=get_settings().log_level)
    pool = await db.create_pool()
    qdrant = QdrantService()
    try:
        await db.smoke_check(pool)
        await qdrant.ensure_collections()
        embedder = Embedder()

        offers = await _sync(pool, qdrant, embedder, OFFERS, db.fetch_offers_since, _offer_point, full)
        students = await _sync(pool, qdrant, embedder, STUDENTS, db.fetch_students_since, _student_point, full)
        result = {"up_offers": offers, "up_students": students, "full": full}
        log.info("embedding sync done: %s", result)
        return result
    finally:
        await qdrant.close()
        await pool.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--full", action="store_true", help="ignore watermark, re-embed everything")
    asyncio.run(run(parser.parse_args().full))
