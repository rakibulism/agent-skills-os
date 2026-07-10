---
name: de4-spring-damper
description: Track 4 rail — spring-mass-damper systems (Hooke's law). Writing custom spring solvers (F = -kx - cv), damping ratio theory (under/critical/overdamped), stiffness-damping preset vocabulary, interruptible retargeting, settle detection, and chained springs for follow-through. Use whenever implementing springy/bouncy UI motion, configuring Framer Motion/react-spring/GSAP spring parameters, replacing tweens with interruptible animation, cursor followers with lag, or when a user asks why an animation pops/restarts when re-triggered or "feels robotic".
version: 0.1.0
tags: [design-engineering, physics, motion]
inputs:
  - name: motion
    description: The physical motion or gesture behavior being implemented.
    required: true
---

# Spring-Mass-Damper Systems

The single most important formula in interaction design:

```js
// F = -k·x - c·v    (Hooke's spring force minus damping)
const x = position - target;
const force = -stiffness * x - damping * velocity;
velocity += (force / mass) * dt;     // integrate (de4-euler-integration)
position += velocity * dt;
```

## Damping Ratio — motion character in one number

`ζ = c / (2 · √(k · m))`
- **ζ < 1 — underdamped:** overshoots and oscillates. Playful, bouncy, alive.
- **ζ = 1 — critically damped:** fastest possible settle, zero overshoot. Premium, precise. The default for most product UI.
- **ζ > 1 — overdamped:** slow syrupy approach. Rarely wanted; usually a mistuning.

## Preset Vocabulary (mass = 1) — specify motion in these terms

| Feel | k (stiffness) | c (damping) | ζ |
|---|---|---|---|
| Snappy, no bounce | 170 | 26 | ≈1.0 |
| Gentle bounce | 170 | 14 | ≈0.54 |
| Wobbly / playful | 180 | 12 | ≈0.45 |
| Stiff & instant | 400 | 40 | ≈1.0 |
| Slow settle | 120 | 22 | ≈1.0 |

Framer Motion / react-spring take these numbers directly.

## Why Springs Beat Duration Tweens

Springs are **interruptible**: retargeting mid-flight keeps current position AND velocity — motion redirects smoothly instead of popping or restarting. Any interaction the user can re-trigger mid-animation (hover, toggle, drag-release) **must** be spring-driven. This is the fix for "the animation glitches when I hover fast".

Velocity injection: on drag release, seed the spring's `velocity` with the gesture's release velocity (de4-momentum-inertia) — the handoff feels seamless.

## Settle & Chain

- **Settle detection:** stop when `|velocity| < 0.01 && |x| < 0.01`, then snap exactly to target (prevents eternal micro-oscillation and keeps the RAF loop killable).
- **Chained springs:** element B's target = element A's position → organic follow-through. Cursor trails, elastic list reordering, staggered settles — chain 3–6 springs with slightly varied k.

## 2D/3D
Run one solver per axis (springs are separable), or on vectors component-wise. For rotations, spring the quaternion components then normalize, or spring an angle.
