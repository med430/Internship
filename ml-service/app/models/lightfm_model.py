"""LightFM (WARP, hybrid) serving wrapper. Hybrid = ID embeddings + skill/domain side features,
so it still scores cold/sparse pairs from features instead of emitting noise. Lazy numpy import
(numpy is in the base image; lightfm only needs to be importable to unpickle the model)."""

from app.models.cf_base import CFModelBase


class LightFMModel(CFModelBase):
    name = "lightfm"

    def __init__(self) -> None:
        super().__init__()
        self._user_features = None
        self._item_features = None

    def _on_loaded(self, art: dict) -> None:
        # Same feature matrices used at train time (None for pure-CF artifacts).
        self._user_features = art.get("user_features")
        self._item_features = art.get("item_features")

    def _raw_scores(self, student_id: str, offer_idx: list[int]):
        import numpy as np
        uid = self._student_index[student_id]
        return self._model.predict(
            uid,
            np.asarray(offer_idx),
            user_features=self._user_features,
            item_features=self._item_features,
        )
