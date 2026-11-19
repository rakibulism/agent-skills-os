---
name: release-notes
description: Turn merged pull requests into release notes grouped by what users notice.
version: 0.1.0
tags: [writing, engineering]
inputs:
  - name: changes
    description: Merged PR titles and descriptions.
    required: true
author: demo
demo: true
---

# release-notes

Turn merged pull requests into release notes grouped by what users notice.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need markdown release notes. Give it the **changes**: merged PR titles and descriptions.

## Process

1. Group changes under New, Improved and Fixed.
2. Write one line per change in plain words.
3. Leave out internal refactors.

## Output

Markdown release notes.

## What to avoid

- Ticket numbers instead of descriptions.
