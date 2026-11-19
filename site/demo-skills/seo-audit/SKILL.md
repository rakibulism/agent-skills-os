---
name: seo-audit
description: Audit a page for technical and on-page SEO issues.
version: 0.1.0
tags: [seo]
inputs:
  - name: url
    description: The page to audit.
    required: true
author: demo
demo: true
---

# seo-audit

Audit a page for technical and on-page SEO issues.

> Demo skill: an example to show how the library looks with many skills. Not published in the npm package.

## When to use

When you need issues ranked by impact with fixes. Give it the **url**: the page to audit.

## Process

1. Check indexability, canonical and robots.
2. Review title, headings and internal links.
3. Check speed and structured data.

## Output

Issues ranked by impact with fixes.

## What to avoid

- Keyword stuffing advice.
