"""Unit tests for Reciprocal Rank Fusion (pure, no deps)."""

from app.services.retrieval import rrf_merge


def test_single_list_preserves_order_and_truncates():
    assert rrf_merge([["a", "b", "c", "d"]], k=60, limit=2) == ["a", "b"]


def test_empty_inputs():
    assert rrf_merge([], k=60, limit=10) == []
    assert rrf_merge([[], []], k=60, limit=10) == []


def test_agreement_across_lists_beats_single_top():
    # 'x' is rank 2 in both lists; 'a' and 'p' are rank 1 in one list each.
    merged = rrf_merge([["a", "x"], ["p", "x"]], k=60, limit=3)
    # x: 1/62 + 1/62 = 0.03226 ; a: 1/61 = 0.01639 ; p: 1/61. So x first.
    assert merged[0] == "x"


def test_deterministic_tie_break_by_id():
    # 'a' and 'b' each appear once at rank 1 → equal RRF → sorted by id.
    assert rrf_merge([["b"], ["a"]], k=60, limit=2) == ["a", "b"]


def test_higher_rank_outscores_lower_within_same_count():
    # both appear once; 'a' at rank 1, 'z' at rank 3 → a wins.
    assert rrf_merge([["a", "m", "z"]], k=60, limit=3)[0] == "a"
