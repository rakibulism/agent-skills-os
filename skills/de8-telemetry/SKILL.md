---
name: de8-telemetry
description: Track 8 rail — telemetry and observability. Production monitoring for creative sites — Sentry with source maps and release tagging, explicit capture of WebGL context loss / shader compile failures / asset load errors with GPU info, real-user monitoring of Core Web Vitals segmented by device tier, sampled FPS metrics for hero scenes, session replay, and alerting that catches visual regressions in production. Use whenever setting up error reporting or performance monitoring, debugging production-only WebGL crashes or frame drops, instrumenting a launched creative site, or deciding what to alert on.
version: 0.1.0
tags: [design-engineering, deployment, infrastructure]
inputs:
  - name: pipeline
    description: The build, CI, or deployment setup being configured.
    required: true
---

# Telemetry & Observability

Production is the only environment that matters. Creative-stack failures don't throw loudly by default — instrument them explicitly or discover them via angry emails.

## Error Reporting (Sentry)

- **Source maps uploaded per release** (`sentry-cli` step in CI — de8-cicd) and **release tagging**, so every error bisects to a deploy.
- **Capture what WebGL won't throw:**
  - `webglcontextlost` → `Sentry.captureMessage` with the unmasked GPU string (`WEBGL_debug_renderer_info`) — context-loss rate *by GPU model* identifies device classes the quality tiers mishandle (feedback into de7-webgl-fallbacks).
  - **Shader compile/link failures:** check `getShaderParameter(COMPILE_STATUS)` / program link status; assert loudly in dev, report in prod. A driver-specific shader failure otherwise renders as a silent black quad.
  - **Asset failures:** GLB/KTX2 404s and decode errors via `LoadingManager.onError` / fetch handlers.
- Breadcrumbs for interaction state transitions (de6-state-systems emits them naturally) — the trail that explains "how did it get into this state".

## Real-User Monitoring (RUM)

- `web-vitals` → analytics with device context: `deviceMemory`, `hardwareConcurrency`, connection type, detected quality tier. **Segment p75 by device tier** — the aggregate hides exactly the users the fallback system exists for (de7-core-web-vitals).
- **Custom metric — sampled FPS:** on a small % of sessions, record the rolling average FPS for the first ~10s of the hero scene; report with tier + GPU. **Alert if p25 drops after a release** — this catches "the new shader tanks Adreno GPUs" the day it ships, not when a client notices.

## Session Replay

LogRocket / Sentry Replay — sampled, privacy-masked. Invaluable for irreproducible "the animation glitched on my iPhone" reports: watch the actual session with its console and network trail.

## Alerting That Matters (and nothing that doesn't)

- New error *type* spike after a deploy (release-tagged makes this trivial)
- Vitals p75 regression week-over-week, per tier
- WebGL context-loss rate anomaly by GPU model
- Sampled-FPS p25 drop post-release

No alert on raw error counts (bots, extensions) — alert fatigue kills observability faster than missing data.

## Launch Checklist
Sentry wired with source maps + release tags · context-loss/shader/asset capture in place · web-vitals RUM with tier segmentation · FPS sampling on the hero · replay sampled · the four alerts configured · a dashboard someone actually opens Monday morning.
