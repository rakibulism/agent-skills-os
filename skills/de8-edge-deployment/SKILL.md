---
name: de8-edge-deployment
description: Track 8 rail — global edge deployment. Static-first architecture with edge functions, platform selection (Cloudflare Pages/Workers/R2 vs Vercel vs AWS CloudFront/Lambda@Edge), CDN caching rules for creative sites, stale-while-revalidate, edge middleware for redirects/AB tests, and preview deployments as a design review workflow. Use whenever choosing hosting for a site, deploying static sites or serverless/edge functions, configuring CDN caching, or setting up per-PR preview URLs for reviewing motion work on real devices.
version: 0.1.0
tags: [design-engineering, deployment, infrastructure]
inputs:
  - name: pipeline
    description: The build, CI, or deployment setup being configured.
    required: true
---

# Global Edge Deployment

Single-digit-millisecond first byte, worldwide, by putting everything cacheable at the edge and keeping the origin out of the request path.

## Static-First Architecture

Creative/marketing sites build to **static output (SSG) + client hydration** — the fastest, cheapest, most cacheable shape. Dynamic needs (forms, personalization, A/B, geo) go to **edge functions**, not a server. If a "server requirement" appears, first ask whether it's really a build-time or edge-time concern.

## Platform Selection

- **Cloudflare Pages + Workers** — largest PoP network, best raw edge latency, generous free tier; **R2 for heavy assets** (zero egress fees — decisive when GLBs/videos get real traffic).
- **Vercel** — best DX for Next.js; built-in image optimization; preview deployments are frictionless. Watch bandwidth pricing for video/3D-heavy sites.
- **AWS CloudFront + S3 + Lambda@Edge** — when client infra mandates AWS; maximal control, most setup.

Default for studio work: Cloudflare or Vercel; move heavy media to R2 either way if egress bills appear.

## Caching Rules (creative site)

- All hashed static assets: `Cache-Control: public, max-age=31536000, immutable` (pairs with de8-bundling hashing — invalidation happens via new hashes in fresh HTML).
- HTML: short TTL or `no-cache` with edge caching + revalidation; the HTML is the pointer to everything else.
- Semi-dynamic content (CMS-ish JSON): `stale-while-revalidate` — users always get instant cached responses; refresh happens in the background.
- Big media (GLB, video, HDR): long-cache from R2/bucket behind the CDN; `Accept-Encoding`-aware (precompressed Brotli — de8-bundling).

## Edge Middleware

Redirects, locale routing, and A/B assignment run **at the edge before HTML is served** — zero client-side flicker, no layout shift from client redirects (CLS — de7-core-web-vitals). Keep middleware tiny; it runs on every request.

## Preview Deployments = Design Review Infrastructure

Every PR gets a URL automatically (Pages/Vercel do this natively; wire it in CI otherwise — de8-cicd). **Motion and 3D are reviewed live on real phones via the preview URL — never via screenshots or screen recordings.** A spring's feel and a scene's frame rate don't survive video compression; the preview link is the review artifact.

## Rollback
Immutable builds → rollback = point production at the previous deployment (one click/command on Pages/Vercel). Practice it once before you need it.
