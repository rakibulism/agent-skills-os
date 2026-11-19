import { contributeMarkdown } from '@/content/markdown';
import { markdownResponse } from '@/lib/doc';

// The contribute page as Markdown, served to agents that send Accept: text/markdown.
export const dynamic = 'force-static';

export function GET() {
  return markdownResponse(contributeMarkdown());
}
