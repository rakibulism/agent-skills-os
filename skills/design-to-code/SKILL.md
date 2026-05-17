---
name: design-to-code
description: Translate a design (Figma spec, screenshot, or written description) into production-quality component code. Faithful to the design, accessible by default, responsive, and consuming design tokens rather than raw values. Use when the user asks to implement a design, "build this Figma", or convert a mockup to code.
version: 0.1.0
tags: [design-engineering, frontend, react, css, implementation]
inputs:
  - name: design
    description: The design source — Figma URL, screenshot, written spec, or detailed description.
    required: true
  - name: stack
    description: Target stack — React + Tailwind, Vue + CSS modules, plain HTML/CSS, Web Components, etc.
    required: false
  - name: tokens
    description: Available design tokens or component primitives to consume (Button, Input, etc.).
    required: false
---

# Design to Code

You translate designs to code. The translation should be invisible — a designer comparing the rendered result to the spec should not be able to tell at a glance which is which.

## Process

1. **Read the design completely before writing code.** Identify:
   - Component boundaries (what's reusable vs page-specific)
   - States visible in the design + states implied (focus, disabled, error)
   - Responsive behavior (does the design show breakpoints?)
   - Tokens vs values (is this exact `#2563EB` or is it `action.primary`?)
2. **Inventory what already exists.** Reach for existing primitives (`<Button>`, `<Input>`) before recreating them. If the design implies a new variant, prefer extending over forking.
3. **Match the design's hierarchy with the DOM's hierarchy.** Visual grouping that doesn't reflect semantic grouping makes screen readers and tests harder.
4. **Use semantic HTML first, ARIA second.** `<nav>`, `<header>`, `<button>`, `<a>` — only reach for `role=` when no semantic element fits.
5. **Implement responsive behavior even if the design only shows one viewport.** Ask: what should this do at 360px? 768px? 1440px? Default to stacking, never horizontal scroll on text.
6. **Build state visibility into the markup.** Loading skeletons, empty states, and error states are often missing from designs but always in production.
7. **Check accessibility in passing, not at the end:**
   - Keyboard reachable in order?
   - Focus visible?
   - Color contrast ≥ 4.5:1 on body text?
   - Form inputs labeled?
   - Decorative icons `aria-hidden`, meaningful icons labeled?

## Quality bar

A faithful implementation:
- **Visual:** spacing matches the design at all breakpoints listed; type matches font, size, weight, line-height; colors use tokens that resolve to the spec values; corners and shadows match.
- **Interaction:** hover, focus, active, disabled all visibly different; transitions where the design shows or implies motion.
- **Accessibility:** WCAG AA contrast; semantic HTML; keyboard navigation; reduced motion respected.
- **Performance:** no layout thrash on hover; images sized and `loading="lazy"` where appropriate; no unnecessary re-renders.
- **Maintainability:** uses tokens, not hex codes; consumes existing components; props named by purpose, not appearance.

## Common translation traps

- **Pixel-perfect ≠ faithful.** A 14.5px gap in Figma is probably 16px in code (the designer dragged). Round to the token scale.
- **The design shows one width.** Production has 200 widths. Decide flex/grid behavior.
- **Text overflow not shown.** Long names, long titles, long URLs always happen. Ellipsize or wrap with intent.
- **States not shown.** Designs rarely show focus, disabled, error, loading. Implement them anyway.
- **Icons at exact size.** SVG icons at 14, 16, 20, 24 — stick to these. Off-scale icons look fuzzy or oversized.
- **One-off colors.** A subtle background tint that doesn't exist in the token set — either propose a new token or use the nearest existing one. Don't inline a hex.
- **Implementing layout with margins.** Prefer gap on flex/grid containers. Margins fight each other and break inside lists.

## Output format

```
## Component plan
- <component>: <purpose> — reusing <existing primitive> or new
- <component>: ...

## Code
<file path comments and code blocks per file>

## Token mapping
| Design value | Token used | Notes |
|---|---|---|
| #2563EB | color.action.primary | |
| 16px | space.4 | |
| ... |

## States implemented
- default | hover | focus | active | disabled | loading | error | empty

## Responsive behavior
- <breakpoint>: <change>

## Accessibility checklist
- [x] Semantic elements
- [x] Keyboard navigation
- [x] Focus visible
- [x] Contrast AA
- [x] Reduced motion respected
- [x] Screen reader output sensible

## Notes / open questions for designer
- <anything that needs clarification>
```

## What to avoid

- **`!important` and inline styles.** They signal something else is wrong.
- **`px` everywhere when a scale exists.** Use tokens or scale variables.
- **`div` soup.** If you can use a `button`, `nav`, `section`, `header`, do.
- **Animating layout properties.** Use transforms (see [[interaction-designer]]).
- **Implementing the design literally when it conflicts with the system.** Push back with a question — designers want consistency too.
- **Shipping without checking 360px.** It's the most common phone width and the most commonly broken.
