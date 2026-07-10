---
name: de6-typescript
description: Track 6 rail — TypeScript mastery for interactive systems. Strict typing for animation/gesture code — discriminated unions for machine states, generics for reusable motion primitives, const-driven design tokens with compile-time validation, template-literal and branded types, and precisely typed events. Use whenever writing or reviewing TypeScript for components, animation APIs, gesture handlers, or token systems, or when NaN/undefined bugs appear in motion code, or a user wants types that make invalid states and invalid tokens impossible.
version: 0.1.0
tags: [design-engineering, architecture, components]
inputs:
  - name: system
    description: The component or state system being structured or reviewed.
    required: true
---

# TypeScript for Interactive Systems

Strict typing catches structural and event bugs before runtime — critical in motion code where a NaN propagates silently until everything teleports to the corner.

## Baseline
`strict: true` plus `noUncheckedIndexedAccess: true` (array reads are `T | undefined` — exactly right for sample buffers and particle indices). No `any` in gesture/animation code — velocity math on `any` is where NaN breeds.

## Type the Motion Vocabulary

```ts
type SpringConfig = { stiffness: number; damping: number; mass?: number };
type EasingFn = (t: number) => number;
type Vec2 = readonly [x: number, y: number];
type Milliseconds = number & { readonly __unit: 'ms' };   // branded — see below
```

## Discriminated Unions for Machine States

The compiler enforces exhaustive state handling:
```ts
type DragState =
  | { status: 'idle' }
  | { status: 'dragging'; origin: Vec2; velocity: Vec2 }
  | { status: 'settling'; target: Vec2 };

switch (state.status) {
  case 'idle': ...
  case 'dragging': ...   // state.velocity exists ONLY here
  case 'settling': ...
  default: { const _x: never = state; }   // exhaustiveness guard — new states can't be forgotten
}
```
Pairs directly with de6-state-systems: the machine's states become the union's arms; accessing `velocity` outside `dragging` is a compile error, not a runtime NaN.

## Generics for Reusable Primitives

```ts
function useSpringValue<T extends number | Vec2>(target: T, config?: SpringConfig): T;
```
One solver typed for scalars and vectors. Constrain generics tightly (`extends`) so misuse errors point at the call site.

## Const-Driven Design Tokens

```ts
const spacing = { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 } as const;
type Space = keyof typeof spacing;                 // 1|2|3|4|6|8
function pad(step: Space) { return spacing[step]; } // pad(5) = compile error
```
Invalid spacing is a compile error — the type system enforces the scale from de1-grid-spacing. Same pattern for radii, durations, z-index.

## Template-Literal & Branded Types

```ts
type ColorToken = `color/${'bg' | 'fg' | 'accent'}/${string}`;   // token-name shape
type Px = number & { __unit: 'px' };
type Rad = number & { __unit: 'rad' };   // deg/rad confusion becomes a type error
```
Brand units where confusion has real cost (angles, normalized-vs-pixel coordinates).

## Events
`PointerEvent<HTMLDivElement>` / `React.PointerEvent`, precisely — event typing surfaces missing `pointerId` handling and wrong-element assumptions at compile time.
