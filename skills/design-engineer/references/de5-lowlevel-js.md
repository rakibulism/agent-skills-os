# Low-Level JavaScript Performance

Bare-metal efficiency for the code that runs 60–120 times per second.

## Typed Arrays for Bulk Numeric Data

Particles/physics state in `Float32Array`, not object arrays:
```js
// Interleaved, stride 4: [x, y, vx, vy] × N
const P = new Float32Array(N * 4);
for (let i = 0; i < N * 4; i += 4) {
  P[i]   += P[i+2] * dt;   // x += vx·dt
  P[i+1] += P[i+3] * dt;
}
```
Contiguous memory → cache-friendly → 2–10× faster iteration, **zero GC pressure**, and directly uploadable to WebGL buffer attributes. Structure-of-arrays (one array per attribute) when attributes update at different rates.

## Zero Allocation in Loops

No object/array/closure creation inside RAF: every allocation feeds the GC, and **GC pauses = dropped frames** (the signature: a hitch every few seconds, sawtooth memory graph).
- Preallocate scratch objects (`const _v = {x:0, y:0}`) and reuse.
- No `.map/.filter/.slice` in loops (allocate); indexed `for` over cached length.
- No template strings/logging per frame; avoid spreading and destructuring fresh objects in hot paths.
- Verify: DevTools Memory → Allocation instrumentation while animating — a clean loop shows a flat line.

## Web Workers — main thread renders, workers compute

Heavy math (N-body physics, image processing, pathfinding) off the main thread:
```js
worker.postMessage(buffer, [buffer]);            // TRANSFER (zero-copy), not clone
```
- `SharedArrayBuffer` for continuous shared state (requires COOP/COEP headers).
- **`OffscreenCanvas`**: `canvas.transferControlToOffscreen()` → the *entire render loop* lives in the worker; the main thread stays free for input/DOM.
- Design rule: main thread budget goes to input + DOM writes; anything else that exceeds ~2ms/frame is a Worker candidate.

## The Canonical Ticker

One RAF loop per app; subsystems subscribe — never one RAF per component.
```js
let rafId, last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 1 / 30);   // clamp: tab-switch safety
  last = now;
  update(dt);        // physics/state — no DOM reads (de5-critical-rendering-path)
  render();          // DOM/canvas writes
  rafId = requestAnimationFrame(frame);
}
rafId = requestAnimationFrame(frame);
// TEARDOWN — non-negotiable:
// cancelAnimationFrame(rafId); removeEventListener(...); dispose buffers/contexts.
```
Orphaned RAF loops are the top memory-leak and battery-drain source in creative sites. Pause on `document.visibilitychange` and when offscreen (`IntersectionObserver`).

## JIT Micro-Patterns
Keep hot functions **monomorphic** (same argument shapes every call). `x | 0` beats `Math.floor` in hot loops; manual `sqrt(x*x + y*y)` beats `Math.hypot`; compare squared distances. Micro-optimizations apply only inside proven-hot loops — profile first (de7-profiling).
