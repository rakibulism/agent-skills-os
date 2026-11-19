import { llmsTxt } from '@/content/markdown';

// A map of the site for language models (https://llmstxt.org).
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
