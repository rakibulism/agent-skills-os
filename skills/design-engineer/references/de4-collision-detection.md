# Collision Detection Algorithms

Mathematical intersection tests for elements with real presence.

## AABB (Axis-Aligned Bounding Box) — first test for everything

```js
const hit = a.x < b.x + b.w && a.x + a.w > b.x &&
            a.y < b.y + b.h && a.y + a.h > b.y;
```
Often the only test needed. Containment (a inside b): all four edges inside.

## Bounding Circles / Spheres

```js
const dx = b.x - a.x, dy = b.y - a.y;
const hit = dx*dx + dy*dy < (a.r + b.r) ** 2;   // squared — skip the sqrt
```
**Resolution:** push apart along the center line by the overlap:
```js
const dist = Math.hypot(dx, dy), overlap = a.r + b.r - dist;
const nx = dx / dist, ny = dy / dist;           // collision normal
a.x -= nx * overlap / 2;  b.x += nx * overlap / 2;  // (same for y)
```
**Dynamic response:** exchange the velocity components *along the normal* (project velocities onto the normal with dot products — de3-linear-algebra — swap those components for equal masses, keep tangential components).

## SAT — rotated rectangles & convex polygons

Separating Axis Theorem: project both shapes onto each candidate axis (each shape's face normals). **Any axis with a gap → no collision.** No gaps → colliding; the axis with **minimum overlap** gives the MTV (minimum translation vector) for resolution. Rotated cards, angled UI shards, convex polygons — this is the tool. Concave shapes: decompose into convex parts first.

## Broad-Phase: spatial hash grid

Pairwise testing is O(n²) — fine to ~50 objects, deadly at 500. Hash objects into grid cells (cell size ≈ largest object diameter); only test pairs sharing a cell or neighbors → ~O(n). Rebuild the hash each frame (cheap with preallocated arrays — de5-lowlevel-js).

## Force Fields (soft "collision")

Cursor-avoiding / magnetic elements don't need contact tests — use repulsion forces:
```js
const f = clamp(strength / (distSq), 0, fMax);   // ∝ 1/dist², clamped near zero-dist
vx -= nx * f * dt;  vy -= ny * f * dt;
```
Treat the cursor as a circle collider with a field. Magnetic *attraction* buttons: same formula, sign flipped, plus a spring to home position.

## UI Applications
Physics-piled tag clouds (circles + gravity + floor AABB) · draggable cards that shove siblings (AABB + separation) · cursor-repelled decorations (force field) · confetti containment (AABB walls, restitution < 1).

## Debug Heuristics
Fast objects pass through walls → tunneling: substep (de4-euler-integration) or swept tests. Pile jitters forever → add velocity damping + sleep threshold. Slow at scale → missing broad-phase.
