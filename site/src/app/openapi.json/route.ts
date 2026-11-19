// Plain ESM shared with the API functions (allowJs gives it types).
import { openapi } from '../../../server/openapi.mjs';

// The OpenAPI 3.1 description of /api/*, written to out/openapi.json at build time.
export const dynamic = 'force-static';

export function GET() {
  return Response.json(openapi);
}
