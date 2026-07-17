# Advanced State Systems

Interactive state has two species with opposite architectures. Confusing them causes either 120Hz re-renders or stuck interactions.

## The Split

**Transient per-frame values** (cursor position, scroll progress, spring positions, drag deltas) — **must bypass the framework render cycle**: store in refs/mutable stores, write to DOM/canvas inside RAF. `useState` at 60–120Hz re-renders the tree per frame; this is the #1 animation-performance failure in React apps.

**Discrete interaction states** (idle / hover / dragging / settling / open / closed) — belong in explicit state machines with named transitions.

## Zustand — the default store

```js
const useStore = create(subscribeWithSelector((set) => ({ progress: 0, ... })));
// Components: slice subscriptions → re-render only for their slice
const count = useStore(s => s.count);
// Render loops: no re-render at all
useStore.subscribe(s => s.progress, p => { mesh.position.x = p; });
// or inside useFrame: useStore.getState().progress
```
Actions colocated in the store; no context-provider pyramid; transient reads via `getState()`.

## XState / Finite State Machines

Reach for a machine whenever an interaction has **≥3 states** or any "it got stuck mid-animation" bug appears:
```
idle → (POINTER_DOWN) → dragging → (RELEASE) → settling → (SETTLED) → idle
                                     ↑ (POINTER_DOWN — re-grab retargets)
```
FSMs make impossible states unrepresentable — the gesture cannot be `dragging` AND `settling`, which is exactly the bug class breeding in boolean-flag soup (`isDragging`, `isAnimating`, `wasReleased`…). Guards for conditions, entry/exit actions for spring start/stop. The storyboard from de2-interaction-storyboarding maps 1:1 onto the machine — cells are states, arrows are events.

## Signals

Preact Signals / Svelte 5 runes / Vue refs: fine-grained reactivity that updates only bound DOM nodes, skipping component re-render entirely — ideal for high-frequency values in frameworks that support them natively. In React, prefer the Zustand-subscribe pattern over bolted-on signals.

## Re-Render Audit (run on every interactive component)

1. React DevTools Profiler → record the gesture → **zero renders during continuous phases** is the pass bar.
2. Memoize handlers passed to memoized children; no inline object/array props on hot components.
3. Split contexts: state-context vs dispatch-context, so action consumers don't re-render on state change.
4. `console.count('render')` in dev while dragging — cheap and brutal.

## Choosing
Local UI toggle → useState. Shared app state → Zustand slices. Gesture/animation lifecycle → state machine (XState or a typed reducer). Per-frame values → refs/mutable store + RAF, never state. High-frequency bound text/attrs in supporting frameworks → signals.
