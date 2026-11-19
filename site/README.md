# Site

The website for `universal-agent-skills`, deployed to https://agent-skills-os.vercel.app.

Next.js 16 (App Router, static export) · React 19 · TypeScript · StyleX · Hugeicons · Sonner · `next/font` (IBM Plex, self-hosted).

Pages: `/` (skill search), `/skills/<name>` (one per skill), `/docs`, `/contribute`.

## Run it

```bash
cd site
npm install
npm run dev       # hot-reloading dev server on http://localhost:3310
npm run preview   # production build, then serves out/ on http://localhost:3311
npm run check     # typecheck, adapter check, production build
```

From the repo root, `npm run site:dev`, `npm run site:build` and `npm run site:preview` do the same.

## How it fits together

- `next build` writes static HTML, CSS and JS to `out/`. Vercel builds it with the root `vercel.json`.
- Skills are read from `../skills/*/SKILL.md` at build time, so search and the skill pages always match the package.
- `/contribute` lists GitHub contributors fetched at build time; if GitHub is unreachable it links to the contributors graph instead.
- Icons come from Hugeicons through `src/components/Icon.tsx`, named by meaning.
- The adapter demo runs browser copies of the adapters (`src/lib/adapters.ts`). `npm run check:adapters` compares them with the real ones in `../src/index.js`.
- Design tokens (colors with dark values, fonts, radii, motion) are in `src/styles/tokens.stylex.ts`.
- The logo is a bookshelf with one book pulled out (`src/components/Logo.tsx`, `public/favicon.svg`). `public/og.png` is rendered from `scripts/og.html` (1200×630).
