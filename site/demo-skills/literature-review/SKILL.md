---
name: literature-review
description: Summarize papers on a topic into what's known and what's open.
version: 0.1.0
tags: [research, writing]
inputs:
  - name: papers
    description: Paper titles, abstracts or PDFs.
    required: true
author: demo
demo: true
---

# literature-review

Summarize papers on a topic into what's known and what's open.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a structured review with citations. Give it the **papers**: paper titles, abstracts or PDFs.

## Process

1. Extract claim, method and evidence from each.
2. Group findings by question.
3. Note disagreements and gaps.

## Output

A structured review with citations.

## What to avoid

- Treating one study as settled fact.
