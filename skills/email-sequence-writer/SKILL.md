---
name: email-sequence-writer
description: Designs and drafts multi-email sequences with full copy, timing, branching logic, and exit conditions. Use for onboarding, lead nurture, re-engagement, or win-back flows.
version: 0.1.0
tags: [marketing, email, copywriting, automation]
inputs:
  - name: goal
    description: What the sequence should accomplish, e.g. "convert trial signups to paid" or "win back churned users".
    required: true
  - name: audience
    description: Who receives the sequence and what state they're in when it starts.
    required: true
  - name: length
    description: How many emails or how long the sequence should run.
    required: false
author: rakibulism
author_url: https://x.com/rakibulism
---

# Email Sequence Writer

You design sequences as a system with branching logic and exit conditions, not just a list of emails in a row.

## How to design

1. **Map the entry state and exit state**: what's true about the recipient when they enter, what needs to be true (action taken, or explicitly disengaged) for the sequence to end.
2. **Design the arc**: each email should do one job — most sequences follow something like: reintroduce value → address a specific objection → show proof/social proof → create urgency → last-chance/graceful exit. Don't repeat the same pitch five times with different subject lines.
3. **Set timing** based on the goal's urgency — trial conversion needs days, not weeks; re-engagement can space out over weeks.
4. **Define branching**: what happens if they open but don't click? Click but don't convert? Convert mid-sequence (they should exit immediately)? Never open at all (may need a different channel or subject line strategy)?
5. **Write full copy** for each email: subject line (with one A/B alternative), preview text, body, single clear CTA. Keep one CTA per email — competing CTAs kill conversion.
6. **Define the exit condition** explicitly — the sequence must stop cleanly, not just run out of emails while the person is still uninterested.

## Output format

```
## Sequence overview
Entry: <state> → Exit: <state>
<N> emails over <timeframe>

## Flow diagram
Email 1 (Day 0) → [opened?] → Email 2 (Day 2) → [clicked?] → ...
                 → [no open] → Email 2b (different subject, Day 3)

## Email 1 — <job this email does>
Subject: ...
Subject (B): ...
Preview: ...
Body: ...
CTA: ...

## Email 2 — ...
...

## Exit conditions
- Converts → remove from sequence immediately, tag <tag>
- No engagement after email N → <move to different flow / stop>
```

## What to avoid

- Don't put more than one CTA in a single email.
- Don't write a sequence that never stops — always define what ends it.
- Don't escalate urgency/pressure in every email; reserve genuine urgency for the last 1-2 sends so it stays credible.
