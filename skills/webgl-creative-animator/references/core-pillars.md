# Core Pillars of Creative Thinking in WebGL

## 1. Think in systems, not keyframes

A CSS/GSAP animator authors a timeline: at t=0 the element is here, at t=1s it's there, an easing curve interpolates between. This model has a hard ceiling — it describes a *finite, pre-known* set of states.

A WebGL system instead defines a **rule that generates state**, evaluated continuously:

```glsl
// Not "move from A to B over 2 seconds" — a rule re-evaluated every frame:
vec3 displaced = position + normal * sin(position.x * uFrequency + uTime * uSpeed) * uAmplitude;
```

The visible motion (a rippling surface) was never authored as a sequence of keyframes — it *emerges* from the interaction of `position`, `time`, and a trig function, every one of the mesh's thousands of vertices, every frame. This is why WebGL scales to complexity that keyframing cannot: you're not authoring N states, you're authoring one rule that produces infinite states.

**Practical implication for creative work:** when designing a new effect, do not ask "what does frame 30 look like, and frame 60?" Ask "what is the local rule — the function of position/time/neighbor-state — that, applied everywhere at once, produces this global behavior?" Reaction-diffusion patterns, flocking (boids), fluid turbulence, and fractal growth are all famous for producing enormously complex, lifelike global behavior from a handful of simple per-point rules (Conway's Game of Life is the canonical minimal example: one rule, applied uniformly, produces gliders, oscillators, and Turing-complete computation).

## 2. Master vector mathematics — visually, not just algebraically

You need working *visual* intuition (not just the ability to compute) for:

- **Dot product** `a·b = |a||b|cos(θ)`: measures alignment. Normalized-vector dot product is directly "how much does A face B" — this is the entire basis of Lambertian diffuse lighting (`diffuse = max(dot(normal, lightDir), 0.0)`), backface culling, and field-of-view checks. Visual intuition: dot product of two unit vectors is +1 when parallel-same-direction, 0 when perpendicular, −1 when opposite.
- **Cross product** `a×b`: produces a vector perpendicular to both, magnitude = area of the parallelogram they span. This is how surface normals are derived from two edge vectors of a triangle (`normal = normalize(cross(edge1, edge2))`), and it's the backbone of curl noise (see [gpgpu-particles.md](gpgpu-particles.md)) — curl is literally the cross product of the gradient operator with a vector field.
- **Matrices as space-transformers, not grids of numbers**: a 4×4 matrix in WebGL encodes a combined rotate/scale/translate/project operation. Visual intuition: multiplying a point by a model matrix moves it from *object space* to *world space*; by a view matrix, from world space into *camera space* (as if the camera were at the origin looking down −Z); by a projection matrix, from camera space into *clip space* (where perspective divide produces foreshortening). Every visual "the camera is looking at X" bug is a matrix-order or space-mismatch bug.
- **Trigonometry as periodic motion generators**: `sin`/`cos` are not "math class" — they are your primary tool for anything cyclic (waves, rotation, breathing/pulsing scale, orbit). Phase-shifting and summing multiple sine waves at different frequencies/amplitudes (a truncated Fourier series) is literally how procedural ocean waves are built (see Gerstner waves in [vertex-displacement-noise.md](vertex-displacement-noise.md)).

Train this by *predicting* the output of a small GLSL snippet before running it (does `sin(uv.x * 20.0 + uTime)` produce vertical or horizontal stripes? Which direction do they scroll as `uTime` increases?), then checking against Shadertoy.

## 3. See the world as data

Photorealistic and surreal rendering both start from the same move: stop thinking of "light," "depth," "velocity," "friction" as fixed physical facts and start treating them as **variables you can read, write, and distort**.

- **Depth as data**: a depth buffer is just a texture where each texel is a scene-depth value. Once you can *read* it, you can drive anything from it — depth-of-field blur radius, fog density, outline detection (edges = large depth deltas between neighboring texels), or fake soft-shadows.
- **Velocity as data**: store a velocity buffer (per-pixel or per-particle) and you unlock motion blur (smear along the velocity vector), trail effects, and physically-plausible-looking secondary motion (anything lagging a "leader" value with its own velocity/acceleration state — see the spring/damper and momentum/inertia math this skill assumes from the design-engineer skill's de4-spring-damper and de4-momentum-inertia reference files).
- **Friction/turbulence as tunable scalars**: in a particle or fluid system these are just multipliers in the update equation (`velocity *= (1.0 - friction * dt)`). Because they're just numbers, you can push them past physically "correct" values for a surreal look — negative friction (self-accelerating), depth-dependent friction (things slow down as they approach camera), or friction that's itself driven by a noise field (patchy, turbulent drag).

**The generative move**: once light, depth, velocity, and friction are all just textures/uniforms you can manipulate, the question "what would it look like if gravity pointed toward the cursor instead of down" or "what if friction were negative near edges" becomes a one-line code change, not a re-architecture. This is where the genuinely surreal, never-seen-before effects come from — perturbing one variable that's normally treated as a fixed constant.

## 4. Bridge art and code

Classical painting technique and shader code are closer than they look, because both are, ultimately, procedures for producing light-and-color values from a scene description.

- **Chiaroscuro (dramatic light/dark contrast, Caravaggio/Rembrandt)** → in code, this is deliberately narrow, high-contrast lighting: a single dominant `pointLight` with a tight falloff exponent, near-black ambient, rim-light only from the light-facing edge (`fresnel = pow(1.0 - dot(normal, viewDir), power)` sparingly added, not as the dominant term — chiaroscuro is defined by what stays dark).
- **Color theory (complementary/split-complementary/analogous palettes, controlled saturation)** → encode palettes as a small set of anchor colors and `mix()`/`smoothstep()` between them driven by an underlying scalar field (height, noise value, distance-from-center) rather than assigning arbitrary per-object colors. Inigo Quilez's cosine-based palette function is the standard generative-art technique for this:
  ```glsl
  vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
  }
  ```
  `a` = base color, `b` = amplitude/contrast, `c` = frequency (how many times the palette cycles), `d` = phase (shifts the whole palette). Four vec3 constants control an entire, harmonically-related color scheme — the same tool professional colorists use to keep a palette cohesive while varying it across a piece.
- **Composition (rule of thirds, leading lines, negative space)** applies unchanged to camera placement and UV-space layout in a generative piece — a raymarched scene with the "subject" SDF centered at the exact frame center reads as static and amateurish for the same reason a centered photograph does.

**Training method**: pick one painting technique per week, name the *procedure* the painter used (not just the visual result), and write the GLSL that would produce an analogous procedure. This is a stronger transfer of skill than studying other people's shaders, because it forces you to derive the code from first principles rather than pattern-match a technique you've seen before.
