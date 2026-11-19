// The public API (server/skills-api.mjs, server/ask.mjs) and its OpenAPI description.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, test } from 'node:test';
import { handleAsk } from '../server/ask.mjs';
import { openapi } from '../server/openapi.mjs';
import { handleGetSkill, handleListSkills, search } from '../server/skills-api.mjs';

const ORIGIN = 'https://skills.rakibulism.space';
const SKILLS = [
  { slug: 'super-ui', name: 'super-ui', description: 'Polish a user interface.', version: '0.1.0', tags: ['design', 'ui'], excerpt: 'Review spacing and type.' },
  { slug: 'api-design', name: 'api-design', description: 'Design a REST API.', version: '1.0.0', tags: ['engineering', 'api'], excerpt: '' },
];
const FILES = { '/search-index.json': JSON.stringify({ skills: SKILLS }), '/skills/super-ui.md': '---\nname: super-ui\n---\n\nBody.\n' };

const realFetch = globalThis.fetch;
before(() => {
  globalThis.fetch = async (url) => {
    const path = new URL(url).pathname;
    return path in FILES ? new Response(FILES[path]) : new Response('missing', { status: 404 });
  };
});
after(() => { globalThis.fetch = realFetch; });

const get = (path, method = 'GET') => new Request(`${ORIGIN}${path}`, { method });

async function expectError(res, status, code) {
  assert.equal(res.status, status);
  assert.match(res.headers.get('content-type'), /^application\/json/);
  const body = await res.json();
  assert.equal(body.code, code);
  for (const k of ['error', 'hint', 'docs']) assert.equal(typeof body[k], 'string', k);
  return body;
}

test('listSkills returns every skill sorted by name', async () => {
  const res = await handleListSkills(get('/api/skills'));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
  const body = await res.json();
  assert.equal(body.query, null);
  assert.equal(body.total, 2);
  assert.deepEqual(body.skills.map((s) => s.name), ['api-design', 'super-ui']);
  assert.deepEqual(Object.keys(body.skills[0]).sort(), ['apiUrl', 'description', 'markdownUrl', 'name', 'tags', 'title', 'url', 'version']);
  assert.equal(body.skills[1].markdownUrl, `${ORIGIN}/skills/super-ui.md`);
});

test('listSkills searches and limits', async () => {
  const body = await (await handleListSkills(get('/api/skills?q=interface&limit=1'))).json();
  assert.equal(body.total, 1);
  assert.equal(body.skills[0].name, 'super-ui');
  assert.deepEqual(search(SKILLS, 'design rest').map((s) => s.slug), ['api-design']);
  assert.equal((await (await handleListSkills(get('/api/skills?q=nothing-matches'))).json()).total, 0);
});

test('listSkills rejects bad input with JSON errors', async () => {
  await expectError(await handleListSkills(get('/api/skills?limit=0')), 400, 'invalid_limit');
  await expectError(await handleListSkills(get('/api/skills?limit=abc')), 400, 'invalid_limit');
  await expectError(await handleListSkills(get(`/api/skills?q=${'a'.repeat(201)}`)), 400, 'query_too_long');
  const res = await handleListSkills(get('/api/skills', 'POST'));
  await expectError(res, 405, 'method_not_allowed');
  assert.match(res.headers.get('allow'), /GET/);
});

test('getSkill returns the skill and its SKILL.md', async () => {
  const res = await handleGetSkill(get('/api/skills/super-ui'));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.name, 'super-ui');
  assert.equal(body.markdown, FILES['/skills/super-ui.md']);
  assert.match(body.usage.claude, /forClaude\("super-ui"\)/);
  assert.equal(body.usage.cli, 'npx universal-agent-skills show super-ui');
});

test('getSkill errors are JSON', async () => {
  await expectError(await handleGetSkill(get('/api/skills/nope')), 404, 'skill_not_found');
  await expectError(await handleGetSkill(get('/api/skills/bad%20name')), 400, 'invalid_name');
  await expectError(await handleGetSkill(get('/api/skills/api-design')), 503, 'skill_file_unavailable');
  await expectError(await handleGetSkill(get('/api/skills/super-ui', 'DELETE')), 405, 'method_not_allowed');
});

test('OPTIONS answers CORS preflight', async () => {
  const res = await handleListSkills(get('/api/skills', 'OPTIONS'));
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
});

test('askSkills errors are JSON with code and hint', async () => {
  await expectError(await handleAsk(get('/api/ask')), 405, 'method_not_allowed');
  const post = (body) => new Request(`${ORIGIN}/api/ask`, { method: 'POST', body, headers: { 'x-forwarded-for': `10.0.0.${Math.random()}` } });
  await expectError(await handleAsk(post('{}'), { apiKey: 'test' }), 400, 'missing_question');
  const saved = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  await expectError(await handleAsk(post('{"question":"hi"}')), 503, 'not_configured');
  if (saved) process.env.OPENROUTER_API_KEY = saved;
});

test('askSkills answers in the documented shape', async () => {
  const req = new Request(`${ORIGIN}/api/ask`, { method: 'POST', body: JSON.stringify({ question: 'which skill polishes ui?' }), headers: { 'x-forwarded-for': '10.1.1.1' } });
  const res = await handleAsk(req, { complete: async () => JSON.stringify({ answer: 'Use super-ui.', cards: [{ type: 'skill', slug: 'super-ui' }], followups: ['Next?'] }) });
  assert.equal(res.status, 200);
  const body = await res.json();
  for (const k of openapi.components.schemas.AskResponse.required) assert.ok(k in body, k);
});

test('the OpenAPI spec is self-describing and function-calling ready', () => {
  assert.equal(openapi.openapi, '3.1.0');
  assert.deepEqual(openapi.security, []);
  assert.ok(openapi.servers[0].url.startsWith('https://'));
  const ops = Object.entries(openapi.paths).flatMap(([path, item]) => Object.entries(item).map(([method, op]) => ({ path, method, op })));
  const ids = ops.map((o) => o.op.operationId);
  assert.equal(new Set(ids).size, ids.length, 'operationIds are unique');
  assert.deepEqual(ids.sort(), ['askSkills', 'getSkill', 'listSkills']);
  for (const { path, op } of ops) {
    assert.match(op.operationId, /^[a-zA-Z][a-zA-Z0-9]*$/);
    assert.ok(op.summary && op.description, `${path} has summary and description`);
    for (const p of op.parameters ?? []) assert.ok(p.description && p.schema?.type, `${path} ${p.name} is typed and described`);
    for (const [status, r] of Object.entries(op.responses)) {
      assert.ok(r.description, `${path} ${status} described`);
      assert.ok(r.content?.['application/json']?.schema, `${path} ${status} has a JSON schema`);
    }
  }
});

test('every error code in the spec is produced by the server code, and vice versa', () => {
  const documented = new Set(openapi.components.schemas.Error.properties.code.enum);
  const src = ['skills-api.mjs', 'ask.mjs', 'agent-routing.mjs']
    .map((f) => readFileSync(new URL(`../server/${f}`, import.meta.url), 'utf8'))
    .join('\n');
  const used = new Set([...src.matchAll(/jsonError\(\s*[^,]+,\s*'([a-z_]+)'/g)].map((m) => m[1]));
  used.add('ai_busy').add('ai_unavailable'); // chosen at runtime in ask.mjs
  for (const code of used) assert.ok(documented.has(code), `${code} is documented`);
  for (const code of documented) assert.ok(used.has(code), `${code} is used`);
});
