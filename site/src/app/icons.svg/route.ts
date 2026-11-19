import { sprite } from '@/lib/icon-data';

// Written once at build time to out/icons.svg; every page's icons <use> its symbols.
export const dynamic = 'force-static';

export function GET() {
  return new Response(sprite(), { headers: { 'Content-Type': 'image/svg+xml' } });
}
