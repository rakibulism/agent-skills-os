---
name: meeting-notes
description: Turn a meeting transcript into decisions, actions and open questions.
version: 0.1.0
tags: [productivity, writing]
inputs:
  - name: transcript
    description: The meeting transcript.
    required: true
author: demo
demo: true
---

# meeting-notes

Turn a meeting transcript into decisions, actions and open questions.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need notes in three sections. Give it the **transcript**: the meeting transcript.

## Process

1. Pull out decisions with who made them.
2. List actions with owners and dates.
3. Note unresolved questions.

## Output

Notes in three sections.

## What to avoid

- Summarizing every comment.
