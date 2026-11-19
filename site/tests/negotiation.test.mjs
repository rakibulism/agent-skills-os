// Markdown content negotiation, Markdown 404s and /api routing (server/agent-routing.mjs,
// run on Vercel by ../../middleware.js).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { isKnownApi, markdownPath, negotiate, parseAccept, route } from '../server/agent-routing.mjs';

const ORIGIN = 'https://skills.rakibulism.space';
const MD_FILES = { '/index.md': '# Home\n', '/docs.md': '# Docs\n', '/skills/super-ui.md': '---\nname: super-ui\n---\n' };

/** A fetch that serves MD_FILES and 404s everything else, recording what was asked. */
function fakeFetch() {
  const calls = [];
  const fn = async (url) => {
    const path = new URL(url).pathname;
    calls.push(path);
    return path in MD_FILES ? new Response(MD_FILES[path], { status: 200 }) : new Response('nope', { status: 404 });
  };
  fn.calls = calls;
  return fn;
}

const req = (path, accept, method = 'GET') =>
  new Request(`${ORIGIN}${path}`, { method, headers: accept == null ? {} : { accept } });

test('parseAccept reads types and q-values', () => {
  assert.deepEqual(parseAccept('text/markdown, text/html;q=0.9, */*;q=0.1'), [
    { type: 'text', subtype: 'markdown', q: 1 },
    { type: 'text', subtype: 'html', q: 0.9 },
    { type: '*', subtype: '*', q: 0.1 },
  ]);
});

test('negotiate follows acceptmarkdown.com: q-values, specificity, default to HTML', () => {
  const cases = [
    ['text/markdown', 'text/markdown'],
    ['text/markdown, text/html;q=0.9', 'text/markdown'],
    ['text/html, text/markdown;q=0.5', 'text/html'],
    ['text/html;q=0.5, text/markdown;q=0.8', 'text/markdown'],
    ['*/*', 'text/html'],
    ['text/*', 'text/html'],
    ['text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'text/html'],
    ['application/json, text/markdown;q=0.3', 'text/markdown'],
    [null, 'text/html'],
    ['', 'text/html'],
    ['application/pdf', null],
    ['text/markdown;q=0', null],
    ['text/markdown;q=0, */*', 'text/html'],
  ];
  for (const [accept, expected] of cases) assert.equal(negotiate(accept), expected, `Accept: ${accept}`);
});

test('markdownPath maps pages to their .md twins', () => {
  assert.equal(markdownPath('/'), '/index.md');
  assert.equal(markdownPath('/docs'), '/docs.md');
  assert.equal(markdownPath('/docs/'), '/docs.md');
  assert.equal(markdownPath('/skills/super-ui'), '/skills/super-ui.md');
});

test('Accept: text/markdown on the homepage returns Markdown with Vary: Accept', async () => {
  const f = fakeFetch();
  const res = await route(req('/', 'text/markdown'), f);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.match(res.headers.get('vary'), /\bAccept\b/);
  assert.equal(await res.text(), MD_FILES['/index.md']);
  assert.deepEqual(f.calls, ['/index.md']);
});

test('Markdown responses link their .md URL but leave the llms.txt link to vercel.json', async () => {
  // vercel.json adds rel="describedby" to every page response; repeating it here sent it twice.
  const ok = await route(req('/docs', 'text/markdown'), fakeFetch());
  assert.equal(ok.headers.get('link'), `<${ORIGIN}/docs.md>; rel="alternate"; type="text/markdown"`);
  const missing = await route(req('/nope', 'text/markdown'), fakeFetch());
  assert.equal(missing.headers.get('link'), null);
  const vercel = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
  const pageRule = vercel.headers.find((h) => h.headers.some((x) => x.key === 'Link'));
  assert.ok(pageRule, 'vercel.json still sets the describedby link');
  assert.match(pageRule.headers.find((x) => x.key === 'Link').value, /llms\.txt>; rel="describedby"/);
});

test('HTML requests pass through untouched (the static page has Vary: Accept from vercel.json)', async () => {
  for (const accept of ['text/html', '*/*', null]) {
    assert.equal(await route(req('/', accept), fakeFetch()), undefined, `Accept: ${accept}`);
  }
});

test('inner pages and skills negotiate too', async () => {
  const res = await route(req('/skills/super-ui', 'text/markdown'), fakeFetch());
  assert.equal(res.status, 200);
  assert.match(await res.text(), /name: super-ui/);
});

test('an unknown page requested as Markdown is a 404 with a helpful Markdown body', async () => {
  const res = await route(req('/__ora-404-probe-fi82wnns', 'text/markdown'), fakeFetch());
  assert.equal(res.status, 404);
  assert.equal(res.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.match(res.headers.get('vary'), /Accept/);
  const body = await res.text();
  assert.ok(body.length >= 20);
  assert.match(body, /^# Page not found/);
  assert.match(body, /https:\/\/skills\.rakibulism\.space\/llms\.txt/);
  assert.match(body, /https:\/\/skills\.rakibulism\.space\/sitemap\.xml/);
});

test('unsupported types get 406 listing what is available', async () => {
  const res = await route(req('/docs', 'application/pdf'), fakeFetch());
  assert.equal(res.status, 406);
  assert.match(res.headers.get('vary'), /Accept/);
  const body = await res.text();
  assert.match(body, /text\/html/);
  assert.match(body, /text\/markdown/);
});

test('HEAD gets the Markdown headers without a body', async () => {
  const res = await route(req('/docs', 'text/markdown', 'HEAD'), fakeFetch());
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(await res.text(), '');
});

test('non-GET page requests are left alone', async () => {
  assert.equal(await route(req('/', 'text/markdown', 'POST'), fakeFetch()), undefined);
});

test('/api lists the endpoints as JSON', async () => {
  const res = await route(req('/api', '*/*'), fakeFetch());
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /^application\/json/);
  const body = await res.json();
  assert.deepEqual(body.endpoints.map((e) => e.operationId), ['listSkills', 'getSkill', 'askSkills']);
  assert.equal(body.openapi, `${ORIGIN}/openapi.json`);
});

test('known API routes pass through to their functions', async () => {
  for (const path of ['/api/ask', '/api/skills', '/api/skills/super-ui', '/api/skills/']) {
    assert.ok(isKnownApi(path), path);
    assert.equal(await route(req(path, 'application/json'), fakeFetch()), undefined, path);
  }
});

test('unknown API paths get a JSON 404 with code and hint', async () => {
  for (const path of ['/api/nope', '/api/skills/a/b', '/api/v1/skills']) {
    const res = await route(req(path, 'text/markdown'), fakeFetch());
    assert.equal(res.status, 404, path);
    assert.match(res.headers.get('content-type'), /^application\/json/);
    const body = await res.json();
    assert.equal(body.code, 'not_found');
    assert.ok(body.error && body.hint && body.docs);
  }
});
