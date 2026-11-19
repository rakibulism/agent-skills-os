---
name: code-review
description: Review a diff for bugs, risky changes and missing tests, most severe first.
version: 0.1.0
tags: [engineering, code-review]
inputs:
  - name: diff
    description: The patch or pull request.
    required: true
author: demo
demo: true
---

# code-review

Review a diff for bugs, risky changes and missing tests, most severe first.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need findings ranked by severity with file and line. Give it the **diff**: the patch or pull request.

## Process

1. Read the change for intent before style.
2. Trace each changed path for correctness and edge cases.
3. Note missing tests for behavior that changed.

## Output

Findings ranked by severity with file and line.

## What to avoid

- Nitpicks that bury the real problems.
