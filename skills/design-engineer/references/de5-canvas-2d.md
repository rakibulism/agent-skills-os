# HTML5 Canvas 2D Mastery

Hundreds of animated elements is where DOM loses to Canvas. But naive canvas code is blurry and slow — these rules are mandatory.

## High-DPI Setup (or everything is blurry)

```js
const dpr = Math.min(window.devicePixelRatio, 2);  // cap at 2: 3× costs 2.25× the pixels for invisible gain
canvas.width  = cssWidth  * dpr;                    // backing store
canvas.height = cssHeight * dpr;
canvas.style.width  = cssWidth + 'px';              // CSS size
canvas.style.height = cssHeight + 'px';
ctx.scale(dpr, dpr);                                // draw in CSS units
```
Re-run on resize (`ResizeObserver`). Skipping this is the #1 canvas defect.

## Pre-Render Static Complexity

`drawImage` of a cached canvas is ~10× cheaper than re-executing paths/gradients:
```js
const sprite = new OffscreenCanvas(64, 64);         // or detached <canvas>
drawExpensiveGlow(sprite.getContext('2d'));          // once
// per frame: ctx.drawImage(sprite, x, y);
```
Pre-render: glows (shadowBlur is brutally slow — never per-frame), complex gradients, repeated shapes, text.

## Particle Systems

- State in **typed arrays** (de5-lowlevel-js): `Float32Array` interleaved `[x,y,vx,vy,life,…]` with stride — cache-friendly, zero GC.
- **Batch by style:** one `beginPath()` per group of same-colored shapes, `fill()` once — not per particle. Sprites via `drawImage` batch naturally.
- No per-particle `save()/restore()`; set transforms manually or draw at absolute coords.
- Circles at scale: `drawImage` a pre-rendered dot beats `arc()` per particle.

## Clears, Trails & Composites

- Full clear: `ctx.clearRect(0, 0, w, h)`.
- **Free motion trails:** translucent fill instead of clear — `ctx.fillStyle = 'rgba(bg, 0.1)'; ctx.fillRect(…)`.
- `globalCompositeOperation`: `lighter` = additive glow (particles, light effects); `destination-in/out` = masking/reveals; `ctx.clip()` with paths for shaped viewports. These replace many shader-lite effects.

## Loop Integration
One RAF ticker (de5-lowlevel-js template), physics update then single draw pass. Pause when offscreen (`IntersectionObserver`) and on `visibilitychange`. For heavy scenes, move the whole loop off-main-thread: `canvas.transferControlToOffscreen()` + Worker.

## When Canvas vs DOM vs WebGL
≤ ~20 simple animated elements → DOM transforms. Hundreds of 2D particles/drawings → Canvas 2D. Thousands, lighting, distortion, 3D → WebGL (de3). Canvas content is invisible to accessibility — pair with an accessible DOM fallback/description.
