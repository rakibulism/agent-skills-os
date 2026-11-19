import { PRIVACY } from '@/content/trust';
import { markdownResponse, toMarkdown } from '@/lib/doc';

// The Markdown twin of the page, served to agents that send Accept: text/markdown.
export const dynamic = 'force-static';

export function GET() {
  return markdownResponse(toMarkdown(PRIVACY));
}
