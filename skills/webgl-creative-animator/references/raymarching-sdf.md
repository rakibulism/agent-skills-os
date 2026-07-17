# Volumetric Raymarching & Signed Distance Fields (SDFs)

## What an SDF actually is

A signed distance function `sdf(p) -> float` returns the shortest distance from point `p` to a surface — negative when `p` is inside the surface, zero on it, positive outside. Unlike a polygon mesh (an explicit list of vertices/faces), an SDF is an *implicit* surface: it's defined everywhere in space by a formula, which is exactly what makes SDF-authored geometry capable of shapes a mesh can't cleanly represent — perfectly smooth blends between arbitrary shapes, infinite repetition, and fractal detail at any zoom level.

## Canonical primitive SDFs (Inigo Quilez's formulas — the field-standard reference)

```glsl
float sdSphere(vec3 p, float r) { return length(p) - r; }

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdTorus(vec3 p, vec2 t) {
  // t.x = major radius, t.y = minor (tube) radius
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float sdPlane(vec3 p, vec3 n, float h) { return dot(p, n) + h; } // n must be normalized
```

## Boolean operations and the smooth-blend formula

```glsl
float opUnion(float a, float b)     { return min(a, b); }
float opIntersect(float a, float b) { return max(a, b); }
float opSubtract(float a, float b)  { return max(a, -b); }

// The "liquid metaball" operator — smooth minimum, Quilez's polynomial form:
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
```
`k` controls blend radius — small `k` (≈0.05–0.1 in a normalized scene) gives a subtle fillet; large `k` (≈0.5+) merges shapes into a single continuous blob well before they visually touch. This single function is responsible for essentially every "morphing liquid blob" effect seen in creative-coding demos: two or more SDFs (often spheres) tracking independent positions (e.g. mouse-following via a spring/damper), combined with `smin`, then raymarched.

## Domain operations (repetition, twisting, infinite structure)

```glsl
// Infinite repetition — evaluate one primitive, get infinite copies:
vec3 opRep(vec3 p, vec3 period) {
  return mod(p + 0.5 * period, period) - 0.5 * period;
}

// Twist along Y axis:
vec3 opTwist(vec3 p, float k) {
  float c = cos(k * p.y), s = sin(k * p.y);
  mat2 m = mat2(c, -s, s, c);
  return vec3(m * p.xz, p.y).xzy;
}
```
`opRep` is how "infinite fractal landscape" and repeating-column/lattice scenes are built without instancing actual geometry — the raymarcher just wraps world-space coordinates into one repeating cell before evaluating the primitive SDF, so a single sphere formula renders as an infinite 3D grid of spheres for the cost of one.

**Fractal SDFs** (Mandelbulb, Menger sponge, IFS box-folds) extend this by iterating a folding+scaling transform on `p` a fixed number of times before the final distance evaluation — each iteration multiplies apparent detail, which is why these render infinite-looking complexity from a short loop (typically 8–15 iterations is enough for a convincing fractal at typical viewing distance).

## The raymarching (sphere tracing) loop

```glsl
const int MAX_STEPS = 100;
const float MAX_DIST = 100.0;
const float SURF_DIST = 0.001;

float sceneSDF(vec3 p) {
  return sdSphere(p, 1.0); // swap in whatever combined scene SDF
}

float rayMarch(vec3 ro, vec3 rd) {
  float dO = 0.0; // distance traveled along the ray Origin
  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * dO;
    float dS = sceneSDF(p); // distance to Surface
    dO += dS;
    if (dO > MAX_DIST || dS < SURF_DIST) break;
  }
  return dO;
}
```
**Why this works (the key insight):** because `sceneSDF(p)` returns the *exact* distance to the nearest surface in *any* direction, it's always safe to step the ray forward by that amount — you're guaranteed not to step through a surface, because nothing is closer than `dS`. This is why it's called "sphere tracing": each step is the radius of the largest sphere around `p` guaranteed to be empty of geometry. Near a surface `dS` shrinks toward zero, so the loop naturally slows down and converges exactly where it should, with no explicit collision math.

**Failure modes:**
- Too few `MAX_STEPS` → the ray gives up before reaching distant/thin geometry, producing visible banding or missing detail (raise steps or use larger step multipliers on early iterations, called "over-relaxation," carefully — over-relaxing can overshoot thin features).
- `SURF_DIST` too large → visibly faceted/blocky surfaces. Too small → wasted steps for no visible gain (diminishing returns below ~0.0005 in a unit-scale scene).
- Missing `MAX_DIST` break → background rays (that never hit anything) run the full loop every frame, which is the most common cause of raymarching demos dropping frame rate on backgrounds/skies.

## Normals from the SDF gradient

The SDF's gradient at the surface *is* the surface normal (an SDF's directional derivative equals 1 by construction, so its gradient direction is the direction of steepest distance increase — i.e., straight out of the surface). Compute via central differences (real analytic derivatives of most SDF combinations are impractical to hand-derive):

```glsl
vec3 getNormal(vec3 p) {
  float e = 0.001;
  vec2 h = vec2(e, 0.0);
  return normalize(vec3(
    sceneSDF(p + h.xyy) - sceneSDF(p - h.xyy),
    sceneSDF(p + h.yxy) - sceneSDF(p - h.yxy),
    sceneSDF(p + h.yyx) - sceneSDF(p - h.yyx)
  ));
}
```
This costs 6 extra SDF evaluations per shaded pixel — expensive relative to a mesh's precomputed vertex normals, and the primary reason raymarched scenes are more GPU-bound per-pixel than equivalent mesh-based scenes.

## Soft shadows and ambient occlusion, both "for free" from the same distance field

```glsl
// Soft shadow: as the ray toward the light passes close to any occluder
// (small dS relative to distance traveled), darken proportionally.
float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
  float res = 1.0;
  float t = mint;
  for (int i = 0; i < 64; i++) {
    float h = sceneSDF(ro + rd * t);
    if (h < 0.001) return 0.0;
    res = min(res, k * h / t);
    t += h;
    if (t > maxt) break;
  }
  return res;
}

// Ambient occlusion: sample the SDF at a few small steps along the normal;
// if nearby surfaces are close (small SDF values), darken.
float calcAO(vec3 p, vec3 n) {
  float occ = 0.0, sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float h = 0.01 + 0.12 * float(i) / 4.0;
    float d = sceneSDF(p + n * h);
    occ += (h - d) * sca;
    sca *= 0.95;
  }
  return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}
```
Both come essentially free because the distance field already encodes "how close is the nearest surface" everywhere — no separate shadow-map render pass or SSAO post-process needed, which is a major reason raymarched scenes can look more physically cohesive (consistent shadow/AO everywhere, no seams between techniques) than equivalent rasterized scenes stitching together multiple approximate passes.

## Visual style this unlocks

Morphing organic globs (smin-blended spheres/capsules with animated positions), infinite fractal landscapes (opRep + fractal iteration), melting liquids (smin blend factor animated over time so shapes separate/merge), and surreal geometry impossible to model conventionally (twisted/folded/repeated primitives with no clean polygon equivalent) — all from the same five building blocks: primitive SDFs, boolean/smooth-blend ops, domain repetition, the raymarch loop, and gradient-derived normals.
