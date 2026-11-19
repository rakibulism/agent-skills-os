// The public read API: GET /api/skills and GET /api/skills/{name}.
// Shared by the Vercel Functions (../../api/skills*.mjs) and the local preview server.
// Data comes from the site's own static files (/search-index.json and /skills/<name>.md),
// so the API can never disagree with the pages.

import { loadIndex } from './ask.mjs';
import { json, jsonError } from './http.mjs';

const SITE_URL = 'https://skills.rakibulism.space';
const PKG = 'universal-agent-skills';
const MAX_QUERY = 200;
const MAX_LIMIT = 100;
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const CACHE = { 'Cache-Control': 'public, max-age=60, s-maxage=300' };

function summary(s) {
  return {
    name: s.slug,
    title: s.name,
    description: s.description,
    version: s.version || null,
    tags: s.tags ?? [],
    url: `${SITE_URL}/skills/${s.slug}`,
    markdownUrl: `${SITE_URL}/skills/${s.slug}.md`,
    apiUrl: `${SITE_URL}/api/skills/${s.slug}`,
  };
}

/** Matching skills, best first; every query word must appear somewhere in the skill. */
export function search(skills, query) {
  const tokens = query.toLowerCase().split(/[^a-z0-9.+#-]+/).filter((t) => t.length > 1);
  if (!tokens.length) return [...skills].sort((a, b) => a.name.localeCompare(b.name));
  return skills
    .map((s) => {
      const name = s.name.toLowerCase();
      const tags = s.tags ?? [];
      const hay = [name, s.description, ...tags, s.excerpt ?? ''].join(' ').toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (!hay.includes(t)) return null;
        score += name.includes(t) ? 4 : tags.some((tag) => tag.startsWith(t)) ? 2 : 1;
      }
      return { s, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.s.name.localeCompare(b.s.name))
    .map((x) => x.s);
}

function preflight(request, allow) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return jsonError(405, 'method_not_allowed', `${request.method} is not supported here.`, `Use ${allow}.`, { ...CORS, Allow: `${allow}, HEAD, OPTIONS` });
  }
  return null;
}

async function index(request, opts) {
  return loadIndex(opts.indexUrl ?? process.env.SKILLS_INDEX_URL ?? new URL('/search-index.json', request.url).href);
}

/**
 * GET /api/skills?q=&limit=
 * @param {Request} request
 * @param {{ indexUrl?: string }} opts
 */
export async function handleListSkills(request, opts = {}) {
  const early = preflight(request, 'GET');
  if (early) return early;

  const params = new URL(request.url).searchParams;
  const query = (params.get('q') ?? '').trim();
  if (query.length > MAX_QUERY) {
    return jsonError(400, 'query_too_long', `The q parameter is longer than ${MAX_QUERY} characters.`, 'Search with a few keywords, like q=accessibility.', CORS);
  }
  let limit = MAX_LIMIT;
  if (params.has('limit')) {
    limit = Number(params.get('limit'));
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      return jsonError(400, 'invalid_limit', 'limit must be a whole number from 1 to 100.', 'Leave limit out to get up to 100 skills.', CORS);
    }
  }

  let skills;
  try {
    skills = await index(request, opts);
  } catch {
    return jsonError(503, 'index_unavailable', 'The skills index is unavailable.', 'Try again shortly.', CORS);
  }
  const matches = search(skills, query);
  const body = { query: query || null, total: matches.length, count: Math.min(limit, matches.length), skills: matches.slice(0, limit).map(summary) };
  return json(request.method === 'HEAD' ? {} : body, 200, { ...CORS, ...CACHE });
}

/**
 * GET /api/skills/{name}
 * @param {Request} request
 * @param {{ indexUrl?: string, fetch?: typeof fetch }} opts
 */
export async function handleGetSkill(request, opts = {}) {
  const early = preflight(request, 'GET');
  if (early) return early;

  const url = new URL(request.url);
  const name = decodeURIComponent(url.pathname.replace(/\/+$/, '').split('/').pop() ?? '').toLowerCase();
  if (!SLUG.test(name)) {
    return jsonError(400, 'invalid_name', `"${name.slice(0, 80)}" is not a valid skill name.`, 'Skill names are lowercase letters, digits and hyphens, like super-ui. GET /api/skills lists them.', CORS);
  }

  let skills;
  try {
    skills = await index(request, opts);
  } catch {
    return jsonError(503, 'index_unavailable', 'The skills index is unavailable.', 'Try again shortly.', CORS);
  }
  const skill = skills.find((s) => s.slug === name);
  if (!skill) {
    return jsonError(404, 'skill_not_found', `There is no skill named "${name}".`, 'GET /api/skills?q=<keywords> to find the right name.', CORS);
  }

  let markdown = null;
  try {
    const res = await (opts.fetch ?? fetch)(new URL(`/skills/${name}.md`, url), { signal: AbortSignal.timeout(5000) });
    if (res.ok) markdown = await res.text();
  } catch {}
  if (markdown == null) {
    return jsonError(503, 'skill_file_unavailable', `The SKILL.md for "${name}" could not be read.`, `Try again shortly, or read it at ${SITE_URL}/skills/${name}.md.`, CORS);
  }

  const body = {
    ...summary(skill),
    markdown,
    usage: {
      install: `npm install ${PKG}`,
      claude: `import { forClaude } from "${PKG}";\nconst { systemPrompt } = forClaude("${name}");`,
      cli: `npx ${PKG} show ${name}`,
    },
    sourceUrl: `https://github.com/rakibulism/agent-skills-os/tree/main/skills/${name}`,
  };
  return json(request.method === 'HEAD' ? {} : body, 200, { ...CORS, ...CACHE });
}
