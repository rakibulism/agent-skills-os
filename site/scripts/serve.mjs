// Serves the static export in out/ the way Vercel does: clean URLs, the routing middleware
// (../../middleware.js → server/agent-routing.mjs), the API functions, and the same headers.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { route } from '../server/agent-routing.mjs';
import { apiHandler, loadEnv, send, toRequest } from './local-api.mjs';

loadEnv();

const root = fileURLToPath(new URL('../out/', import.meta.url));
const port = Number(process.env.PORT) || 3311;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.md': 'text/markdown; charset=utf-8', '.xml': 'application/xml',
};

// Mirrors the middleware matcher: pages and /api, not _next or files with an extension.
const middlewareRuns = (path) => !path.startsWith('/_next/') && !/\.[A-Za-z0-9]+$/.test(path);

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
  try {
    const request = await toRequest(req);
    const { pathname } = new URL(request.url);

    if (middlewareRuns(pathname)) {
      const early = await route(request, fetch);
      if (early) return send(res, early);
    }
    const api = apiHandler(pathname, { indexUrl: `http://localhost:${port}/search-index.json` });
    if (api) return send(res, await api(request));

    const file = (await resolve(pathname)) ?? join(root, '404.html');
    const body = await readFile(file);
    const notFound = file.endsWith('404.html') && !pathname.startsWith('/404');
    const page = /^[^.]*$/.test(pathname) && !pathname.startsWith('/_next/');
    res.writeHead(notFound ? 404 : 200, {
      'Content-Type': types[extname(file)] ?? 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      ...(page ? { Vary: 'Accept', Link: '<https://skills.rakibulism.space/llms.txt>; rel="describedby"' } : {}),
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.writeHead(500).end();
  }
}).listen(port, () => console.log(`Serving out/, the middleware and /api/* at http://localhost:${port}`));
