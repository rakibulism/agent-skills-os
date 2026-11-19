// Vercel Function: POST /api/ask. The site itself is static; this is its only server code.
// Needs OPENROUTER_API_KEY (and optionally OPENROUTER_MODEL) in the Vercel project's environment.
import { handleAsk } from '../site/server/ask.mjs';

export const config = { maxDuration: 30 };

export function POST(request) {
  return handleAsk(request);
}

export function GET(request) {
  return handleAsk(request);
}
