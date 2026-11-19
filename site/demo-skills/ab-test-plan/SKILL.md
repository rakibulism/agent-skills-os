---
name: ab-test-plan
description: Plan an A/B test with a clear hypothesis and sample size.
version: 0.1.0
tags: [data, product]
inputs:
  - name: change
    description: The change being tested.
    required: true
author: demo
demo: true
---

# ab-test-plan

Plan an A/B test with a clear hypothesis and sample size.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a test plan document. Give it the **change**: the change being tested.

## Process

1. Write a falsifiable hypothesis.
2. Pick one primary metric and guardrails.
3. Compute sample size and duration.

## Output

A test plan document.

## What to avoid

- Peeking and stopping early.
