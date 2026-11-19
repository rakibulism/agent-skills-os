// Vercel Function: POST /api/ask. The site itself is static; the API lives in api/.
// Needs OPENROUTER_API_KEY (and optionally OPENROUTER_MODEL) in the Vercel project's environment.
import { handleAsk } from '../site/server/ask.mjs';

export const config = { maxDuration: 30 };

export function POST(request) {
  return handleAsk(request);
}

export function GET(request) {
  return handleAsk(request);
}

// Every other method gets the endpoint's JSON 405 rather than the platform's plain-text one.
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
export const HEAD = GET;
export const OPTIONS = GET;
