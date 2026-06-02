"""Worker entrypoint (container CMD: python -m trainer.scheduler).

Runs an initial delta sync on boot so `docker compose up` self-populates Qdrant,
then keeps a ~5-min delta sweep + a nightly full reconcile running via APScheduler.
The nightly full at 02:30 precedes the backend's 3 AM recompute.
"""

import asyncio
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.config import get_settings
from trainer.refresh_embeddings import run

log = logging.getLogger("ml-worker")


async def _safe_run(full: bool = False) -> None:
    try:
        await run(full=full)
    except Exception:
        # A failed sweep must not kill the scheduler; the next tick retries.
        log.exception("embedding sync failed")


async def _safe_cf() -> None:
    """Nightly CF retrain. No-ops gracefully if the CF deps aren't installed (they live in
    requirements-train.txt, not the base image) — logs and moves on, never kills the scheduler."""
    try:
        from trainer.train_als import run as train_als
        from trainer.train_lightfm import run as train_lightfm
        await train_lightfm()
        await train_als()
    except Exception:
        log.exception("CF retrain skipped/failed (install requirements-train.txt to enable CF)")


async def main() -> None:
    s = get_settings()
    logging.basicConfig(level=s.log_level)

    await _safe_run(full=False)

    scheduler = AsyncIOScheduler()
    scheduler.add_job(_safe_run, IntervalTrigger(minutes=s.sync_interval_minutes), kwargs={"full": False})
    scheduler.add_job(_safe_run, CronTrigger(hour=2, minute=30), kwargs={"full": True})
    # Nightly CF retrain after the full embedding reconcile, before the 3 AM backend recompute.
    scheduler.add_job(_safe_cf, CronTrigger(hour=2, minute=45))
    scheduler.start()
    log.info("scheduler up: delta every %dm + nightly full reconcile 02:30 + CF retrain 02:45",
             s.sync_interval_minutes)

    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())
