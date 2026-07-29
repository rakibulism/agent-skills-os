---
name: flow-auditor
description: Entry point for any "is this complete," "check the flow," or "did I miss anything" request. Decides whether the situation calls for a full product-wide flow-completeness sweep (every button/modal/route/state across an entire app) or a single-feature builder's checklist (CRUD completeness, permissions, relationships on one implemented feature), or both — then dispatches to the right method. Use this whenever scope isn't already obvious; use the two underlying skills directly when it is.
version: 0.1.0
tags: [ux, qa, audit, product, flows, review, completeness]
inputs:
  - name: scope
    description: What's being audited — an entire product/app spanning many screens, or one specific, already-implemented feature. Ask if it isn't clear from context.
    required: true
  - name: target
    description: The product or feature to audit — a live URL, screenshots, a Figma file, a codebase, or a pointer to the relevant screens/components.
    required: true
  - name: access_method
    description: How you'll inspect it — live crawl, codebase read, or screenshots/static files. Live crawl is strongly preferred for the micro lens.
    required: false
related: [flow-completeness-auditor, ux-flow-completeness-auditor]
author: rakibulism
author_url: https://x.com/rakibulism
---

# Flow Auditor

This is the entry point for completeness audits. It doesn't re-derive the audit method itself — it decides which of two lenses applies (or both), then runs that lens's method in full from its reference file. Both lenses share one discipline: **an interface isn't done because the happy path works — it's done when every path a user could take lands somewhere real.** They differ in scope and vantage point.

| | Macro lens — Product Flow Completeness | Micro lens — Feature Completeness Checklist |
|---|---|---|
| Scope | An entire product/app, many screens | One specific, already-implemented feature |
| Unit of analysis | Every interactive element, route, modal, form, and state across the whole surface | CRUD completeness, relationships, permissions, and placement for one feature |
| Best for | Pre-launch passes, "does everything go somewhere" sweeps, cross-screen consistency checks | Post-build reviews, "did I ship a half feature," admin/SaaS entity-and-role review |
| Full method | [references/product-flow-completeness.md](references/product-flow-completeness.md) — mirrors the standalone [`flow-completeness-auditor`](../flow-completeness-auditor/SKILL.md) skill | [references/feature-completeness-checklist.md](references/feature-completeness-checklist.md) — mirrors the standalone [`ux-flow-completeness-auditor`](../ux-flow-completeness-auditor/SKILL.md) skill |

## Choosing a lens

1. **Determine scope.** If it isn't already clear from the request, ask: is this a whole-product audit, or one feature that just got built?
2. **Whole product / many screens / pre-launch** → the macro lens. Load `references/product-flow-completeness.md` and run its method end to end: inventory → flow-trace → state-completeness → consistency → severity tag.
3. **One implemented feature / just shipped / "check what I built"** → the micro lens. Load `references/feature-completeness-checklist.md` and work the 8-item checklist (dead elements, one-way CRUD, unmanageable relationships, unsurfaced data, permission theatre, permission identity, standard placement, systematic state coverage) against the actual running app.
4. **Both apply** — e.g. a pre-launch audit that also needs to sanity-check one admin-heavy feature in depth. Run the macro lens first to inventory the whole surface and locate gaps, then zoom into any CRUD/permission-heavy feature it surfaces with the micro checklist. Report as one combined audit: macro findings first, with any micro-checklist findings nested under the feature they belong to.
5. **Don't guess silently.** If scope is genuinely ambiguous, ask before starting either lens — the two methods produce differently-shaped reports and picking wrong wastes the audit.

## Output

Use the output format defined in whichever reference file(s) you loaded — don't invent a third format. When combining both lenses, keep their vocabulary intact: macro findings stay 🔴 Blocking / 🟡 Incomplete / ⚪ Inconsistent by category; micro findings stay grouped as Gaps found / Already complete / Priority order, nested under the relevant macro section.

## What to avoid

- Don't run the micro checklist from source alone — it requires getting the feature into a running, clickable state (see the "How to run the audit" step in its reference file). Several of the gaps it targets are invisible from reading code.
- Don't substitute the macro lens for the micro lens on a single feature — a product-wide sweep won't catch one-way CRUD, permission theatre, or relationship-lifecycle gaps; those need the micro checklist specifically.
- Don't substitute the micro lens for the macro lens on a whole product — the checklist's per-feature depth doesn't generalize to cross-screen consistency or full-surface inventory.
- Don't skip the scoping question and default to one lens by habit.
