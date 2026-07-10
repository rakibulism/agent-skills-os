---
name: de8-cicd
description: Track 8 rail — automated CI/CD workflows. GitHub Actions pipelines for creative-dev repos — typecheck/lint gates, unit tests for motion math, hard-failing performance budgets (size-limit), Lighthouse CI assertions against preview deploys, visual regression testing with frozen time for animations and deterministic WebGL frames, and automated preview/production deploys. Use whenever setting up or improving CI/CD, adding performance budgets or Lighthouse checks to a pipeline, implementing screenshot/visual regression tests (especially for animated or WebGL content), or automating deployments.
version: 0.1.0
tags: [design-engineering, deployment, infrastructure]
inputs:
  - name: pipeline
    description: The build, CI, or deployment setup being configured.
    required: true
---

# Automated CI/CD Workflows

The pipeline is the quality contract: every merge proves the work still looks right, runs fast, and fits budget — automatically.

## Pipeline Stages (GitHub Actions) — each gates the merge

**1. Static quality** (fast, first): `tsc --noEmit`, ESLint, format check.

**2. Tests:** **unit tests for the math** — spring solvers, easing functions, collision tests, projection formulas are pure functions: trivially testable and exactly where silent breakage hurts most (a sign flip in the damping term ships invisibly until every animation wobbles). Component tests for interaction state machines (every transition reachable — de6-state-systems).

**3. Build + budget enforcement — hard fail:**
```yaml
- run: npm run build
- run: npx size-limit          # asserts per-chunk gzip limits from de7-resource-budgets
```
A budget that doesn't fail CI is a wish.

**4. Lighthouse CI** against the preview deployment:
```yaml
- run: npx lhci autorun --collect.url=$PREVIEW_URL
# assertions: categories:performance >= 0.9, cumulative-layout-shift <= 0.1, largest-contentful-paint <= 2500
```
Mobile config, throttled — matching de7-core-web-vitals targets.

**5. Visual regression** — Playwright `toHaveScreenshot` per component/page state (or Chromatic/Percy for review workflows). **Animation discipline — the part everyone gets wrong:**
- Freeze CSS animation/transition via injected style (`*, *::before, *::after { animation: none !important; transition: none !important; }`) or seek to a fixed time.
- Mock `requestAnimationFrame` / advance a fake clock to a deterministic frame.
- **WebGL:** render a deterministic frame — fixed `uTime` uniform, fixed camera, seeded randomness — then screenshot.
- Sensible `maxDiffPixelRatio` (~0.01) for antialiasing noise; separate baselines per OS if runners differ.
- **A flaky visual test gets fixed or deleted the day it flakes** — a red-noise suite trains everyone to ignore red.

**6. Deploy:** preview per PR automatically (the design-review URL — de8-edge-deployment); production on main; rollback = redeploy previous immutable build.

## Speed
Cache the package-manager store and Playwright browsers between runs; parallelize independent jobs. **Whole pipeline ≤ ~5 minutes** — slower, and people start bypassing it, and a bypassed pipeline protects nothing.
