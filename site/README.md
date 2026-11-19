# Site

The website for `universal-agent-skills`, deployed to https://agent-skills-os.vercel.app.

Next.js 16 (App Router, static export) · React 19 · TypeScript · StyleX · Hugeicons · Sonner · `next/font` (IBM Plex, self-hosted).

Pages: `/` (skill search), `/skills/<name>` (one per skill), `/docs`, `/contribute`.

## Run it

```bash
cd site
npm install
npm run dev       # hot-reloading dev server on http://localhost:3310 (Ask AI endpoint on 3312)
npm run preview   # production build, then serves out/ and /api/ask on http://localhost:3311
npm run check     # typecheck, adapter check, production build
```

From the repo root, `npm run site:dev`, `npm run site:build` and `npm run site:preview` do the same.

## Ask AI

The search box also answers questions. Questions go to `/api/ask`, a Vercel Function (`../api/ask.mjs`) that calls a model through [OpenRouter](https://openrouter.ai). The handler is in `server/ask.mjs`.

- It's grounded: the endpoint ranks skills with the same search the site uses, gives the model only the top matches, and makes it reply in a fixed JSON shape that picks cards by id. The site renders every install command and code block from its own data, so the model never writes them.
- Setup: copy `.env.example` to `.env.local` and set `OPENROUTER_API_KEY` (and optionally `OPENROUTER_MODEL`, default `openrouter/auto`). Add the same variables to the Vercel project. Never commit `.env.local`.
- Without a key the endpoint answers "not set up" and keyword search keeps working.
- Fallbacks for real models: if the main model fails (for example a paid model on an account with no credits), it retries on `OPENROUTER_FALLBACK_MODEL` (default `openrouter/free`). Reasoning is kept short and excluded, and an empty reply is retried once with a bigger budget, all inside a 27-second limit.
- `npm run dev:fake` and `npm run serve:fake` use a stand-in model, to try the UI without a key.
- Limits: 300-character questions, 600-token answers, 12 questions per minute per visitor on each server instance.

## How it fits together

- `next build` writes static HTML, CSS and JS to `out/`. Vercel builds it with the root `vercel.json`.
- Skills are read from `../skills/*/SKILL.md` at build time, so search and the skill pages always match the package.
- `/contribute` lists GitHub contributors fetched at build time; if GitHub is unreachable it links to the contributors graph instead.
- Icons come from Hugeicons through `src/components/Icon.tsx`, named by meaning.
- The adapter demo runs browser copies of the adapters (`src/lib/adapters.ts`). `npm run check:adapters` compares them with the real ones in `../src/index.js`.
- Design tokens (colors with dark values, fonts, radii, motion) are in `src/styles/tokens.stylex.ts`.
- The logo is a bookshelf with one book pulled out (`src/components/Logo.tsx`, `public/favicon.svg`). `public/og.png` is rendered from `scripts/og.html` (1200×630).
