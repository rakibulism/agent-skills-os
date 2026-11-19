// Runs the Ask AI handler locally: loads .env.local, adapts Node requests to Web Requests,
// and offers a fake model (ASK_FAKE=1) so the UI can be tried without an OpenRouter key.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { handleAsk, rank } from '../server/ask.mjs';

export function loadEnv() {
  const file = fileURLToPath(new URL('../.env.local', import.meta.url));
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]] && m[2]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

/** A stand-in model: picks the top skill and answers in the endpoint's JSON shape. */
async function fakeComplete(messages) {
  const q = messages.at(-1).content.toLowerCase();
  const manager = ['pnpm', 'yarn', 'bun'].find((m) => q.includes(m)) ?? 'npm';
  const framework = ['langchain', 'openai', 'crewai', 'autogen', 'cursor'].find((f) => q.includes(f));
  const slug = messages[0].content.match(/- slug: (\S+)/)?.[1];
  const cards = [];
  if (/install|start|setup|set up|get/.test(q)) cards.push({ type: 'install', manager });
  if (slug) cards.push(framework
    ? { type: 'usage', framework: framework === 'crewai' || framework === 'autogen' ? 'python' : framework === 'cursor' ? 'files' : framework, skill: slug }
    : { type: 'skill', slug });
  await new Promise((r) => setTimeout(r, 700));
  return JSON.stringify({
    answer: `(Fake answer for local testing.) ${slug ? `The closest skill is ${slug}.` : 'No skill matches yet.'} ${cards.some((c) => c.type === 'install') ? `Install the package with ${manager} using the card below.` : ''}`.trim(),
    cards,
    followups: ['How do I use it with LangChain?', 'How do I install with pnpm?', 'How do I contribute a skill?'],
  });
}

export async function nodeToAsk(req, res, { indexUrl, cors } = {}) {
  const headers = { ...(cors ? { 'Access-Control-Allow-Origin': cors, 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } : {}) };
  if (req.method === 'OPTIONS') { res.writeHead(204, headers).end(); return; }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const url = `http://${req.headers.host}${req.url}`;
  const request = new Request(url, {
    method: req.method,
    headers: Object.fromEntries(Object.entries(req.headers).filter(([, v]) => typeof v === 'string')),
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
  });
  const response = await handleAsk(request, {
    indexUrl,
    complete: process.env.ASK_FAKE === '1' ? fakeComplete : undefined,
  });
  res.writeHead(response.status, { ...Object.fromEntries(response.headers), ...headers });
  res.end(Buffer.from(await response.arrayBuffer()));
}

export { rank };
