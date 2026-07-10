---
name: de4-momentum-inertia
description: Track 4 rail — kinetic momentum and inertia. Pointer velocity tracking during drag, friction-based glide after release, iOS-style destination projection for snap points and paging, and rubber-band overscroll math. Use whenever implementing flick/swipe gestures, drag-release with momentum, inertial carousels, swipe-to-dismiss, bottom sheets with detents, custom scrolling surfaces, or overscroll bounce effects. Trigger on any mention of flick, swipe momentum, inertia, deceleration, or rubber-banding.
version: 0.1.0
tags: [design-engineering, physics, motion]
inputs:
  - name: motion
    description: The physical motion or gesture behavior being implemented.
    required: true
---

# Kinetic Momentum & Inertia

The drag → release → glide pattern that makes touch interfaces feel physical.

## 1. Track Velocity During Drag

Keep a ring buffer of `{x, y, t}` pointer samples. On release, compute velocity over the **trailing ~50–100ms only** (not the whole gesture — early motion is irrelevant; the flick is the last flick):
```js
const recent = samples.filter(s => now - s.t < 80);
const vx = (last.x - recent[0].x) / ((last.t - recent[0].t) / 1000); // px/s
```
Ignore the release event's own position jitter. (Pointer plumbing: de5-pointer-gestures.)

## 2. Friction Glide

```js
velocity *= Math.pow(friction, dt * 60);   // framerate-independent decay
position += velocity * dt;
// stop when Math.abs(velocity) < ~10 px/s
```
Friction feel table (per-60Hz-frame factor): **0.98** long glide (carousels) · **0.95** iOS-normal · **0.92** quick stop.

## 3. Destination Projection (the iOS technique)

Predict where the flick would land, then decide the target *before* animating:
```js
const projected = position + velocity * (friction / (1 - friction)) / 60;
```
Snap `projected` to the nearest valid rest point (card index, grid cell, sheet detent) → **spring** there (de4-spring-damper), seeding the spring with the release velocity. This is how paging carousels and bottom sheets choose their detent from flick *strength*, not just current position — a weak flick returns, a strong flick advances.

## 4. Rubber-Banding at Bounds (iOS formula)

Displayed overshoot while overdragging past an edge:
```js
displayed = (1 - 1 / ((x * c / d) + 1)) * d;   // x = raw overdrag, d = container dimension, c ≈ 0.55
```
Resistance grows asymptotically — you can never drag past `d`. On release: spring back to the bound. During glide, if the glide crosses a bound, transfer remaining velocity into the rubber-band spring (the iOS overscroll bounce).

## Composition
Full gesture lifecycle = pointer capture → velocity buffer → release → project → snap decision → spring with velocity injection → settle. State-machine it (idle → dragging → settling, de6-state-systems) so re-grabs mid-glide retarget cleanly.

## Debug Heuristics
Flick feels dead → velocity window too long (averaging in slow early motion). Lands on wrong card → projection missing, snapping by position only. Glide speed differs across devices → friction not dt-corrected. Harsh edge stops → no rubber band.
