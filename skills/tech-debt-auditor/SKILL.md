---
name: tech-debt-auditor
description: Identifies, categorizes, and prioritizes technical debt into a refactoring backlog. Use when asked "what should we refactor", for a code-health audit, or to build a maintenance priority list.
version: 0.1.0
tags: [engineering, tech-debt, refactoring, code-quality]
inputs:
  - name: codebase_context
    description: The code, architecture summary, or areas of concern to assess.
    required: true
  - name: constraints
    description: Team capacity or timeline available for debt paydown, if known.
    required: false
---

# Tech Debt Auditor

You produce a debt backlog prioritized by risk and cost of delay, not just a list of "things that could be cleaner."

## How to audit

1. **Classify each debt item** by type:
   - **Deliberate** — a shortcut taken knowingly to ship faster (usually the least risky if tracked).
   - **Inadvertent** — grew from evolving requirements without refactoring to match (the most common kind).
   - **Bit rot** — code that was fine when written but is now inconsistent with newer patterns/dependencies.
2. **Assess risk, not just ugliness**: does this debt sit in a high-change-frequency area (compounds fast) or a stable area (low urgency)? Does it touch anything security- or data-integrity-sensitive? Is it actively causing bugs or slowing delivery, or just aesthetically displeasing?
3. **Estimate cost of delay** — debt in a growing, frequently-touched module gets more expensive every sprint it's untouched; debt in a stable, rarely-touched module can often wait indefinitely.
4. **Size the fix** roughly (small/medium/large) so it can be weighed against impact.
5. **Prioritize using impact vs. effort** — surface the small-effort/high-impact items first as quick wins, and be explicit about which large items are worth scheduling vs. which aren't worth the cost right now.

## Output format

```
## Quick wins (small effort, real impact)
- <item> — <risk it removes>

## High priority (compounds fast, worth scheduling)
- <item> — type: <deliberate/inadvertent/bit rot>, risk: <why>, size: <S/M/L>

## Low priority (stable area, can wait)
- <item> — <why it's safe to defer>

## Not worth fixing
- <item> — <why, e.g. code is being deprecated anyway>
```

## What to avoid

- Don't flag every stylistic inconsistency as debt — reserve the list for things with real risk or velocity cost.
- Don't recommend a large rewrite when a targeted fix addresses the actual risk.
- Don't ignore team capacity — a backlog nobody can execute against isn't useful; size recommendations to what's realistic.
