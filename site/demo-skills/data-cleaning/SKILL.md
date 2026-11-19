---
name: data-cleaning
description: Plan and script the cleaning of a messy dataset.
version: 0.1.0
tags: [data]
inputs:
  - name: dataset
    description: A sample of the data and its schema.
    required: true
author: demo
demo: true
---

# data-cleaning

Plan and script the cleaning of a messy dataset.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a cleaning plan plus pandas code. Give it the **dataset**: a sample of the data and its schema.

## Process

1. Profile missing, duplicate and outlier values.
2. Decide a rule for each issue.
3. Log every change for reproducibility.

## Output

A cleaning plan plus pandas code.

## What to avoid

- Silently dropping rows.
