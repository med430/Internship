"""Stage 2 — score blending (the ranking signal).

Pure math: fuse content / semantic / cf / popularity into one score per candidate. The cf term
is scaled by a smooth logistic ramp on the student's interaction count, so CF stays near zero
until data accrues (and is naturally 0 when no CF model is trained). No I/O — fully unit-testable.

This is the RANKING stage: retrieval (RRF) decided *which* offers are candidates; this decides
their final order. The feed sorts by the value produced here.

**Available-case blending (the missing-vs-zero rule).** A signal is `None` when it was *not
computed* for this candidate (content for a retrieval-only offer beyond Nest's top-K; cf when no
model / cold pair; semantic for a cold student) — that is *unknown*, NOT a bad match. A real
`0.0` means *computed and genuinely bad*. We blend only over the signals that are present (exclude
missing from both numerator and denominator), so an offer surfaced by semantic/CF isn't punished
for lacking content it was never scored on. This keeps M7 fair as the catalog grows and as CF
arrives — without M8 feature hydration. Trade-off: a candidate with one strong known signal can
outrank a more-complete one with a mediocre signal; acceptable for M7 (M8 hydration makes it exact).
"""

import math
from dataclasses import dataclass


@dataclass(frozen=True)
class SignalScores:
    # None = not computed (unknown) → excluded from the blend. A real 0.0 = computed-and-bad → counts.
    content: float | None     # None when the offer wasn't in Nest's content candidates
    semantic: float | None    # Qdrant cosine [0,1]; None only when the student has no stored vector
    cf: float | None          # LightFM/ALS [0,1]; None when no model or the pair is cold
    popularity: float | None  # segment popularity [0,1]; None when not computed for this offer


def cf_weight(n_interactions: int, midpoint: float, steepness: float) -> float:
    """Logistic ramp holding CF near zero until interactions accrue.

    n=0 → ~0.12 (with midpoint 10), n=midpoint → 0.5, n≫midpoint → ~1.0. This is why CF needs no
    on/off switch: with no data it contributes almost nothing; it fades in as the student interacts.
    """
    return 1.0 / (1.0 + math.exp(-(n_interactions - midpoint) / steepness))


def blend(
    s: SignalScores,
    n_interactions: int,
    *,
    w_content: float,
    w_semantic: float,
    w_cf: float,
    w_popularity: float,
    cf_midpoint: float,
    cf_steepness: float,
) -> float:
    """Weighted average over the PRESENT signals only, in [0,1].

    Missing (None) signals are dropped from both the numerator and the denominator, so absence
    doesn't drag the score. The cf weight is `w_cf` scaled by the ramp.
    """
    cfw = w_cf * cf_weight(n_interactions, cf_midpoint, cf_steepness)
    terms = [
        (w_content, s.content),
        (w_semantic, s.semantic),
        (cfw, s.cf),
        (w_popularity, s.popularity),
    ]
    present = [(w, v) for w, v in terms if v is not None]
    total = sum(w for w, _ in present)
    if total <= 0:
        return 0.0
    raw = sum(w * v for w, v in present)
    return max(0.0, min(1.0, raw / total))
