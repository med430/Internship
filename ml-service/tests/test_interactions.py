"""Unit tests for the CF interaction-weighting (pure, stdlib)."""

from trainer.interactions import PairSignals, interaction_weight


def approx(a, b, tol=1e-6):
    return abs(a - b) <= tol


def test_no_signal_is_zero():
    assert interaction_weight(PairSignals()) == 0.0


def test_application_is_strong_regardless_of_outcome():
    assert approx(interaction_weight(PairSignals(application_status="PENDING")), 4.5)   # 5*0.9
    assert approx(interaction_weight(PairSignals(application_status="ACCEPTED")), 5.0)  # 5*1.0
    assert approx(interaction_weight(PairSignals(application_status="REJECTED")), 4.0)  # 5*0.8


def test_bookmark_active_vs_removed():
    assert approx(interaction_weight(PairSignals(bookmarked_active=True)), 3.0)
    assert approx(interaction_weight(PairSignals(bookmarked_removed=True)), 0.5)


def test_dwell_increases_view_weight():
    no_dwell = interaction_weight(PairSignals(view_count=1))                     # 0.5
    full_dwell = interaction_weight(PairSignals(view_count=1, total_dwell_ms=30000))  # ~1.0
    assert approx(no_dwell, 0.5)
    assert approx(full_dwell, 1.0)
    assert full_dwell > no_dwell


def test_deeper_position_weighs_more():
    # a click at rank 11 overcame more position bias than at rank 1.
    top = interaction_weight(PairSignals(view_count=1, best_position=1))
    deep = interaction_weight(PairSignals(view_count=1, best_position=11))
    assert deep > top
    assert approx(deep, 0.75)   # 0.5 * (1 + min(0.5, 10/20))


def test_impressions_without_view_dampen_confidence():
    # shown 5x, never engaged → fully cancels a single shallow view.
    assert approx(interaction_weight(PairSignals(view_count=1, impressions_without_view=5)), 0.0)
    # a strong signal still survives the skip penalty.
    assert interaction_weight(PairSignals(bookmarked_active=True, impressions_without_view=5)) > 2.0
