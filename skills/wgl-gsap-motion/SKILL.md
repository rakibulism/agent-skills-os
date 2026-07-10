---
name: wgl-gsap-motion
description: Track 9 rail (webgl-motion-stack) — GSAP (GreenSock) expertise — nested timeline architecture, ScrollTrigger scroll-driven sequences and pinning, custom easing (CustomEase/CustomWiggle/CustomBounce), plugins (MorphSVG, SplitText, Flip), syncing GSAP to WebGL/Canvas render loops via gsap.ticker, and cleanup in SPAs (React/Vue/Svelte). Use whenever the user mentions GSAP, ScrollTrigger, scroll-driven animation, pinning sections, timeline sequencing, text/SVG morph animation, or is choreographing motion on top of DOM, Canvas, Three.js, or PixiJS.
version: 0.1.0
tags: [design-engineering, webgl, animation, rendering]
inputs:
  - name: scene
    description: The animation, rendering, or batching problem being solved.
    required: true
---

# GSAP Motion

GSAP is a **choreographer, not a renderer**. It writes values into whatever you point it at, on a schedule you control. Master it as timeline architecture, not "add a tween here."

## 1. Timeline Architecture (the actual skill)

Nested, modular, reusable timelines beat isolated tweens every time. Build small timelines for repeatable units (a card entrance, a hero reveal) and compose them:

```js
function cardEnter(el) {
  const tl = gsap.timeline({ paused: true });
  tl.from(el, { y: 40, opacity: 0, duration: 0.6, ease: 'power3.out' });
  return tl;
}

const master = gsap.timeline();
master.add(cardEnter(card1)).add(cardEnter(card2), '<0.1'); // stagger via position params
```

Position parameters (`'<'`, `'>'`, `'<0.1'`, `'-=0.2'`) are how experts control overlap without hardcoding absolute times — the sequence stays correct even if individual durations change.

## 2. Easing: beyond `power1.out`

Default eases are for placeholders. For anything that should feel physical or branded:
- `CustomEase.create('id', 'M0,0 C0.2,0 0,1 1,1')` — hand-drawn curves matching a reference site's exact feel (pair with `de1-aesthetic-deconstruction` to extract the curve from a reference).
- `CustomBounce` / `CustomWiggle` — parametric physical bounce/wiggle instead of faking it with keyframes.
- For true spring physics (interruptible, velocity-aware), GSAP eases are not enough — hand off to a real spring solver (`de4-spring-damper`) and drive GSAP-managed properties from it, or use GSAP's own `Physics2DPlugin` for simple cases.

## 3. ScrollTrigger — scroll-driven domination

```js
gsap.timeline({
  scrollTrigger: {
    trigger: '.section',
    start: 'top top',
    end: '+=200%',
    scrub: 1,        // 1s of lag smooths scroll input — never scrub: true for anything jittery
    pin: true,
    anticipatePin: 1 // pre-pins one tick early to prevent a visible snap on fast scrolls
  }
})
```
- **`scrub` value, not boolean:** a number (`0.5`–`1.5`) low-pass-filters jittery trackpad/mouse-wheel input into smooth motion. `scrub: true` tracks scroll exactly, which reads as janky on anything but a perfectly smooth scroll device.
- **Pinning cost:** every pinned section forces a layout recalculation on resize; batch `ScrollTrigger.refresh()` calls and avoid pinning more than a few sections per page.
- **Mobile/touch:** trackpads, mice, and touch scroll at different native rates — verify scrub feel on an actual touch device, don't assume desktop testing transfers. `ScrollSmoother` (or `Lenis`, which Panze already uses) normalizes this.

## 4. Plugin-Specific Notes

- **Flip:** capture state (`Flip.getState(el)`), make a DOM change (reflow/reorder/resize), then `Flip.from(state, {...})` — animates the delta automatically. This is the correct tool for shared-element/layout transitions instead of hand-computing before/after positions.
- **SplitText:** split before animating (`chars`/`words`/`lines`), stagger with `stagger: {each, from: 'center'}` for radial reveal feel. Re-split on resize/font-load or line breaks will be stale.
- **MorphSVG:** works path-to-path — for divergent shapes, add matching anchor points manually (`shapeIndex` param) or the morph will visibly twist.

## 5. Syncing GSAP to WebGL/Canvas

Never run a second independent `requestAnimationFrame` loop alongside GSAP's — it desyncs and drifts:

```js
gsap.ticker.add((time, deltaTime, frame) => {
  renderer.render(scene, camera); // Three.js/PixiJS render call driven by GSAP's own clock
});
gsap.ticker.fps(60); // cap if the render is expensive — don't let ticker outrun the GPU
```

Drive shader uniforms or WebGL object properties the same way you'd drive a DOM style — GSAP doesn't care what the target is:
```js
gsap.to(material.uniforms.uProgress, { value: 1, duration: 1.2, ease: 'power2.inOut' });
```

## 6. Performance & Cleanup

- Animate only `x`, `y`, `scale`, `rotation`, `opacity` on the DOM (composite-only, GPU-accelerated) — never `top`/`left`/`width`/`height` (see `de5-critical-rendering-path` for why).
- In React/Vue/Svelte: every `gsap.timeline()`, `ScrollTrigger.create()`, and `gsap.to()` needs a matching kill on unmount (`tl.kill()`, `ScrollTrigger.getAll().forEach(t => t.kill())`). Leaked ScrollTriggers keep firing scroll listeners for unmounted DOM — a silent memory/CPU leak in SPAs.
- Use `gsap.context()` in React to scope and auto-cleanup all animations created inside a component in one call.

## Decision Note

If the motion needs to *respond* to physical forces (drag momentum, collision, interruption mid-flight with correct velocity carry-through), GSAP's tween/timeline model is the wrong tool — reach for a real integrator (`de-ui-physics`, `de4-spring-damper`). GSAP excels at *authored, scheduled* sequences; physics engines excel at *emergent, responsive* motion. Award-tier sites use both, wired together, not one instead of the other.
