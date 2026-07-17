# Theatre.js — Visual Timeline Editing for Production Code

Theatre.js's whole value proposition: it lets someone drag keyframes on a graph editor and have that directly drive real Three.js objects and shader uniforms in the actual running app — no export/reimport step. Use it when a designer (or you, iterating fast) needs to *feel out* timing and easing visually rather than guessing numbers in code.

## 1. Project / Sheet / Sequence Model

- **Project** — the top-level container, holds saved state.
- **Sheet** — one "scene" of animatable objects (e.g., the hero section). Multiple sheets can play simultaneously for compound experiences (hero + nav both animating independently).
- **Sequence** — the actual timeline of keyframes within a sheet.

```js
import { getProject } from '@theatre/core';
const project = getProject('MySite');
const sheet = project.sheet('Hero');
const obj = sheet.object('sphere', { positionY: 0, uProgress: 0 });

obj.onValuesChange((values) => {
  mesh.position.y = values.positionY;
  material.uniforms.uProgress.value = values.uProgress;
});
```

Binding is push-based: Theatre.js calls `onValuesChange` on every tick where a tracked value changed — write those values directly into Three.js properties or shader uniforms, mutating in place (same allocation-free discipline as [de5-lowlevel-js](de5-lowlevel-js.md), since this runs inside a render loop).

## 2. Production Deployment (the part people get wrong)

The `@theatre/studio` package is the visual editor GUI — it is large and meant for the authoring environment only. **Never ship it to production users.**

```js
if (process.env.NODE_ENV === 'development') {
  const studio = (await import('@theatre/studio')).default;
  studio.initialize();
}
```

Export the authored animation as a static JSON state (`project.exportForSave` in dev tooling, or the studio's export) and load only `@theatre/core` with that state in production — `@theatre/core` alone is lightweight and has no editor UI attached.

## 3. Binding to 3D/Shader Properties

- Bind directly to mesh transforms, material properties, and camera position/fov/lookAt for cinematic camera moves timed visually against other scene events.
- Bind custom shader uniforms the same way as any other tracked value — this is how a designer scrubs a raymarched effect's intensity or a noise displacement's amplitude without touching GLSL.
- For R3F integration, drive the binding inside `useFrame`, not `useEffect`/`setState` — see [de3-threejs-r3f](de3-threejs-r3f.md) for why per-frame `setState` in React kills performance.

## 4. Triggering from Scroll, Clicks, or Data

Theatre.js sequences have a `.position` you can set programmatically — this is the hook for tying a timeline to anything external:

```js
gsap.timeline({ scrollTrigger: { trigger: '.hero', scrub: 1 } })
  .to(sequence, { position: sequence.pointer.length, ease: 'none' });
```

This is a common real pairing: **GSAP/ScrollTrigger drives scroll progress → that progress scrubs a Theatre.js sequence position → the sequence drives Three.js object properties.** See [wgl-gsap-motion](wgl-gsap-motion.md) for the ScrollTrigger half.

## 5. Keeping Timelines Maintainable

- Name objects and props clearly (`hero.cameraFov`, not `obj1.val2`) — Theatre.js state files get large fast and are hard to debug with generic names.
- Split unrelated animated concerns into separate sheets rather than one giant sheet with everything — makes the visual editor usable and keeps re-renders scoped.
- Treat the exported JSON state as a build artifact, not hand-edited source — always author through the studio GUI and re-export, don't hand-patch the JSON.

## When to Reach for This vs. Just GSAP

| Signal | Choice |
|---|---|
| A designer/non-coder needs to tune timing visually | Theatre.js |
| Complex, non-linear, many-property choreography of a 3D scene | Theatre.js |
| Simple scroll-triggered DOM/property tweens, code-authored | GSAP alone ([wgl-gsap-motion](wgl-gsap-motion.md)) — lighter, no extra dependency |
| Need it to ship without a design-review loop | GSAP alone — Theatre.js's value is the visual iteration loop, which costs a workflow step |
