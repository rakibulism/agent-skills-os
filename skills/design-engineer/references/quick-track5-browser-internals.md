# Track 5: Pure Core Engineering

Code that executes with bare-metal efficiency requires knowing exactly what the browser does with every line. These rules apply to all animation/interaction code Claude writes.

## 1. The Critical Rendering Path

The pixel pipeline per frame: **JS → Style → Layout → Paint → Composite.** Cost drops massively at each stage you can skip:
- Animating `width`/`top`/`margin` → triggers Layout + Paint + Composite (worst)
- Animating `background`/`box-shadow`/`filter` → Paint + Composite
- Animating `transform`/`opacity` → **Composite only** (GPU, nearly free) ← live here

**Layout thrashing** — the classic frame-killer: interleaving DOM reads and writes forces synchronous reflow per iteration:
```js
// BAD: read-write-read-write → N forced reflows
els.forEach(el => { el.style.height = el.offsetHeight * 2 + 'px'; });

// GOOD: batch all reads, then all writes → 1 reflow
const heights = els.map(el => el.offsetHeight);
els.forEach((el, i) => { el.style.height = heights[i] * 2 + 'px'; });
```
Layout-forcing reads to never call inside a RAF/scroll loop: `offsetWidth/Height/Top`, `getBoundingClientRect()`, `getComputedStyle()`, `scrollTop`, `clientWidth`. Cache them on resize (`ResizeObserver`) instead. Use `IntersectionObserver` for visibility, never scroll-handler + rect math.

## 2. GPU Compositor Layers

- `transform: translate3d(...)` / `translateZ(0)` and animated `opacity` promote elements to their own compositor layer — the GPU moves the layer without repainting.
- `will-change: transform` hints promotion *before* an animation starts (prevents first-frame jank). Apply just before animating, **remove after** — each layer costs GPU memory; dozens of permanent `will-change` elements can crash mobile tabs.
- Scroll-linked motion: never mutate in a `scroll` event (fires off-cadence with rendering). Read `scrollY` inside RAF, or better, use CSS scroll-driven animations / transform-based parallax on composited layers.
- Debug: DevTools → Rendering → "Layer borders" + "Paint flashing". Green flashes during animation = you're repainting = fix it.

## 3. HTML5 Canvas API (2D)

For hundreds of animated elements, DOM loses to Canvas. Rules:
- **High-DPI setup (mandatory, or everything is blurry):**
```js
const dpr = Math.min(window.devicePixelRatio, 2);  // cap at 2 — 3x costs 2.25× pixels for invisible gain
canvas.width  = cssWidth  * dpr;
canvas.height = cssHeight * dpr;
canvas.style.width  = cssWidth + 'px';
canvas.style.height = cssHeight + 'px';
ctx.scale(dpr, dpr);
```
- **Pre-render static complexity** to offscreen canvases (`OffscreenCanvas` or detached `<canvas>`): draw the expensive gradient/sprite once, then `drawImage` it per frame — `drawImage` of a cached canvas is ~10× cheaper than re-executing paths.
- **Particle systems:** store particle state in typed arrays (see §5), not object arrays; one `beginPath()` per batch of same-styled shapes rather than per particle; avoid per-frame `save()/restore()` and shadow properties (`shadowBlur` is brutally slow — pre-render glows as sprites).
- **Partial clears** when possible; `clearRect` full-canvas is fine, but translucent-fill trails (`fillRect` with `rgba(bg, 0.1)`) give motion trails for free.
- Clipping/masking: `ctx.clip()` with paths; `globalCompositeOperation` (`destination-in/out`, `lighter` for additive glow) replaces many shader-lite effects.

## 4. Advanced Pointer Event Handling

One unified system, not three:
- **Use Pointer Events** (`pointerdown/move/up/cancel`) — covers mouse, touch, pen. `setPointerCapture(pointerId)` on the dragged element so moves keep arriving after the pointer leaves it.
- **`touch-action` CSS is half the battle:** `touch-action: none` on draggable surfaces (else the browser steals the gesture for scrolling), `pan-y` when horizontal drag must coexist with vertical page scroll.
- **Velocity tracking:** keep a ring buffer of `{x, y, t}` samples; on release compute velocity over the trailing ~80ms (see `de-ui-physics` §3). Ignore the release event's own position jitter.
- **Multi-touch pinch/rotate math** from two active pointers:
  - scale = `dist(p1,p2) / dist(p1₀,p2₀)`
  - rotation = `atan2(p2.y-p1.y, p2.x-p1.x) - atan2(p2₀.y-p1₀.y, p2₀.x-p1₀.x)`
  - pivot = midpoint; to zoom around it: `translate(pivot) scale(s) translate(-pivot)` composed onto the existing transform matrix (use `DOMMatrix`).
- **Coalesced events** for drawing apps: `e.getCoalescedEvents()` yields the full-resolution input trail between frames (120–240Hz styluses report faster than RAF).
- **Event → render decoupling:** pointer handlers only write to state variables; RAF loop reads state and renders. Never render inside the event handler (pointermove can fire >120×/sec).

## 5. Low-Level JavaScript Performance

- **Typed arrays for numeric bulk data:** particles as `Float32Array` (interleaved `[x,y,vx,vy,...]` with stride, or one array per attribute). Contiguous memory = cache-friendly = 2–10× faster iteration than object arrays, zero GC pressure, and directly uploadable to WebGL buffers.
- **Zero allocation in loops:** no object/array/closure creation inside RAF. Preallocate scratch vectors, reuse them. GC pauses = dropped frames; a clean loop shows a flat sawtooth-free memory graph.
- **Web Workers** for heavy math (physics with many bodies, image processing, pathfinding): main thread must only render. Transfer, don't copy: `postMessage(buffer, [buffer])` (transferable ArrayBuffers) or `SharedArrayBuffer` where COOP/COEP headers allow. `OffscreenCanvas` + `canvas.transferControlToOffscreen()` moves entire render loops off the main thread.
- **requestAnimationFrame discipline:** single RAF loop per app (a ticker) that subsystems subscribe to — not one RAF per component. Always compute dt from the timestamp argument, clamp it, and **cancel on teardown** (`cancelAnimationFrame`) — orphaned loops are the top memory-leak/battery-drain source in creative sites. Pause via `document.visibilitychange`.
- Micro-notes: `Math.hypot` is slower than manual `sqrt(x*x+y*y)`; bitwise `| 0` truncation beats `Math.floor` in hot loops; keep functions monomorphic (same argument shapes) so the JIT stays on the fast path.

## Default Loop Template

```js
let rafId, last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 1 / 30);
  last = now;
  update(dt);   // physics/state only — no DOM reads
  render();     // writes: transforms, canvas draws
  rafId = requestAnimationFrame(frame);
}
rafId = requestAnimationFrame(frame);
// teardown: cancelAnimationFrame(rafId); remove listeners; dispose buffers.
```
