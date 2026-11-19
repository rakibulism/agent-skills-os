// `npm run dev`: Next dev server on 3310, plus the Ask AI endpoint on 3312.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { loadEnv, nodeToAsk } from './local-api.mjs';

loadEnv();
const WEB = 3310;
const API = 3312;

createServer((req, res) => {
  if (!req.url?.startsWith('/api/ask')) { res.writeHead(404).end(); return; }
  nodeToAsk(req, res, { indexUrl: `http://localhost:${WEB}/search-index.json`, cors: `http://localhost:${WEB}` })
    .catch((e) => { console.error(e); res.writeHead(500).end(); });
}).listen(API, () => {
  const mode = process.env.ASK_FAKE === '1' ? 'fake answers' : process.env.OPENROUTER_API_KEY ? `OpenRouter, ${process.env.OPENROUTER_MODEL || 'openrouter/auto'}` : 'no OPENROUTER_API_KEY: answers will say it is not set up';
  console.log(`Ask AI on http://localhost:${API}/api/ask (${mode})`);
});

const next = spawn('npx', ['next', 'dev', '-p', String(WEB)], {
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_ASK_ENDPOINT: `http://localhost:${API}/api/ask` },
});
next.on('exit', (code) => process.exit(code ?? 0));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => next.kill(sig));
