"""Unit tests for MMR + slate (pure, stdlib cosine)."""

from app.services.reranking import OfferMeta, _cosine, apply_slate, mmr_rerank, pin_urgent


def test_cosine_basics():
    assert abs(_cosine([1, 0], [1, 0]) - 1.0) < 1e-9
    assert abs(_cosine([1, 0], [0, 1]) - 0.0) < 1e-9
    assert abs(_cosine([1, 0], [-1, 0]) + 1.0) < 1e-9
    assert _cosine([0, 0], [1, 1]) == 0.0


def test_mmr_promotes_diverse_over_near_duplicate():
    # a and b are identical vectors; c is orthogonal. After a, MMR should prefer c over b.
    vectors = {"a": [1, 0], "b": [1, 0], "c": [0, 1]}
    scored = [("a", 0.9), ("b", 0.85), ("c", 0.6)]
    order = [oid for oid, _ in mmr_rerank(scored, vectors, lam=0.5, pool=3)]
    assert order == ["a", "c", "b"]


def test_mmr_scores_non_increasing():
    vectors = {"a": [1, 0], "b": [0, 1], "c": [1, 1]}
    out = mmr_rerank([("a", 0.9), ("b", 0.8), ("c", 0.7)], vectors, lam=0.7, pool=3)
    scores = [s for _, s in out]
    assert scores == sorted(scores, reverse=True)


def test_slate_defers_company_over_cap():
    ordered = ["o1", "o2", "o3", "o4"]
    meta = {
        "o1": OfferMeta("X", "d", None), "o2": OfferMeta("X", "d", None),
        "o3": OfferMeta("X", "d", None), "o4": OfferMeta("Y", "e", None),
    }
    out = apply_slate(ordered, meta, max_per_company=2, company_window=10,
                      max_per_domain=99, domain_window=20)
    assert out == ["o1", "o2", "o4", "o3"]   # third X deferred past Y


def test_pin_urgent_floats_soon_deadlines():
    ordered = ["a", "b", "c"]
    meta = {"a": OfferMeta(None, None, None), "b": OfferMeta(None, None, None),
            "c": OfferMeta(None, None, 1.0)}
    assert pin_urgent(ordered, meta, pin_days=3, max_pins=3) == ["c", "a", "b"]
