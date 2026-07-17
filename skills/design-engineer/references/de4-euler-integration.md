# Euler Integration

Every physics-driven animation is this heartbeat:

```js
velocity += acceleration * dt;   // then...
position += velocity * dt;
```

This ordering (velocity first) is **semi-implicit Euler** — markedly more stable than naive Euler (position first). Always use it.

## dt Discipline — where all the bugs live

```js
let last = performance.now();
function frame(now) {
  let dt = (now - last) / 1000;   // seconds
  dt = Math.min(dt, 1 / 30);      // CLAMP: tab-switch pause must not teleport elements
  last = now;
  step(dt);
  requestAnimationFrame(frame);
}
```
- **Compute real dt** from RAF timestamps; never hardcode `+= 0.016` or `+= 0.1`.
- **Clamp dt** (≤1/30s): after a background-tab pause, `now - last` can be seconds — unclamped, springs explode and objects tunnel through colliders.
- **Frame-rate independence test:** motion must look identical at 60Hz and 120Hz displays. If speed differs, a hardcoded per-frame increment is hiding somewhere.

## Stability: fixed-timestep substeps
High stiffness springs or fast-moving sims can diverge at large dt. Run N substeps:
```js
const N = 4, h = dt / N;
for (let i = 0; i < N; i++) substep(h);
```
Substep when: spring stiffness > ~500, collisions at high velocity (tunneling), or any "it explodes sometimes" report.

## The Cheap Cousin — exponential smoothing
For cursor followers / soft camera lag, full physics is overkill:
```js
// WRONG (framerate-dependent): pos += (target - pos) * 0.1;
pos += (target - pos) * (1 - Math.exp(-rate * dt));   // rate ≈ 5–15
```
The exp form is the mathematically correct framerate-independent lerp.

## Forces Plug In Here
Gravity: `a = g`. Drag: `a -= k * v`. Springs: de4-spring-damper. Everything sums into `acceleration` before integrating. Zero allocations inside the loop (de5-lowlevel-js).

## Debug Heuristics
Explodes → dt unclamped or stiffness too high for step (substep it). Different speed per monitor → hardcoded increment. Jitters at rest → add settle threshold and snap. Teleports after tab switch → clamp missing.
