---
name: de-component-architecture
description: Track 6 of the Design Engineer curriculum — modern component and system architecture. Composing isolated, accessible, drop-in components (React/Vue/Svelte), advanced state systems (Zustand, XState finite state machines, Signals) without wasteful re-renders, strict TypeScript for animation/interaction code, and automated Figma-variables-to-code design token pipelines (Style Dictionary → Tailwind/SCSS/JSON). Use this skill whenever the user is structuring a component library, wiring complex interactive state, typing animation APIs, setting up design tokens or theme systems, connecting Figma variables to code, or asks how to keep animation-heavy React apps from re-rendering themselves to death.
---

# Track 6: Modern Component & System Architecture

Mathematical brilliance wrapped in spaghetti is unshippable. This skill covers packaging interactive work as clean, typed, production-grade systems.

## 1. Component Composition

- **Isolate by responsibility, compose by slots:** a component owns its internal states and motion; everything contextual arrives via props/children. Prefer compound components (`<Carousel><Carousel.Track><Carousel.Slide/>…`) over prop-bag mega-components — consumers compose structure, the parent shares state via context.
- **Headless core + styled shell:** put behavior (keyboard handling, gesture logic, state machine) in an unstyled hook/primitive (`useCarousel`), style separately. This is the Radix/shadcn pattern and it's what makes components genuinely drop-in across projects. When shadcn/ui fits the project, build on it rather than reinventing focus management.
- **Accessibility is part of the component, not a pass afterward:** correct roles/ARIA, full keyboard operation (arrow keys in composite widgets, Escape to dismiss, focus trap in modals), visible focus rings, and `prefers-reduced-motion` handling baked into every animated component: reduce to opacity-only or instant transitions — never simply delete the state change.
- **Animation-aware component design:** components must animate on unmount (exit animations) — design with presence handling (`AnimatePresence` or equivalent) from the start; expose motion customization as physical props (`spring={{ stiffness, damping }}`), not booleans like `fast`.

## 2. Advanced State Systems

Interactive/animation state has two distinct species — architect them differently:
- **Transient per-frame values** (cursor position, scroll progress, spring positions) must **bypass the framework render cycle**: store in refs/mutable stores and write to the DOM/canvas in RAF. In R3F/Zustand: `useStore.subscribe(sel, cb)` or `getState()` inside `useFrame` — never `useState` at 60Hz.
- **Discrete interaction states** (idle/hover/dragging/settling/open/closed) belong in explicit state machines.

**Zustand** — default store: small, selector-based subscriptions (`useStore(s => s.count)`) so components re-render only for their slice; `subscribeWithSelector` for render-loop consumers; actions colocated in the store.

**XState / finite state machines** — reach for one whenever an interaction has ≥3 states or any "it got stuck mid-animation" bug appears. Model states (`idle → dragging → settling → idle`), events (`POINTER_DOWN`, `RELEASE`), and guards explicitly. FSMs make impossible states unrepresentable — the gesture can't be simultaneously `dragging` and `settling`, which is precisely the bug class that plagues hand-rolled boolean-flag interaction code. The storyboard from `de-sketch-prototype` §2 maps 1:1 to the machine's states.

**Signals** (Preact Signals, Svelte 5 runes, Vue refs) — fine-grained reactivity that updates only the DOM nodes bound to a value, skipping component re-render entirely — ideal for high-frequency values in frameworks that support them.

**Re-render audit rules:** React DevTools Profiler on every interactive component; memoize event handlers passed to memoized children; never create objects/arrays inline in props of hot components; context splits (state-context vs. dispatch-context) so consumers of stable actions don't re-render on state change.

## 3. TypeScript Mastery (for interactive systems)

- **Strict mode, always** (`strict: true`, plus `noUncheckedIndexedAccess`).
- **Type the motion vocabulary:**
```ts
type SpringConfig = { stiffness: number; damping: number; mass?: number };
type EasingFn = (t: number) => number;
type Vec2 = readonly [x: number, y: number];
```
- **Discriminated unions for machine states** — the type system enforces exhaustive handling:
```ts
type DragState =
  | { status: 'idle' }
  | { status: 'dragging'; origin: Vec2; velocity: Vec2 }
  | { status: 'settling'; target: Vec2 };
// switch (state.status) — compiler errors if a state is unhandled
```
- **Generics for reusable primitives:** `function useSpringValue<T extends number | Vec2>(target: T, config?: SpringConfig): T` — one solver, typed for scalars and vectors.
- **Const-driven design tokens:** `const spacing = { 1: 4, 2: 8, 3: 12 } as const; type Space = keyof typeof spacing;` — component props accept only real scale steps; invalid spacing is a compile error.
- **Template literal types** for token names (`type ColorToken = \`color/\${string}/\${number}\``), branded types for unit safety (`type Px = number & { __unit: 'px' }`) where unit confusion has bitten before.
- Type events precisely (`PointerEvent<HTMLDivElement>`), never `any` in gesture code — velocity math on `any` is where NaN bugs breed.

## 4. Figma-to-Code Token Pipelines

Design tokens flow one way — Figma variables are the source of truth; code consumes generated artifacts:

1. **Export** Figma variables to JSON: Tokens Studio plugin, Figma Variables REST API, or a custom plugin. Keep the tier structure: **primitive** tokens (`blue/500`) → **semantic** tokens (`color/bg/accent` references `blue/500`) → component tokens where needed. Code should reference *semantic* tokens almost exclusively.
2. **Transform with Style Dictionary:** one token source, multiple build targets:
   - CSS custom properties (`--color-bg-accent`) with light/dark mode blocks generated from Figma variable modes
   - Tailwind config (`theme.extend.colors` mapped to the CSS vars, so Tailwind classes stay theme-reactive: `accent: 'var(--color-bg-accent)'`)
   - SCSS maps / JSON for native or docs consumption
   - TypeScript declarations of token names → autocomplete + compile-time validation
3. **Automate:** a CI job (or on-demand script) pulls Figma variables → regenerates tokens → opens a PR. Designers change a variable in Figma; the product updates in one reviewed commit. No human ever transcribes a hex code.
4. **Motion and radii are tokens too:** durations, spring presets (`motion/spring/snappy = {stiffness:170, damping:26}`), easing curves, z-index scale, radii — all belong in the same pipeline, or design/code drift returns through the back door.

## Definition of Done (component)

Typed public API · headless behavior separable from styles · keyboard + screen-reader accessible · exit animations handled · `prefers-reduced-motion` respected · zero re-renders during continuous gestures (verified in profiler) · consumes semantic tokens only · story/demo with all machine states reachable.
