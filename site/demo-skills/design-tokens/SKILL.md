---
name: design-tokens
description: Turn a design's colors, type and spacing into named, themeable design tokens.
version: 0.1.0
tags: [design, ui]
inputs:
  - name: design
    description: Colors, fonts and spacing in use.
    required: true
author: demo
demo: true
---

# design-tokens

Turn a design's colors, type and spacing into named, themeable design tokens.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a token table plus JSON ready for Style Dictionary. Give it the **design**: colors, fonts and spacing in use.

## Process

1. Collect every raw value and group near-duplicates.
2. Name tokens by role, not by appearance.
3. Add dark-mode values and check contrast for each text pair.

## Output

A token table plus JSON ready for Style Dictionary.

## What to avoid

- Names like blue-500 for a role such as link color.
