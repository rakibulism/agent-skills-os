import { getSkills } from '@/lib/skills';

// Written to out/search-index.json at build time. The ask endpoint reads it to ground answers.
export const dynamic = 'force-static';

export function GET() {
  const skills = getSkills().map((s) => ({
    slug: s.slug,
    name: s.name,
    description: s.description,
    version: s.version,
    tags: s.tags,
    category: s.category,
    // The instructions, without frontmatter, trimmed: enough for the model to judge relevance.
    excerpt: s.raw.replace(/^---\n[\s\S]*?\n---\n?/, '').trim().slice(0, 1200),
  }));
  return Response.json({ generatedAt: new Date().toISOString(), skills });
}
