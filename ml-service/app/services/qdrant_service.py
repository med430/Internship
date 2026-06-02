"""Async Qdrant access: collection bootstrap, idempotent upsert, retrieve-by-id.

Used by app/main.py (startup bootstrap), routes/recommend.py (retrieve candidate
offer vectors), and trainer/refresh_embeddings.py (upsert embeddings).
"""

import asyncio
import logging

from qdrant_client import AsyncQdrantClient, models
from qdrant_client.http.exceptions import ResponseHandlingException

from app.config import get_settings

OFFERS = "offers"
STUDENTS = "students"

log = logging.getLogger("ml-service")

# A long-lived AsyncQdrantClient drops idle keep-alive connections; the next call
# then raises a transient ReadError (ResponseHandlingException). Retrying re-opens a
# fresh connection. Without this, one blip 500s the whole call and zeroes every
# semanticScore for that student (rows still tagged with the live model version).
_RETRIEVE_RETRIES = 3


class QdrantService:
    def __init__(self) -> None:
        s = get_settings()
        self._client = AsyncQdrantClient(host=s.qdrant_host, port=s.qdrant_port)
        self._dim = s.embed_dim

    async def ensure_collections(self) -> None:
        for name in (OFFERS, STUDENTS):
            if not await self._client.collection_exists(name):
                await self._client.create_collection(
                    collection_name=name,
                    vectors_config=models.VectorParams(
                        size=self._dim,
                        distance=models.Distance.COSINE,
                        # int8 scalar quant: ~4x less memory, <1% recall loss.
                        quantization_config=models.ScalarQuantization(
                            scalar=models.ScalarQuantizationConfig(
                                type=models.ScalarType.INT8, always_ram=True
                            )
                        ),
                    ),
                    hnsw_config=models.HnswConfigDiff(m=16, ef_construct=128),
                )

    async def upsert(
        self, collection: str, points: list[tuple[str, list[float], dict]]
    ) -> int:
        if not points:
            return 0
        await self._client.upsert(
            collection_name=collection,
            points=[
                models.PointStruct(id=pid, vector=vec, payload=payload)
                for pid, vec, payload in points
            ],
        )
        return len(points)

    async def retrieve_vectors(
        self, collection: str, ids: list[str]
    ) -> dict[str, list[float]]:
        if not ids:
            return {}
        for attempt in range(_RETRIEVE_RETRIES):
            try:
                records = await self._client.retrieve(
                    collection_name=collection, ids=ids, with_vectors=True
                )
                return {str(r.id): r.vector for r in records if r.vector is not None}
            except ResponseHandlingException as e:
                if attempt == _RETRIEVE_RETRIES - 1:
                    raise
                log.warning("qdrant retrieve transient error (attempt %d): %s", attempt + 1, e)
                await asyncio.sleep(0.1 * (attempt + 1))
        return {}  # unreachable; the loop either returns or re-raises

    async def search(
        self, collection: str, vector: list[float], limit: int, exclude_inactive: bool = True
    ) -> list[tuple[str, float]]:
        """Semantic ANN (Stage-1 retrieval): top-`limit` points by cosine to `vector`.

        Returns (id, score). Eligibility pushed into the query: the payload `deleted` flag is set
        by the worker when an offer is soft-deleted OR its deadline has passed, so a single
        `deleted == false` filter excludes both. Same transient-retry guard as retrieve_vectors.
        """
        query_filter = (
            models.Filter(must=[models.FieldCondition(
                key="deleted", match=models.MatchValue(value=False))])
            if exclude_inactive else None
        )
        for attempt in range(_RETRIEVE_RETRIES):
            try:
                res = await self._client.query_points(
                    collection_name=collection, query=vector, limit=limit,
                    query_filter=query_filter, with_payload=False, with_vectors=False,
                )
                return [(str(p.id), p.score) for p in res.points]
            except ResponseHandlingException as e:
                if attempt == _RETRIEVE_RETRIES - 1:
                    raise
                log.warning("qdrant search transient error (attempt %d): %s", attempt + 1, e)
                await asyncio.sleep(0.1 * (attempt + 1))
        return []  # unreachable

    async def retrieve_full(self, collection: str, ids: list[str]) -> dict[str, dict]:
        """Vectors + payloads in one round-trip (advanced pipeline needs both: vectors for
        semantic score + MMR similarity, payloads for slate metadata)."""
        if not ids:
            return {}
        for attempt in range(_RETRIEVE_RETRIES):
            try:
                records = await self._client.retrieve(
                    collection_name=collection, ids=ids, with_vectors=True, with_payload=True
                )
                return {str(r.id): {"vector": r.vector, "payload": r.payload or {}} for r in records}
            except ResponseHandlingException as e:
                if attempt == _RETRIEVE_RETRIES - 1:
                    raise
                log.warning("qdrant retrieve_full transient error (attempt %d): %s", attempt + 1, e)
                await asyncio.sleep(0.1 * (attempt + 1))
        return {}  # unreachable

    async def close(self) -> None:
        await self._client.close()
