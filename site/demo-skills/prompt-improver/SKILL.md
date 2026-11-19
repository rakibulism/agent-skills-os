---
name: prompt-improver
description: Rewrite a prompt so a model follows it reliably.
version: 0.1.0
tags: [engineering, writing]
inputs:
  - name: prompt
    description: The current prompt and its failures.
    required: true
author: demo
demo: true
---

# prompt-improver

Rewrite a prompt so a model follows it reliably.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need the rewritten prompt with notes. Give it the **prompt**: the current prompt and its failures.

## Process

1. Lead with the task and the output shape.
2. Add one concrete example.
3. Name the failure modes to avoid.

## Output

The rewritten prompt with notes.

## What to avoid

- Adding emphasis instead of clarity.
