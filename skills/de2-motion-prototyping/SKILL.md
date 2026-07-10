---
name: de2-motion-prototyping
description: Track 2 rail — video and motion prototyping. Using After Effects, Spline, Rive, or Blender playblasts to build high-fidelity motion mockups that prove a concept before writing shader or animation code, plus translating AE curves to code and choosing Lottie vs Rive vs code. Use whenever an expensive animation/3D effect should be validated before implementation, when converting an After Effects mockup into web code, or when choosing a delivery format for authored motion (Lottie, Rive, video, code).
version: 0.1.0
tags: [design-engineering, prototyping, storyboarding]
inputs:
  - name: concept
    description: The interaction or motion idea being planned before implementation.
    required: true
---

# Video & Motion Prototyping

High-fidelity motion mockups de-risk expensive implementations. A 2-hour mockup that reveals "this looks bad" saves a week of shader work.

## When to Prototype First

Any effect estimated at >1 day of implementation: custom shaders, complex 3D choreography, physics ensembles, multi-element orchestrated reveals. The gate: **mockup approved → storyboard extracted (de2-interaction-storyboarding) → code**. Implementation never drifts from the approved mockup without re-approval.

## Tool Selection

- **After Effects** — 2D motion choreography, timing exploration, orchestrated reveals. The graph editor is the ground truth for curves.
- **Spline** — quick interactive 3D concepts in-browser; good enough fidelity to judge camera/material choices; can export to web (but treat exports as prototypes — payload and control are usually worse than hand-built R3F).
- **Blender playblasts** — block the 3D scene with placeholder materials, animate the camera, render low-res video. Approve the *choreography* before spending on materials/shaders.
- **Rive** — when the animation ships as an interactive state machine (hover/press baked into the asset) at small payload.

## After Effects → Code Translation

- AE "Easy Ease" ≈ `cubic-bezier(0.33, 0, 0.67, 1)`. Read exact curves from the graph editor: influence % and speed map to bezier handles — port them directly.
- Frame math: AE comps at 30fps → durations = frames/30; keep an exact ms table per layer.
- Overshoots in AE become springs in code: match the overshoot % and settle time to spring params (k/c) rather than baking a keyframe chain.

## Delivery Format Decision

| Situation | Ship as |
|---|---|
| Decorative vector animation, plays once/loops | Lottie (Bodymovin export) — but decorative ONLY |
| Interactive states baked in asset, small payload | Rive |
| Physics/gesture-driven, interruptible | Code (springs — de4) ; never Lottie |
| Background ambiance | Compressed video (≤1–2MB, muted, autoplay) |
| Anything driven by scroll/cursor | Code |

Lottie for interactive motion is a trap: not interruptible, not physics-aware, and heavy JSON for complex comps.

## Review Heuristic
If someone proposes weeks of WebGL work from a static image reference, require a motion mockup first. If a Lottie file is driving a gesture, replace it with springs.
