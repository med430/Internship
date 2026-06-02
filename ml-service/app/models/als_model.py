"""implicit ALS serving wrapper. Score = user_factor · item_factor (dot product of the learned
latent vectors). Pure collaborative — no side features — so it only scores warm (seen) pairs;
unknown student/offer → no score (CF stays 0, the cf ramp handles the rest)."""

from app.models.cf_base import CFModelBase


class ALSModel(CFModelBase):
    name = "als"

    def _on_loaded(self, art: dict) -> None:
        # implicit's AlternatingLeastSquares exposes user_factors / item_factors after fit.
        self._user_factors = art.get("user_factors")
        self._item_factors = art.get("item_factors")
        if self._user_factors is None and self._model is not None:
            self._user_factors = getattr(self._model, "user_factors", None)
            self._item_factors = getattr(self._model, "item_factors", None)

    def _raw_scores(self, student_id: str, offer_idx: list[int]):
        import numpy as np
        if self._user_factors is None or self._item_factors is None:
            return None
        uid = self._student_index[student_id]
        uvec = np.asarray(self._user_factors[uid])
        items = np.asarray(self._item_factors)[np.asarray(offer_idx)]
        return items.dot(uvec)
