---
name: de7-core-web-vitals
description: Track 7 rail — Core Web Vitals on animation-heavy sites. Architecting for elite LCP (under 2.5s), INP (under 200ms), and CLS (under 0.1) when the page carries WebGL, heavy animation, and custom fonts — poster-image LCP strategy, hydration and long-task INP fixes, layout-reservation CLS fixes, and field measurement with the web-vitals library. Use whenever improving Lighthouse/CWV scores, diagnosing poor LCP/INP/CLS, launching a creative site that must also rank/convert, or reconciling rich animation with elite vitals.
version: 0.1.0
tags: [design-engineering, performance, analytics]
inputs:
  - name: site
    description: The site or experience being measured, budgeted, or profiled.
    required: true
---

# Core Web Vitals on Animation-Heavy Sites

Rich visuals and elite vitals are not in tension — if the architecture is right. Each metric has a creative-site-specific failure mode and fix.

## LCP < 2.5s — the poster strategy

**The LCP element must never wait for WebGL.**
- Serve a designed static poster (styled `<img>` render of the scene) as the hero — it *is* the LCP element; the live canvas swaps in behind a designed transition when ready (de7-resource-budgets).
- `<link rel="preload" as="image">` the poster (with `imagesrcset` for responsive); `fetchpriority="high"` on it.
- Hero text must not block on fonts: `font-display: swap` + tuned fallback (below).
- Server-render the shell; no client-render-then-fetch waterfalls in front of the hero.
- three.js parsing/executing before first paint = architecture bug: the 3D chunk loads after LCP (dynamic import).

## INP < 200ms — hydration & long tasks

- **Code-split so interaction handlers aren't buried behind three.js parsing.** The menu button must respond during scene load.
- Break Long Tasks (>50ms): chunk scene init with `scheduler.yield()`; heavy math to Workers (de5-lowlevel-js).
- Pointer handlers stay thin: write state, render in RAF (de5-pointer-gestures) — a 300ms handler is an INP of 300ms.
- Measure real interactions, not just load: INP is the worst interaction across the whole session.

## CLS < 0.1 — reserve everything

- Explicit `aspect-ratio` (or width/height) on **every** async visual container — canvas, video, images, embeds.
- **Canvas must appear at exactly the poster's dimensions** — the poster→canvas swap shifting layout is the classic creative-site CLS bug.
- Font swaps: tune the fallback with `size-adjust`/`ascent-override` in `@font-face` so text doesn't reflow when the webfont lands (or `font-display: optional` to skip the swap entirely).
- Nothing inserts above existing content post-load (banners, notices → reserved slots or overlays).
- Note: `transform` animations don't count as layout shift — another reason all motion lives on transform (de5-gpu-compositing).

## Measure in the Field

Lab Lighthouse ≠ a real Moto G on hotel Wi-Fi:
```js
import { onLCP, onINP, onCLS } from 'web-vitals';
onLCP(m => sendToAnalytics(m)); // + INP, CLS — with device context
```
Segment by device tier (deviceMemory, hardwareConcurrency, connection) — p75 per tier is the number that matters (pipeline: de8-telemetry). Lighthouse CI gates releases (de8-cicd).
