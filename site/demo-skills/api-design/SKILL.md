---
name: api-design
description: Design a REST or RPC API that is consistent and easy to evolve.
version: 0.1.0
tags: [engineering]
inputs:
  - name: use-cases
    description: What clients need to do.
    required: true
author: demo
demo: true
---

# api-design

Design a REST or RPC API that is consistent and easy to evolve.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need endpoint list with request and response shapes. Give it the **use-cases**: what clients need to do.

## Process

1. Model resources and their relationships.
2. Pick consistent naming, pagination and errors.
3. Plan versioning before the first release.

## Output

Endpoint list with request and response shapes.

## What to avoid

- Verbs in resource URLs.
