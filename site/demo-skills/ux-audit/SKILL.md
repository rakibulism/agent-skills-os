---
name: ux-audit
description: Review a screen or flow for usability problems and return them ranked by impact.
version: 0.1.0
tags: [design, ux]
inputs:
  - name: screen
    description: A screenshot, URL or description of the screen.
    required: true
author: demo
demo: true
---

# ux-audit

Review a screen or flow for usability problems and return them ranked by impact.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a numbered list: issue, where it is, why it hurts, the fix. Give it the **screen**: a screenshot, URL or description of the screen.

## Process

1. Walk the main task as a first-time user and note every hesitation.
2. Check hierarchy, labels, feedback, errors and empty states.
3. Rank each issue by how many users it blocks and how often.

## Output

A numbered list: issue, where it is, why it hurts, the fix.

## What to avoid

- Listing taste preferences as usability problems.
