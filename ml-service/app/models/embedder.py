"""BGE-M3 embedding wrapper (FlagEmbedding/PyTorch) + cosine helper.

Loaded once at startup in app/main.py; used by routes/recommend.py (query embedding)
and trainer/refresh_embeddings.py (offer/student embedding). Dense vectors only for now;
BGE-M3 also yields sparse + ColBERT for the hybrid retrieval planned later.
"""

import numpy as np
from FlagEmbedding import BGEM3FlagModel

from app.config import get_settings


class Embedder:
    def __init__(self) -> None:
        s = get_settings()
        # use_fp16 only helps on GPU; this runs on CPU.
        self._model = BGEM3FlagModel(s.bge_model, use_fp16=False, cache_dir=s.model_cache_dir)
        self._batch = s.embed_batch_size
        self._max_length = s.embed_max_length

    def embed(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        out = self._model.encode(
            texts, batch_size=self._batch, max_length=self._max_length, return_dense=True
        )
        return [v.tolist() for v in out["dense_vecs"]]

    def embed_one(self, text: str) -> list[float]:
        return self.embed([text])[0]


def cosine(a: list[float], b: list[float]) -> float:
    va, vb = np.asarray(a, dtype=np.float32), np.asarray(b, dtype=np.float32)
    denom = float(np.linalg.norm(va) * np.linalg.norm(vb))
    if denom == 0.0:
        return 0.0
    sim = float(np.dot(va, vb) / denom)
    # semanticScore is contracted to [0,1]; sentence-embedding cosines rarely go negative.
    return max(0.0, min(1.0, sim))
