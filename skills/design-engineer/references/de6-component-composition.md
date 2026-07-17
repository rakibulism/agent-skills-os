# Component Composition

Components must drop into any project, customize without forking, and remain accessible — while carrying complex motion inside.

## Compose by Slots, Not Prop Bags

Prefer compound components over mega-components with 30 props:
```jsx
<Carousel>
  <Carousel.Track>
    <Carousel.Slide />
  </Carousel.Track>
  <Carousel.Dots />
</Carousel>
```
Consumers compose structure; the parent shares state via context. A prop-bag (`showDots`, `dotPosition`, `dotStyle`, …) hardcodes every future layout decision; slots defer them.

## Headless Core + Styled Shell

Behavior (keyboard handling, gesture logic, the state machine) lives in an unstyled hook/primitive (`useCarousel`); styling is a separate layer. This is the Radix/shadcn architecture and it's what makes components genuinely portable across brands and projects. When shadcn/ui fits, build on it — never reinvent focus traps and roving tabindex.

## Accessibility Is Part of the Component

Not an audit afterward:
- Correct roles/ARIA (`role="dialog"`, `aria-expanded`, `aria-controls`)
- Full keyboard operation: arrow keys within composite widgets (roving tabindex), Escape dismisses, Enter/Space activate, focus trapped in modals and **returned** on close
- Visible focus rings (`:focus-visible`), never `outline: none` without replacement
- **`prefers-reduced-motion` in every animated component:** reduce to opacity-only or instant — never simply delete the state change (the state must still communicate)

## Animation-Aware Design

- **Exit animations require presence handling** — React unmounts instantly, so design with `AnimatePresence` (or equivalent) from day one; retrofitting exit animations is painful.
- **Motion customization as physical props:** `spring={{ stiffness: 170, damping: 26 }}` — never booleans like `fast` or `bouncy` (they don't compose or tune).
- Motion defaults come from tokens (de6-token-pipeline), overridable per instance.
- Continuous gesture values bypass React state (de6-state-systems) — a component re-rendering 120×/s during drag is an API design failure.

## Isolation Rules
No global CSS leakage (scoped styles/CSS modules/Tailwind); no reliance on parent DOM structure; explicit z-index/portal strategy for overlays; SSR-safe (no window access at module scope); controlled AND uncontrolled modes where state ownership varies.

## Definition of Done
Typed public API · headless/styled separable · keyboard + SR pass · exit animations work · reduced-motion respected · zero re-renders during continuous gestures (profiler-verified) · demo with every state reachable.
