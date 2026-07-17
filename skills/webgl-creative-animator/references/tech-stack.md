# The Technical Stack You Must Learn

## The dependency order, and why it's ordered this way

```
[ Math & Logic Foundations ] ──> [ High-Level Frameworks ] ──> [ Low-Level Power ]
 (Trig, Vectors, Matrices)         (Three.js / React Three)       (Vanilla WebGL / WebGL2)
                                                                            │
                                                                            ▼
                                                                  [ The Holy Grail ]
                                                                   (GLSL Shaders)
```

Every layer above GLSL exists purely to get uniforms, attributes, and textures into the two functions that actually execute on the GPU — the vertex shader and fragment shader. This is why the ordering matters: framework fluency (knowing Three.js's API surface) without shader fluency produces someone who can assemble scenes from existing materials but can't originate a new visual technique; shader fluency without framework fluency produces slow, reinvented scene-management code. The creative ceiling is set by GLSL comfort, not by framework API memorization.

## GLSL (OpenGL Shading Language) — non-negotiable

GLSL is a C-like language that compiles to run on the GPU, executing the **same program in parallel across every vertex or every pixel**, once per frame. Two shader stages matter for WebGL:

- **Vertex shader**: runs once per vertex, must output `gl_Position` (clip-space position). This is where mesh displacement, wave/wind simulation, and per-vertex data lookups (as in GPGPU particle rendering) happen.
- **Fragment shader**: runs once per rasterized pixel, must output `gl_FragColor` (or a named output in GLSL ES 3.0/WebGL2). This is where raymarching, procedural texturing, lighting, and post-processing all happen.

Data flows: **uniforms** (`uniform float uTime`) are constant across all vertices/pixels in a single draw call, set from JS once per frame — your bridge from application state into the shader. **Attributes** (`attribute vec3 position` in GLSL ES 1.0 / `in vec3 position` in ES 3.0) are per-vertex data pulled from geometry buffers. **Varyings** (`varying vec2 vUv` / `out vec2 vUv`) are written in the vertex shader and automatically interpolated across the triangle for the fragment shader to read — this interpolation is itself doing real work (it's why a UV coordinate or a normal is smooth across a triangle's surface rather than constant).

Because shaders execute in massive parallel (a modern GPU runs thousands of shader-core invocations simultaneously), branching (`if`) is comparatively expensive relative to CPU code — GPUs execute in SIMD groups ("warps"/"wavefronts"), and a branch that diverges within a group forces the GPU to execute *both* branches for the whole group and mask the result, rather than skipping the untaken branch. This is why shader code favors `mix()`, `step()`, and `smoothstep()` over `if`/`else` in hot paths — not stylistic preference, a real performance consequence of the execution model.

## Three.js / React Three Fiber — the industry-standard wrapper

Three.js handles the machinery that has nothing to do with your creative decision: scene graph management, camera projection matrices, standard lighting models (`MeshStandardMaterial`'s physically-based shading), geometry buffer management, and render-target/FBO bookkeeping (`WebGLRenderTarget`, `EffectComposer`). This frees creative attention for the actual shader/system design rather than re-deriving a perspective projection matrix from scratch.

**React Three Fiber (R3F)** is a React renderer for Three.js — it lets a Three.js scene graph be described declaratively as JSX, with Three.js objects created/updated/disposed automatically as React state changes, and hooks (`useFrame`, `useThree`) providing access to the render loop and renderer/camera/scene instances. R3F does not replace Three.js knowledge — it's a thinner layer requiring the same mental model (materials, geometries, the render loop), with React's component/state ergonomics on top. Custom shader materials in R3F are typically authored with `shaderMaterial` (from `@react-three/drei`) or `extend()`, passing the exact same GLSL strings you'd write for vanilla Three.js — the GLSL itself doesn't change between the two.

**When Three.js's abstractions actively help**: standard PBR-lit scenes, camera controls (orbit/fly), asset loading (GLTF/GLB models), and any project where 80% of the visual is conventional 3D rendering with one or two custom shader effects layered in.

**When Three.js's abstractions get in the way**: fully custom multi-pass render pipelines with non-standard buffer layouts, GPGPU simulations with unusual texture formats/counts beyond what `GPUComputationRenderer` assumes, or WebXR/performance-critical work where every driver call needs to be accounted for.

## Vanilla WebGL / WebGL2 — understanding the raw API

WebGL2 (based on OpenGL ES 3.0) is what Three.js itself is built on top of. Core raw-API concepts worth understanding even if you never write raw WebGL day-to-day:

```js
// The raw API shape Three.js abstracts away — creating and linking a shader program:
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// Buffers: raw vertex data uploaded to GPU memory
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// Attribute pointers: tell the GPU how to read that buffer per-vertex
const positionLoc = gl.getAttribLocation(program, 'position');
gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLoc);
```

Understanding this layer explains *why* certain Three.js operations are expensive (e.g., changing a `BufferGeometry`'s vertex count at runtime requires reallocating GPU buffers, not just updating values — mirrors `gl.bufferData` needing a fresh allocation vs. `gl.bufferSubData` for same-size updates) and unlocks custom rendering techniques Three.js's material system doesn't expose directly (multiple render targets/MRT for deferred-style G-buffers, transform feedback for GPU-side data without the FBO-as-texture indirection GPGPU particles currently require, compute-shader-adjacent techniques where WebGL2's limits are reached).

**WebGPU note**: WebGPU (the eventual successor exposing true compute shaders, unlike WebGL's fragment-shader-as-compute workaround) is arriving in browsers but is not yet a required substitute for WebGL2 skill — the GLSL/shader mental model transfers directly (WebGPU uses WGSL, syntactically different but conceptually the same vertex/fragment/now-also-compute model), and WebGL2 remains the safer choice for broad browser/device compatibility as of any current production project.

## What to actually spend time on, in order

1. **Trig/vectors/matrices** until dot/cross products and matrix transforms are visually intuitive, not just computable (see [core-pillars.md](core-pillars.md)).
2. **GLSL fundamentals** — write fragment shaders that don't touch any 3D geometry at all (pure 2D `uv`-based effects) until `mix`/`step`/`smoothstep`/`length`/noise functions feel like a natural vocabulary.
3. **Three.js/R3F** scene setup, standard materials, and the `EffectComposer` pipeline — enough to get a scene on screen and a custom shader material into it.
4. **The five technique families** (raymarching, GPGPU particles, vertex displacement, post-processing, fluid dynamics) — each as its own reference in this skill.
5. **Vanilla WebGL2**, only once a specific limitation of the framework layer is actually blocking a specific effect — learning it in the abstract, disconnected from a real blocking need, doesn't stick as well as learning it to solve a concrete problem.
