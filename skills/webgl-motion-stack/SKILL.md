---
name: webgl-motion-stack
description: Track 9 of the Design Engineer curriculum (parent skill of design-engineer) — the animation & rendering LIBRARY layer, the tools that sit on top of raw WebGL/DOM (GSAP, PixiJS, Theatre.js) plus the two cross-cutting techniques every one of them depends on (draw-call batching/instancing, and creative concepting). Use this skill whenever the user is choosing a rendering/animation library, mixing GSAP with Three.js/PixiJS, building a scroll-driven or timeline-driven site, hitting frame-rate problems from too many draw calls, or asking "what stack should I use" for an award-tier interactive site. Route to the child skill for deep implementation; use this skill first to decide which tool fits and to avoid stacking redundant libraries. Load alongside `design-engineer` for any full-project task — that skill is the top-level orchestrator across all 9 tracks.
version: 0.1.0
tags: [design-engineering, webgl, animation, rendering, orchestrator]
inputs:
  - name: project
    description: The rendering/animation stack decision being made — libraries, mixing GSAP with Three.js/PixiJS, etc.
    required: true
---

# WebGL Motion Stack (Track 9 of Design Engineer)

This is **Track 9** of the same curriculum as `design-engineer` — the top-level orchestrator skill. If the task is a full project (not just a library question), load `design-engineer` first; it will route into this skill via its rail map. This skill is the **library layer**: the tools developers reach for instead of writing raw WebGL. It sits beside — not inside — Track 3 (`de-webgl-3d`: math/shaders/Three.js/R3F/asset pipeline), `de5-lowlevel-js` (allocation-free render loops), `de7-webgl-fallbacks` (graceful degradation), and `de3-asset-pipeline` (compression). **Consult those first for anything math-, shader-, Three.js/R3F-, compression-, or fallback-related** — this skill and its children exist specifically for the pieces those don't cover: GSAP, PixiJS, Theatre.js, and the cross-cutting batching/concepting disciplines.

## The Stack, Layered

```
Animation / Physics Engines   →  GSAP · Theatre.js · Rapier
Rendering Frameworks          →  Three.js/R3F (3D) · PixiJS (2D)
Core Web Platform             →  WebGL · WebGPU · Canvas2D · DOM
```

A project rarely uses one layer alone. The common real pairing at Panze-scale work is **GSAP (choreography) + Three.js/R3F or PixiJS (rendering) + a custom shader for the hero effect**. GSAP does not render anything — it just writes numbers into whatever properties, uniforms, or DOM styles you point it at, every frame, on a schedule you control.

## Choosing the Renderer (do this before writing any code)

| Need | Use |
|---|---|
| 3D — geometry, camera, lighting, depth | Three.js / R3F → `de3-threejs-r3f` |
| 2D — thousands of sprites, particles, filters, no camera/depth | PixiJS → `wgl-pixijs-2d-engine` |
| Full-screen procedural effect, no discrete objects | Single fragment shader → `de3-glsl-shaders` |
| ≤20 animated DOM elements | Plain CSS/GSAP on the DOM, no canvas at all |
| Draggable/visual timeline editing for a WebGL scene | Theatre.js → `wgl-theatrejs-editor` |

Do not default to Three.js for 2D work — PixiJS is a dedicated 2D WebGL renderer and is faster and lighter for flat particle/sprite-heavy scenes. Do not reach for a full 3D engine to move a handful of DOM elements — that's GSAP + CSS transforms, full stop.

## The Choreographer: GSAP

GSAP is the layer that scripts *when* and *how* values change — scroll-tied sequences, nested timelines, and easing curves — regardless of what's underneath (DOM, Canvas, Three.js uniforms, PixiJS sprites). See `wgl-gsap-motion` for the full pattern set. Two rules that apply everywhere GSAP is used:
- Only animate GPU-cheap properties directly on the DOM (`x`, `y`, `scale`, `rotation`, `opacity`) — never `top`/`left`/`width` (see `de5-critical-rendering-path`).
- Sync GSAP to a WebGL/Canvas render loop with `gsap.ticker`, not a second independent `requestAnimationFrame` — two unsynced loops is how you get tearing and drift.

## Cross-Cutting Disciplines

These two apply no matter which renderer or choreographer you picked:

- **`wgl-draw-call-batching`** — instancing, atlasing, and culling. Read this whenever the scene has more than ~50 similar objects (particles, trees, cards, crowd members) or frame rate degrades as object count grows.
- **`wgl-creative-vision`** — the concepting step *before* any of the above. Translating a mood, a piece of data, or a brand feeling into a concrete visual mechanism (what warps, what the camera does, what the palette is) so the technical work has a target worth hitting.

## Memory Discipline (pointer, not a rewrite)

Every one of these libraries runs inside a `requestAnimationFrame`-class loop firing up to 120×/second. The rule that governs all of them: **allocate once, mutate in place.** No `new Vector3()`, no object literals, no `.map()`/`.filter()` inside the loop — reuse pooled objects and rewrite their properties. This is covered in full in `de5-lowlevel-js`; every child skill below assumes it.

## Routing Table

| Question | Skill |
|---|---|
| "How do I choreograph a scroll sequence / nested timeline?" | `wgl-gsap-motion` |
| "How do I render 10,000 2D particles / sprites?" | `wgl-pixijs-2d-engine` |
| "How do I give a client a visual timeline editor for the 3D scene?" | `wgl-theatrejs-editor` |
| "Frame rate drops as object count grows" | `wgl-draw-call-batching` |
| "I know the tech but not what to build" | `wgl-creative-vision` |
| "Vertex/fragment shader, SDF, noise, raymarching" | `de3-glsl-shaders` |
| "Three.js / R3F scene architecture" | `de3-threejs-r3f` |
| "GLTF too heavy / texture compression" | `de3-asset-pipeline` |
| "Site needs to degrade on weak devices" | `de7-webgl-fallbacks` |
| "Animation stutters / GC pauses" | `de5-lowlevel-js` |
