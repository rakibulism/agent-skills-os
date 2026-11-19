---
name: icon-set-review
description: Check an icon set for consistent grid, stroke, corners and optical size.
version: 0.1.0
tags: [design, ui]
inputs:
  - name: icons
    description: SVG files or a screenshot of the set.
    required: true
author: demo
demo: true
---

# icon-set-review

Check an icon set for consistent grid, stroke, corners and optical size.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a list of icons to adjust and how. Give it the **icons**: sVG files or a screenshot of the set.

## Process

1. Overlay icons on the shared grid.
2. Compare stroke widths, end caps and corner radii.
3. Flag icons that look heavier or lighter than the rest.

## Output

A list of icons to adjust and how.

## What to avoid

- Judging icons only at a large preview size.
