---
name: sql-helper
description: Write and explain SQL queries from a plain-language question.
version: 0.1.0
tags: [engineering, data]
inputs:
  - name: question
    description: What you want to know, plus the table schema.
    required: true
author: demo
demo: true
---

# sql-helper

Write and explain SQL queries from a plain-language question.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need the query plus a two-line explanation. Give it the **question**: what you want to know, plus the table schema.

## Process

1. Restate the question as columns, filters and grouping.
2. Write the query with readable aliases.
3. Explain any join or window function used.

## Output

The query plus a two-line explanation.

## What to avoid

- SELECT * in production queries.
