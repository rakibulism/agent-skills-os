# GLSL Shaders: SDFs, Raymarching & Noise

Vertex shaders move vertices (waves, warps, displacement); fragment shaders color pixels. Uniforms flow in per frame (`uTime`, `uMouse`, `uResolution`); varyings interpolate vertex→fragment.

## Fragment Setup Idioms

```glsl
vec2 uv = gl_FragCoord.xy / uResolution.xy;   // 0..1
uv = uv * 2.0 - 1.0;                           // centered -1..1
uv.x *= uResolution.x / uResolution.y;         // aspect-correct
```
Build everything from `mix, smoothstep, step, clamp, fract, mod, length, dot`. Resolution-independent anti-aliased edges: `smoothstep(0.0, fwidth(d), d)`.
**Mobile:** `precision highp float;` (mediump artifacts distance fields), minimize texture fetches, replace branches with `mix`/`step` in hot paths.

## SDFs — shapes as math

Distance from any point to a surface; negative inside.
```glsl
float sdCircle(vec2 p, float r)           { return length(p) - r; }
float sdBox(vec2 p, vec2 b)               { vec2 d = abs(p) - b; return length(max(d, 0.)) + min(max(d.x, d.y), 0.); }
float sdRoundBox(vec2 p, vec2 b, float r) { return sdBox(p, b) - r; }
```
Boolean ops: union `min(a,b)` · intersect `max(a,b)` · subtract `max(a,-b)`.
**Smooth union — the liquid/metaball formula:**
```glsl
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
```
Render: `color = mix(shapeColor, bg, smoothstep(0.0, fwidth(d), d));`
The "liquid blob follows the cursor" effect = two SDF circles smooth-unioned, one tracking a spring-lagged `uMouse` (lag via de4-spring-damper on the CPU side, passed as uniform).

## Raymarching — 3D in one fragment shader

```glsl
float march(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 100; i++) {
    float d = sceneSDF(ro + rd * t);
    if (d < 0.001) return t;   // hit
    t += d;                    // sphere-trace: step by distance to nearest surface
    if (t > 100.0) break;
  }
  return -1.0;                 // miss
}
```
- Normals = SDF gradient via central differences (epsilon ~0.001).
- Lighting = Lambert + Fresnel from de3-linear-algebra.
- Soft shadows: march toward the light, track `min(k * d / t)`.
- **Budget:** cap iterations; render at half resolution and upscale on weak GPUs (see de7-webgl-fallbacks).

## Noise Math

- **Perlin/Simplex:** smooth pseudo-random fields; Simplex is cheaper in higher dimensions, fewer axis artifacts.
- **fBm** — the texture of nature: sum 4–6 octaves, frequency ×2 and amplitude ×0.5 each octave. Fire, smoke, terrain, organic warps start here.
- **Domain warping** — noise fed into noise's coordinates: `fbm(p + fbm(p + uTime * 0.1))` → liquid, marble, aurora.
- **Worley (cellular):** distance to scattered feature points → cells, caustics, biological texture.
- **Animate through 3D noise** with time as the z-axis: `noise(vec3(uv * scale, uTime * speed))` — never scroll 2D noise (reads as sliding wallpaper).

## Effect Recipes
Hover image distortion → displace UVs by noise/texture, mix by hover progress. Aurora background → fBm + domain warp, 2–3 color mix by noise value. Glow edges → Fresnel added to emissive. Water surface → vertex displacement by simplex + normal recompute.
