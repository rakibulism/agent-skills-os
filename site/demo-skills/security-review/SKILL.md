---
name: security-review
description: Look for common security issues in web code: injection, auth and secrets.
version: 0.1.0
tags: [engineering, security]
inputs:
  - name: code
    description: The code or feature to review.
    required: true
author: demo
demo: true
---

# security-review

Look for common security issues in web code: injection, auth and secrets.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need findings with severity, location and fix. Give it the **code**: the code or feature to review.

## Process

1. Trace user input to every sink.
2. Check authentication and authorization on each route.
3. Search for secrets and unsafe defaults.

## Output

Findings with severity, location and fix.

## What to avoid

- Reporting theoretical issues with no reachable path.
