"""Shared base for the CF serving wrappers (LightFM, ALS).

Both load a pickled artifact at startup and expose the same tiny interface the pipeline calls:
  .ready                      → False until BOTH the lib is installed AND an artifact exists
  .predict(student_id, ids)   → {offerId: cfScore in [0,1]} (relative, min-max over the set)
  .top_offers(student_id, n)  → ranked offerIds (a retrieval generator)

Graceful by design: missing lib / missing artifact / unknown student → ready False or empty dict,
so cfScore is simply 0 and the cf ramp + blend carry on. The base image needs no CF deps; they
arrive only when CF is opted in (install requirements-train.txt + train).
"""

import logging
import os
import pickle

log = logging.getLogger("ml-service")


class CFModelBase:
    name = "cf"

    def __init__(self) -> None:
        self._model = None
        self._student_index: dict[str, int] = {}
        self._offer_ids: list[str] = []
        self._offer_index: dict[str, int] = {}

    @property
    def ready(self) -> bool:
        return self._model is not None

    def load(self, path: str) -> "CFModelBase":
        if not os.path.exists(path):
            log.info("%s artifact not found at %s — CF off for this model", self.name, path)
            return self
        try:
            art = self._load_artifact(path)
            self._model = art["model"]
            self._student_index = art["student_index"]
            self._offer_ids = art["offer_ids"]
            self._offer_index = {oid: i for i, oid in enumerate(self._offer_ids)}
            self._on_loaded(art)
            log.info("%s loaded (%d students, %d offers)", self.name,
                     len(self._student_index), len(self._offer_ids))
        except Exception as e:  # missing lib, version skew, corrupt artifact — all → CF off
            log.warning("%s load failed (%s) — CF off", self.name, e)
            self._model = None
        return self

    def _load_artifact(self, path: str) -> dict:
        with open(path, "rb") as f:
            return pickle.load(f)

    def _on_loaded(self, art: dict) -> None:
        """Subclass hook for extra artifact fields (feature matrices, factors)."""

    @staticmethod
    def _minmax(scores: list[float], ids: list[str]) -> dict[str, float]:
        if not scores:
            return {}
        lo, hi = float(min(scores)), float(max(scores))
        rng = (hi - lo) or 1.0
        return {oid: (float(s) - lo) / rng for oid, s in zip(ids, scores)}

    # Subclasses implement the raw scoring.
    def _raw_scores(self, student_id: str, offer_idx: list[int]):
        raise NotImplementedError

    def predict(self, student_id: str, offer_ids: list[str]) -> dict[str, float]:
        if not self.ready or student_id not in self._student_index:
            return {}
        pairs = [(oid, self._offer_index[oid]) for oid in offer_ids if oid in self._offer_index]
        if not pairs:
            return {}
        raw = self._raw_scores(student_id, [i for _, i in pairs])
        if raw is None:
            return {}
        return self._minmax([raw[k] for k in range(len(pairs))], [oid for oid, _ in pairs])

    def top_offers(self, student_id: str, limit: int) -> list[str]:
        if not self.ready or student_id not in self._student_index:
            return []
        scored = self.predict(student_id, self._offer_ids)
        return [oid for oid, _ in sorted(scored.items(), key=lambda kv: -kv[1])[:limit]]


class CFEnsemble:
    """Combines the ready CF models (LightFM + ALS): averages their per-offer scores and
    RRF-merges their candidate lists. ready=False (→ cfScore 0 everywhere) if none loaded."""

    def __init__(self, models: list[CFModelBase]) -> None:
        self.models = models

    @property
    def ready(self) -> bool:
        return any(m.ready for m in self.models)

    def predict(self, student_id: str, offer_ids: list[str]) -> dict[str, float]:
        preds = [m.predict(student_id, offer_ids) for m in self.models if m.ready]
        out: dict[str, float] = {}
        for oid in offer_ids:
            vals = [p[oid] for p in preds if oid in p]
            if vals:
                out[oid] = sum(vals) / len(vals)
        return out

    def top_offers(self, student_id: str, limit: int) -> list[str]:
        from app.services.retrieval import rrf_merge
        lists = [m.top_offers(student_id, limit) for m in self.models if m.ready]
        lists = [lst for lst in lists if lst]
        return rrf_merge(lists, k=60, limit=limit) if lists else []
