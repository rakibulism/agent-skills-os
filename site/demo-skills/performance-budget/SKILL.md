---
name: performance-budget
description: Set and check a performance budget for a web page.
version: 0.1.0
tags: [engineering]
inputs:
  - name: page
    description: The page and its target devices.
    required: true
author: demo
demo: true
---

# performance-budget

Set and check a performance budget for a web page.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need budget table plus a ranked fix list. Give it the **page**: the page and its target devices.

## Process

1. Measure current Core Web Vitals.
2. Set budgets for JS, images and fonts.
3. List the biggest wins in order of effort.

## Output

Budget table plus a ranked fix list.

## What to avoid

- Optimizing before measuring.
