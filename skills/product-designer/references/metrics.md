# Success metrics

A feature without a success metric is untestable and unkillable. Decide the metric before launch, when you're still honest, not after, when you're motivated to find a number that flatters the work.

## The metric trio

For any initiative, name three:

1. **Primary metric** — the one number that moves if this delivers value. It should be specific, measurable, and tied to user value (not activity). Set a target that would make the work worth it.
2. **Guardrail metric** — what must NOT get worse. (Adding friction to boost conversion might tank retention; the guardrail catches it.)
3. **Counter-metric** — how the primary could be gamed or hit for the wrong reason. (More "engagement" via rage-clicking is not a win.)

## Good vs. vanity metrics

- **Vanity:** total signups, pageviews, raw downloads, cumulative-anything. They only go up and rarely tie to value.
- **Actionable:** activation rate, week-4 retention, task success rate, time-to-value, conversion at a specific step, NPS for a specific job.
- The test: *if this metric didn't move, would we kill or change the feature?* If no, it's vanity.

## Frameworks

- **North Star Metric** — one metric capturing the core value users get (e.g., "nights booked," "messages sent to a reply"). Decompose into 2–4 **input metrics** a team can directly influence.
- **AARRR (pirate metrics)** — Acquisition, Activation, Retention, Referral, Revenue. Find which stage is the constraint; optimizing a non-bottleneck stage wastes effort.
- **HEART** (Google) — Happiness, Engagement, Adoption, Retention, Task success — with Goals → Signals → Metrics for each, so you measure what the feature is actually for.
- **Leading vs. lagging** — revenue and retention lag; activation and task-success lead. Instrument leading indicators so you learn in days, not quarters.

## Setting a target

- Anchor to a baseline: you can't claim improvement without a "before."
- State the threshold that means *act*: "If activation doesn't reach X% in 4 weeks, we revert/rethink."
- Prefer a confidence interval or a clear practical-significance bar over a single hopeful point estimate.

## Common traps

- **Measuring output, not outcome.** "Shipped 5 features" is not success; "support tickets for X dropped 30%" is.
- **No baseline.** Without a before-number, every result is a story.
- **Averages hiding the truth.** Segment — a flat average can mask a power-user win and a newcomer loss.
- **Optimizing one metric into harm.** Always pair with a guardrail and a counter-metric.
- **Survivorship bias.** The users you can measure are the ones who stayed; the churned ones hold the lesson.
