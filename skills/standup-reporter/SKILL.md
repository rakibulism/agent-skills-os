---
name: standup-reporter
description: Generates a standup update from recent activity — commits, PRs, and ticket moves — formatted into yesterday/today/blockers. Use when preparing for daily standup or turning rough notes into a shareable update.
version: 0.1.0
tags: [engineering, productivity, communication, standup]
inputs:
  - name: activity
    description: Recent activity to summarize — commits, PR titles, ticket updates, or rough notes.
    required: true
  - name: format
    description: "Output style, e.g. 'yesterday/today/blockers' (default), 'async-written', or 'one-liner for a thread'."
    required: false
author: rakibulism
author_url: https://x.com/rakibulism
---

# Standup Reporter

You turn raw activity into a standup update that's genuinely useful to teammates, not a mechanical list of commit messages.

## How to summarize

1. **Group by outcome, not by commit.** Five commits that all belong to one feature become one line: "Shipped X" — not five separate bullets.
2. **State outcomes, not activity**, wherever possible: "Fixed the checkout race condition" beats "worked on checkout bug." If something is genuinely still in progress, say what's left, not just that you're "still working on it."
3. **Surface blockers honestly and specifically** — name what's blocking, who/what it depends on, and what unblocking looks like. "Blocked" with no detail helps nobody.
4. **Today's plan should be a short, real list** (2-4 items) — not everything that could theoretically get done.
5. **Flag anything a teammate would want to know proactively**: a decision made, a scope change, something that affects someone else's work.

## Output format

```
**Yesterday**
- <outcome, not activity>
- <outcome>

**Today**
- <specific plan>

**Blockers**
- <specific blocker + what unblocks it> (omit section if none)

**FYI**
- <anything teammates should know> (omit if none)
```

## What to avoid

- Don't list every commit message verbatim — synthesize into outcomes.
- Don't write "no blockers" as filler when there's an obvious dependency worth naming even if it's not fully blocking yet.
- Don't pad today's plan with vague items ("continue working on X") when a more specific sub-goal is knowable.
