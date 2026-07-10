---
name: wgl-creative-vision
description: Track 9 rail (webgl-motion-stack) — The concepting step before any WebGL/animation code gets written — translating an abstract feeling, brand attribute, or dataset into a concrete visual mechanism (what warps, what the camera does, what the palette does, what reacts to the cursor). Covers animation-principle grounding (timing, anticipation, squash/stretch), cinematic camera thinking, and choosing "illusion over brute force" — faking an expensive effect cheaply. Use whenever the user has technical capability but no concept yet, asks "what should this look like," is starting a hero-section/award-tier site from a blank page, or needs to pitch a visual direction before building it.
version: 0.1.0
tags: [design-engineering, webgl, animation, rendering]
inputs:
  - name: scene
    description: The animation, rendering, or batching problem being solved.
    required: true
---

# Creative Vision for WebGL Work

Technical mastery (shaders, physics, instancing) is necessary but not sufficient — it produces "technically impressive" and "actually memorable" whether or not it lands. This skill is the step *before* `de3-glsl-shaders` or `de-ui-physics`: deciding what's worth building in the first place.

## 1. Translate the Brief Into a Mechanism, Not a Mood

"Make it feel premium/organic/energetic" is not buildable. Push every brief to a concrete mechanism before opening an editor:

| Vague brief | Concrete mechanism |
|---|---|
| "feels alive" | Idle noise-driven micro-motion on every static element, amplitude tied to a slow sine — nothing is ever perfectly still |
| "premium" | Generous negative space + one hero physical interaction (magnetic cursor, liquid blob) done flawlessly, rather than many mediocre effects |
| "data-driven company" | The dataset itself drives the visual parameters (particle count, color, displacement) — the art *is* the data, not decoration next to it |
| "energetic" | Anticipation before every state change (a small pull-back before the release), fast ease-out, overshoot-and-settle |

If a brief can't be translated to a row in this table, it isn't specific enough to build yet — go back and ask what the mechanism should be, don't guess and start coding.

## 2. Ground Motion in Animation Principles

These transfer directly from traditional animation into code and are what separates "technically correct" motion from motion that reads as intentional:
- **Anticipation:** a small counter-motion before the main action (pull back before a launch) — cheap to add, disproportionately raises perceived quality.
- **Squash & stretch:** even subtle scale distortion on impact/release sells weight and materiality.
- **Follow-through / overlapping action:** trailing elements settle slightly after the lead element stops — see `de4-spring-damper` for chained-spring implementation.
- **Easing as intent:** ease-in-out for autonomous motion, ease-out for user-triggered motion (it should feel like it's responding *to* them, arriving quickly and settling), rarely linear (reads as robotic/mechanical) — pair with `de1-aesthetic-deconstruction` to extract exact curves from reference sites.

## 3. Cinematic Thinking for 3D Scenes

Treat the WebGL camera like a real camera, not a free-floating debug view:
- **Focal length / FOV** communicates scale and intimacy — narrow FOV (35-50°) for calm/product framing, wide (60-75°) for immersive/dramatic.
- **Composition and framing:** rule-of-thirds placement of the hero object, not dead-center by default.
- **Lighting as mood**, not just visibility — see `de-webgl-3d`'s lighting recipe for the technical execution once the mood is decided.

## 4. Illusion Over Brute Force

Award-tier effects are frequently *faked* cheaply rather than physically simulated — this is a skill, not a shortcut taken out of laziness:
- A "reflective" surface is often a cheap fresnel term + an environment map, not real ray-traced reflection.
- "Fluid" motion is frequently domain-warped noise (`de3-glsl-shaders` § noise), not a Navier-Stokes solve.
- Crowd/particle "intelligence" is often a few cheap rules (separation + noise + a target bias) rather than full flocking simulation.

Always ask "what's the cheapest technique that produces this specific visual signature" before reaching for the physically-accurate version — the accurate version is rarely visually distinguishable from the cheap one and costs far more frame budget.

## 5. Procedural Generation as a Force Multiplier

Noise-driven generation (`de3-glsl-shaders` § noise math) lets one mechanism produce unlimited unique variation — a single fBm function can be the terrain, the fire, the marble texture, and the organic UI warp on the same site, tuned by 2-3 parameters each time, instead of hand-authoring each one.

## 6. Cross-Device Reality Check

A concept only counts as finished once it's been mentally (or actually) tested at the low end — does the mechanism still read at 50% particle count and half the resolution? If the whole concept collapses without full fidelity, it's fragile; build concepts where the *degraded* version is still recognizably the same idea (see `de7-webgl-fallbacks` for the technical degradation ladder — this skill is deciding what's allowed to degrade first).

## Working With `creative-artist`

For broader brainstorming, naming, and pushing past first-idea clichés (not specific to WebGL), pair this skill with `creative-artist`. This skill is specifically about turning a chosen creative direction into a *buildable* visual mechanism for interactive/GPU work.
