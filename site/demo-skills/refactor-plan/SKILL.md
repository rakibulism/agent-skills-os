---
name: refactor-plan
description: Plan a refactor in small, safe steps that each keep the build green.
version: 0.1.0
tags: [engineering]
inputs:
  - name: code
    description: The code to change and the goal.
    required: true
author: demo
demo: true
---

# refactor-plan

Plan a refactor in small, safe steps that each keep the build green.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a numbered plan with a check after each step. Give it the **code**: the code to change and the goal.

## Process

1. Find the seams where behavior can be isolated.
2. Order steps so each is shippable alone.
3. Add characterization tests before moving code.

## Output

A numbered plan with a check after each step.

## What to avoid

- One big-bang rewrite.
