# MVP scoping

An MVP is the smallest thing that produces a real signal about your riskiest bet. It is an experiment, not a miniature product. Scope it by what you need to *learn*, not by what you can *cut*.

## Reframe: minimum *viable*, both words matter

- **Minimum** — strip everything not needed to test the core hypothesis.
- **Viable** — it must still deliver enough value that a real user would actually use it and you'd trust the signal. A skateboard, not a car's front wheel.

The classic illustration: don't ship a wheel, then a chassis, then a car (each useless until the last). Ship a skateboard, then a scooter, then a bike — each usable, each teaching you something.

## The three-bucket cut

Make scope decisions explicit and visible:

```
IN (v1 ships with this):        the irreducible core that tests the bet
DEFERRED (fast-follow):         valuable, but not needed to learn
OUT (deliberately not doing):   tempting things we're saying no to, on purpose
```

The "OUT" bucket is the most important and the most often skipped. Naming what you won't do prevents scope creep and aligns the team.

## How to find the core

1. Write the hypothesis: "We believe [X] for [users] will cause [outcome]."
2. Ask of every proposed feature: *does this feature change whether we can validate the hypothesis?* If no, it's deferred or out.
3. Prefer manual over automated where volume is low. Concierge/Wizard-of-Oz MVPs (humans behind the curtain) test demand without building the machine.
4. Prefer one polished path over three rough ones. A narrow product that works beats a broad one that frustrates — frustration corrupts your signal.

## Quality is not the variable you cut

Common mistake: "MVP" used as an excuse for broken, ugly, or untrustworthy. Cut **scope** (how many things it does), not **quality** (how well it does them). A buggy MVP teaches you that it's buggy, not whether the idea works.

## Define "done" and "what we'll learn"

Before building, write:
- **Launch criteria:** what must be true to ship (the core path works end to end, instrumentation is in place).
- **Learning goal:** the specific question this answers and the metric/threshold that answers it.
- **Decision rule:** "If we see X, we double down; if we see Y, we pivot; if Z, we kill it."

Scoping is done when the team agrees on the IN/DEFERRED/OUT buckets, the hypothesis, and the decision rule — and could build it without re-litigating what counts as v1.
