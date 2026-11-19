# Site

The website for `universal-agent-skills`, deployed to https://skills.rakibulism.space.

Next.js 16 (App Router, static export) · React 19 · TypeScript · StyleX · Hugeicons · Sonner · `next/font` (IBM Plex, self-hosted).

Pages: `/` (skill search), `/skills/<name>` (one per skill), `/docs`, `/docs/api`, `/docs/cli`, `/contribute`, `/about`, `/contact`, `/privacy`.

## Run it

```bash
cd site
npm install
npm run dev       # hot-reloading dev server on http://localhost:3310 (Ask AI endpoint on 3312)
npm run preview   # production build, then serves out/, the middleware and /api/* on http://localhost:3311
npm test          # tests for negotiation, the API and the built files (needs a build)
npm run check     # typecheck, adapter check, production build, tests
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

## For agents

Everything an AI agent needs is served from the same static build plus three small functions:

- **Markdown for every page.** Each page has a twin at `<path>.md` (`/index.md` for the home page). The Vercel Routing Middleware (`../middleware.js`, logic in `server/agent-routing.mjs`) serves it to requests whose `Accept` header prefers `text/markdown`, with `Vary: Accept`, following [acceptmarkdown.com](https://acceptmarkdown.com): q-values decide, HTML is the default, unsupported types get 406, unknown pages get a Markdown 404. Pages built from `src/lib/doc.ts` data render both formats from one source; the home, docs and contribute twins come from `src/content/markdown.ts`; skill twins are the raw `SKILL.md`, copied by `scripts/agent-files.mjs` after `next build`.
- **API.** `GET /api/skills`, `GET /api/skills/{name}` (`../api/skills*.mjs` → `server/skills-api.mjs`) and `POST /api/ask`. Errors are always JSON `{ error, code, hint, docs }`; unknown `/api/*` paths get a JSON 404 from the middleware. The OpenAPI 3.1 spec is `server/openapi.mjs`, published at `/openapi.json`; `tests/api.test.mjs` checks every error code in it is real.
- **Discovery files.** `/llms.txt` (with when-to-use guidance), `/sitemap.xml`, `/robots.txt`, and JSON-LD (Organization, WebSite, SoftwareApplication) on the home page. Each page sets its own canonical URL and a `rel="alternate" type="text/markdown"` link.
- **CLI.** `agent-skills` ships in the npm package (`../bin/agent-skills.js`), documented at `/docs/cli`.

## How it fits together

- `next build` writes static HTML, CSS and JS to `out/`. Vercel builds it with the root `vercel.json`.
- Skills are read from `../skills/*/SKILL.md` at build time, so search and the skill pages always match the package.
- `/contribute` lists GitHub contributors fetched at build time; if GitHub is unreachable it links to the contributors graph instead.
- Icons come from Hugeicons, named by meaning in `src/components/Icon.tsx`. Their artwork (and the brand logos) is built into one sprite, `/icons.svg` (`src/lib/icon-data.ts`), so pages reference symbols instead of repeating path data.
- The adapter demo runs browser copies of the adapters (`src/lib/adapters.ts`). `npm run check:adapters` compares them with the real ones in `../src/index.js`.
- Design tokens (colors with dark values, fonts, radii, motion) are in `src/styles/tokens.stylex.ts`.
- The logo is a bookshelf with one book pulled out (`src/components/Logo.tsx`, `public/favicon.svg`). `public/og.png` is rendered from `scripts/og.html` (1200×630).
