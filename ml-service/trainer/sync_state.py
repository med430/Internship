"""Durable per-collection watermark for the incremental sync (survives restarts).

Reads/upserts the EmbeddingSyncState table — owned by Prisma (see schema.prisma),
written only here. No DDL: the table is created by a Prisma migration.
Used by trainer/refresh_embeddings.py.
"""

from datetime import datetime

import asyncpg

# Naive: Prisma DateTime columns are `timestamp(3)` without timezone, so asyncpg needs
# naive datetimes here (a tz-aware value can't bind to a non-tz column).
EPOCH = datetime(1970, 1, 1)


async def get_watermark(pool: asyncpg.Pool, collection: str) -> datetime:
    async with pool.acquire() as con:
        row = await con.fetchrow(
            'SELECT "lastSyncedAt" FROM "EmbeddingSyncState" WHERE collection = $1',
            collection,
        )
    return row["lastSyncedAt"] if row else EPOCH


async def set_watermark(pool: asyncpg.Pool, collection: str, ts: datetime) -> None:
    async with pool.acquire() as con:
        await con.execute(
            """
            INSERT INTO "EmbeddingSyncState" (collection, "lastSyncedAt", "lastRunAt")
            VALUES ($1, $2, now())
            ON CONFLICT (collection)
            DO UPDATE SET "lastSyncedAt" = EXCLUDED."lastSyncedAt", "lastRunAt" = now()
            """,
            collection,
            ts,
        )
