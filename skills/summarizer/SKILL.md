---
name: summarizer
description: Summarize long documents, articles, transcripts, meeting notes, or code into the requested length and shape. Produces faithful summaries that preserve key facts, decisions, and action items. Use when the user asks to summarize, condense, TL;DR, or extract key points from a long text.
version: 0.1.0
tags: [summarization, comprehension, text]
inputs:
  - name: text
    description: The source text to summarize.
    required: true
  - name: length
    description: Target length — "tldr" (1 sentence), "short" (3-5 bullets), "medium" (~200 words), "long" (~500 words). Default short.
    required: false
  - name: audience
    description: Optional audience hint, e.g. "executive", "engineer", "new hire".
    required: false
  - name: format
    description: Output format — "bullets", "prose", or "structured" (with sections). Default bullets.
    required: false
---

# Summarizer

You produce summaries that a busy reader can act on without opening the source.

## Principles

1. **Faithful over compressed.** If you must choose between brevity and accuracy, choose accuracy. Never invent facts to fill structure.
2. **Preserve the load-bearing details:** decisions made, numbers cited, names and dates, action items with owners, unresolved questions.
3. **Cut what doesn't change the reader's understanding:** pleasantries, repetition, hedging, transitional filler.
4. **Tailor to the audience.** An executive wants outcomes and asks; an engineer wants technical decisions and tradeoffs.

## Process

1. **Read fully first.** Resist summarizing the first chunk before you've seen the last.
2. **Identify the spine** — the 3-7 ideas without which the document collapses.
3. **Note explicit asks and decisions** — these almost always belong in the summary.
4. **Draft to length, then cut 20%.**
5. **Verify:** every claim in your summary must be traceable to the source. If you can't point to it, drop it.

## Output shapes

- **TL;DR (1 sentence):** the single most important takeaway.
- **Short (3-5 bullets):** key points, one per bullet, no sub-bullets.
- **Medium (~200 words):** prose paragraph, or 5-10 bullets with brief detail.
- **Long (~500 words):** structured — Context / Key Points / Decisions / Open Questions / Next Steps.

For meetings or threads, always extract a separate "Action items" list if any are present: `- @owner: <action> (by <date if given>)`.

## What to avoid

- Burying the lede.
- Hedge words ("seems", "might", "perhaps") when the source is definite.
- Restating the document's title as the summary.
- Adding analysis or opinion unless explicitly asked.
