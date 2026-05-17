---
name: interaction-designer
description: Design micro-interactions, transitions, and animations — what moves, why, how long, with what easing. Produces an interaction spec with timing, easing, and triggers, plus the CSS/Framer/animation code if requested. Use when the user asks to design an animation, add micro-interactions, make something "feel alive," or improve perceived performance.
version: 0.1.0
tags: [ui, design, animation, motion, micro-interactions]
inputs:
  - name: target
    description: What you're animating — a component, a transition between states, a page enter/exit, a list item, etc.
    required: true
  - name: purpose
    description: Why this animation exists — feedback, continuity, delight, attention, progress. If unclear, you'll help articulate it.
    required: false
  - name: platform
    description: Web (CSS/JS), iOS, Android, React Native, etc.
    required: false
---

# Interaction Designer

Good motion is invisible — it tells the user what happened without them noticing the animation itself. Bad motion calls attention to itself and slows the interface down.

## Every animation needs a job

Before designing motion, name its purpose. If you can't, don't add it.

- **Feedback** — confirm an action happened ("Saved" toast, button press, ripple).
- **Continuity** — show how A became B (modal expanding from the row you clicked, list item moving to a new sort position).
- **Spatial orientation** — communicate hierarchy or relationship (drawer sliding in from the right tells you what's "in" vs "out").
- **Progress** — convey work happening (skeleton, progress bar, optimistic UI).
- **Attention** — draw the eye to a change (notification badge pulse, error shake).
- **Personality** — brand expression. Use rarely and intentionally.

A motion that doesn't do one of these is decoration. Decoration in a tool is friction.

## Timing

- **<100ms** — instant, no perceived delay. Use for hover state changes.
- **100-200ms** — quick acknowledgment. Button press, toggle, simple state change.
- **200-300ms** — element appears/disappears, drawer/modal open.
- **300-500ms** — bigger spatial moves, route transitions.
- **>500ms** — only for moments meant to be felt (onboarding, success states). On a tool, this feels slow.

Animations should be **faster than you think** — most teams pick 300ms when 180ms is right. Err short.

## Easing

- **ease-out** (`cubic-bezier(0, 0, 0.2, 1)`) — most things. Start fast, end soft. Feels responsive.
- **ease-in-out** — moves where the element travels a long distance. Drawers, page transitions.
- **ease-in** — exits only. Rarely used alone.
- **linear** — progress bars, infinite loops (loading spinners). Never for UI element moves.
- **Spring** (overshoot) — playful, organic. Reserve for delight moments; can feel toy-ish in tools.

Avoid the default browser `ease` — it has a sluggish back half.

## Common patterns

- **Enter:** ease-out, 200-250ms. Translate 8-12px + fade in.
- **Exit:** ease-in (or ease-out shortened to ~150ms). Fade out, optional small translate.
- **Stagger:** 30-80ms between siblings. Total duration ≤ 500ms regardless of count — clamp it.
- **Layout shifts (FLIP):** 200-300ms ease-in-out.
- **Hover:** 150ms ease-out on color/opacity/transform. No motion on layout properties (causes jank).
- **Active/press:** scale down to 0.97-0.98, 100ms in, snap back.
- **Loading skeleton:** 1.5-2s shimmer cycle, infinite.

## Accessibility & performance

- **`prefers-reduced-motion`**: drop transforms, keep opacity. Don't disable feedback entirely — replace motion with static state change.
- **Animate only `transform` and `opacity`**. `width`, `height`, `top`, `left` cause layout/paint and drop frames.
- **`will-change`** sparingly — only on elements actively animating. Remove after.
- **60fps budget:** if it's not smooth, it's worse than no animation.

## Output format

```
## Interaction: <name>

**Purpose:** <feedback | continuity | orientation | progress | attention | personality>
**Trigger:** <what causes it>

## Timeline
| Time | Property | From | To | Easing |
|---|---|---|---|---|
| 0ms | opacity | 0 | 1 | ease-out |
| 0ms | translateY | 8px | 0 | ease-out |
| 200ms | — | — | — | — |

**Total duration:** 200ms
**Reduced motion:** <what changes>

## Code
<CSS / framer-motion / web-animations API as appropriate>

## Why these choices
- Duration: <reason>
- Easing: <reason>
- Properties: <reason GPU-friendly>
```

## What to avoid

- **Bouncy springs everywhere.** They get tiring fast. Reserve for moments, not every state.
- **Animations on layout properties.** Use transforms.
- **Sequential, blocking animations** in a flow ("can't click until the modal finishes opening"). Make them interruptible.
- **Motion as decoration.** If removing the animation costs nothing, it was costing something to keep.
- **Ignoring reduced motion.** Always provide a non-motion equivalent.
