---
name: de7-profiling
description: Track 7 rail — performance profiling with Chrome DevTools. Performance panel frame-hunting under CPU throttling, reading flame charts, eliminating Long Tasks, Memory panel heap-snapshot leak hunting (detached nodes, undisposed WebGL resources), and the Rendering panel (paint flashing, layer borders, FPS meter). Use whenever diagnosing frame drops, jank, sites that slow down over time, memory leaks, or Long Tasks — or whenever performance work is about to start (profile before optimizing, always).
version: 0.1.0
tags: [design-engineering, performance, analytics]
inputs:
  - name: site
    description: The site or experience being measured, budgeted, or profiled.
    required: true
---

# Performance Profiling (Chrome DevTools)

Profile before optimizing — always. Guessed optimizations waste weeks; profiles point at the guilty line.

## Performance Panel — frame hunting

1. Enable **CPU 4×–6× throttling** — a fast dev machine hides every problem real users see. Enable screenshots.
2. Record the *actual janky interaction* (short recordings, 5–10s, targeted).
3. Read the flame chart:
   - Red-cornered frames = dropped. Inspect what filled the budget.
   - **Yellow (Scripting):** find the long function in Bottom-Up view sorted by self-time.
   - **Purple (Layout) marked "Forced reflow"** with warning icon: layout thrashing — the stack trace names the guilty read (fix: de5-critical-rendering-path).
   - **Green (Paint):** something invalidated pixels — find what, move it to transform/opacity (de5-gpu-compositing).
4. **Long Tasks** (>50ms gray-flagged blocks) destroy INP. Break up: `await scheduler.yield()` (or `setTimeout(0)`) between chunks; move pure math to a Worker (de5-lowlevel-js).

## Memory Panel — leak hunting

Symptom: site degrades the longer it's open; memory baseline climbs in a sawtooth that never returns.

**The 3-snapshot method:**
1. Heap snapshot → 2. perform the suspect interaction 10× (open/close the animated modal) → 3. snapshot → filter "Objects allocated between snapshot 1 and 2".
- **Detached** DOM nodes → listeners holding removed elements (missing removeEventListener/AbortController).
- Growing `Float32Array` / geometry counts → undisposed Three.js resources (`geometry/material/texture.dispose()` — de3-threejs-r3f).
- Closures retaining large scopes → RAF loops never cancelled (de5-lowlevel-js teardown).

**Allocation instrumentation** while an animation runs: a clean loop shows a flat line; blue spikes = per-frame allocation → hunt with the stack traces.

## Rendering Panel

- **Paint flashing:** idle/looping animations must show **zero** green. Any flash = repaint = wrong property animated.
- **Layer borders:** verify promotion where expected; spot layer explosions (de5-gpu-compositing).
- **Frame Rendering Stats:** live FPS + GPU memory overlay while interacting.

## Field Profiling
DevTools is lab-only. Confirm on a real mid-range Android via `chrome://inspect` remote profiling; production frame data via sampled RUM (de8-telemetry).

## Workflow Rule
Every optimization PR states: the profile finding (screenshot/metric) → the change → the re-profiled result. "Feels faster" is not a result.
