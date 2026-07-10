---
name: de5-gpu-compositing
description: Track 5 rail — GPU compositor layer acceleration. Using transform translate3d, will-change, and opacity to promote elements onto GPU compositor layers, layer lifecycle management (promote before animating, demote after), layer-explosion memory risks, scroll-linked motion done correctly, and paint-flashing verification. Use whenever animations stutter despite simple code, when setting up transform/parallax/scroll-driven effects, when deciding where to apply will-change, or when reviewing CSS for GPU acceleration.
version: 0.1.0
tags: [design-engineering, performance, browser-internals]
inputs:
  - name: target
    description: The animation, render loop, or performance-critical code in question.
    required: true
---

# GPU Composite Layer Acceleration

Composited layers let the GPU move pixels without the CPU repainting them. Mastering the layer lifecycle = free-feeling animation.

## Promotion

Elements get their own compositor layer when they have: animated `transform` or `opacity`, `will-change: transform/opacity`, 3D transforms (`translate3d/translateZ(0)`), `position: fixed/sticky` (usually), canvas/video, or sit above a composited sibling.

```css
.card { will-change: transform; }          /* hint BEFORE animating — prevents first-frame jank */
.card { transform: translate3d(0,0,0); }   /* legacy force-promotion hack; prefer will-change */
```

## The Layer Lifecycle Rule

**Promote just before animating; demote after.** Every layer costs GPU memory (width × height × 4 bytes × DPR²) — a full-screen layer on a 3× phone ≈ 40MB+. Dozens of permanent `will-change` elements = layer explosion = mobile tab crash.

```js
el.style.willChange = 'transform';
el.addEventListener('transitionend', () => { el.style.willChange = 'auto'; }, { once: true });
```
Static `will-change` in a stylesheet is acceptable only for a handful of persistently-animated elements (a cursor follower, a fixed header).

## Scroll-Linked Motion — done right

- Never mutate styles inside a `scroll` event (fires off-cadence with rendering → guaranteed jitter). Read `scrollY` inside RAF and write transforms there.
- Better: **CSS scroll-driven animations** (`animation-timeline: scroll()/view()`) — the compositor drives them entirely off-main-thread where supported.
- Parallax = composited `translate3d` on layers, never `background-position` (paints every frame).

## Compositing Caveats

- Composited ≠ free paint: changing the layer's **content** (text, shadows, filters) still repaints that layer. Composite-cheap properties are transform/opacity *only*.
- `filter`/`backdrop-filter` promote but are GPU-expensive per frame — budget them, especially `backdrop-filter: blur()` over large areas on mobile.
- Sub-pixel text on transformed layers can shimmer; snap settled positions to integers.

## Verification
DevTools → Rendering: **Paint flashing** (idle animations must show zero green), **Layer borders** (confirm promotion; spot explosions), Frame Rendering Stats (live FPS + GPU memory). Layers panel shows per-layer memory — audit anything unexpectedly large.
