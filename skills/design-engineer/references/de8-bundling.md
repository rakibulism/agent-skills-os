# Advanced Bundling Architecture

**Vite** is the default for creative sites (Rollup underneath for builds); raw Rollup for libraries; Webpack only under legacy constraints.

## Tree-Shaking three.js Correctly

- Named imports from the package root: `import { WebGLRenderer, Scene } from 'three'` — modern three is side-effect-free and shakes well.
- Watch the add-ons: `three/examples/jsm/*` and drei can pull in far more than expected (controls dragging in whole subsystems). **Verify with the analyzer, never assumptions.**
- Import drei components individually where the toolchain benefits; audit what each convenience import costs.

## Code Splitting Strategy

- **Route-level** splits by default (framework handles it).
- **Experience-level split — the important one:** the entire WebGL experience (three, scene code, physics, assets) in its own dynamic `import()` chunk, loaded on approach per de7-resource-budgets. It must never sit in the critical path (LCP/INP — de7-core-web-vitals).
- **`manualChunks`** (Rollup) pins heavy stable vendors (`three`, animation libs) into long-cache chunks separate from weekly-changing app code — returning visitors re-download only the small app chunk:
```js
manualChunks: { three: ['three'], vendor: ['react', 'react-dom'] }
```

## Asset Handling

- Hashed filenames + **immutable caching**: `Cache-Control: public, max-age=31536000, immutable` for all static assets; HTML itself short/no-cache (the HTML references new hashes — that's the whole invalidation model).
- `?url` imports for GLB/KTX2/HDR so binaries enter the hashed pipeline.
- Build-time raster optimization (sharp/vite-plugin based) and **SVGO** for SVGs.
- **Brotli** (+gzip fallback): precompress at build (`vite-plugin-compression`) if the host doesn't compress at the edge (de8-edge-deployment).

## Targets

Modern browsers only (`build.target: 'esnext'` or baseline-widely-available) — don't pay transpilation and polyfill tax for browsers that can't run WebGL2 anyway.

## Analyze Every Release — non-negotiable

`rollup-plugin-visualizer` / `vite-bundle-visualizer`: the treemap must be **boring**. A surprise 300kb dependency is a build failure, not a shrug. Wire byte budgets into CI with `size-limit` (de8-cicd) so the treemap review has teeth:
```json
[{ "path": "dist/assets/index-*.js", "limit": "200 kb" },
 { "path": "dist/assets/three-*.js", "limit": "160 kb" }]
```
