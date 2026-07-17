# Post-Processing & Screen-Space Effects

## The core mechanism: render-to-texture, then process the texture

Every post-processing effect follows the same two-stage structure:

1. **Render the scene to an off-screen target** (a `WebGLRenderTarget` in Three.js, an FBO in raw WebGL) instead of directly to the screen — this produces a texture containing the fully-rendered frame (and optionally auxiliary buffers: depth, normals, velocity).
2. **Render a full-screen quad** with a fragment shader that samples that texture (and any auxiliary buffers) and computes a new color per pixel — this is where the "filter" logic lives. The quad's vertex shader is trivial (it just needs to cover the screen); all the creative work is in the fragment shader.

Three.js's `EffectComposer` (from `three/examples/jsm/postprocessing/`) manages the chain of render targets for you:

```js
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));      // stage 1: render scene to texture
composer.addPass(new ShaderPass(chromaticAberrationShader)); // stage 2+: process it
composer.addPass(new ShaderPass(vignetteShader));

function animate() {
  composer.render(); // replaces renderer.render(scene, camera)
}
```
Each `ShaderPass` is one full-resolution texture read + write — this is the direct cost driver discussed in the "what to avoid" section of the core SKILL.md: N passes ≈ N full-frame texture round trips, which is why stacking many independent passes is the most common cause of post-processing-heavy sites janking on mobile GPUs (mobile is bandwidth-bound on texture reads/writes far more than desktop).

## Chromatic aberration

Real lens chromatic aberration comes from a lens focusing different wavelengths of light at slightly different points. Simulated by sampling the R, G, B channels of the scene texture at slightly different, radially-offset UV coordinates:

```glsl
uniform sampler2D tDiffuse;
uniform float uStrength;
varying vec2 vUv;

void main() {
  vec2 center = vec2(0.5);
  vec2 dir = vUv - center;
  float dist = length(dir);

  vec2 offset = dir * dist * uStrength; // stronger toward frame edges — matches real lens behavior
  float r = texture2D(tDiffuse, vUv - offset).r;
  float g = texture2D(tDiffuse, vUv).g;
  float b = texture2D(tDiffuse, vUv + offset).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}
```
Scaling the offset by `dist` (distance from center) rather than using a constant offset is what makes the effect read as an optical lens property rather than a flat color-fringing filter — real aberration is negligible at the optical center and increases toward the edges.

## Bloom (the two-pass technique used everywhere from Unreal Engine to Shadertoy)

Bloom simulates light bleeding beyond the boundaries of bright objects, as real camera lenses and the human eye both do at high luminance. The standard technique is:

1. **Threshold/extract**: render a copy of the scene keeping only pixels above a luminance threshold (everything else black).
2. **Blur that extracted image** — critically, with a *separable* Gaussian blur (one horizontal pass, one vertical pass) rather than a full 2D kernel, because a 2D Gaussian blur is mathematically separable into two 1D passes, reducing cost from O(n²) samples per pixel to O(2n).
3. **Additively composite** the blurred bright-pass back onto the original scene.

```glsl
// Pass 1: extract
float luminance(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); } // Rec. 709 luma weights
void main() {
  vec3 color = texture2D(tDiffuse, vUv).rgb;
  float lum = luminance(color);
  gl_FragColor = vec4(color * smoothstep(uThreshold, uThreshold + 0.1, lum), 1.0);
}

// Pass 2/3: separable 1D Gaussian blur (run once horizontal, once vertical)
uniform vec2 uDirection; // (1,0) then (0,1)
void main() {
  vec4 sum = vec4(0.0);
  float weights[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216); // Gaussian coefficients
  sum += texture2D(tDiffuse, vUv) * weights[0];
  for (int i = 1; i < 5; i++) {
    vec2 offset = uDirection * float(i) * uTexelSize;
    sum += texture2D(tDiffuse, vUv + offset) * weights[i];
    sum += texture2D(tDiffuse, vUv - offset) * weights[i];
  }
  gl_FragColor = sum;
}

// Final composite: additive blend
gl_FragColor = sceneColor + bloomColor * uIntensity;
```
The luminance weights `(0.2126, 0.7152, 0.0722)` are the standard Rec. 709/sRGB coefficients for perceived brightness (green contributes far more to perceived luminance than blue) — using equal `(0.333, 0.333, 0.333)` weights instead is a common subtle bug that makes blue-bright scenes bloom too little and green-bright scenes bloom too much.

## Depth of field (circle of confusion from the depth buffer)

DoF blurs pixels based on their distance from a focal plane, using the scene's depth buffer as the distance source:

```glsl
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform float uFocusDistance;
uniform float uFocusRange;
uniform float uMaxBlur;

float linearizeDepth(float d, float near, float far) {
  float z = d * 2.0 - 1.0; // NDC depth is 0..1, convert to -1..1
  return (2.0 * near * far) / (far + near - z * (far - near));
}

void main() {
  float depth = linearizeDepth(texture2D(tDepth, vUv).r, uNear, uFar);
  float coc = clamp(abs(depth - uFocusDistance) / uFocusRange, 0.0, 1.0) * uMaxBlur; // circle-of-confusion size

  vec4 color = vec4(0.0);
  float total = 0.0;
  for (float x = -4.0; x <= 4.0; x += 1.0) {
    for (float y = -4.0; y <= 4.0; y += 1.0) {
      vec2 offset = vec2(x, y) * coc * uTexelSize;
      color += texture2D(tDiffuse, vUv + offset);
      total += 1.0;
    }
  }
  gl_FragColor = color / total;
}
```
"Circle of confusion" (CoC) is the actual optics term: the size of the blur disc a point of light produces on the sensor/film when out of focus. Encoding it as `|depth - focusDistance|` scaled by a range and clamped is the standard cheap approximation used in real-time engines (true lens CoC is a function of aperture/focal length too, but this depth-driven approximation is what reads correctly to an audience without needing physically-based camera parameters).

## CRT / retro monitor distortion

Combines a **barrel distortion** UV warp (simulating a curved CRT screen) with **scanlines** (simulating visible horizontal raster lines):

```glsl
vec2 barrelDistort(vec2 uv, float strength) {
  vec2 cc = uv - 0.5;
  float dist = dot(cc, cc) * strength;
  return uv + cc * dist; // pushes UV outward quadratically with distance from center
}

void main() {
  vec2 uv = barrelDistort(vUv, uDistortStrength);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // outside warped bounds = black border
    return;
  }
  vec3 color = texture2D(tDiffuse, uv).rgb;

  float scanline = sin(uv.y * uResolution.y * 3.14159) * 0.08;
  color -= scanline;

  gl_FragColor = vec4(color, 1.0);
}
```
The barrel-distortion formula pushes each UV coordinate outward proportional to the *square* of its distance from center — a quadratic falloff is what produces the convex, bulging appearance of a physical curved screen (a linear falloff instead just scales the image, no curvature).

## Motion blur (velocity-buffer driven, the technique used in every modern game engine)

Naive frame-blending motion blur (averaging the current and previous rendered frames) produces ghosting rather than directional blur. The correct technique renders a **velocity buffer** (per-pixel screen-space motion vector, computed from current and previous frame's clip-space position of each vertex) and samples the scene texture along that vector:

```glsl
uniform sampler2D tDiffuse;
uniform sampler2D tVelocity; // RG channels = per-pixel screen-space velocity
uniform int uSamples;

void main() {
  vec2 velocity = texture2D(tVelocity, vUv).rg;
  vec4 color = texture2D(tDiffuse, vUv);
  for (int i = 1; i < uSamples; i++) {
    vec2 offset = velocity * (float(i) / float(uSamples - 1) - 0.5);
    color += texture2D(tDiffuse, vUv + offset);
  }
  gl_FragColor = color / float(uSamples);
}
```
This is meaningfully more expensive to set up (requires rendering a velocity pass) than the other effects here, which is why simpler creative-coding demos often fake motion blur with a cheap frame-accumulation trick (blend current frame over previous frame's buffer at low opacity) instead — visually softer/less correct, but a single extra blend rather than a full velocity-buffer pipeline.

## Combining passes without tanking performance

- **Merge effects into fewer shaders where the math allows it.** Chromatic aberration + vignette + film grain are all cheap, order-independent per-pixel operations — write them as one combined `ShaderPass` rather than three, since the expensive part is the texture read/write round-trip, not the arithmetic.
- **Run expensive passes (bloom's blur, DoF) at reduced resolution** (render the bright-pass/blur chain at half or quarter resolution, then upscale on final composite) — visually near-identical for blur-heavy effects since blurring inherently discards high-frequency detail, at a fraction of the bandwidth cost.
- **Budget passes against target hardware, not desktop dev machine.** A pass chain that runs at 60fps on a desktop GPU during development is a common source of "why is this janky on the client's phone" — profile on actual mobile mid-tier hardware, not just the dev machine (see the design-engineer skill's de7-webgl-fallbacks and de7-profiling reference files for device-tiered degradation strategy).
