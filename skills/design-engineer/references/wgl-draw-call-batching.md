# Draw-Call Batching & Instancing

A draw call is the CPU telling the GPU "render this now" — the expense is mostly **driver/CPU overhead per call**, not the GPU's actual rendering work. 10,000 individual `mesh.draw()` calls will stall a browser even if the GPU could render the same triangle count instantly as one batch. This is the mental model that makes every rule below make sense.

## 1. What Breaks a Batch

Anything that forces a state change breaks a batch into a new draw call: a different material, a different texture, a different blend mode, or interleaving a non-instanceable object between instanceable ones. Structure the scene/display-tree so same-material, same-texture objects are grouped and rendered contiguously — this applies identically in Three.js, PixiJS, and raw WebGL.

## 2. Instanced Attributes (the actual leverage)

Static instancing (same mesh, same look, different position) is the easy 80%. The expert 20% is **per-instance variation inside one draw call** via custom instanced attributes — different color, scale, or animation phase per copy, without splitting into separate draw calls:

```js
// Three.js InstancedMesh with per-instance color
const mesh = new THREE.InstancedMesh(geometry, material, count);
const colorAttr = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
for (let i = 0; i < count; i++) {
  colorAttr.setXYZ(i, r, g, b); // written once at setup, or updated per-frame below
}
geometry.setAttribute('instanceColor', colorAttr);
```

## 3. Dynamic Instancing Without CPU Bottlenecks

Updating thousands of instance transforms every frame (moving crowd, wind-blown leaves) is where naive implementations choke:
- Write directly into the `InstancedMesh.instanceMatrix.array` (a typed array) rather than calling `setMatrixAt` inside a loop that also allocates a temp `Matrix4` per iteration — allocate the temp matrix **once outside the loop** and reuse it ([de5-lowlevel-js](de5-lowlevel-js.md) discipline).
- Set `mesh.instanceMatrix.needsUpdate = true` once per frame, not per instance.
- Only update the instances that actually changed if the scene is mostly static — a dirty-flag or spatial-tiled update avoids touching the full buffer every frame.

## 4. Texture Atlases & Arrays

To keep visually-different objects in one draw call, combine their textures:
- **Atlas:** pack multiple textures into one image, index via UV offset per instance — works well for a fixed small set of variants (a handful of tree species, a card back + several fronts).
- **Texture arrays** (WebGL2/WebGPU): same-size textures addressed by layer index in the shader — cleaner than atlas UV math when variants are numerous but same-dimension.

## 5. Culling & Hierarchical Batching

- **Frustum culling:** don't submit instances the camera can't see. Bounding-box/sphere checks against the camera frustum before the draw call, not after — the GPU shouldn't process what will never be visible.
- **Spatial grids/octrees:** for worlds larger than one draw call's worth of instances, chunk into spatial cells and only instance the visible chunks. This trades a CPU-side visibility check for a much smaller GPU workload — the classic CPU/GPU balance decision below.
- **LOD:** swap instanced meshes to lower-poly versions as camera distance increases, seamlessly, rather than rendering full detail for objects that occupy a handful of pixels.

## 6. Knowing When *Not* to Instance

Instancing has a fixed setup/memory overhead (buffer allocation, per-instance attribute storage). Don't instance:
- A unique, single-use object — the overhead isn't recouped.
- A small count where the batch savings are negligible next to the added code complexity.
- Always weigh it as a CPU-vs-GPU tradeoff explicitly: is the CPU cost of managing instance arrays and dirty-tracking actually less than the GPU cost of the extra draw calls it replaces? For small counts (<20-30 similar objects), it usually isn't worth it.

## Applies Beyond Three.js

- **PixiJS:** the same driver-overhead logic is why `ParticleContainer` and texture-atlas batching exist — see [wgl-pixijs-2d-engine](wgl-pixijs-2d-engine.md).
- **Raw WebGL/WebGPU:** same principles, expressed as manual instanced draw calls (`gl.drawArraysInstanced`) instead of a framework wrapper.

## Budget Target

For a scroll-driven marketing scene, aim under 100 draw calls total (merge static geometry, atlas textures, instance repeated elements) — this is the same number referenced in `de-webgl-3d`'s performance section; this skill is the "how" behind hitting it.
