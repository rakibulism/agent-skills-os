# GPU-Driven Particle Simulations (FBO / GPGPU)

## The core problem this solves

A CPU-side particle loop (`for each particle: update position, upload to GPU`) is bottlenecked by JS execution speed and the CPU→GPU upload bandwidth for updated data — practically capped around 10,000–50,000 particles before frame time degrades. GPGPU (General-Purpose computing on the GPU) moves the *update step itself* onto the GPU, so millions of particles update in parallel, once per frame, with no CPU involvement and no per-particle upload after initialization. This is the only practical route to "millions of particles at 60fps."

## The technique: state stored in textures, updated via ping-pong Frame Buffer Objects (FBOs)

The trick that makes this work: **a texture is just a 2D array of numbers**, and a fragment shader is a function that computes one output value per pixel, in parallel, automatically. So instead of storing particle position as a JS array, you store it as pixel color in a texture — particle *N*'s position lives at texel `(N % width, floor(N / width))`, encoded as RGBA where R,G,B = x,y,z and A = free (commonly used for particle "life" or a per-particle random seed).

**Ping-pong**: you cannot read and write the same texture in one draw call, so you keep two textures (A and B) per simulated quantity. Each frame: render a full-screen quad with a fragment shader that reads the *current* state texture (A) and writes the *next* state to a render target backed by texture B, then swap which one is "current" for next frame. This alternation is the "ping-pong."

```
Frame N:   read positionTextureA → compute → write positionTextureB
Frame N+1: read positionTextureB → compute → write positionTextureA
Frame N+2: read positionTextureA → compute → write positionTextureB
...
```

## Implementation with Three.js's `GPUComputationRenderer`

Three.js ships a purpose-built helper (`three/examples/jsm/misc/GPUComputationRenderer.js`) that manages the ping-pong bookkeeping for you:

```js
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

const WIDTH = 256; // WIDTH * WIDTH = total particle count (65,536 here)
const gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);

// Seed initial position/velocity data into DataTextures
const posTexture = gpuCompute.createTexture(); // a THREE.DataTexture, RGBA Float32
const velTexture = gpuCompute.createTexture();
fillPositions(posTexture.image.data);  // your init function, writes x,y,z,w per texel
fillVelocities(velTexture.image.data);

// Register each simulated quantity as a "variable" with its own update shader
const posVariable = gpuCompute.addVariable('texturePosition', positionShaderGLSL, posTexture);
const velVariable  = gpuCompute.addVariable('textureVelocity', velocityShaderGLSL, velTexture);

// Declare cross-dependencies: position update reads velocity, velocity update reads position
gpuCompute.setVariableDependencies(posVariable, [posVariable, velVariable]);
gpuCompute.setVariableDependencies(velVariable, [posVariable, velVariable]);

// Custom uniforms per variable (time, delta, mouse world position, curl scale, etc.)
velVariable.material.uniforms.uTime = { value: 0 };
velVariable.material.uniforms.uMouse3D = { value: new THREE.Vector3() };
velVariable.material.uniforms.uCurlScale = { value: 0.5 };

const error = gpuCompute.init();
if (error !== null) console.error(error);

// Per frame:
function animate(dt) {
  velVariable.material.uniforms.uTime.value += dt;
  gpuCompute.compute();
  // Feed the freshly-computed position texture into the render material:
  particleMaterial.uniforms.uPositionTexture.value =
    gpuCompute.getCurrentRenderTarget(posVariable).texture;
}
```

The velocity update shader (`velocityShaderGLSL`, a fragment shader run once per particle-texel):

```glsl
uniform float uTime;
uniform float uCurlScale;
uniform vec3 uMouse3D;

vec3 curlNoise(vec3 p); // see below

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy; // GPUComputationRenderer injects `resolution`
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;

  vec3 curl = curlNoise(pos * uCurlScale + uTime * 0.1);
  vel += curl * 0.02;

  // attraction toward cursor position in world space
  vec3 toMouse = uMouse3D - pos;
  float dist = length(toMouse);
  vel += normalize(toMouse) * smoothstep(3.0, 0.0, dist) * 0.05;

  vel *= 0.98; // damping/friction — see core-pillars.md, "friction as tunable data"
  gl_FragColor = vec4(vel, 1.0);
}
```

## Curl noise — the standard "organic swirl" velocity field

Curl noise is preferred over raw Perlin/Simplex noise for particle velocity because it is **divergence-free** — particles neither pile up nor spread to infinity, they swirl, which reads as smoke/fluid rather than random jitter. It's derived by taking the curl (a 3D generalization of "rotation") of a scalar potential field built from noise:

```glsl
// Curl of a vector potential built from 3 independent simplex-noise channels.
// Requires snoise() (see vertex-displacement-noise.md) and takes a finite-difference
// approximation of the curl operator (∇ × F) since an analytic derivative of
// simplex noise is impractical to hand-code.
vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  vec3 p_x0 = vec3(snoise(p - dx), snoise(p + vec3(100.0) - dx), snoise(p + vec3(200.0) - dx));
  vec3 p_x1 = vec3(snoise(p + dx), snoise(p + vec3(100.0) + dx), snoise(p + vec3(200.0) + dx));
  vec3 p_y0 = vec3(snoise(p - dy), snoise(p + vec3(100.0) - dy), snoise(p + vec3(200.0) - dy));
  vec3 p_y1 = vec3(snoise(p + dy), snoise(p + vec3(100.0) + dy), snoise(p + vec3(200.0) + dy));
  vec3 p_z0 = vec3(snoise(p - dz), snoise(p + vec3(100.0) - dz), snoise(p + vec3(200.0) - dz));
  vec3 p_z1 = vec3(snoise(p + dz), snoise(p + vec3(100.0) + dz), snoise(p + vec3(200.0) + dz));

  float x = (p_y1.z - p_y0.z) - (p_z1.y - p_z0.y);
  float y = (p_z1.x - p_z0.x) - (p_x1.z - p_x0.z);
  float z = (p_x1.y - p_x0.y) - (p_y1.x - p_y0.x);

  return normalize(vec3(x, y, z) / (2.0 * e));
}
```
The three `+vec3(100.0)`/`+vec3(200.0)` offsets sample three decorrelated regions of the same noise function to build three independent potential-field components cheaply, without needing three separate noise implementations.

## Rendering the simulated particles

The render-side vertex shader reads the *same* position texture the compute step just wrote, looking up by a per-vertex UV that was baked in at geometry-creation time (one UV pair per particle index):

```glsl
// Vertex shader, attached to a THREE.Points geometry whose only real per-vertex
// attribute is `reference` — a UV into the WIDTH×WIDTH simulation texture.
attribute vec2 reference;
uniform sampler2D uPositionTexture;

void main() {
  vec3 pos = texture2D(uPositionTexture, reference).xyz;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = 4.0 * (300.0 / -mvPosition.z); // perspective size falloff
  gl_Position = projectionMatrix * mvPosition;
}
```
This is why GPGPU particle systems render with `THREE.Points`/`gl.POINTS` almost universally — the geometry itself never changes (it's just an index buffer of UV lookups), all motion comes from what the position texture contains that frame.

## Visual styles this unlocks

- **Swirling cosmic dust / nebula**: curl noise velocity field, particles colored by velocity magnitude or noise value via the palette function from [core-pillars.md](core-pillars.md).
- **Realistic smoke**: curl noise + upward buoyancy force (`vel.y += buoyancy * dt`) + particle "life" decremented in the alpha channel, respawned at a source point when life hits 0.
- **Custom gravity wells / interactive sand**: replace curl noise with an explicit force `vel += normalize(wellPos - pos) * strength / (distSq + epsilon)` — the classic inverse-square attraction formula, epsilon added to avoid divide-by-zero singularities at the well center.
- **Wind reacting to cursor**: blend a constant directional force with a cursor-proximity force exactly as in the velocity shader example above — this pattern (base field + localized cursor perturbation) generalizes to nearly every "interactive particle field" seen in creative-coding portfolios.

## Failure modes

- **Precision**: particle position/velocity textures must be `FloatType` (or `HalfFloatType` if float render targets aren't supported on target hardware) — `UnsignedByteType` textures clamp to 0–255 per channel and cannot represent negative velocities or world-space positions outside a tiny range.
- **Texture size mismatch**: `WIDTH * WIDTH` must equal (or exceed, with the remainder unused) your particle count — this is why particle counts in GPGPU demos are almost always perfect squares (65536 = 256², 1048576 = 1024²) rather than round numbers like 1,000,000.
- **Forgetting to re-inject boundary/reset conditions**: without a life-based respawn or wraparound (`mod(pos, boundsSize)`), particles pushed by strong forces eventually all drift out of frame and the effect reads as "dying out" a few seconds in.
