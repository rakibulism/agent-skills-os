# Resource Budgeting & Optimization

Budgets are set before building and enforced in CI (de8-cicd) — a budget that can't fail a build is a wish.

## The Budget Table (creative/marketing site defaults)

| Resource | Budget |
|---|---|
| JS, gzipped, initial route | ≤ 200kb including framework (three.js core ≈ 150kb — it must earn its place) |
| 3D assets above the fold | ≤ 500kb total (Meshopt/Draco + KTX2 — de3-asset-pipeline) |
| Hero image | ≤ 200kb (AVIF → WebP → JPEG chain, `srcset` always) |
| Background video | ≤ 1–2MB, muted, `playsinline`, `preload="metadata"` |
| Fonts | ≤ 2 families, WOFF2, subset to used glyphs, `font-display: swap`/`optional` |
| Any single texture | ≤ 1024px unless a close-up proves otherwise |

Adjust per project — but write the numbers down first and wire them into CI.

## Lazy-Loading WebGL — the pattern

The 3D bundle (three, scene code, assets) never sits in the critical path:
1. **Dynamic `import()`** for the whole experience chunk (split config: de8-bundling).
2. Initialize on approach: `IntersectionObserver` with `rootMargin: '50%'` — loading starts before the user arrives.
3. **Designed static poster first:** a styled `<img>`/render of the scene displays instantly (this is also the LCP element — de7-core-web-vitals); swap to the live canvas with a designed transition when ready.
4. Progress-driven loading state from `LoadingManager` — never an indefinite spinner over a blank canvas.

## Image & Texture Strategy
- GPU textures: **KTX2/Basis** (stays compressed in VRAM). DOM images: AVIF first.
- `loading="lazy"` below the fold; explicit `width/height` or `aspect-ratio` on every image (CLS).
- Responsive: `srcset`/`sizes` sized to actual rendered dimensions × DPR (capped 2).

## SVG
Run everything through **SVGO**; inline only what's styled/animated, sprite the rest. **Warning:** filter-heavy SVGs (`feTurbulence`, large `feGaussianBlur`) paint on CPU and can out-jank WebGL — a "lightweight SVG effect" can be the heaviest thing on the page. Test under throttle.

## Pause Everything Invisible
Every RAF loop gated on `IntersectionObserver` + `document.visibilitychange`. An offscreen particle system is pure battery theft and thermal throttling that then janks the visible content.

## Audit
`ls -la` the deployed assets and read the bundle treemap (de8-bundling) every release. Numbers, not vibes: each budget line gets a measured value in the PR.
