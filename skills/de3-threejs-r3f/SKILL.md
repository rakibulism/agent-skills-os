---
name: de3-threejs-r3f
description: Track 3 rail — Three.js and React Three Fiber scene architecture. Camera rigs, scene graph management, lighting setups, physical materials, color management/tone mapping, R3F performance rules (useFrame mutation, no per-frame setState, instancing), and draw-call budgets. Use whenever building or reviewing Three.js/R3F scenes, choosing cameras/lights/materials, debugging why web 3D "looks like a tech demo", setting up product-shot or hero scenes, or rendering many objects/particles efficiently.
version: 0.1.0
tags: [design-engineering, webgl, 3d, graphics-math]
inputs:
  - name: scene
    description: The 3D scene, shader, or asset pipeline being built or debugged.
    required: true
---

# Three.js / React Three Fiber Architecture

Scene architecture separates premium 3D from tech demos. Most "cheap-looking" web 3D is a color-management or lighting failure, not a modeling one.

## Scene Graph Discipline
Group logically (`<group>` per feature); transform groups, not individual meshes, when moving compound objects. Name objects (`mesh.name`) for debuggability. Dispose what you create dynamically (`geometry.dispose()`, `material.dispose()`, `texture.dispose()`).

## Camera
- Perspective FOV **35–50°** = calm product-shot compression; **60–75°** = immersive drama. Match the sketch's focal-length decision (de2-perspective-sketching).
- Never move a camera instantaneously: damped controls, or drive position/quaternion through a spring toward a target (de4-spring-damper). `slerp` quaternions for orientation transitions.
- Scroll-driven scenes: map scroll progress → camera path (Catmull-Rom through keyed positions, de4-bezier-splines).

## Lighting Recipe (premium default)
1. One **key** directional light (matches the sketch's light arrow)
2. Large soft **environment** light — HDRI via drei `<Environment>`; this is where "expensive" reflections come from
3. **Rim** light opposite the key for silhouette separation

**Color management — the #1 fix:** `renderer.outputColorSpace = SRGBColorSpace` and `toneMapping = ACESFilmicToneMapping` (R3F does much of this by default — verify). Wrong color pipeline = washed-out or neon garbage regardless of everything else.

## Materials
`MeshStandardMaterial` / `MeshPhysicalMaterial` + environment map beats any hand-tuned Phong. Custom looks: extend via `onBeforeCompile`, or `ShaderMaterial` / drei `shaderMaterial` with typed uniforms updated in `useFrame` (never recreate materials per frame — update uniforms).

## R3F Performance Rules
- **Mutate in `useFrame`** (`ref.current.position.x = …`) — `setState` at 60Hz re-renders React; transient values bypass React entirely (Zustand `getState()`/subscribe inside the loop).
- **Zero allocations in the loop:** preallocate `Vector3`/`Quaternion` scratch objects outside; `.copy()`/`.set()` into them.
- `useMemo` geometries/materials; `<Suspense>` + drei `useGLTF`/`Preload` for async assets.
- **Instancing:** >100 copies → `InstancedMesh` (one draw call); thousands of particles → instanced planes or `Points` with a custom shader; per-instance data in buffer attributes.
- **Draw-call budget:** <100 for a scroll-driven marketing scene; merge static geometry; check with `renderer.info`.

## Scene Review Checklist
ACES + sRGB set · HDRI or 3-light rig (not one white pointlight) · shadows only where visible (or baked — de3-asset-pipeline) · pixel ratio capped ≤2 · instancing for repeats · dispose on unmount · context-loss handler (de7-webgl-fallbacks).
