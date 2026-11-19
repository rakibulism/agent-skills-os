---
name: agent-eval
description: Design an evaluation set for an AI agent's task.
version: 0.1.0
tags: [engineering, research]
inputs:
  - name: task
    description: What the agent should do.
    required: true
author: demo
demo: true
---

# agent-eval

Design an evaluation set for an AI agent's task.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need an eval spec with cases. Give it the **task**: what the agent should do.

## Process

1. Collect real inputs, including hard ones.
2. Define pass criteria per case.
3. Track results across versions.

## Output

An eval spec with cases.

## What to avoid

- Testing only easy examples.
