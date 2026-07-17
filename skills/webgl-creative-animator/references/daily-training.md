# How to Train Your Brain Daily

## 1. Deconstruct existing masterpieces

**Shadertoy** (shadertoy.com) is the primary training ground — thousands of complete, runnable fragment shaders with visible source, ranging from simple SDF studies to full raymarched scenes and fluid sims. The deconstruction method that actually builds intuition (rather than passive reading):

1. Load a shader whose *result* you understand (you can describe what it looks like) but whose *code* you don't yet fully follow.
2. Pick one uniform or constant partway through the code — not at the very top (too foundational, breaks everything unhelpfully) and not at the very end (too cosmetic, changes nothing instructive). A `smin` blend-radius `k`, a noise frequency multiplier, or a raymarch step count are good targets.
3. **Predict** what changing it will do *before* changing it — write down your prediction.
4. Change it, observe, compare to your prediction. Where you're wrong is exactly where your mental model has a gap — that gap is the thing to study next, specifically (look up what that one term/operation does, not the whole shader).
5. Repeat with a different variable in the same shader before moving to a new one — extracting 3-4 insights from one shader beats skimming ten.

**Awwwards** (awwwards.com) is the reference for *how these techniques get composed into finished sites* — less about isolated shader code, more about staging: which effect is the hero moment, how post-processing (bloom, chromatic aberration, DoF) is dialed back to support rather than overwhelm content, how loading/transition states are designed so the GPU-heavy scene doesn't feel like dead time before it's ready. Study Awwwards sites for *composition and restraint*; study Shadertoy for *technique*.

## 2. Imitate nature's math

Natural patterns are the richest source of "what rule produces this" study material, because they're systems in the exact sense described in [core-pillars.md](core-pillars.md) — simple local rules producing complex global structure, with no central "designer."

- **A leaf's veins**: branching that gets thinner and more numerous toward the leaf edge, roughly following a diffusion-limited-aggregation or space-colonization pattern (a growth point extends toward the nearest unclaimed space, repeated). Try to write pseudocode for "extend toward nearest open space, branch when two growth fronts get too close" before looking up how procedural vein/river-network/lightning generators actually implement it.
- **A whirlpool**: rotational flow with velocity magnitude increasing toward the center up to a point, then a stable "eye." This maps directly onto curl-noise or vortex-force particle work in [gpgpu-particles.md](gpgpu-particles.md) — try deriving the velocity-field formula for a simple vortex (`vel = perpendicular(pos - center) / distance` is the core of it) before reading the reference.
- **Cracks in mud**: Worley/cellular noise's native visual signature (see [vertex-displacement-noise.md](vertex-displacement-noise.md)) — mud cracks form because the drying material contracts and fractures roughly evenly across a grid of nucleation points, which is structurally the same process Worley noise's "distance to nearest feature point" formula models. Recognizing this connection (a real physical process and a specific noise algorithm are the *same underlying math*) is the kind of pattern-matching this daily practice is building.

The exercise is not to perfectly simulate these phenomena — it's to practice the specific mental move of translating an observed pattern into a candidate local rule, which is the exact skill "think in systems, not keyframes" requires.

## 3. Build code sketches, not full sites

Treat GLSL like a daily sketchbook: one effect, ~30 minutes, no layout/navigation/responsive-design overhead. A useful prompt format is a short, evocative phrase deliberately underspecified enough to require creative interpretation, not a spec:

- "Underwater light refraction"
- "A heartbeat, visualized as light"
- "Static on an old television between channels"
- "The moment ink hits water"
- "A held breath"

Constraints that make sketches more productive than open-ended play:
- **Time-box it.** 30 minutes forces picking one technique family and committing, rather than researching indefinitely.
- **Single technique per sketch.** Don't combine raymarching + fluid sim + GPGPU particles in one 30-minute sketch — that's a portfolio piece, not a sketch, and mixing techniques before any one is fluent slows learning per technique.
- **Keep every sketch**, even failed ones, in a running collection (a personal Shadertoy profile, or a local gallery of saved `.glsl`/`.html` files). The visible history of "this is what I could do in month 1 vs. month 6" is itself motivating and diagnostic of which technique families still need reps.

## Reference points worth knowing by name

- **Inigo Quilez** (iquilezles.org) — originated or canonicalized the majority of the SDF/raymarching formulas in [raymarching-sdf.md](raymarching-sdf.md); his site's articles are the primary source, not a secondary summary, for SDF/raymarching math.
- **The Book of Shaders** (thebookofshaders.com, Patricio Gonzalez Vivo & Jen Lowe) — the standard structured GLSL-from-zero curriculum, covering exactly the fragment-shader fundamentals (`uv` space, `mix`/`step`/`smoothstep`, noise) this skill assumes as prerequisite.
- **Ashima Arts / Stefan Gustavson's `webgl-noise`** — the canonical, correctness-verified Simplex noise GLSL implementation reproduced in [vertex-displacement-noise.md](vertex-displacement-noise.md); worth knowing this is *the* reference implementation the field converged on, rather than one of many equivalent options.
- **Jos Stam's "Stable Fluids" (SIGGRAPH 1999)** — the paper underlying essentially every real-time fluid shader technique in [fluid-dynamics.md](fluid-dynamics.md).
- **Pavel Dobryakov's `WebGL-Fluid-Simulation`** (open source) — a complete, working reference implementation of the Stable Fluids pipeline, useful for seeing the full multi-texture ping-pong orchestration wired together end-to-end rather than in isolated snippets.

## What "good" looks like after sustained practice

Fluency shows up as being able to look at a finished effect (someone else's demo, a reference video, a verbal description) and correctly name *which of the five technique families* (or combination) produced it within a few seconds — because each family has a distinct visual signature once you've internalized the underlying math (SDF blending has a specific smooth, rounded-metaball quality; curl-noise particles have a specific swirling-without-clumping quality; Stable-Fluids advection has a specific stretching/folding quality distinct from either). That fast, confident classification is the actual sign the systems-not-keyframes mental shift from [core-pillars.md](core-pillars.md) has taken hold.
