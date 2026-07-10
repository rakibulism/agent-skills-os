---
name: de6-token-pipeline
description: Track 6 rail — Figma-to-code design token pipelines. Automated systems (Style Dictionary, Tokens Studio, Figma Variables API) that export design tokens from Figma variables into Tailwind configs, CSS custom properties, SCSS, JSON, and TypeScript declarations — with primitive/semantic tiers, light/dark modes, and CI automation. Use whenever setting up or reviewing a design token system, syncing Figma variables to code, theming (light/dark), configuring Tailwind from design decisions, or when design and code have drifted apart.
version: 0.1.0
tags: [design-engineering, architecture, components]
inputs:
  - name: system
    description: The component or state system being structured or reviewed.
    required: true
---

# Figma-to-Code Token Pipelines

Design tokens flow one way: **Figma variables are the source of truth; code consumes generated artifacts.** No human ever transcribes a hex code.

## Token Architecture — two tiers (+ component tier as needed)

- **Primitives:** raw values — `blue/500`, `space/4`, `radius/md`. Never referenced by components directly.
- **Semantics:** meaning — `color/bg/accent` → references `blue/500`; `color/fg/danger`, `space/section-gap`. **Components consume semantics almost exclusively** — this is what makes retheming a reference swap instead of a codebase grep.
- Naming identical in Figma and code (de2-figma-to-code): `color/bg/surface-2` in Figma = `--color-bg-surface-2` in CSS.

## Pipeline

1. **Export** Figma variables → JSON: Tokens Studio plugin, the Figma Variables REST API, or a small custom plugin. Preserve tiers and **modes** (light/dark variable modes = theme dimension).
2. **Transform with Style Dictionary** — one source, all targets:
   - **CSS custom properties**, with mode blocks: `:root { --color-bg-accent: … }` / `[data-theme="dark"] { … }`
   - **Tailwind config** mapped to the CSS vars so utilities stay theme-reactive:
     ```js
     colors: { accent: 'var(--color-bg-accent)' }   // NOT a baked hex
     ```
   - SCSS maps / JSON for native platforms and docs
   - **TypeScript declarations** of token names → autocomplete + compile-time validity (de6-typescript const-token pattern)
3. **Automate:** CI job or on-demand script pulls variables → regenerates → opens a PR. Designer changes a variable in Figma → the product updates in one reviewed commit.

## Motion, Radii, Z — tokens too

Durations, spring presets (`motion/spring/snappy = { stiffness: 170, damping: 26 }`), easing curves, radii, z-index scale, shadow stacks — all through the same pipeline, or design/code drift returns through the back door via animation values. Springs as structured tokens, not strings.

## Rules
- A raw hex/px in component code (outside the generated token files) is a defect.
- Semantic-only in components; primitives may appear only in the semantic-definition layer.
- Mode-test every semantic token: does `color/fg/muted` pass contrast on `color/bg/surface-2` in BOTH modes? (Contrast pairs: de1-perceptual-color.)
- Generated files are build artifacts: never hand-edited, always regenerable, committed for reviewability.

## Drift Audit
Grep for raw hex/rgb/px literals in components → each is either tokenized or justified in a comment. Diff Figma variable export vs. current token JSON in CI → fail on unreviewed drift.
