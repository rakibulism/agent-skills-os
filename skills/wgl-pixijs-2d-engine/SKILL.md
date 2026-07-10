---
name: wgl-pixijs-2d-engine
description: Track 9 rail (webgl-motion-stack) — PixiJS expertise — a dedicated 2D WebGL rendering engine (not a 3D engine, not a full game framework). Covers ParticleContainer for tens of thousands of moving sprites, sprite batching and texture atlases to minimize draw calls, custom GLSL filters, texture lifecycle/memory management, and integrating 2D physics (Matter.js/Planck.js) with the Pixi ticker. Use whenever the user wants massive 2D particle counts, flat sprite-heavy scenes, custom 2D filters/shaders, or is choosing between Three.js and PixiJS for a 2D-only effect.
version: 0.1.0
tags: [design-engineering, webgl, animation, rendering]
inputs:
  - name: scene
    description: The animation, rendering, or batching problem being solved.
    required: true
---

# PixiJS — The 2D WebGL Engine

Reach for PixiJS specifically when the effect is **flat** — no camera, no depth, no 3D lighting — but needs far more sprites/particles than Canvas2D or DOM can push at 60 FPS. It is faster and lighter than Three.js for this case because it isn't carrying a 3D pipeline it doesn't need.

## 1. The Non-Negotiable: ParticleContainer

A regular `Container` re-batches and re-sorts children every frame; a `PIXI.ParticleContainer` skips that overhead and is the only way to hold tens of thousands of moving sprites at 60 FPS:

```js
const particles = new PIXI.ParticleContainer(20000, {
  position: true, rotation: true, scale: false, alpha: false, // only enable what you actually animate
});
```
Every enabled property costs GPU buffer bandwidth — leave `scale`/`alpha`/`tint` off if the particle system doesn't use them. This single choice is usually the difference between 5,000 and 50,000 particles at 60 FPS.

## 2. Draw-Call Minimization

- **Batching:** Pixi auto-batches sprites sharing the same texture and blend mode — breaking that (a new texture, a different blend mode, an interleaved non-batchable object) splits the batch into a new draw call. Structure the display tree so same-texture sprites sit contiguously.
- **Texture atlases:** pack all sprite frames into one sheet (TexturePacker or `gltf-transform`-style build step) so an entire particle system or UI is one texture bind, one draw call. See `de3-asset-pileline`-style atlas thinking, applied to 2D.
- Check batch count in devtools/Spector.js the same way you'd check Three.js draw calls (`de-webgl-3d` § performance) — the discipline transfers directly.

## 3. Custom Filters (GLSL)

Pixi filters are fragment shaders that run as a post-process pass on a `RenderTexture`. Write your own for effects the built-in filter set can't do (fluid ripple, displacement map, custom bloom) — see `de3-glsl-shaders` for the shader math itself; the Pixi-specific part is wiring uniforms through `filter.uniforms.uTime = …` each tick and knowing that stacking many filters means many extra render-texture passes, each with a GPU cost. Prefer one combined filter over five chained simple ones when performance matters.

## 4. Memory & Texture Lifecycle

- Every loaded texture lives in GPU memory until explicitly destroyed. Call `texture.destroy(true)` (the `true` also frees the underlying `BaseTexture`) when a scene/screen unloads — Pixi does not garbage-collect GPU resources for you.
- **Object pooling for sprites:** in a particle system with continuous spawn/despawn (rain, embers, a trail), never `new PIXI.Sprite()` per particle per frame — pre-allocate a pool, flag active/inactive, and reset properties on reuse. This is the same allocation-free discipline as `de5-lowlevel-js`, applied to sprite objects instead of vectors.
- Cache and reuse `Matrix`/`Point` instances the same way — Pixi's own internals allocate temp matrices per transform update if you're not careful with static caching.

## 5. Integrating 2D Physics

Matter.js or Planck.js drive positions; Pixi renders them. Keep the physics step and the render step decoupled:
```js
app.ticker.add((delta) => {
  Matter.Engine.update(engine, app.ticker.deltaMS); // fixed-ish step, real elapsed ms
  bodies.forEach((body, i) => {
    sprites[i].position.set(body.position.x, body.position.y);
    sprites[i].rotation = body.angle;
  });
});
```
Use `PIXI.Ticker`'s `deltaMS`/`deltaTime`, not a hand-rolled clock — see `de4-euler-integration` for why real delta-time (not an assumed fixed frame) matters for physics stability across 60Hz/120Hz displays.

## 6. Interaction at Scale

For thousands of interactive elements, per-object `pointerdown` listeners don't scale — use Pixi's interaction manager with `eventMode: 'static'` on a container and hit-test in one delegated handler, or maintain a spatial index (see `de4-collision-detection` for the broad-phase spatial hash pattern) rather than relying on Pixi's per-object hit testing for very dense scenes.

## 7. Resolution & Retina

Set `resolution: window.devicePixelRatio` on the `Application` (capped — see `de7-webgl-fallbacks` for the pixel-ratio-first quality knob) or text/fine detail will look soft on Retina/high-DPI screens. Re-check this cap on low-end devices; it's the single highest-leverage performance knob, same as in raw Canvas2D (`de5-canvas-2d`).

## When to Reach for This Instead of Three.js/R3F

| Signal | Choice |
|---|---|
| Flat scene, no camera movement, no lighting | PixiJS |
| Tens of thousands of independent 2D sprites | PixiJS + ParticleContainer |
| Anything with depth, 3D camera, or PBR materials | Three.js/R3F (`de3-threejs-r3f`) |
| Full-screen procedural, no discrete sprites at all | Raw fragment shader (`de3-glsl-shaders`) |
