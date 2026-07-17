# Vertex Shader Displacement & Noise Fields

## What vertex displacement is

The vertex shader runs once per mesh vertex and must set `gl_Position`; anything you add to the vertex's local position *before* the model/view/projection transforms is a displacement. Because it runs on the GPU per-vertex, a mesh with tens of thousands of vertices can be displaced by a nontrivial function every frame at negligible cost — this is the mechanism behind procedural waves, terrain, cloth, and "dissolving" effects.

```glsl
uniform float uTime;
varying vec3 vNormal; // pass to fragment shader for lighting after displacement

void main() {
  vec3 pos = position; // object-space vertex position (built-in attribute)
  float displacement = noiseFunction(pos.xz * uFrequency + uTime * uSpeed) * uAmplitude;
  pos += normal * displacement; // push outward along the vertex's own normal
  vNormal = normal; // note: true normals need recomputation post-displacement, see below
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

## Noise algorithms — what each one is actually for

**Perlin noise** (Ken Perlin, 1985 — won a Technical Achievement Academy Award for its impact on CGI): gradient noise built by assigning a pseudo-random gradient vector to each cell corner of a grid, then interpolating dot products of those gradients with the offset to the query point. Produces smooth, organic-looking variation with no visible grid artifacts if implemented correctly. Classic Perlin noise has a known weakness: directional artifacts along the grid axes at high frequency, and O(2ⁿ) cost in n dimensions.

**Simplex noise** (Ken Perlin, 2001 — his improvement on Perlin noise specifically to fix the above): uses a simplex (triangle in 2D, tetrahedron in 3D) grid instead of a square/cube grid, reducing the corner count evaluated per sample from 2ⁿ to n+1, and eliminating the axis-aligned artifacts. This is the noise function used in essentially all professional shader work today; "Perlin noise" is often used informally to mean simplex when discussing shader code.

**Worley noise** (a.k.a. cellular/Voronoi noise, Steven Worley, 1996): computes, for each point, the distance to the nearest of a set of randomly-scattered feature points. Produces cell-like, organic-but-angular patterns (looks like biological cells, cracked mud, or reptile scales) rather than smooth Perlin/simplex blobbiness — the two noise families are visually distinct tools, not interchangeable.

**fBm (fractal Brownian motion)**: not a distinct noise algorithm but a *technique* — summing multiple octaves of any of the above noise functions at increasing frequency and decreasing amplitude:

```glsl
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;   // "lacunarity" — how much detail increases per octave
    amplitude *= 0.5;   // "gain/persistence" — how much each octave contributes
  }
  return value;
}
```
This is what turns "smooth blobby noise" into "believable natural detail" (clouds, terrain, marble) — a single noise octave looks synthetic; 4–6 summed octaves at halving amplitude looks natural because it mimics the actual statistical self-similarity of real terrain/cloud formation.

**Domain warping**: feed noise's own output back in as an offset to its input coordinate before sampling again — `snoise(p + fbm(p))`. This is what produces the marbled, swirling look distinct from plain fBm's "bumpy" look, and is a favorite technique of Inigo Quilez's for organic textures.

## Canonical Simplex noise GLSL (Ashima Arts implementation — the field-standard reference)

This is the widely-used, correctness-verified implementation (`webgl-noise`, Ashima Arts / Stefan Gustavson) that essentially every production shader pulls in rather than reimplementing from scratch:

```glsl
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857; // 1/7
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
```
Copy this verbatim rather than approximating — small errors in the permutation/gradient tables reproduce as visible seams at simplex-cell boundaries that are difficult to spot in isolation but obvious once the mesh moves.

## Gerstner waves — the actual ocean-simulation formula

Simple `sin(x)` displacement produces waves that look wrong to the eye because real ocean waves are not vertical sine waves — water at the wave crest also moves *horizontally* forward, giving the characteristic sharp, peaked crest and broad, shallow trough (a trochoid, not a sinusoid). Gerstner's formula (Franz Josef von Gerstner, 1802; the standard technique in production ocean shaders including Crest, Unity's/Unreal's ocean systems) displaces horizontally as well as vertically:

```glsl
vec3 gerstnerWave(vec2 p, vec2 direction, float steepness, float wavelength, float time) {
  float k = 6.28318 / wavelength;          // wavenumber
  float c = sqrt(9.8 / k);                 // wave speed from gravity (deep-water dispersion relation)
  vec2 d = normalize(direction);
  float f = k * (dot(d, p) - c * time);
  float a = steepness / k;                 // amplitude, capped by steepness to avoid self-intersecting loops

  return vec3(
    d.x * a * cos(f),   // horizontal displacement along wave direction
    a * sin(f),          // vertical displacement
    d.y * a * cos(f)
  );
}
```
Real ocean shaders sum 4–8 Gerstner waves at different directions, wavelengths, and steepness values (the same fBm-style octave-summing principle as noise, applied to waves specifically) to avoid the visibly repeating, too-regular look a single wave produces.

## Recomputing normals after displacement

Displacing vertices invalidates the mesh's original normals — lighting computed against stale normals looks flat/wrong on a now-bumpy surface. Two standard approaches:

1. **Analytic derivative** (cheap, exact when available): if the displacement function is simple enough to differentiate by hand (a single Gerstner wave, a single sine), compute the tangent and bitangent directly and cross them.
2. **Finite-difference resample** (general-purpose, works for any displacement including noise/fBm): displace three nearby points (the vertex plus small offsets in two tangent directions), then cross the resulting edge vectors — the same central-difference technique used for SDF normals in [raymarching-sdf.md](raymarching-sdf.md), applied here to a mesh instead of an implicit surface.

```glsl
vec3 pos = displace(position);
vec3 posDX = displace(position + vec3(epsilon, 0.0, 0.0));
vec3 posDZ = displace(position + vec3(0.0, 0.0, epsilon));
vec3 recomputedNormal = normalize(cross(posDZ - pos, posDX - pos));
```

## Visual styles this unlocks

- **Ocean waves**: summed Gerstner waves, as above.
- **Waving flag**: a sine wave with amplitude that increases with distance from a fixed edge (`amplitude * smoothstep(0.0, 1.0, uv.x)`, so the flag pole side stays anchored) plus a secondary higher-frequency noise term for wind turbulence.
- **Glitching holographic figures**: displace along a *single* axis by a large, infrequent step function (`step(0.98, snoise(vec3(uTime * 5.0)))`) rather than smooth continuous noise — glitch reads as discontinuous, not organic, so a threshold/step function is the correct tool, not fBm.
- **Terrain forming/dissolving**: fBm noise displacement with amplitude driven by a `uProgress` uniform animated 0→1 (forming) or 1→0 (dissolving), often combined with a fragment-shader discard/alpha-fade past a noise threshold so the mesh visually crumbles rather than just flattening.
