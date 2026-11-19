---
name: dependency-audit
description: Review a project's dependencies for risk, size and staleness.
version: 0.1.0
tags: [engineering, security]
inputs:
  - name: manifest
    description: package.json, requirements.txt or similar.
    required: true
author: demo
demo: true
---

# dependency-audit

Review a project's dependencies for risk, size and staleness.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a table: package, issue, recommendation. Give it the **manifest**: package.json, requirements.txt or similar.

## Process

1. Flag unmaintained or deprecated packages.
2. Check for known vulnerabilities and heavy transitive trees.
3. Suggest lighter or built-in replacements.

## Output

A table: package, issue, recommendation.

## What to avoid

- Upgrading majors without reading changelogs.
