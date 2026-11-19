---
name: test-writer
description: Write focused unit tests for a function, covering edge cases first.
version: 0.1.0
tags: [engineering, testing]
inputs:
  - name: code
    description: The function or module to test.
    required: true
author: demo
demo: true
---

# test-writer

Write focused unit tests for a function, covering edge cases first.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need a test file in the project's framework. Give it the **code**: the function or module to test.

## Process

1. List the inputs that change behavior.
2. Write one test per behavior, named for it.
3. Cover errors and boundaries before the happy path.

## Output

A test file in the project's framework.

## What to avoid

- Tests that only re-state the implementation.
