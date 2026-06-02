"""Unit tests for the Stage-2 blend + cf ramp (pure math, no deps beyond stdlib)."""

import math

from app.services.scoring import SignalScores, blend, cf_weight

WEIGHTS = dict(
    w_content=0.5, w_semantic=0.4, w_cf=0.33, w_popularity=0.1,
    cf_midpoint=10.0, cf_steepness=5.0,
)


def approx(a, b, tol=1e-3):
    return abs(a - b) <= tol


def test_cf_ramp_holds_cf_low_until_data():
    assert approx(cf_weight(0, 10.0, 5.0), 1 / (1 + math.exp(2)))   # ~0.119
    assert approx(cf_weight(10, 10.0, 5.0), 0.5)                    # midpoint
    assert cf_weight(25, 10.0, 5.0) > 0.94                          # ramped in
    # monotonic increasing
    assert cf_weight(0, 10, 5) < cf_weight(10, 10, 5) < cf_weight(25, 10, 5)


def test_blend_all_signals_max_is_one():
    s = SignalScores(content=1.0, semantic=1.0, cf=1.0, popularity=1.0)
    assert approx(blend(s, 100, **WEIGHTS), 1.0)


def test_blend_all_zero_is_zero():
    s = SignalScores(0.0, 0.0, 0.0, 0.0)
    assert blend(s, 0, **WEIGHTS) == 0.0


def test_cf_barely_counts_with_no_interactions():
    # cf=1 but n=0 → cf contributes ~0.33*0.119 of the mass; semantic-only vs +cf differ little
    only_sem = SignalScores(0.0, 1.0, 0.0, 0.0)
    sem_plus_cf = SignalScores(0.0, 1.0, 1.0, 0.0)
    delta_cold = blend(sem_plus_cf, 0, **WEIGHTS) - blend(only_sem, 0, **WEIGHTS)
    delta_warm = blend(sem_plus_cf, 40, **WEIGHTS) - blend(only_sem, 40, **WEIGHTS)
    assert delta_cold < delta_warm          # cf matters more as interactions grow
    assert delta_cold < 0.05                 # nearly invisible with no data


def test_blend_in_unit_range():
    s = SignalScores(content=0.7, semantic=0.3, cf=0.9, popularity=0.2)
    for n in (0, 5, 10, 50):
        v = blend(s, n, **WEIGHTS)
        assert 0.0 <= v <= 1.0


def test_missing_content_is_not_penalized_vs_real_zero():
    # Same strong semantic. One offer's content is UNKNOWN (None), the other's is computed-and-bad (0).
    unknown = SignalScores(content=None, semantic=0.9, cf=None, popularity=None)
    bad = SignalScores(content=0.0, semantic=0.9, cf=None, popularity=None)
    assert blend(unknown, 0, **WEIGHTS) > blend(bad, 0, **WEIGHTS)
    # unknown-content offer is judged purely on its present signal → equals semantic.
    assert approx(blend(unknown, 0, **WEIGHTS), 0.9)


def test_semantic_only_candidate_scores_its_semantic():
    s = SignalScores(content=None, semantic=0.42, cf=None, popularity=None)
    assert approx(blend(s, 0, **WEIGHTS), 0.42)


def test_all_missing_is_zero():
    assert blend(SignalScores(None, None, None, None), 0, **WEIGHTS) == 0.0


def test_absent_cf_does_not_dilute_score():
    # cf=None (no model) must NOT add weight to the denominator (the old bug lowered every score).
    no_cf = SignalScores(content=0.6, semantic=0.6, cf=None, popularity=0.6)
    # all three present and equal → blend is exactly that value, regardless of the cf ramp.
    assert approx(blend(no_cf, 0, **WEIGHTS), 0.6)
    assert approx(blend(no_cf, 50, **WEIGHTS), 0.6)
