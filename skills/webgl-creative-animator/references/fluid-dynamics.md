# Fluid Dynamics & Vector Fields

## When this is actually the right tool (vs. curl-noise particles)

Reach for a real grid-based fluid solver only when the effect needs a visible **density/dye field advecting through a velocity field** — ink diffusing in water, smoke with continuous density gradients, paint blending across a canvas. If the ask is just "particles that flow organically," curl-noise-driven GPGPU particles ([gpgpu-particles.md](gpgpu-particles.md)) produce a similar *impression* at a fraction of the implementation and runtime cost. A grid fluid solver is heavier: it simulates a full 2D (or 3D) field of velocity and pressure values, not a sparse set of particles.

## The governing equations (Navier–Stokes, incompressible form)

The incompressible Navier–Stokes equations describe how a fluid's velocity field **u** evolves:

```
∂u/∂t = -(u·∇)u - (1/ρ)∇p + ν∇²u + f      (momentum equation)
∇·u = 0                                     (incompressibility / continuity constraint)
```

In words, the four terms on the right of the momentum equation are: **advection** (the fluid carries itself along, `-(u·∇)u`), **pressure gradient** (fluid flows from high to low pressure, `-(1/ρ)∇p`), **viscous diffusion** (fluid smooths out velocity differences with its neighbors, `ν∇²u`), and **external forces** (gravity, a mouse-injected force, `f`). The second equation is a *constraint*, not something evolved in time — it says the velocity field must have zero divergence everywhere (fluid doesn't spontaneously appear or vanish at any point), and enforcing this constraint after each update is what the "projection" step below does.

Solving this exactly is a famously hard, unsolved problem in general (existence/smoothness of solutions is one of the Clay Institute's seven Millennium Prize Problems) — but real-time graphics doesn't need an exact solution, only one that's **stable and visually convincing**, which is exactly what the next section provides.

## Jos Stam's "Stable Fluids" method — the real-time graphics standard

Jos Stam's 1999 SIGGRAPH paper "Stable Fluids" is the technique nearly every real-time fluid shader (including most Shadertoy fluid demos and commercial creative-coding fluid effects) is built on. Its key insight: replace the numerically unstable explicit advection term with an **unconditionally stable semi-Lagrangian backward advection**, so the simulation never blows up regardless of time step size — critical for a real-time system where frame time (and therefore `dt`) isn't fully controllable.

Each simulation step, applied on a grid stored as textures (positions/velocities are texel values, exactly the ping-pong FBO pattern from [gpgpu-particles.md](gpgpu-particles.md)):

1. **Add forces** — inject velocity from external sources (mouse drag direction/speed, a constant wind):
   ```glsl
   vel += force * dt;
   ```

2. **Advect** — instead of stepping forward (unstable), trace *backward* along the current velocity to find where this texel's fluid came from, and sample its value there:
   ```glsl
   vec2 pos = uv - velocity * dt; // where did the fluid at `uv` come from?
   newVelocity = texture2D(velocityTexture, pos).xy; // bilinear-sampled — this interpolation is what keeps it stable
   ```
   This backward-trace-and-sample is unconditionally stable because it can never overshoot or amplify — it's always reading an interpolated value from *within* the existing field, unlike forward (Eulerian) stepping which can extrapolate past the field's actual range and diverge.

3. **Diffuse** — simulate viscosity by blending each texel toward its neighbors' average, solved implicitly via a few Jacobi iterations (explicit diffusion is also numerically unstable at real-time time steps):
   ```glsl
   // One Jacobi iteration; run ~20-40 times per frame for a stable diffuse solve
   vec2 jacobi(sampler2D x, vec2 uv, float alpha, float rBeta, vec2 texel) {
     vec2 xL = texture2D(x, uv - vec2(texel.x, 0.0)).xy;
     vec2 xR = texture2D(x, uv + vec2(texel.x, 0.0)).xy;
     vec2 xB = texture2D(x, uv - vec2(0.0, texel.y)).xy;
     vec2 xT = texture2D(x, uv + vec2(0.0, texel.y)).xy;
     vec2 bC = texture2D(x, uv).xy; // "b" is the field being diffused (current velocity, before this pass)
     return (xL + xR + xB + xT + alpha * bC) * rBeta;
   }
   ```

4. **Project** — this is where the incompressibility constraint (`∇·u = 0`) is actually enforced. Compute the divergence of the current velocity field, solve a Poisson equation for a pressure field that would cancel that divergence (again via Jacobi iteration), then subtract the pressure gradient from velocity:
   ```glsl
   // 4a. Divergence of velocity field:
   float divergence(sampler2D vel, vec2 uv, vec2 texel) {
     float L = texture2D(vel, uv - vec2(texel.x, 0.0)).x;
     float R = texture2D(vel, uv + vec2(texel.x, 0.0)).x;
     float B = texture2D(vel, uv - vec2(0.0, texel.y)).y;
     float T = texture2D(vel, uv + vec2(0.0, texel.y)).y;
     return 0.5 * ((R - L) + (T - B));
   }

   // 4b. Solve for pressure via Jacobi (Poisson equation ∇²p = divergence):
   float pressureJacobi(sampler2D pressure, sampler2D div, vec2 uv, vec2 texel) {
     float pL = texture2D(pressure, uv - vec2(texel.x, 0.0)).x;
     float pR = texture2D(pressure, uv + vec2(texel.x, 0.0)).x;
     float pB = texture2D(pressure, uv - vec2(0.0, texel.y)).x;
     float pT = texture2D(pressure, uv + vec2(0.0, texel.y)).x;
     float d  = texture2D(div, uv).x;
     return (pL + pR + pB + pT - d) * 0.25;
   }

   // 4c. Subtract pressure gradient from velocity (makes it divergence-free):
   vec2 gradSubtract(sampler2D vel, sampler2D pressure, vec2 uv, vec2 texel) {
     float pL = texture2D(pressure, uv - vec2(texel.x, 0.0)).x;
     float pR = texture2D(pressure, uv + vec2(texel.x, 0.0)).x;
     float pB = texture2D(pressure, uv - vec2(0.0, texel.y)).x;
     float pT = texture2D(pressure, uv + vec2(0.0, texel.y)).x;
     vec2 v = texture2D(vel, uv).xy;
     return v - 0.5 * vec2(pR - pL, pT - pB);
   }
   ```

5. **Advect the dye/density field** through the now divergence-free velocity — same backward-trace technique as step 2, applied to whatever visible quantity you're advecting (ink color, smoke density) rather than velocity itself. This is the field the audience actually *sees*; velocity/pressure are invisible intermediate state.

## Practical implementation notes

- **Pavel Dobryakov's `WebGL-Fluid-Simulation`** (open-source, MIT-licensed) is the widely-referenced production implementation of exactly this pipeline and is a legitimate study reference for seeing the full ping-pong FBO orchestration (multiple textures: velocity, pressure, divergence, dye, each double-buffered) wired together in working WebGL2 code.
- **Grid resolution vs. particle count tradeoff**: a fluid solver's cost scales with grid cell count (`width × height` texels, each requiring several Jacobi iterations per frame), not with a "particle count" — a 256×256 simulation grid (65,536 cells) at 30 Jacobi iterations for diffuse + 30 for pressure is roughly 4 million texel operations per frame before rendering, which is why fluid demos commonly simulate at lower resolution (128×128–256×256) than the display resolution and upscale the final dye texture.
- **Mouse-driven forcing**: inject both a velocity impulse (in the direction of mouse movement, scaled by movement speed) and, optionally, a dye/color impulse at the cursor position each frame the mouse moves — this dual injection (force the fluid *and* color it) is what produces the classic "colorful ink trailing the cursor" demo effect.
- **Boundary conditions matter visually**: reflective boundaries (velocity component perpendicular to a wall is negated/zeroed at the edge) keep fluid contained and swirling near edges; wraparound boundaries (`mod` the UV) produce an infinite-feeling flow with no visible walls — pick deliberately, this is a visible compositional choice, not just a technical default.

## Visual styles this unlocks

Ink/smoke trails following a mouse (dye field advected by mouse-forced velocity), watercolor paint blending (multiple dye channels with different colors advected through the same velocity field, blending where they overlap), and turbulent currents warping underlying typography (render text to the dye-field's initial state, then let the velocity field's advection step distort it over time — the text becomes the "ink" being carried by the simulated flow).
