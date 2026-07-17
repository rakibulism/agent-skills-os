---
name: de-sketch-prototype
description: Track 2 of the Design Engineer curriculum — the artist's hand. Techniques for perspective sketching, storyboarding interactions frame-by-frame, structuring Figma files so they map 1:1 to code (auto-layout, components, variables, tokens), and motion prototyping in After Effects/Spline before writing shaders. Use this skill whenever the user wants to plan or storyboard an animation or interaction before coding it, structure a Figma file for developer handoff, sketch or visualize a UI/3D concept, prototype motion, or asks how to go from idea → sketch → Figma → code. Also trigger when translating Figma designs to code or preparing designs for Figma-to-code workflows.
author: rakibulism
author_url: https://x.com/rakibulism
---

# Track 2: The Artist's Hand

Ideas must be visible before they're executable. This skill covers externalizing concepts fast — on paper, in Figma, in motion mockups — and structuring those artifacts so they translate to code without interpretation loss.

## 1. Perspective & Industrial Sketching (for UI/3D concepts)

Use sketching to solve spatial problems before touching software:

- **1-point perspective** — for depth-stacked UI: card stacks receding, z-layered modals, tunnel/portal effects. Single vanishing point at eye level; all depth lines converge to it.
- **2-point perspective** — for isometric-feeling product shots, floating device mockups, folder/box metaphors viewed at an angle. Two vanishing points on the horizon; verticals stay vertical.
- **3-point perspective** — for dramatic hero shots looking up/down at 3D scenes. Adds a third vanishing point above or below.
- **Practical method for UI cards in space:** draw the horizon line, place vanishing points *far apart* (close VPs = fisheye distortion), block the card as a box first, then round corners and add face details. Shadows anchor objects: sketch a soft ellipse under floating elements.
- **What to sketch before coding a 3D scene:** camera height and angle, focal length feel (wide = drama, long = product-shot calm), light direction (one arrow), and the 2–3 depth planes (foreground/subject/background). These four decisions determine 80% of a scene's look and are 100× cheaper to change on paper.

## 2. Storyboarding Interactions

Every non-trivial animation gets a storyboard before implementation. Format:

```
Frame 1 (0ms)     — rest state: card at scale 1, shadow tight
Frame 2 (0–80ms)  — press: card scales to 0.97, shadow contracts (anticipation)
Frame 3 (80ms)    — release: spring launches, card scales past 1 to ~1.03 (overshoot)
Frame 4 (~300ms)  — settle: oscillation decays to scale 1, shadow blooms then settles
```

Rules for good motion storyboards:
- **Every keyframe names the properties that change and their values** — "it grows" is not a storyboard; "scale 1→1.03, shadow-blur 8→24" is.
- **Borrow the animation principles that apply to UI:** anticipation (small counter-move before the main move), follow-through (elements settle after the container stops), squash-and-stretch (sparingly — stretch along the velocity vector during fast motion), staggered secondary action (children animate 30–60ms after the parent), and arcs (elements moving between two points travel a slight curve, not a laser line).
- **Mark the interruption behavior:** what happens if the user re-triggers mid-animation? (Answer should almost always be: retarget from current position/velocity — which mandates springs over fixed tweens; see `de-ui-physics`.)
- **One storyboard cell per state transition** in the interaction's state machine — this doubles as the spec for XState/state code later.

## 3. Figma-to-Code Mastery

Structure Figma files as a direct logical representation of the DOM, so translation is mechanical:

- **Auto-layout everywhere = flexbox everywhere.** Every frame that will be a `div` gets auto-layout. Direction = flex-direction, gap = gap, padding = padding, "fill container" = `flex: 1` / `width: 100%`, "hug" = intrinsic sizing. A frame with absolute-positioned children is a deliberate exception (maps to `position: absolute` in a `relative` parent) — not the default.
- **Layer naming maps to component names:** `Card/Pricing`, `Button/Primary/Large`. If a layer is called "Frame 4231," the file isn't handoff-ready.
- **Nested components mirror the component tree in code:** a `Card` component containing a `Button` instance, not a flattened group. Component properties (boolean toggles, instance swaps, text props) map to React props — name them as you'd name props (`showIcon`, `variant`, `label`).
- **Variables = design tokens.** Colors, spacing, radii, and type as Figma variables with the same names the code tokens will use (`color/bg/surface-2`, `space/4`). Modes (light/dark) in Figma variables map to theme switching in code. Never hand a file where values are hardcoded per-layer.
- **Constraints & breakpoints:** set min/max widths on frames, use variables for breakpoint-dependent values, and provide the key breakpoint frames (mobile/desktop at minimum) rather than one artboard.
- **The test:** a developer (or Claude) should be able to read the Figma inspect panel and produce the DOM without asking a single "what happens when…" question.

## 4. Video & Motion Prototyping (before shader code)

High-fidelity motion mockups de-risk expensive implementations:

- **When to prototype in After Effects/Spline/Rive first:** any effect that will take >1 day to implement in code (shaders, complex 3D, physics choreography). A 2-hour AE mockup that reveals "this looks bad" saves a week.
- **After Effects → code translation notes:** AE's default "Easy Ease" ≈ `cubic-bezier(0.33,0,0.67,1)`; read exact curves from the graph editor and port the bezier handles directly. Export motion specs, or use Lottie (via Bodymovin) for vector animations that can ship as-is — but treat Lottie as a delivery format for *decorative* motion only, never for interactive/physics-driven motion.
- **Spline / Blender playblasts** for 3D concepts: block the scene with placeholder materials, animate the camera, render a low-res video. Approve the *choreography* before spending time on materials and shaders.
- **Rive** when the animation needs to ship as an interactive state machine (hover/press states baked into the asset) at small payload.
- **The gate:** motion mockup gets stakeholder/self approval → storyboard extracted from it → then code. Never let the code implementation drift from the approved mockup without re-approving.

## Workflow Summary

Idea → 5-minute paper sketch (spatial decisions) → storyboard (exact property keyframes) → Figma (tokenized, auto-layout, DOM-shaped) → motion mockup if the effect is expensive → code. Each artifact answers questions the next stage would otherwise waste engineering time on.
