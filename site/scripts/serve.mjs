// Serves the static export in out/ the way Vercel does (clean URLs), for a production preview.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, nodeToAsk } from './local-api.mjs';

loadEnv();

const root = fileURLToPath(new URL('../out/', import.meta.url));
const port = Number(process.env.PORT) || 3311;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
};

async function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  for (const candidate of [clean, `${clean}.html`, join(clean, 'index.html')]) {
    const file = join(root, candidate);
    if (!file.startsWith(root)) return null;
    try { if ((await stat(file)).isFile()) return file; } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  if (req.url?.startsWith('/api/ask')) {
    await nodeToAsk(req, res).catch((e) => { console.error(e); res.writeHead(500).end(); });
    return;
  }
  const file = (await resolve(req.url || '/')) ?? join(root, '404.html');
  try {
    const body = await readFile(file);
    const notFound = file.endsWith('404.html') && !req.url?.startsWith('/404');
    res.writeHead(notFound ? 404 : 200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(port, () => console.log(`Serving out/ and /api/ask at http://localhost:${port}`));
