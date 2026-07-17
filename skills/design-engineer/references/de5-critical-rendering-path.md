# The Critical Rendering Path

The pixel pipeline per frame: **JS → Style → Layout → Paint → Composite.** Cost drops massively at each stage skipped:

| Animating… | Triggers | Cost |
|---|---|---|
| width, top, left, margin, font-size | Layout + Paint + Composite | Worst — forbidden in loops |
| background, color, box-shadow, filter | Paint + Composite | Expensive |
| **transform, opacity** | **Composite only (GPU)** | **Nearly free — live here** |

Rewrite rule: `left: X` → `transform: translateX(X)`; `width` grow → `transform: scaleX()` on a pre-sized element (counter-scale children if needed); animated `box-shadow` → cross-fade two layered pseudo-elements with opacity.

## Layout Thrashing — the classic frame-killer

Interleaved reads and writes force a synchronous reflow per iteration:

```js
// BAD: read-write-read-write → N forced reflows
els.forEach(el => { el.style.height = el.offsetHeight * 2 + 'px'; });

// GOOD: batch all reads, then all writes → 1 reflow
const heights = els.map(el => el.offsetHeight);
els.forEach((el, i) => { el.style.height = heights[i] * 2 + 'px'; });
```

**Layout-forcing reads — never call inside RAF/scroll/pointermove loops:**
`offsetWidth/Height/Top/Left` · `getBoundingClientRect()` · `getComputedStyle()` · `scrollTop/Left` · `clientWidth/Height` · `innerText`

Instead: **measure once, cache, re-measure on change** — `ResizeObserver` for element sizes, `IntersectionObserver` for visibility (never scroll-handler + rect math), cache viewport size on `resize`.

## Frame Anatomy Discipline
- Input handlers (pointermove fires >120Hz) write **state only**; the RAF loop reads state and performs DOM writes — one write pass per frame (see de5-lowlevel-js loop template).
- All DOM writes together, after all reads. If both are unavoidable per frame: reads first, then writes.
- Style invalidation scope: changing a class high in the tree recalcs styles for the whole subtree — toggle classes on the smallest element possible; prefer CSS custom property updates on the animated node.

## Verification
DevTools Performance panel: purple "Layout" blocks tagged **"Forced reflow"** with a warning icon = thrashing, and the stack trace names the guilty read. Fix = batch or cache. Target: zero forced reflows during any continuous interaction.
