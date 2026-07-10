---
name: de5-pointer-gestures
description: Track 5 rail — advanced pointer event handling. Unified Pointer Events for mouse/trackpad/touch/pen, setPointerCapture, touch-action CSS, velocity tracking with sample buffers, multi-touch pinch-zoom and rotation math, coalesced events for high-Hz styluses, and decoupling input handlers from rendering. Use whenever implementing drag, swipe, pinch-to-zoom, rotate gestures, drawing surfaces, or custom gesture recognizers, or when touch gestures fight page scrolling, drags "drop" mid-gesture, or drawing input looks choppy.
version: 0.1.0
tags: [design-engineering, performance, browser-internals]
inputs:
  - name: target
    description: The animation, render loop, or performance-critical code in question.
    required: true
---

# Advanced Pointer Event Handling

One unified input system — not separate mouse and touch code paths.

## Pointer Events Foundation

`pointerdown / pointermove / pointerup / pointercancel` cover mouse, touch, and pen with one API.
- **`el.setPointerCapture(e.pointerId)`** on drag start — moves keep arriving even when the pointer leaves the element (fixes "drag drops when moving fast").
- Always handle **`pointercancel`** (browser steals the gesture — incoming call, scroll takeover): treat as release, spring home.
- Track by `pointerId` — multi-touch means a Map of active pointers, not single-pointer globals.

## `touch-action` — half the battle

The browser competes for gestures; declare intent in CSS:
- `touch-action: none` on drag surfaces (else Chrome/Safari hijack for scrolling and your moves stop)
- `pan-y` when horizontal drag must coexist with vertical page scroll
- Missing touch-action is the #1 "works with mouse, broken on phone" bug.

## Velocity Tracking

Ring buffer of `{x, y, t}`; velocity over the trailing ~80ms window only (details + friction handoff: de4-momentum-inertia). Never derive velocity from just the last two events (noisy) or the whole gesture (stale).

## Multi-Touch Math (two active pointers p1, p2)

```js
scale    = dist(p1, p2) / dist(p1₀, p2₀);
rotation = atan2(p2.y - p1.y, p2.x - p1.x) - atan2(p2₀.y - p1₀.y, p2₀.x - p1₀.x);
pivot    = midpoint(p1, p2);
```
Zoom **around the pivot** (not the origin): compose `translate(pivot) · scale(s) · translate(-pivot)` onto the existing transform — use `DOMMatrix` and multiply, don't accumulate error by re-deriving from scratch. Re-baseline p₀ values whenever a finger is added/removed.

## High-Fidelity Input

- **`e.getCoalescedEvents()`** — the full-resolution trail between frames; 120–240Hz styluses report faster than RAF and drawing apps that ignore this produce chunky strokes.
- `e.pressure`, `tiltX/Y` for pen; `e.movementX/Y` under Pointer Lock for infinite-drag knobs.

## The Decoupling Rule

Handlers **write state only**; the RAF loop reads state and renders:
```js
onPointerMove = e => { state.x = e.clientX; state.y = e.clientY; };  // no DOM writes here
```
pointermove can fire >120×/s — rendering inside it wastes work between frames and fights the compositor (see de5-critical-rendering-path).
