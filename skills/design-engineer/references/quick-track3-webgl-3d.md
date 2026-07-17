# Track 3: The 3D Engine & Matrix Math

Treat the screen as a GPU-accelerated coordinate space. This skill covers the math, the shader craft, the scene architecture, and the asset pipeline.

## 1. Linear Algebra for Graphics — the working set

- **Vectors:** position, direction, velocity. Normalize (`v/|v|`) any vector used as a direction. Length via `sqrt(dot(v,v))` — compare squared lengths when possible to skip the sqrt.
- **Dot product** `a·b = |a||b|cosθ` — the workhorse:
  - Lighting: `diffuse = max(dot(normal, lightDir), 0.0)` (Lambert)
  - Facing checks: `dot(viewDir, normal) < 0` → back-face
  - Fresnel rim: `pow(1.0 - dot(viewDir, normal), 3.0)` — the glow edge on every premium 3D site
  - Projection of a onto b: `(dot(a,b)/dot(b,b)) * b`
- **Cross product** `a×b` — perpendicular vector: compute face normals (`normalize(cross(edge1, edge2))`), camera right vectors, winding/orientation tests.
- **Matrices:** 4×4 for 3D transforms (the 4th row/column carries translation via homogeneous coordinates). The pipeline every vertex travels:
  `clipPos = projectionMatrix × viewMatrix × modelMatrix × vec4(position, 1.0)`
  - **Order matters:** matrices apply right-to-left. Scale → rotate → translate is the conventional composition (`T·R·S`).
  - **Normals** transform by the inverse-transpose of the model matrix (Three.js `normalMatrix`) — using the model matrix directly breaks lighting under non-uniform scale.
  - Rotations: know Euler (gimbal-locked, fine for simple cases) vs. quaternions (`slerp` for smooth camera/orientation interpolation — always quaternions for animated rotation between orientations).

## 2. GLSL Shader Writing

**Vertex shaders** move vertices (waves, warps, per-vertex displacement); **fragment shaders** color pixels. Uniform data flows in per-frame (`uTime`, `uMouse`, `uResolution`); varyings interpolate vertex→fragment.

Core fragment-shader idioms:
```glsl
vec2 uv = gl_FragCoord.xy / uResolution.xy;      // 0..1 space
uv = uv * 2.0 - 1.0;                              // -1..1 centered
uv.x *= uResolution.x / uResolution.y;            // aspect-correct
```
- Build everything from `mix`, `smoothstep`, `step`, `clamp`, `fract`, `mod`, `length`, `dot`. `smoothstep(edge-fw, edge+fw, d)` with `fwidth(d)` gives resolution-independent anti-aliased edges.
- **Mobile:** declare `precision highp float;` deliberately (mediump artifacts on distance fields), minimize texture fetches, avoid branching in hot paths (`mix`/`step` instead of `if`).

### SDFs (Signed Distance Fields)
Shapes as math — distance from any point to the surface, negative inside:
```glsl
float sdCircle(vec2 p, float r)            { return length(p) - r; }
float sdBox(vec2 p, vec2 b)                { vec2 d = abs(p)-b; return length(max(d,0.)) + min(max(d.x,d.y),0.); }
float sdRoundBox(vec2 p, vec2 b, float r)  { return sdBox(p,b) - r; }
```
Operations that make SDFs magical: union `min(a,b)`, intersect `max(a,b)`, subtract `max(a,-b)`, and **smooth union** for liquid/metaball blending:
```glsl
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
  return mix(b, a, h) - k*h*(1.0-h);
}
```
Render: `color = mix(shapeColor, bg, smoothstep(0.0, fwidth(d), d));`. This is how "liquid blob follows the cursor" effects are actually built — two SDF circles smooth-unioned, one tracking `uMouse` with a physics lag.

### Raymarching
Render 3D inside one fragment shader by marching rays through an SDF scene:
```glsl
float march(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 100; i++) {
    float d = sceneSDF(ro + rd * t);
    if (d < 0.001) return t;       // hit
    t += d;                         // safe step = distance to nearest surface
    if (t > 100.0) break;           // miss
  }
  return -1.0;
}
```
Normals via SDF gradient (central differences with small epsilon), lighting via the dot-product formulas above, soft shadows by marching toward the light and tracking the minimum `d/t` ratio. Budget: raymarching is expensive — cap iterations, render at reduced resolution and upscale on weak GPUs.

### Noise Math
- **Value/Perlin/Simplex noise:** smooth pseudo-random fields. Simplex is cheaper at higher dimensions and has fewer directional artifacts.
- **fBm (fractal Brownian motion)** — the texture of nature: sum 4–6 octaves, each doubling frequency and halving amplitude. Fire, smoke, terrain, organic UI warp all start here.
- **Domain warping** — feed noise into noise's coordinates: `fbm(p + fbm(p + uTime*0.1))` → liquid, marble, aurora effects.
- **Worley (cellular) noise:** distance to scattered feature points → cells, water caustics, biological textures.
- Animate by sampling a 3D noise field with time as the third axis (`noise(vec3(uv*scale, uTime*speed))`) — never by scrolling 2D noise, which reads as sliding wallpaper.

## 3. Three.js / React Three Fiber Architecture

- **Scene graph discipline:** group logically (`<group>` per feature), transform groups not meshes when moving compound objects. Name objects for debugging.
- **Camera:** perspective FOV 35–50° for product-shot calm, 60–75° for immersive drama. Use `damping`-enabled controls or drive the camera through a spring toward a target (see `de-ui-physics`) — raw instantaneous camera moves read as cheap.
- **Lighting recipe for premium look:** one key directional light + large soft area/environment light (HDRI via `Environment` in drei) + rim light opposite the key. Enable physically correct tone mapping (`ACESFilmicToneMapping`) and set renderer output color space to sRGB — wrong color management is the #1 reason web 3D looks like a tech demo.
- **Materials:** `MeshStandardMaterial`/`MeshPhysicalMaterial` with an environment map beats any hand-tuned Phong. Custom looks: extend materials via `onBeforeCompile` or use `ShaderMaterial`/drei's `shaderMaterial` with uniforms typed and updated in `useFrame`.
- **R3F rules:** mutate in `useFrame` (`ref.current.position.x = …`) — never `setState` per frame; reuse `Vector3`/`Quaternion` instances outside the loop (no allocations in the render loop); `useMemo` geometries/materials; `<Suspense>` around async assets; and dispose on unmount (R3F handles most, but manual `dispose()` for dynamically created resources).
- **Instancing:** >100 copies of a mesh → `InstancedMesh` (one draw call). Particles in the thousands → instanced planes or `Points` with a custom shader.
- **Draw-call budget:** aim <100 draw calls for a scroll-driven marketing scene; merge static geometry.

## 4. 3D Asset Pipeline & Blender

- **Model low-poly, let materials do the work:** silhouettes need polygons; surfaces need normal maps. Target <50k triangles total for a hero scene.
- **Bake expensive lighting:** ambient occlusion and static lighting baked into textures in Blender (Cycles bake) → cheap runtime, expensive look.
- **Export GLTF/GLB** (GLB = single binary file, preferred). Apply transforms before export (Ctrl+A), +Y up, check normals.
- **Compression — the difference between 20MB and 500kb:**
  - Geometry: **Draco** or **Meshopt** compression (via `gltf-transform` or `gltfpack`) — 5–10× smaller meshes.
  - Textures: **KTX2/Basis Universal** (GPU-native compressed textures — stay compressed in VRAM, unlike JPEG/PNG which decompress to full size) via `gltf-transform etc1s|uastc`. Resize textures to what's actually visible: 1024px is usually plenty, 2048 max for hero close-ups.
  - Command-line one-liner: `gltf-transform optimize input.glb output.glb --compress draco --texture-compress ktx2`
- **Budget: total 3D payload under 500kb** for anything above the fold. Load with `useGLTF` + drei's `Preload`, show a designed loading state (see `de-performance-budget`).

## Effect Recipe Index (what to reach for)

| Desired effect | Technique |
|---|---|
| Liquid blob cursor follower | 2D SDF circles + smin + spring-lagged uMouse |
| Fabric/flag/water surface | vertex shader displacement with simplex noise |
| Hover image distortion | fragment shader UV displacement by noise/texture, mix on hover progress |
| Aurora / smoke background | fBm + domain warping, 2–3 color mix by noise value |
| Glowing edges on 3D object | Fresnel term added to emissive |
| Thousands of particles | InstancedMesh / Points + curl noise velocity field |
| Photoreal product spin | GLB + HDRI environment + ACES tone mapping, no custom shaders needed |
