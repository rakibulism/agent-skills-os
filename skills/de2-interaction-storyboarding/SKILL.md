---
name: de2-interaction-storyboarding
description: Track 2 rail — storyboarding interactions. Cell-by-cell keyframe sequences that specify exactly how an element morphs, expands, or transitions over time, with property-level values, animation principles (anticipation, follow-through, squash/stretch, arcs, stagger), and interruption behavior. Use whenever planning any non-trivial animation or transition before coding, writing a motion spec, or when a user describes desired motion vaguely ("it should feel bouncy") and it needs to become implementable.
version: 0.1.0
tags: [design-engineering, prototyping, storyboarding]
inputs:
  - name: concept
    description: The interaction or motion idea being planned before implementation.
    required: true
---

# Storyboarding Interactions

Every non-trivial animation gets a storyboard before implementation. "It grows" is not a spec; "scale 1→1.03, shadow-blur 8→24, expo-out 300ms" is.

## Format

```
Frame 1 (0ms)      — REST: card scale 1, shadow 0 2px 8px @ .12, y 0
Frame 2 (0–80ms)   — PRESS: scale→0.97, shadow contracts to 0 1px 3px (anticipation)
Frame 3 (80ms)     — RELEASE: spring k=170 c=14 launches; scale overshoots to ~1.03
Frame 4 (~350ms)   — SETTLE: oscillation decays to 1; shadow blooms to 0 8px 24px then settles
INTERRUPT: re-press mid-settle → spring retargets from current value+velocity (no restart)
```

Rules:
- **Every keyframe names properties + values.** Position, scale, opacity, shadow, radius, color — whatever moves gets a number.
- **One storyboard cell per state transition** in the interaction's state machine — the storyboard doubles as the FSM spec (feeds de6-state-systems).
- **Always specify the interrupt row.** What happens when re-triggered mid-flight? Correct answer is almost always: retarget from current position AND velocity — which mandates springs (de4-spring-damper) over fixed tweens.

## Animation Principles That Apply to UI

- **Anticipation:** tiny counter-move before the main move (press-shrink before release-pop). 40–80ms.
- **Follow-through:** contents settle *after* the container stops; children lag 30–60ms behind parents.
- **Staggered secondary action:** list items enter 30–80ms apart, capped ~400ms total; stagger origin follows the interaction point.
- **Squash & stretch:** sparingly — stretch along the velocity vector during fast motion (≤5–8% distortion), restore on stop.
- **Arcs:** elements moving between two points travel a slight curve, not a laser line — especially anything "picked up and placed".
- **Slow in / slow out:** nothing physical starts or stops instantly; enters ease-out, exits ease-in.

## Paper Technique
6–8 cells per row, tiny thumbnails, arrows for motion direction, timing written under each cell. Draw the *extremes* (rest, peak overshoot, settled) first, then in-betweens only if ambiguous.

## Definition of Done
Another engineer could implement the motion without asking a single "what happens when…" question: all properties valued, all transitions timed, easing/spring named per transition, interruption behavior stated, reduced-motion variant noted (usually: opacity-only or instant).
