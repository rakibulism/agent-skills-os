# Track 8: Deployment, Pipelines & Cloud Infrastructure

A masterpiece that only runs on localhost doesn't exist. This skill covers shipping globally with pipelines that protect quality automatically.

## 1. Advanced Bundling Architecture

**Vite** is the default for creative sites (Rollup under the hood for builds); reach for raw Rollup for libraries, Webpack only for legacy constraints.

- **Tree-shaking three.js correctly:** import from the package root with named imports (`import { WebGLRenderer, Scene } from 'three'`) — modern three is side-effect-free and shakes well. Beware `three/examples/jsm/*` add-ons and drei pulling in more than expected; check with a bundle analyzer, not assumptions.
- **Code splitting strategy:**
  - Route-level splits by default (framework handles it)
  - **Experience-level splits:** the entire WebGL experience — three, scene code, physics — in its own dynamic `import()` chunk, loaded per `de-performance-budget` §2
  - `manualChunks` (Rollup) to pin heavy vendors (`three`, animation libs) into stable long-cache chunks separate from app code that changes weekly
- **Asset handling:** hashed filenames + immutable cache headers (`Cache-Control: public, max-age=31536000, immutable`) for all static assets; HTML itself no-cache/short. `?url` imports for GLB/KTX2 so they enter the hashed pipeline. `vite-plugin-imagemin`/sharp step for raster; SVGO in the build.
- **Compression:** ship Brotli (and gzip fallback) — precompress at build (`vite-plugin-compression`) if the host doesn't do it at the edge.
- **Analyze every release:** `rollup-plugin-visualizer` / `vite-bundle-visualizer`; the treemap must be boring — a surprise 300kb dependency is a build failure, not a shrug.
- Modern targets (`esnext`/`baseline-widely-available`) — don't pay transpilation tax for browsers that can't run WebGL2 anyway.

## 2. Global Edge Deployment

- **Static-first architecture:** creative/marketing sites should build to static output (SSG) + client hydration — the fastest, cheapest, most cacheable shape. Dynamic needs (forms, personalization, A/B) go to edge functions, not a server.
- **Platform picks:**
  - **Cloudflare Pages + Workers** — largest PoP network, generous free tier, R2 for heavy assets (no egress fees — relevant when GLBs/videos get traffic), best raw edge latency
  - **Vercel** — best DX for Next.js, preview deployments per PR are the collaboration workflow, image optimization built in
  - **AWS CloudFront + Lambda@Edge/S3** — when the client's infra mandates AWS; more setup, maximal control
- **Edge rules for creative sites:** all assets behind the CDN with immutable caching (§1); HTML at the edge with short TTL + revalidation; redirect/AB logic in edge middleware (zero client flicker vs. client-side redirects); `stale-while-revalidate` for API-ish content.
- **Preview deployments are part of the design workflow:** every PR gets a URL; motion and 3D must be reviewed live on real phones, never via screenshots or screen recordings.

## 3. Automated CI/CD (GitHub Actions)

Pipeline stages for a creative-dev repo — each stage gates the merge:

1. **Static quality:** typecheck (`tsc --noEmit`), lint, format check. Fast, first.
2. **Tests:** unit tests for the math (spring solvers, easing, collision — pure functions are trivially testable and where silent breakage hurts most); component tests for interaction state machines.
3. **Build + budget enforcement:** production build, then hard-fail on budget breach — `size-limit` or bundlesize asserting per-chunk gzip limits (the numbers from `de-performance-budget` §2). A budget that doesn't fail CI is a wish.
4. **Lighthouse CI:** run against the preview deployment with assertions (`lhci assert` — e.g., `performance >= 0.9`, `cumulative-layout-shift <= 0.1`). Mobile config, throttled.
5. **Visual regression:** Playwright screenshot comparisons per component/page state (`toHaveScreenshot`, sensible `maxDiffPixelRatio`) or a service (Chromatic/Percy) for review workflows. **Animation discipline:** freeze time for stable shots — disable CSS animation via injected style, mock `requestAnimationFrame`/seek to a fixed timestamp, and for WebGL render a deterministic frame (fixed uTime uniform). Flaky visual tests get deleted or fixed the day they flake.
6. **Deploy:** preview per PR automatically; production on main merge; instant rollback = redeploy previous immutable build.

Cache `node_modules`/pnpm store and Playwright browsers between runs; the whole pipeline should stay under ~5 minutes or people start bypassing it.

## 4. Telemetry & Observability

Production is the only environment that matters; instrument it:

- **Error reporting (Sentry):** source maps uploaded per release (`sentry-cli` step in CI), release tagging so regressions bisect to a deploy. Explicitly capture creative-stack failures — they don't throw loudly by default:
  - `webglcontextlost` events → `Sentry.captureMessage` with GPU info (`WEBGL_debug_renderer_info` unmasked renderer string)
  - shader compile/link failures (check `getShaderParameter(COMPILE_STATUS)` in dev-time asserts, report in prod)
  - asset load failures (GLB/KTX2 404s or decode errors via `LoadingManager.onError`)
- **Real-user performance (RUM):** `web-vitals` library posting LCP/INP/CLS with device context (`deviceMemory`, `hardwareConcurrency`, connection type) — segment vitals by device tier to see how the low-end actually experiences the site. Custom metric: **sampled FPS** — record rolling average FPS for the first 10s of the hero scene on a small % of sessions; alert if the p25 drops after a release.
- **Session replay (LogRocket / Sentry Replay):** sampled, privacy-masked — invaluable for "the animation glitched on my iPhone" reports you can't reproduce.
- **Alerting that matters:** new error type spikes post-deploy, vitals p75 regression week-over-week, WebGL context-loss rate by GPU model (identifies a device class your quality tiers mishandle — feed back into `de-performance-budget` §4).

## Repo Definition of Done

□ visualized bundle, budgets asserted in CI · □ preview URL per PR · □ Lighthouse CI gating with mobile assertions · □ visual regression on key states with frozen time · □ immutable-cached hashed assets on a CDN/edge · □ Sentry with source maps + WebGL failure capture · □ RUM vitals segmented by device tier · □ one-command rollback.
