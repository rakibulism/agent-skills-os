// Request routing for agents, run by the Vercel Routing Middleware (../../middleware.js)
// and by the local preview server, so both behave the same.
//
// - Markdown content negotiation (https://acceptmarkdown.com): every page has a Markdown
//   twin at <path>.md (index.md for "/"). A request whose Accept header prefers
//   text/markdown gets that twin with Content-Type: text/markdown and Vary: Accept.
// - Unknown pages requested as Markdown get a 404 with a Markdown body.
// - Unknown /api/* paths get a JSON 404 instead of an HTML page.

import { jsonError, json } from './http.mjs';

export const SITE_URL = 'https://skills.rakibulism.space';
const PRODUCES = ['text/html', 'text/markdown']; // The first one is the default.
const MARKDOWN = 'text/markdown; charset=utf-8';

/** Parses an Accept header into entries with q-values (RFC 9110 §12.5.1). */
export function parseAccept(header) {
  return String(header)
    .split(',')
    .map((part) => {
      const [range, ...params] = part.trim().split(';');
      const [type = '', subtype = ''] = range.trim().toLowerCase().split('/');
      let q = 1;
      for (const p of params) {
        const [k, v] = p.trim().split('=');
        if (k?.trim().toLowerCase() === 'q') {
          const n = Number(v);
          q = Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 1;
        }
      }
      return { type, subtype, q };
    })
    .filter((e) => e.type && e.subtype);
}

/**
 * Picks the representation to send: 'text/html', 'text/markdown', or null for 406.
 * For each type we can produce, the most specific matching Accept entry gives its score
 * (exact > type/* > *\/*); the highest score wins, ties go to the default (HTML).
 */
export function negotiate(header) {
  if (header == null || !String(header).trim()) return PRODUCES[0];
  const entries = parseAccept(header);
  if (!entries.length) return PRODUCES[0];
  let best = null;
  let bestQ = 0;
  for (const produced of PRODUCES) {
    const [type, subtype] = produced.split('/');
    const match =
      entries.find((e) => e.type === type && e.subtype === subtype) ??
      entries.find((e) => e.type === type && e.subtype === '*') ??
      entries.find((e) => e.type === '*' && e.subtype === '*');
    const q = match ? match.q : 0;
    if (q > bestQ) { best = produced; bestQ = q; }
  }
  return best;
}

/** The Markdown twin of a page path. */
export function markdownPath(pathname) {
  const clean = pathname.replace(/\/+$/, '');
  return clean === '' || clean === '/index' ? '/index.md' : `${clean}.md`;
}

const KNOWN_API = [/^\/api\/ask$/, /^\/api\/skills$/, /^\/api\/skills\/[^/]+$/];
export const isKnownApi = (pathname) => KNOWN_API.some((r) => r.test(pathname.replace(/\/+$/, '')));

const API_INDEX = {
  name: 'Agent Skills OS API',
  description: 'Search the Agent Skills OS library, read any skill as Markdown, and ask which skill fits a task.',
  openapi: `${SITE_URL}/openapi.json`,
  docs: `${SITE_URL}/docs/api`,
  endpoints: [
    { method: 'GET', path: '/api/skills', operationId: 'listSkills', description: 'List or search skills.' },
    { method: 'GET', path: '/api/skills/{name}', operationId: 'getSkill', description: 'One skill with its SKILL.md.' },
    { method: 'POST', path: '/api/ask', operationId: 'askSkills', description: 'Ask which skill fits a task.' },
  ],
};

// The rel="describedby" link to llms.txt isn't set here: vercel.json adds it to every page
// response, these included, so setting it here too would send it twice.
function markdownHeaders(extra = {}) {
  return {
    'Content-Type': MARKDOWN,
    Vary: 'Accept',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    ...extra,
  };
}

export function notFoundMarkdown(pathname) {
  return `# Page not found

There is no page at \`${pathname}\` on Agent Skills OS, the open library of agent skills.

- Home: ${SITE_URL}/
- Search skills (JSON): ${SITE_URL}/api/skills?q=your+task
- Docs: ${SITE_URL}/docs
- API reference: ${SITE_URL}/docs/api
- Site guide for agents: ${SITE_URL}/llms.txt
- Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function notAcceptable(accept, method) {
  const body = `This resource is available in:\n- text/html\n- text/markdown\n\nYou requested: ${accept}\n`;
  return new Response(method === 'HEAD' ? null : body, {
    status: 406,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', Vary: 'Accept', 'Cache-Control': 'no-store' },
  });
}

/** Headers worth passing on when fetching the Markdown twin (preview-deploy protection). */
function forwardHeaders(request) {
  const out = {};
  for (const h of ['cookie', 'authorization', 'x-vercel-protection-bypass']) {
    const v = request.headers.get(h);
    if (v) out[h] = v;
  }
  return out;
}

/**
 * Returns a Response to send, or undefined to let the request continue to the static
 * site or the API functions unchanged.
 * @param {Request} request
 * @param {typeof fetch} fetchImpl
 */
export async function route(request, fetchImpl = fetch) {
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method.toUpperCase();

  if (pathname === '/api' || pathname === '/api/') {
    if (method !== 'GET' && method !== 'HEAD') {
      return jsonError(405, 'method_not_allowed', `${method} is not supported on /api.`, 'Use GET.', { Allow: 'GET, HEAD' });
    }
    return json(API_INDEX, 200, { 'Access-Control-Allow-Origin': '*' });
  }
  if (pathname.startsWith('/api/')) {
    if (isKnownApi(pathname)) return undefined;
    return jsonError(404, 'not_found', `There is no API endpoint at ${pathname}.`, 'See /openapi.json for every endpoint, or GET /api/skills to list skills.');
  }

  if (method !== 'GET' && method !== 'HEAD') return undefined;
  const accept = request.headers.get('accept');
  const choice = negotiate(accept);
  if (choice === 'text/html') return undefined;
  if (choice === null) return notAcceptable(accept, method);

  const md = markdownPath(pathname);
  let res;
  try {
    res = await fetchImpl(new URL(md, url), { headers: forwardHeaders(request) });
  } catch {
    res = null;
  }
  if (res?.ok) {
    const body = await res.text();
    return new Response(method === 'HEAD' ? null : body, {
      status: 200,
      headers: markdownHeaders({ Link: `<${SITE_URL}${md}>; rel="alternate"; type="text/markdown"` }),
    });
  }
  if (res && res.status === 404) {
    return new Response(method === 'HEAD' ? null : notFoundMarkdown(pathname), {
      status: 404,
      headers: markdownHeaders({ 'Cache-Control': 'no-store' }),
    });
  }
  return undefined;
}
