# Mathematical modeling

Modeling is translating a messy real situation into mathematics, solving inside the math, and translating back — without forgetting that the answer is only as trustworthy as the translation.

## The modeling cycle

1. **Identify the question** in real-world terms and what would count as an answer.
2. **List assumptions and idealizations.** What are you ignoring (friction, edge effects, rare events, correlations)? Every model simplifies; the skill is simplifying the right things. State them — an unstated assumption is a hidden bug.
3. **Define variables and parameters** with **units**. Distinguish what varies (variables) from what's fixed (parameters), and what you control from what you observe.
4. **Build the relationships.** Conservation laws, rates of change (differential equations), proportionality, optimization objective + constraints, probability distributions, or a discrete/recurrence structure — choose the form that matches the mechanism.
5. **Solve** within the model — analytically if possible, numerically if not.
6. **Interpret** the solution back in real terms, *with units*. Does it answer the original question?
7. **Validate and refine.** Compare to data or known cases; check the assumptions held; iterate.

## Choosing a model form

| Situation | Form |
|---|---|
| Smooth change over time | differential equation |
| Step-by-step / generational | recurrence / difference equation |
| Best choice under limits | optimization (objective + constraints) |
| Uncertainty / variability | probability model, random variables |
| Networks / relationships | graphs |
| Accumulation / totals | integrals, sums |

## Units and dimensional analysis
- Carry units through every step; the answer's units must match what's asked.
- **Dimensional analysis** is a free correctness check and sometimes derives the form of a law up to a constant. If a sum adds meters to seconds, stop — there's an error.
- Use it to estimate too: combine the relevant quantities so the units come out right.

## Keep the model honest
- **Match complexity to purpose.** The simplest model that captures the essential behavior beats an elaborate one you can't analyze or trust. "All models are wrong; some are useful."
- **Know the regime of validity.** Linear approximations hold near the operating point and fail far from it; a model fit to one range may not extrapolate.
- **Sensitivity analysis.** Which assumptions/parameters does the answer depend on most? If a conclusion flips under a small, plausible change, flag it.
- **Sanity-check the output:** order of magnitude, limiting cases (what happens as a parameter → 0 or ∞?), and sign. A population model that predicts negative people has a bug.

## Reporting a model
State: the question, the assumptions (prominently), the variables with units, the model, the solution, the interpretation, and the limits of validity. The assumptions section is not boilerplate — it's where a reader decides whether to believe the answer.
