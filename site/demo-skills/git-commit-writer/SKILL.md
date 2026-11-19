---
name: git-commit-writer
description: Write clear commit messages from a staged diff.
version: 0.1.0
tags: [engineering, writing]
inputs:
  - name: diff
    description: The staged changes.
    required: true
author: demo
demo: true
---

# git-commit-writer

Write clear commit messages from a staged diff.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a subject line and a short body. Give it the **diff**: the staged changes.

## Process

1. Summarize what changed in under 60 characters.
2. Explain why in the body.
3. Note anything a reviewer must check.

## Output

A subject line and a short body.

## What to avoid

- Messages that only say what files changed.
