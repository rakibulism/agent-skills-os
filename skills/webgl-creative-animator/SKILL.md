---
name: webgl-creative-animator
description: Become an elite creative WebGL thinker — the mental framework, mathematical grounding, and technique library behind world-class generative/interactive graphics (Awwwards-tier sites, Shadertoy demos, GPU art installations). Covers systems-based thinking over keyframe animation, the five signature technique families (raymarched SDFs, GPGPU particle simulation, vertex noise displacement, post-processing, fluid dynamics), the required tech stack (GLSL, Three.js/R3F, vanilla WebGL2), and a daily training regimen. Use whenever the user wants to design an original WebGL/shader animation, is stuck thinking in DOM/CSS-keyframe terms instead of GPU-system terms, wants to build a creative-coding portfolio, or asks "how do I get good at this" for shader/particle/fluid work. Complements the design-engineer skill's Track 3 (de3-glsl-shaders) and Track 9 (webgl-motion-stack/wgl-*) reference files by supplying the conceptual model and the specific formulas those references assume.
version: 0.2.0
tags: [design-engineering, webgl, glsl, shaders, creative-coding, graphics-math]
inputs:
  - name: goal
    description: What the user is trying to build or learn (a specific effect, a portfolio piece, a mental-model shift, a technique deep-dive).
    required: true
  - name: experience_level
    description: Current familiarity with GLSL/WebGL/Three.js — shapes how much foundational math to front-load vs. how fast to reach for the deep-dive reference file.
    required: false
related: [design-engineer]
---

# WebGL Creative Animator

WebGL removes the constraints that shape ordinary web animation (DOM elements, CSS transitions, a fixed set of easing curves). What replaces those constraints is not "more animation" — it's a different unit of work. In CSS you animate an element's properties over a timeline. In WebGL you write a **system**: a rule, applied per-pixel or per-particle, re-evaluated every frame, that produces motion as an emergent property rather than an authored one. Getting this shift wrong is the single most common reason technically-competent shader code still looks amateurish — the code runs, but it was designed like a tween.

## The core reframe

**Think in fields, not frames.** A traditional animator asks "where is this object at t=2s?" A WebGL creative coder asks "what is the value of this property (color, displacement, velocity, density) at this point in space, given time and neighboring state?" Every technique below is a different answer to that question — a fragment shader is a function from `(pixel, time)` to color; a GPGPU particle system is a function from `(particle, time, neighbor state)` to position; a vertex displacement is a function from `(vertex, time)` to offset. See [references/core-pillars.md](references/core-pillars.md) for the full mental-model breakdown (systems vs. keyframes, vector-math intuition, "the world as data," and the art→code bridge with concrete chiaroscuro/color-theory-to-GLSL translations).

## The five technique families

Route to the matching reference file the moment the user's ask matches a pattern:

| Signal in the ask | Technique | Reference |
|---|---|---|
| "morphing blob," "liquid metaball," "impossible geometry," "infinite fractal" | Raymarching + Signed Distance Fields | [references/raymarching-sdf.md](references/raymarching-sdf.md) |
| "millions of particles," "cosmic dust," "interactive sand/smoke," "reacts to cursor at 60fps" | GPU-driven particle simulation (FBO/GPGPU) | [references/gpgpu-particles.md](references/gpgpu-particles.md) |
| "ocean waves," "waving flag," "glitching hologram," "terrain forming/dissolving" | Vertex displacement via noise fields | [references/vertex-displacement-noise.md](references/vertex-displacement-noise.md) |
| "cinematic depth of field," "chromatic aberration," "CRT effect," "neon bloom," "motion blur" | Post-processing / screen-space effects | [references/post-processing.md](references/post-processing.md) |
| "ink in water," "smoke trail," "watercolor blend," "turbulence warping type" | Fluid dynamics (Navier–Stokes on a grid) | [references/fluid-dynamics.md](references/fluid-dynamics.md) |

Each reference is self-contained: the underlying math, the correct GLSL/JS implementation pattern, the specific failure modes, and what to tune for a different visual result. Don't guess at the formulas from memory when one of these is loaded — use the reference; these techniques fail silently (wrong-looking but no error) when a constant or sign is off.

## The stack, in dependency order

[references/tech-stack.md](references/tech-stack.md) covers this in depth, but the short version: **GLSL is non-negotiable and the other two layers are conveniences on top of it.**

```
[ Math foundations ]  →  [ Three.js / React Three Fiber ]  →  [ Vanilla WebGL / WebGL2 ]
 trig, vectors,            scene graph, camera, lighting,        raw gl.* API, custom
 matrices, dot/cross       R3F declarative wrapper                render pipelines
                                        │
                                        ▼
                          [ GLSL — vertex + fragment shaders ]
                           the actual creative surface; everything
                           above exists to get uniforms/attributes
                           into these two functions
```

Reach for vanilla WebGL2 only when Three.js's abstractions (its material system, its render-target management) get in the way of a custom multi-pass pipeline — not by default, and not to prove you can.

## Daily practice

Talent here is trained, not innate — see [references/daily-training.md](references/daily-training.md) for a concrete 30-minutes-a-day regimen: deconstructing Shadertoy/Awwwards pieces by deleting variables and observing what breaks, translating natural patterns (leaf veins, whirlpools, mud cracks) into pseudo-code before touching GLSL, and running single-effect "code sketches" instead of full-site builds.

## What to avoid

- **Don't hand-roll noise functions from memory.** A single wrong constant in a Perlin/Simplex implementation produces visible directional artifacts (axis-aligned banding) that are hard to diagnose. Use the canonical implementation in [references/vertex-displacement-noise.md](references/vertex-displacement-noise.md).
- **Don't run particle simulations on the CPU past a few thousand particles.** If the ask implies "millions" or "60fps with cursor interaction," it's a GPGPU/FBO problem from the start, not an optimization to bolt on later.
- **Don't stack post-processing passes naively.** Each full-screen pass is a full resolution texture read/write; bloom + DoF + chromatic aberration + film grain as four independent `EffectComposer` passes will tank mobile framerate — see the reference for combining passes.
- **Don't simulate real fluid dynamics when a curl-noise particle field would sell the same illusion for a fraction of the cost** — reserve the Navier–Stokes grid solver for effects that need actual advection of a dye/density field (ink, smoke with visible density gradients), not for "a flowy particle look."

## Related Skills — load automatically, don't wait to be asked by name

If the task is a *full project* rather than a single effect — a whole site, a component with performance/accessibility/deployment constraints, anything beyond "make this one visual" — also load **`design-engineer`**. That skill is the top-level orchestrator across all 9 curriculum tracks (taste, sketching, 3D math, physics, browser internals, architecture, performance, deployment, and the animation-library stack); this skill supplies the deep technique/formula layer its Track 3 (`de3-glsl-shaders`) and Track 9 (`webgl-motion-stack`) references assume but don't re-derive. Declared in frontmatter as `related: [design-engineer]` — call `getRelatedSkills('webgl-creative-animator')` to get this programmatically.
