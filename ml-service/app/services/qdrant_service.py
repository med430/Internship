"""Async Qdrant access: collection bootstrap, idempotent upsert, retrieve-by-id.

Used by app/main.py (startup bootstrap), routes/recommend.py (retrieve candidate
offer vectors), and trainer/refresh_embeddings.py (upsert embeddings).
"""

from qdrant_client import AsyncQdrantClient, models

from app.config import get_settings

OFFERS = "offers"
STUDENTS = "students"


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
        records = await self._client.retrieve(
            collection_name=collection, ids=ids, with_vectors=True
        )
        return {str(r.id): r.vector for r in records if r.vector is not None}

    async def close(self) -> None:
        await self._client.close()
