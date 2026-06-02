"""Train implicit ALS on the weighted confidence matrix and persist a serving artifact.

Pure collaborative filtering (latent factors from co-interaction) — complements LightFM's
feature-aware view. Only scores warm students/offers; cold ones fall back to 0 (cf ramp + blend).

Run:  python -m trainer.train_als           (needs requirements-train.txt installed)
Off the demo path — only when CF is opted in. Unvalidated until first real run.
"""

import argparse
import asyncio
import logging
import os
import pickle

from app.config import get_settings
from trainer import db, interactions

log = logging.getLogger("ml-worker")

ARTIFACT_NAME = "als.pkl"


async def run(factors: int = 32, iterations: int = 20) -> dict:
    logging.basicConfig(level=get_settings().log_level)
    s = get_settings()
    pool = await db.create_pool()
    try:
        rows = await interactions.fetch_interactions(pool)
    finally:
        await pool.close()

    if not rows:
        log.warning("no interactions — skipping ALS train")
        return {"trained": False, "reason": "no interactions"}
    if len(rows) < s.cf_min_interactions:
        log.warning("only %d interaction pairs (< %d) — CF signal will be weak",
                    len(rows), s.cf_min_interactions)

    mat, student_ids, offer_ids = interactions.build_matrix(rows)  # CSR (students × offers), confidence

    import numpy as np
    from implicit.als import AlternatingLeastSquares

    model = AlternatingLeastSquares(
        factors=factors, regularization=0.05, iterations=iterations, random_state=42)
    model.fit(mat.astype(np.float32))   # implicit reads the values as confidence

    artifact = {
        # Serving only needs the factors (dot product), so we don't pickle the implicit model —
        # keeps the artifact independent of the implicit lib version. Truthy marker so .ready works.
        "model": {"kind": "als"},
        "student_index": {sid: i for i, sid in enumerate(student_ids)},
        "offer_ids": offer_ids,
        "user_factors": np.asarray(model.user_factors),
        "item_factors": np.asarray(model.item_factors),
    }
    os.makedirs(s.artifact_dir, exist_ok=True)
    path = os.path.join(s.artifact_dir, ARTIFACT_NAME)
    with open(path, "wb") as f:
        pickle.dump(artifact, f)
    result = {"trained": True, "students": len(student_ids), "offers": len(offer_ids), "path": path}
    log.info("ALS trained: %s", result)
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--factors", type=int, default=32)
    parser.add_argument("--iterations", type=int, default=20)
    args = parser.parse_args()
    asyncio.run(run(args.factors, args.iterations))
