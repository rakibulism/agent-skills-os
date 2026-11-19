---
name: empty-states
description: Write empty, loading and error states that tell people what to do next.
version: 0.1.0
tags: [design, writing]
inputs:
  - name: context
    description: The screen and what it normally shows.
    required: true
author: demo
demo: true
---

# empty-states

Write empty, loading and error states that tell people what to do next.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need copy for each state with a primary action label. Give it the **context**: the screen and what it normally shows.

## Process

1. Find each state the screen can be in.
2. Say what happened in plain words.
3. Give the one next action that gets people unstuck.

## Output

Copy for each state with a primary action label.

## What to avoid

- Blaming the user or showing raw error codes.
