# Track 7: Performance Optimization & Analytics

The most visually complex experience must load instantly and run smoothly on a $150 Android phone. Performance is a design feature, budgeted from day one — not a cleanup sprint.

## 1. Performance Profiling (Chrome DevTools)

**Performance panel — frame hunting:**
- Record the actual janky interaction with **CPU 4×–6× throttling** (a fast dev machine hides every problem users see). Enable screenshots.
- Read the flame chart: red-corner frames = dropped. Identify what filled the frame budget: long yellow (scripting — find the function), purple (layout — hunt forced reflows, marked "Forced reflow" in the summary), green (paint — find what invalidated pixels).
- **Long Tasks** (>50ms blocks) destroy INP. Break them up: `scheduler.yield()` / `await new Promise(r => setTimeout(r))` between chunks, or move the math to a Worker (`de-browser-internals` §5).
- Bottom-up view sorted by self-time finds the single hottest function fast.

**Memory panel — leak hunting:**
- Symptom: performance degrades the longer the page is open; sawtooth memory baseline climbs.
- Method: heap snapshot → interact (open/close the animated component 10×) → snapshot → "Objects allocated between snapshots." Detached DOM nodes = listener leaks; growing `Float32Array` counts = undisposed buffers.
- Usual suspects in creative dev: uncancelled RAF loops, listeners never removed, Three.js geometries/materials/textures never `.dispose()`d, event emitters holding component refs.

**Rendering panel:** Paint flashing (green = repaint — composited animations should show none), Layer borders (verify promotion, spot layer explosions), Frame Rendering Stats (live FPS + GPU memory).

## 2. Resource Budgeting & Optimization

Set budgets before building; enforce in CI (`de-deploy-pipeline`):

| Resource | Budget (marketing/creative site) |
|---|---|
| JS (gzipped, initial) | ≤ 200kb incl. framework; three.js core ≈ 150kb — earn it |
| 3D assets above the fold | ≤ 500kb total (Draco/Meshopt + KTX2, per `de-webgl-3d` §4) |
| Hero image/video | img ≤ 200kb (AVIF/WebP), bg video ≤ 1–2MB, muted, `preload="metadata"` |
| Fonts | ≤ 2 families, WOFF2, subset; `font-display: swap` or `optional` |
| Any single texture | ≤ 1024px unless proven necessary |

- **Lazy-load WebGL:** the 3D bundle (`three`, scene code, assets) loads via dynamic `import()` — never in the critical path. Below-fold scenes initialize on `IntersectionObserver` approach (rootMargin `50%`). Render a designed static poster (styled `<img>` of the scene) instantly; swap to live canvas when ready — this also rescues LCP.
- **Textures:** KTX2/Basis for GPU delivery (stays compressed in VRAM); AVIF → WebP → JPEG fallback chain for DOM images; `srcset`/`sizes` always.
- **SVG:** run through SVGO; inline only what's styled/animated; sprite the rest. Beware filter-heavy SVGs (feTurbulence, big blurs) — they paint on CPU and can out-jank WebGL.
- **Pause everything invisible:** RAF gated on `IntersectionObserver` + `visibilitychange`. An offscreen particle loop is pure battery theft.

## 3. Core Web Vitals on Animation-Heavy Sites

- **LCP < 2.5s:** the LCP element must never wait for WebGL. Poster-image strategy above; preload the hero asset (`<link rel="preload">`); no font-blocked hero text; server-render the shell.
- **INP < 200ms:** hydration and scene-init are the killers. Code-split so interaction handlers aren't buried behind three.js parsing; chunk long init tasks; keep pointer handlers thin (write state, render in RAF).
- **CLS < 0.1:** reserve exact space for every async visual — explicit `aspect-ratio` on canvas/media containers, `size-adjust`-tuned font fallbacks so text doesn't reflow on font swap, no late-inserted banners. Canvas popping in at a different size than its poster is a classic creative-site CLS bug — match dimensions exactly.
- Measure in the field, not just the lab: `web-vitals` library → analytics (see `de-deploy-pipeline` §4). Lab Lighthouse ≠ real Moto G on 3G.

## 4. WebGL Fallbacks & Adaptive Quality

Tier the experience — same design intent at every tier:

1. **Capability detection at boot:** WebGL2 support, `MAX_TEXTURE_SIZE`, `navigator.hardwareConcurrency`, `navigator.deviceMemory`, `prefers-reduced-motion`. Classify: **high / medium / low / static**.
2. **Quality knobs to scale down** (in order of visual cost-effectiveness):
   - Renderer pixel ratio: `renderer.setPixelRatio(min(devicePixelRatio, tier === 'high' ? 2 : 1))` — the single biggest lever
   - Postprocessing off (bloom/DOF are expensive)
   - Particle counts ÷ 4, raymarch iterations ÷ 2, shadow maps → baked/none
   - Texture mip bias / smaller texture set
3. **Runtime adaptive degradation:** monitor a rolling FPS average in the render loop; if < 45 for 2s, step the tier down live (drop pixel ratio first). Never let users watch a slideshow out of pride. (drei's `<PerformanceMonitor>` implements this pattern for R3F.)
4. **Static tier is a designed artifact:** high-quality rendered still/video of the scene with the same layout and copy — indistinguishable in screenshots, not an apology page. `prefers-reduced-motion` users get this tier (or minimal opacity transitions) automatically.
5. **Loading states are choreography:** show branded progress tied to real asset loading (`THREE.LoadingManager` progress), reveal the scene with a designed transition (fade/wipe from the poster). A grace-period skeleton beats both a blank canvas and a frozen page.
6. **Context loss is not optional:** handle `webglcontextlost` (preventDefault, pause loop) / `webglcontextrestored` (reinit) — mobile GPUs evict contexts routinely.

## Pre-Ship Performance Checklist

□ 60fps under 4× CPU throttle on the worst real interaction · □ heap stable after 10× mount/unmount · □ zero paint-flash during idle animations · □ LCP/INP/CLS green in Lighthouse *mobile* · □ JS + asset budgets met (verified numbers, not vibes) · □ scene lazy-loaded with poster · □ low tier + reduced-motion actually tested · □ context-loss handler present.
