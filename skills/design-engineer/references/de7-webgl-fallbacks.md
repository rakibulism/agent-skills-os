# WebGL Fallbacks & Adaptive Quality

Tier the experience — same design intent at every tier. The low tier is a designed artifact, never an apology page.

## 1. Capability Detection at Boot

Classify **high / medium / low / static** from:
- WebGL2 support; `MAX_TEXTURE_SIZE`; unmasked renderer string (`WEBGL_debug_renderer_info`) for known-weak GPU patterns
- `navigator.hardwareConcurrency`, `navigator.deviceMemory`, connection type
- `prefers-reduced-motion` → static tier (or opacity-only transitions) automatically

## 2. Quality Knobs — ranked by visual cost-effectiveness

1. **Renderer pixel ratio — the single biggest lever:** `renderer.setPixelRatio(Math.min(devicePixelRatio, tier === 'high' ? 2 : 1))`. Dropping 2→1 quarters the fragment work; most users can't tell on motion-heavy scenes.
2. Postprocessing off (bloom/DOF/SSAO are the most expensive per-pixel items).
3. Particle counts ÷ 4; raymarch iterations ÷ 2 (de3-glsl-shaders); shadow maps → baked (de3-asset-pipeline) or off.
4. Smaller texture set / mip bias; simpler materials (standard → lambert) as a last resort.

## 3. Runtime Adaptive Degradation

Don't trust the boot classification alone — monitor and react:
```js
// rolling FPS average in the render loop
if (avgFPS < 45 for 2s) stepTierDown();   // pixel ratio first
if (avgFPS > 58 for 10s) cautiouslyStepUp();
```
drei's `<PerformanceMonitor>` implements exactly this for R3F. Never let users watch a slideshow out of pride — degrade live.

## 4. The Static Tier — designed, not apologetic

A high-quality rendered still or short video of the scene, same layout, same copy — indistinguishable in screenshots from the live version. This is also the poster in the LCP strategy (de7-core-web-vitals), so it exists anyway. `prefers-reduced-motion` users land here by default.

## 5. Loading States Are Choreography

- Branded progress tied to **real** asset loading (`THREE.LoadingManager` / drei `useProgress`) — never an indefinite spinner.
- Reveal with a designed transition (fade/wipe from poster to canvas), dimensions matched exactly (CLS — de7-core-web-vitals).
- Grace period: if load exceeds ~4s on the detected connection, stay on the static tier and offer the full experience as an opt-in.

## 6. Context Loss Is Not Optional

Mobile GPUs evict contexts routinely (backgrounding, memory pressure):
```js
canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); pauseLoop(); });
canvas.addEventListener('webglcontextrestored', () => { reinitScene(); resumeLoop(); });
```
Report loss events with GPU info to telemetry (de8-telemetry) — a device class losing contexts constantly means the tiering misclassifies it.

## Ship Test
Actually run the low tier and reduced-motion mode before launch — on a real cheap Android, not a resized desktop window.
