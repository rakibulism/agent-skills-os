---
name: component-designer
description: Design a UI component from scratch — structure, states, variants, props/API, accessibility, and edge cases. Produces a component spec a designer and engineer can build from without ambiguity. Use when the user asks to design a button, input, modal, card, menu, or any reusable UI primitive.
version: 0.1.0
tags: [ui, design, components, design-system, accessibility]
inputs:
  - name: component
    description: Component name and purpose, e.g. "a multi-select dropdown for filtering search results".
    required: true
  - name: design_system
    description: Existing design system context — token names, sibling components, framework (React, Vue, Web Components).
    required: false
  - name: constraints
    description: Constraints — viewport sizes, accessibility level (WCAG AA / AAA), themes (light/dark), platforms.
    required: false
---

# Component Designer

You design components that engineers can implement without coming back to ask "what about…". The output is a spec, not a sketch.

## Process

1. **Clarify the job.** What is this component *for*? A button submits an action; a link navigates; a chip represents a removable selection. If the user's description mixes jobs ("a button that toggles and links"), split it into two components or pick one.
2. **Enumerate states before structure.** A complete component handles:
   - default, hover, active/pressed, focus (keyboard), focus-visible, disabled, loading, success, error, read-only, selected/unselected, empty, populated, overflowing.
   - For inputs: also empty, valid, invalid, with-help-text, with-error-text, required, optional.
3. **Enumerate variants.** Size (sm/md/lg), weight/emphasis (primary/secondary/ghost/destructive), shape (rounded/square), icon-only vs icon+label.
4. **Define the API.** What props/slots does it expose? Required vs optional, defaults, controlled vs uncontrolled, what's a child vs a prop. Smaller surface area is better; resist props that exist "just in case."
5. **Pin down accessibility.** Semantic element (`<button>` not `<div role="button">`), keyboard interactions (Tab, Enter, Space, Esc, arrows), focus management, ARIA where needed (only when semantics aren't enough), screen reader output, reduced motion.
6. **Specify the visual language by token, not by value.** `background: color.surface.subtle`, not `background: #F4F4F4`. Engineers and themes can substitute.
7. **Define edge cases the engineer will hit:**
   - Long text (truncation? wrap? max width?)
   - No content (placeholder? hide?)
   - Async (loading skeleton, optimistic state, error retry)
   - Responsive (does this collapse, stack, or hide on small screens?)
   - Internationalization (RTL flip, longer strings in DE/FR)

## Output format

```
# <Component Name>

**Purpose:** <one sentence>
**Anatomy:** <named parts — e.g. "icon · label · trailing icon · badge">

## Anatomy diagram
<ASCII or text layout showing named parts>

## API
| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| variant | "primary" \| "secondary" \| "ghost" \| "destructive" | no | "primary" | Visual emphasis |
| size | "sm" \| "md" \| "lg" | no | "md" | Vertical size |
| ... |

## States
- **default** — <visual spec by token>
- **hover** — <delta from default>
- **focus-visible** — <focus ring spec>
- **disabled** — <visual + interaction: pointer-events none, aria-disabled>
- **loading** — <spinner placement, content shift policy>
- ...

## Interactions
- **Click / Enter / Space:** triggers `onClick`
- **Esc:** <if applicable>
- **Tab:** moves focus to/from
- ...

## Accessibility
- Semantic element: `<button type="...">`
- Keyboard: <full list>
- ARIA: <only what's needed>
- Screen reader output: "<expected announcement>"
- Reduced motion: <what changes when prefers-reduced-motion>
- Touch target: ≥ 44×44 px

## Edge cases
- Long text: <policy>
- Async: <policy>
- RTL: <policy>
- Responsive: <policy>

## Tokens used
- <list of design tokens referenced>

## Open questions
- <anything that needs design or product input>
```

## What to avoid

- **Over-componentization.** A "Button" doesn't need 14 variants for v1. Ship 3, add more on demand.
- **Props that encode position or page-specific behavior** (`isOnHomePage`). The component shouldn't know where it lives.
- **Hidden flexibility.** Don't expose props the design system won't actually support — saying yes to everything makes the system inconsistent.
- **Visual spec by hex values.** Always reference tokens; let the theme do its job.
- **Skipping the focus state.** A component with no keyboard focus design is incomplete, not "to be added later."
