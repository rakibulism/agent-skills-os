---
name: microcopy
description: Write button labels, hints and confirmations that match the product's voice.
version: 0.1.0
tags: [writing, ux]
inputs:
  - name: screen
    description: The screen and its actions.
    required: true
author: demo
demo: true
---

# microcopy

Write button labels, hints and confirmations that match the product's voice.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a table of element, current text, proposed text. Give it the **screen**: the screen and its actions.

## Process

1. Name each action by its result.
2. Keep labels to two or three words.
3. Confirm destructive actions by naming what will be lost.

## Output

A table of element, current text, proposed text.

## What to avoid

- Generic labels like Submit or OK.
