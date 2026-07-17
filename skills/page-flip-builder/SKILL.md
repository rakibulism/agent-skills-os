---
name: page-flip-builder
description: Builds a custom page-turn / flipbook effect from scratch — fold geometry, drag-to-turn interaction, snap physics, and page virtualization — using vanilla JS/CSS or Canvas, no third-party flipbook library. Use when the user wants a digital magazine/catalog/book reader, a page-curl effect, or wants to understand or debug page-turn math.
version: 0.1.0
tags: [webgl, canvas, animation, ui-physics, book-reader]
inputs:
  - name: requirements
    description: What's being built — number of pages, single-page vs. two-page spread, whether a realistic curl/fold is needed or a simpler slide is acceptable, target platform (touch, mouse, or both).
    required: true
  - name: rendering_target
    description: "Preferred rendering approach if known: DOM/CSS transforms, Canvas 2D, or WebGL."
    required: false
author: rakibulism
author_url: https://x.com/rakibulism
---

# Page Flip Builder

You build page-turn interactions as a real physical simulation of a hinged sheet, not a generic slide transition — but you also know when a hinge simulation is the wrong tool and a simple slide is more honest to the content.

## Decide the fidelity level first

A "page turn" can mean three very different things — pick based on what the content actually needs:

1. **Slide/vanish** — the page translates off-screen and the next one appears. No hinge, no curl. Right for single-page reading flows where realism adds nothing but confusion (a lone page "flipping" with no facing page to fold onto looks like it's undoing itself).
2. **Flat hinge flip** — a rigid rectangle rotating in 3D around a fixed edge (`rotateY` on a `transform-style: preserve-3d` element). Right for a two-page spread or a "flip to reveal the next surface" metaphor where a facing page justifies the fold.
3. **Curled fold** — the page bends along a curve as it turns, with a highlight/shadow along the fold line, following the actual geometry of a corner being pulled. Right for a realistic book/magazine reader where the user drags a corner. Needs either a Canvas mesh warp or a WebGL shader; CSS alone can't bend a flat plane.

State which fidelity level fits the requirements before writing any code — most requests default to level 3 when level 1 or 2 would serve the reader better and cost far less.

## Fold geometry (level 3 — the curl)

1. **Model the page as a grid of vertices**, not a single rigid quad. A coarse grid (roughly 10×14) is enough to fake a convincing curl; too fine wastes GPU/CPU for no visible gain.
2. **Track the "drag point"** (where the user's finger/cursor is) and the **fold line** — the perpendicular bisector between the drag point and the fixed corner the page is anchored to.
3. **Split the page at the fold line**: vertices behind the fold stay flat; vertices ahead of it get displaced along a cylindrical arc whose radius shrinks as the drag point moves closer to the anchor corner (the page "wraps" tighter the further it's turned).
4. **Add a soft shadow gradient along the fold** and a highlight on the curled part facing the light source — this single detail sells the illusion more than the geometry precision does.
5. **On release**, don't just snap the mesh flat — animate the curl radius back to flat (or forward to fully turned) over a short easing curve; an instant snap reads as a glitch, not a page settling.

## Interaction & physics

1. **Drive the fold from pointer position, not from time.** The user's finger should always be "holding" the corner — the fold recalculates every pointer move, not on a fixed animation timeline.
2. **Decide the commit threshold** up front: what fraction of the page width/height dragged counts as "turn it," vs. "spring back." Somewhere around a quarter to a third of the dimension feels natural — much less and light taps accidentally turn pages; much more and a deliberate drag doesn't commit.
3. **Add velocity-based commit** on top of the distance threshold: a fast flick partway through should still commit, the same way flicking a real page does, even if it doesn't cross the static distance threshold.
4. **Constrain the drag axis appropriately** — a flip usually only makes sense from specific corners/edges; ignore pointer movement that doesn't originate near a valid drag zone, and don't fight the browser's native vertical scroll if the content itself needs scrolling.

## Page management (multi-page books)

1. **Virtualize.** Never mount every page's DOM/canvas/WebGL resources at once for anything beyond a handful of pages — mount the current page, the one or two neighbors on each side, and tear down everything else.
2. **Preload the next likely page's assets** (images, heavy content) slightly ahead of when it'll be needed, but don't preload the entire book eagerly.
3. **Keep page state (scroll position within a page, form inputs, etc.) alive across virtualization boundaries** if the page might be revisited — remount shouldn't mean "forget."

## Performance

- Prefer `transform`/`opacity` for anything CSS-driven — never animate `top`/`left`/`width` in the drag loop.
- For a Canvas/WebGL curl, keep the vertex grid and texture resolution proportional to the page's on-screen size, not its source resolution — downscale large source images before they hit the GPU.
- Cap the redraw rate to the drag/pointer event rate; don't run a separate uncapped animation loop while idle.

## What to avoid

- Don't build a full curl simulation for a single-page reading flow — that's fidelity level 3 solving a level 1 problem, and it reads as confusing rather than impressive (the page appears to "come back" toward the reader with nowhere for it to have gone).
- Don't snap the fold instantly on release; always ease to the resolved state.
- Don't mount the whole book's pages into the DOM/canvas at once — virtualize past a handful of pages.
