---
name: dashboard-layout
description: Lay out a data dashboard so the most important numbers read first.
version: 0.1.0
tags: [design, ui, data]
inputs:
  - name: metrics
    description: The metrics and who reads them.
    required: true
author: demo
demo: true
---

# dashboard-layout

Lay out a data dashboard so the most important numbers read first.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a wireframe description with sections in order. Give it the **metrics**: the metrics and who reads them.

## Process

1. Rank metrics by the decision they inform.
2. Place the top three as large figures with change.
3. Group the rest by question, not by data source.

## Output

A wireframe description with sections in order.

## What to avoid

- Equal-sized cards for unequal importance.
