---
name: schema-markup
description: Generate JSON-LD structured data for a page.
version: 0.1.0
tags: [seo, engineering]
inputs:
  - name: page
    description: The page type and its content.
    required: true
author: demo
demo: true
---

# schema-markup

Generate JSON-LD structured data for a page.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a JSON-LD script tag. Give it the **page**: the page type and its content.

## Process

1. Pick the schema.org type that fits.
2. Fill required and recommended properties.
3. Validate against the rich results rules.

## Output

A JSON-LD script tag.

## What to avoid

- Marking up content that isn't on the page.
