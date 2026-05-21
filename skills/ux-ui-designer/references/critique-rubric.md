# Critique rubric

A useful critique changes the work. That means: specific, prioritized, and kind. Lead with what's working (so it survives the next revision), then issues ranked by impact, each with a concrete fix — not just a complaint.

## Output structure for a critique

```
# Critique: <screen / flow>

**Context I'm assuming:** <user, job, platform> — correct me if wrong.

## What's working (keep these)
- <strength> — why it works

## Issues, by severity

### Blockers (the user can't or won't complete the task)
- **<issue>** — <why it breaks the task> → **Fix:** <specific change>

### Major (significant friction, confusion, or risk)
- ...

### Minor (works, but costs the user effort or trust)
- ...

### Polish (taste-level; do last, optional)
- ...

## If I could change one thing
<the single highest-leverage change>
```

## Lenses to run the design through

- **Task completion:** can the user finish, and how many decisions/steps does it cost? Where do they hesitate?
- **Hierarchy:** squint at it — does the most important thing dominate? Is the primary action obvious in under 2 seconds?
- **Clarity of next step:** at every screen, is "what do I do now" answerable without reading everything?
- **Consistency:** same patterns, words, and spacing for the same things? Any one-off that should be systematized?
- **Feedback & status:** does every action confirm itself? Are waits and errors handled?
- **Accessibility:** contrast, focus, keyboard, target size, labels (see accessibility-quickref).
- **Content:** is the copy doing work? Labels and microcopy are UI; vague ones are bugs.
- **Edge & empty states:** are they designed or improvised?

## Severity, defined

- **Blocker** — prevents the core task or causes data loss / a serious accessibility barrier.
- **Major** — the task is possible but the user is likely to err, give up, or distrust.
- **Minor** — measurable extra effort or a consistency lapse; not task-fatal.
- **Polish** — aesthetic refinement with no functional cost.

## How to phrase feedback

- Tie every note to a user consequence, not personal preference: "This label is ambiguous, so users may pick the wrong option" beats "I'd use a different word."
- Offer a direction, not just a verdict. "Make the primary button higher contrast and the only filled button on the screen" beats "the CTA is weak."
- Separate observation from prescription so the designer can solve it their own way when there are several good answers.
