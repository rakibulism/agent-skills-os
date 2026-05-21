# Experiment design

The design is where truth is won or lost. A clever analysis cannot rescue a confounded design. Spend your care here.

## The variables

- **Independent variable (IV):** what you deliberately change (the treatment).
- **Dependent variable (DV):** what you measure (the outcome). Define how you'll measure it *before* running, and prefer objective, pre-specified measures.
- **Control variables:** everything held constant so the IV is the only thing differing between conditions.

## The pillars of a clean comparison

- **Control group.** A comparison condition identical except for the treatment. Without it, you can't attribute the outcome to the IV rather than to time, expectation, or anything else.
- **Randomization.** Assign subjects to conditions by chance. This is what lets you attribute differences to the treatment rather than to pre-existing differences — it balances both known and unknown confounds in expectation.
- **Blinding.** Keep subjects (single-blind) and ideally experimenters (double-blind) unaware of who got what, to neutralize placebo and observer effects.
- **Replication & sample size.** Enough subjects to detect an effect of the size you care about (power), and independent repeats so a fluke doesn't masquerade as a finding.

## Confounds: the usual suspects

A confound is a variable that moves with your IV and could explain the result.

- **Selection** — groups differ before treatment (volunteers vs. assigned). Fix: randomize.
- **History / time** — something else changed during the study (seasonality, a news event). Fix: concurrent control group.
- **Maturation** — subjects change on their own over time. Fix: control group experiences the same passage of time.
- **Regression to the mean** — extreme groups drift toward average on remeasurement regardless of treatment. Fix: control group, don't select on extremes.
- **Measurement / instrument** — the way you measure changes or is biased. Fix: standardize, calibrate, blind the measurer.
- **Demand effects** — subjects guess the hypothesis and conform. Fix: blinding, neutral framing.
- **Attrition** — who drops out differs by group, biasing the survivors. Fix: track and analyze dropouts (intention-to-treat).

## Designs, from weak to strong

1. **Anecdote / case** — generates hypotheses, proves nothing.
2. **Observational / correlational** — finds associations; vulnerable to confounds; can't establish cause alone.
3. **Natural experiment / quasi-experiment** — exploits as-if-random variation when you can't assign; better, still needs care.
4. **Randomized controlled trial (RCT)** — randomized, controlled, ideally blinded; the gold standard for causal claims.
5. **Replicated RCTs / meta-analysis** — the same effect across independent studies; the strongest practical evidence.

## A/B tests (the everyday RCT)

The same logic applies to product and data work:
- Randomize users to A vs. B; don't let them self-select.
- Decide the metric, the minimum effect worth detecting, and the sample size **before** starting.
- Don't peek-and-stop the moment it looks significant (inflates false positives); set the duration/sample in advance or use a proper sequential method.
- Watch guardrail metrics and segment effects (an average can hide that B helps one group and hurts another).
- Run long enough to cover novelty effects and natural cycles (e.g., a full week).

## Before you run it, ask

- If the result comes out as hoped, what else could explain it? Does the design rule that out?
- If it comes out the opposite way, will I learn something? (If not, the test is poorly designed.)
- Is the measure pre-specified, the analysis pre-planned, the stopping rule fixed? If not, you're inviting bias.
