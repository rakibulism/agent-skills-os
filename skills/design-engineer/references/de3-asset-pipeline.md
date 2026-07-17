# 3D Asset Pipeline & Blender

The difference between a 20MB scene and a 500kb scene is pipeline, not modeling talent.

## Modeling Strategy
- **Low-poly silhouettes, materials do the rest:** polygons for the outline, **normal maps** for surface detail. Target **<50k triangles total** for a hero scene.
- Delete what the camera never sees (backfaces of fixed-angle scenes, interior geometry).
- Clean topology only where it deforms (rigged parts); static props can be ugly-but-light.

## Bake Expensive Lighting
Ambient occlusion and static lighting baked to textures in Blender (Cycles bake → AO / combined lightmap). Runtime cost: one texture fetch. Look: expensive. This is how premium product scenes get soft realistic shading on mobile GPUs. Requires a second UV set (lightmap UVs, no overlaps).

## Export (Blender → GLB)
- **GLB** (single binary) over GLTF+bin+textures.
- Apply transforms before export (Ctrl+A → All Transforms), +Y up, check normals (backface culling on to spot flips).
- Export only used materials/textures; no 4k textures "just in case".

## Compression — the 5–40× payload win

- **Geometry:** Draco or **Meshopt** (Meshopt decodes faster, streams better).
- **Textures: KTX2 / Basis Universal** — GPU-native compressed formats that **stay compressed in VRAM** (a 2048² PNG decompresses to ~16–21MB of GPU memory; KTX2 stays ~2–5MB). `etc1s` = smaller, `uastc` = higher quality for normal maps.
- Resize honestly: **1024px is usually plenty; 2048 max** for hero close-ups.

One-liner:
```bash
gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress ktx2
```
(or `npx gltfpack -i in.glb -o out.glb -cc -tc`)

## Loading
- drei `useGLTF` + `<Preload all />`; register `KTX2Loader`/`MeshoptDecoder` with the loader.
- Show a **designed** loading state driven by real progress (`THREE.LoadingManager` / `useProgress`), reveal with a designed transition from a static poster (ties into de7-core-web-vitals LCP strategy).

## The Budget
**Total 3D payload above the fold: ≤ 500kb.** Verify with actual numbers per release, not vibes. Every asset over budget needs a written justification or a smaller texture.

## Audit Checklist
GLB not GLTF-separate · transforms applied · <50k tris · AO baked · KTX2 textures ≤1024 · Meshopt/Draco applied · measured payload ≤500kb · decoders registered · progress-driven loader.
