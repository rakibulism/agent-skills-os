---
name: de4-bezier-splines
description: Track 4 rail — bezier curve and spline math. Cubic bezier evaluation, how CSS cubic-bezier() easing actually works (time-remapping and Newton-Raphson inversion), standard easing functions in JS, Hermite/Catmull-Rom splines for path-through-points motion, and arc-length reparameterization for constant-speed travel. Use whenever hand-rolling easing functions, implementing motion along a curved path, smoothing cursor trails or camera paths, converting CSS easing to JS/canvas/WebGL animation, or when path-following motion visibly speeds up and slows down unintentionally.
version: 0.1.0
tags: [design-engineering, physics, motion]
inputs:
  - name: motion
    description: The physical motion or gesture behavior being implemented.
    required: true
---

# Bezier Curve & Spline Math

For motion that follows an authored curve rather than emerging from forces.

## Cubic Bezier Evaluation

```
B(t) = (1-t)³P₀ + 3(1-t)²t·P₁ + 3(1-t)t²·P₂ + t³P₃      t ∈ [0,1]
```
Tangent (for orienting objects along the path) = derivative:
`B'(t) = 3(1-t)²(P₁-P₀) + 6(1-t)t(P₂-P₁) + 3t²(P₃-P₂)`

## The CSS `cubic-bezier()` Gotcha

`cubic-bezier(x1,y1,x2,y2)` defines a curve mapping **time → progress** with P₀=(0,0), P₃=(1,1). Sampling it isn't direct: you must **invert** — solve `x(t) = elapsedFraction` for t (Newton-Raphson, 4–8 iterations, bisection fallback), then evaluate `y(t)` for progress. That's what the browser does internally. Hand-rolling in JS/canvas/WebGL: implement that solver, or skip beziers for plain easing functions:

```js
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeOutExpo  = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);   // the premium "expo-out"
const easeInOutCubic = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
```

Reference translations: CSS `ease` ≈ `cubic-bezier(0.25, 0.1, 0.25, 1)`; the premium expo-out ≈ `cubic-bezier(0.16, 1, 0.3, 1)`.

## Catmull-Rom / Hermite Splines — through points, not near them

Beziers need hand-placed control handles; Catmull-Rom interpolates **through** a point list with automatic tangents:
```
tangentᵢ = (Pᵢ₊₁ - Pᵢ₋₁) / 2        (then evaluate as Hermite per segment)
```
Uses: camera paths through keyed positions, smoothing hand-drawn cursor trails, path-following elements, scroll-mapped camera rigs (Three.js: `CatmullRomCurve3`).

## Arc-Length Reparameterization — constant speed

Bezier/spline `t` is **not distance**: equal t-steps move faster through stretched regions — path-following at constant t-speed visibly lurches. Fix:
1. Sample the curve finely (100–200 points), accumulate segment lengths into a cumulative table.
2. To travel at constant speed, look up distance → t (binary search + lerp between table entries).
3. Cache the table; rebuild only when control points change.

Any "move along this path" feature without arc-length parameterization will be flagged in review the moment the path has both tight and flat sections.

## Choosing
Authored one-shot enter/exit → easing function (simplest wins). Path through waypoints → Catmull-Rom + arc-length. Interruptible/physical → springs instead (de4-spring-damper). Matching an After Effects curve → port the bezier handles (de2-motion-prototyping).
