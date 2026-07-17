---
name: de-ui-physics
description: Track 4 of the Design Engineer curriculum — Newtonian physics in UI code. Euler integration loops, spring-mass-damper solvers (Hooke's law), flick momentum and friction, collision detection (AABB, bounding spheres, SAT), and custom bezier/Hermite interpolation math. Use this skill whenever the user wants natural-feeling motion such as springy animations, draggable elements with momentum, flick-to-dismiss, rubber-banding, bouncy transitions, elements that collide or repel, custom easing curves, inertial scrolling, or asks why an animation "feels robotic/linear/cheap". Also trigger when implementing anything with Framer Motion springs, react-spring, GSAP inertia, or hand-rolled animation loops.
---

# Track 4: The Physics Engine

Elements with mass, friction, and kinetic energy feel real; tweened elements feel like PowerPoint. This skill covers implementing physical motion from first principles.

## 1. Euler Integration — the heartbeat

Every physics-driven animation is this loop:
```js
// per frame, dt in seconds
velocity += acceleration * dt;
position += velocity * dt;
```
Rules that keep it stable:
- **Compute real dt** from RAF timestamps (`(now - last) / 1000`), and **clamp it** (`dt = Math.min(dt, 1/30)`) so a background-tab pause doesn't teleport elements across the screen.
- This is *semi-implicit Euler* (velocity updated before position) — more stable than naive Euler; use it.
- For high stiffness springs or fast sims, run **fixed-timestep substeps** (e.g., 4 × dt/4) to prevent explosion.
- Frame-rate independence test: the motion must look identical at 60 and 120Hz. If it doesn't, dt handling is broken somewhere (usually a hardcoded `+= 0.1`).

The cheap cousin — exponential smoothing (`pos += (target - pos) * lambda`) — is fine for cursor followers, but make it framerate-independent: `pos += (target - pos) * (1 - Math.exp(-rate * dt))`.

## 2. Spring-Mass-Damper Systems (Hooke's Law)

The single most important formula in interaction design:
```js
// F = -k·x - c·v   (spring force minus damping)
const x = position - target;
const force = -stiffness * x - damping * velocity;
velocity += (force / mass) * dt;
position += velocity * dt;
```
- **Damping ratio** `ζ = c / (2·√(k·m))` determines character:
  - ζ < 1 → underdamped: overshoots and oscillates (playful, bouncy)
  - ζ = 1 → critically damped: fastest settle, no overshoot (premium, precise)
  - ζ > 1 → overdamped: slow, syrupy approach
- **Preset vocabulary** (mass = 1): snappy-no-bounce `k=170, c=26` (ζ≈1); gentle bounce `k=170, c=14`; wobbly `k=180, c=12`; stiff instant `k=400, c=40`; slow settle `k=120, c=22`. State presets in these terms when specifying motion.
- **Why springs beat duration-based tweens:** springs are *interruptible* — retargeting mid-flight keeps current position AND velocity, so motion never pops or restarts. Any interaction the user can re-trigger mid-animation (hover, drag-release, toggles) must be spring-driven.
- **Settle detection:** stop the loop when `|velocity| < 0.01 && |position - target| < 0.01` — then snap exactly to target.
- **Chained/staggered springs:** drive element B's target from element A's position → organic follow-through (trailing cursor dots, elastic list reordering).

## 3. Kinetic Momentum & Inertia (flicks)

The drag-release-glide pattern:
1. **Track velocity during drag:** keep the last few pointer samples; velocity = distance/time over the last ~50–100ms window (not the whole gesture). Or exponential-smooth per-move deltas.
2. **On release, hand velocity to a friction sim:**
```js
velocity *= Math.pow(friction, dt * 60);   // friction ≈ 0.95 per 60Hz frame
position += velocity * dt;
// stop when |velocity| < threshold
```
   `friction 0.95` ≈ iOS "normal" deceleration feel; `0.98` glides long (carousels); `0.92` stops quick.
3. **Projected destination** (iOS technique): predict where the flick lands — `projection = position + velocity × (friction / (1 - friction)) / 60` — then snap that projection to the nearest valid rest point (card index, snap grid) and spring to it. This is how paging carousels and bottom sheets choose which detent to land on based on flick strength, not just position.
4. **Rubber-banding at bounds** (iOS formula): displayed overshoot = `(1 - 1/(x·c/d + 1)) × d` where x = raw overdrag, d = dimension, c ≈ 0.55. On release, spring back to the bound.

## 4. Collision Detection

For UI elements that bump, repel, or contain each other:
- **AABB (axis-aligned bounding box):** `a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y`. First test for everything; often the only test needed.
- **Bounding circles:** collide when `dist² < (r1+r2)²` (compare squared — skip the sqrt). Resolution: push apart along the center-line by the overlap; for dynamic response, exchange velocity components along the collision normal.
- **SAT (Separating Axis Theorem)** for rotated rectangles/convex polygons: project both shapes onto each candidate axis (the face normals); if any axis shows a gap, no collision. The minimum-overlap axis gives the resolution vector (MTV).
- **Broad-phase:** >~50 colliding objects → spatial hash grid (cell size ≈ largest object) so you only test neighbors, not all pairs (O(n²) → ~O(n)).
- Practical UI uses: repelling magnetic buttons, physics-piled tag clouds, draggable cards that shove siblings, cursor-avoiding elements (treat cursor as a circle collider with a force field: repulsion force ∝ 1/dist², clamped).

## 5. Bezier & Spline Math

When motion must follow an authored curve rather than emerge from forces:
- **Cubic bezier evaluation:** `B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃`.
- **CSS easing gotcha:** `cubic-bezier(x1,y1,x2,y2)` maps time→progress and needs *inverting* (solve x(t)=elapsed for t via Newton-Raphson, then evaluate y(t)) — that's what the browser does internally. When hand-rolling easings in JS, either implement that solver or use plain easing functions: `easeOutExpo = 1 - Math.pow(2, -10*t)`, `easeOutCubic = 1 - Math.pow(1-t, 3)`.
- **Hermite splines / Catmull-Rom:** interpolate *through* a set of points with automatic tangents — path-following animations, smoothing hand-drawn cursor trails, camera paths. Catmull-Rom tangents: `tᵢ = (pᵢ₊₁ - pᵢ₋₁) / 2`.
- **Arc-length reparameterization:** bezier `t` is not distance — motion at constant `t`-speed visibly accelerates through flat curve regions. For constant-speed path travel, precompute a lookup table of cumulative segment lengths and sample by distance.

## Choosing the Model

| Interaction | Model |
|---|---|
| Hover/press/toggle states | Spring (interruptible) |
| Drag release | Velocity capture → friction glide → spring to snap point |
| Cursor followers/trails | Exponential smoothing or soft spring, chained for trails |
| Elements reacting to each other | Circle/AABB collision + repulsion forces |
| Motion along an authored path | Catmull-Rom + arc-length parameterization |
| Simple enter/exit (non-interruptible) | Plain easing function is fine — don't over-engineer |

Libraries (Framer Motion, react-spring, GSAP Inertia) implement all of this — use them for product work, but spec their parameters in physical terms (stiffness/damping/friction), and hand-roll when inside Canvas/WebGL loops where library overhead or API mismatch costs frames.
