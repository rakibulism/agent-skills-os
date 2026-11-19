---
name: color-palette
description: Build an accessible color palette from one brand color.
version: 0.1.0
tags: [design, ui]
inputs:
  - name: brand
    description: The brand color.
    required: true
author: demo
demo: true
---

# color-palette

Build an accessible color palette from one brand color.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a scale with hex values and the contrast of each text pair. Give it the **brand**: the brand color.

## Process

1. Generate a perceptual scale in OKLCH.
2. Pick text, surface and accent steps that pass contrast.
3. Add dark-mode equivalents.

## Output

A scale with hex values and the contrast of each text pair.

## What to avoid

- Lightening by adding white, which shifts the hue.
