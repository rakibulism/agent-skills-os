---
name: de2-figma-to-code
description: Track 2 rail — Figma-to-code mastery. Structuring Figma files with absolute auto-layout control, nested component architecture, variables, and design tokens so the file is a direct logical representation of the DOM. Use whenever preparing Figma files for developer handoff, translating Figma designs into code, auditing a Figma file's structure, setting up Figma variables/components, or when a user asks how to organize Figma so devs stop asking questions.
version: 0.1.0
tags: [design-engineering, prototyping, storyboarding]
inputs:
  - name: concept
    description: The interaction or motion idea being planned before implementation.
    required: true
---

# Figma-to-Code Mastery

The Figma file should be a logical mirror of the DOM, making translation mechanical instead of interpretive.

## Auto-Layout = Flexbox

Every frame that will be a `div` gets auto-layout. The mapping is exact:

| Figma | CSS |
|---|---|
| Direction | flex-direction |
| Gap | gap |
| Padding | padding |
| Fill container | flex: 1 / width: 100% |
| Hug contents | intrinsic sizing |
| Fixed | explicit width/height |
| Align/justify controls | align-items / justify-content |
| Absolute position child | position: absolute in relative parent — a deliberate exception, never the default |

A file full of manually-positioned layers is a picture of a UI, not a spec for one.

## Naming & Structure

- Layers named as components will be named in code: `Card/Pricing`, `Button/Primary/Large`. "Frame 4231" = not handoff-ready.
- **Nested components mirror the code tree:** a `Card` containing a `Button` *instance*, not a flattened group.
- **Component properties map to props:** boolean toggles (`showIcon`), instance swaps (`icon`), text props (`label`), variants (`variant=primary|ghost`, `size=sm|md|lg`). Name them exactly as the code props will be named.

## Variables = Design Tokens

- Colors, spacing, radii, typography as Figma **variables**, named identically to code tokens: `color/bg/surface-2`, `space/4`, `radius/md`.
- Two tiers: primitives (`blue/500`) referenced by semantics (`color/bg/accent`); layers consume semantics.
- **Modes** (light/dark) on variable collections = theme switching in code; test every screen in both modes inside Figma.
- Zero hardcoded per-layer values in a handoff file — a raw hex in the inspect panel is a defect.

## Responsive Intent

- Min/max widths on frames; provide key breakpoint frames (mobile + desktop minimum, tablet where layout differs structurally).
- Use constraints and auto-layout wrapping to *demonstrate* reflow behavior, not just show two static sizes.

## The Handoff Test
A developer (or Claude, via Figma MCP) should produce the DOM from the inspect panel without asking one "what happens when…" question. If a question would arise — text overflow? empty state? 4-item vs 40-item list? — add the frame that answers it.
