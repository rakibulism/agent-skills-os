---
name: incident-summary
description: Turn incident notes into a blameless postmortem.
version: 0.1.0
tags: [engineering, writing]
inputs:
  - name: notes
    description: Timeline, logs and chat excerpts.
    required: true
author: demo
demo: true
---

# incident-summary

Turn incident notes into a blameless postmortem.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a postmortem: summary, impact, timeline, causes, actions. Give it the **notes**: timeline, logs and chat excerpts.

## Process

1. Build an accurate timeline in UTC.
2. Separate the trigger from the root causes.
3. List actions with owners and dates.

## Output

A postmortem: summary, impact, timeline, causes, actions.

## What to avoid

- Naming individuals as the cause.
