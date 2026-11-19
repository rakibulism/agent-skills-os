---
name: keyword-research
description: Find keywords worth targeting for a topic and group them by intent.
version: 0.1.0
tags: [seo, marketing]
inputs:
  - name: topic
    description: The topic and audience.
    required: true
author: demo
demo: true
---

# keyword-research

Find keywords worth targeting for a topic and group them by intent.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a keyword map: page, primary, secondary, intent. Give it the **topic**: the topic and audience.

## Process

1. Expand the topic into related queries.
2. Group queries by search intent.
3. Pick one primary keyword per page.

## Output

A keyword map: page, primary, secondary, intent.

## What to avoid

- Targeting the same keyword on two pages.
