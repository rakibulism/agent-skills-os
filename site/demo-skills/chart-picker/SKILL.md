---
name: chart-picker
description: Choose the right chart for a dataset and the question it answers.
version: 0.1.0
tags: [data, design]
inputs:
  - name: question
    description: The question and the data shape.
    required: true
author: demo
demo: true
---

# chart-picker

Choose the right chart for a dataset and the question it answers.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a chart spec with reasons. Give it the **question**: the question and the data shape.

## Process

1. Identify comparison, trend, part-to-whole or distribution.
2. Pick the simplest chart that answers it.
3. Specify sorting, labels and color.

## Output

A chart spec with reasons.

## What to avoid

- Pie charts with many slices.
