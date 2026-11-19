// Vercel Routing Middleware for the static site: Markdown for agents that ask for it
// (Accept: text/markdown), Markdown 404s, and JSON 404s under /api. The logic lives in
// site/server/agent-routing.mjs, which the local preview server runs too.
import { route } from './site/server/agent-routing.mjs';

export const config = {
  // Pages and /api only: skip Next's assets and any path with a file extension.
  matcher: ['/((?!_next/)(?!.*\\.[A-Za-z0-9]+$).*)'],
};

export default function middleware(request) {
  return route(request);
}
