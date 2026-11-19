---
name: form-design
description: Design forms that are quick to fill in and hard to get wrong.
version: 0.1.0
tags: [design, ux]
inputs:
  - name: fields
    description: The data the form must collect.
    required: true
author: demo
demo: true
---

# form-design

Design forms that are quick to fill in and hard to get wrong.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need field list with labels, help text and error messages. Give it the **fields**: the data the form must collect.

## Process

1. Remove every field you can infer or postpone.
2. Use the right input type and autocomplete for each field.
3. Validate inline, after the field loses focus.

## Output

Field list with labels, help text and error messages.

## What to avoid

- Placeholder text used as the label.
