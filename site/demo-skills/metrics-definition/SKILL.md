---
name: metrics-definition
description: Define product metrics precisely enough to compute the same way twice.
version: 0.1.0
tags: [data, product]
inputs:
  - name: goal
    description: What the team wants to measure.
    required: true
author: demo
demo: true
---

# metrics-definition

Define product metrics precisely enough to compute the same way twice.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a metric spec per metric. Give it the **goal**: what the team wants to measure.

## Process

1. Name the metric and its decision.
2. Define numerator, denominator and time window.
3. List known edge cases.

## Output

A metric spec per metric.

## What to avoid

- Vanity metrics with no decision attached.
