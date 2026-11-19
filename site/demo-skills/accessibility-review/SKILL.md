---
name: accessibility-review
description: Check a page against WCAG 2.2 AA and explain each failure with a concrete fix.
version: 0.1.0
tags: [design, accessibility]
inputs:
  - name: page
    description: HTML, a URL or a component.
    required: true
author: demo
demo: true
---

# accessibility-review

Check a page against WCAG 2.2 AA and explain each failure with a concrete fix.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need failures grouped by WCAG criterion, each with the fix. Give it the **page**: hTML, a URL or a component.

## Process

1. Test keyboard order, focus visibility and traps.
2. Check names, roles and states of every control.
3. Measure text contrast and target sizes.

## Output

Failures grouped by WCAG criterion, each with the fix.

## What to avoid

- Adding ARIA where native HTML already works.
