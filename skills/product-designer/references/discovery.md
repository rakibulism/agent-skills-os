# Discovery & the solution space

Discovery is the work of reducing uncertainty before you spend build budget. The output is not a spec — it's a set of well-tested bets and the cheapest experiments to validate them.

## Opportunity Solution Tree (Teresa Torres)

Keep discovery and delivery connected by mapping top-down:

```
OUTCOME (the metric you must move)
  └─ OPPORTUNITY (a user need / pain / desire that, if addressed, moves the outcome)
       └─ SOLUTION (a way to address the opportunity)
            └─ EXPERIMENT (the cheapest test that the solution works)
```

Rules of thumb:
- Start from one **outcome**, not a backlog of features.
- Generate **multiple opportunities** before solutions, and **multiple solutions** per opportunity. Comparison beats commitment-to-the-first-idea.
- Pick the opportunity by impact on the outcome × how addressable it is, not by who shouted loudest.

## Generating solution options

For any real opportunity, always lay out a spread, including the unglamorous ends:

- **Do nothing** — the honest baseline. Sometimes the right call.
- **Manual / concierge** — solve it by hand for a few users to learn before automating. Fastest signal.
- **Off-the-shelf / integrate** — buy or wire up an existing tool.
- **Build minimal** — the smallest custom thing that tests the bet.
- **Build full** — the ambitious version, costed honestly.

Naming the cheap options keeps the team from defaulting to the expensive one out of habit.

## Research methods, matched to the question

| You need to learn | Use |
|---|---|
| Why users behave as they do | 1:1 interviews (open, past-behavior focused) |
| How widespread a behavior is | Survey (after qualitative, to size it) |
| Whether they can use it | Usability test (5 users catches most issues) |
| Whether they'll act | Fake-door / landing-page / Wizard-of-Oz test |
| What actually happens at scale | Analytics, funnels, cohort retention |
| What's painful in their words | Support tickets, sales-loss reasons, reviews |

Pair qualitative (why) with quantitative (how much). One without the other misleads.

## Continuous, not a phase

Discovery isn't a gate before delivery; it runs alongside it. Talk to users weekly, keep a running list of opportunities, and let evidence — not the loudest stakeholder — reshuffle priorities.

## De-risking: test the assumption, not the feature

List the assumptions the plan rests on (desirability, usability, feasibility, viability). Rank by **impact if wrong × uncertainty**. For the top one, design the cheapest experiment that would change your mind. A test that can't fail isn't a test.
