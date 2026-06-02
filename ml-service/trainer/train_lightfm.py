"""Train LightFM (WARP, hybrid) on the weighted interaction matrix + skill/domain side features,
and persist a serving artifact to settings.artifact_dir.

Hybrid (features + per-entity identity, via LightFM's Dataset) is what keeps this useful under
sparsity — a cold/rare pair still scores from shared skill/domain features instead of noise.

Run:  python -m trainer.train_lightfm        (needs requirements-train.txt installed)
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

ARTIFACT_NAME = "lightfm.pkl"


async def run(epochs: int = 30) -> dict:
    logging.basicConfig(level=get_settings().log_level)
    s = get_settings()
    pool = await db.create_pool()
    try:
        rows = await interactions.fetch_interactions(pool)
        if not rows:
            log.warning("no interactions — skipping LightFM train")
            return {"trained": False, "reason": "no interactions"}
        if len(rows) < s.cf_min_interactions:
            log.warning("only %d interaction pairs (< %d) — CF signal will be weak",
                        len(rows), s.cf_min_interactions)

        offer_feats = await interactions.fetch_offer_features(pool)
        student_feats = await interactions.fetch_student_features(pool)
    finally:
        await pool.close()

    from lightfm import LightFM
    from lightfm.data import Dataset

    student_ids = sorted({r["student_id"] for r in rows} | set(student_feats))
    offer_ids = sorted({r["offer_id"] for r in rows} | set(offer_feats))
    all_user_tokens = {t for toks in student_feats.values() for t in toks}
    all_item_tokens = {t for toks in offer_feats.values() for t in toks}

    ds = Dataset()
    ds.fit(users=student_ids, items=offer_ids,
           user_features=all_user_tokens, item_features=all_item_tokens)

    weighted = [
        (r["student_id"], r["offer_id"], interactions.interaction_weight(interactions._row_to_signals(r)))
        for r in rows
    ]
    weighted = [(u, o, w) for (u, o, w) in weighted if w > 0]
    interactions_mat, weights = ds.build_interactions(weighted)
    user_features = ds.build_user_features(
        [(uid, toks) for uid, toks in student_feats.items() if toks], normalize=False)
    item_features = ds.build_item_features(
        [(oid, toks) for oid, toks in offer_feats.items() if toks], normalize=False)

    model = LightFM(loss="warp", no_components=32, random_state=42)
    model.fit(interactions_mat, sample_weight=weights,
              user_features=user_features, item_features=item_features,
              epochs=epochs, num_threads=2)

    # LightFM's internal id order = the order passed to fit().
    artifact = {
        "model": model,
        "student_index": {sid: i for i, sid in enumerate(student_ids)},
        "offer_ids": offer_ids,
        "user_features": user_features,
        "item_features": item_features,
    }
    os.makedirs(s.artifact_dir, exist_ok=True)
    path = os.path.join(s.artifact_dir, ARTIFACT_NAME)
    with open(path, "wb") as f:
        pickle.dump(artifact, f)
    result = {"trained": True, "students": len(student_ids), "offers": len(offer_ids),
              "pairs": len(weighted), "path": path}
    log.info("LightFM trained: %s", result)
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=30)
    asyncio.run(run(parser.parse_args().epochs))
