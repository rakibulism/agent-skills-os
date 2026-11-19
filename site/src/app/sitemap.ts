import type { MetadataRoute } from 'next';
import { lastModified } from '@/lib/lastmod';
import { SITE } from '@/lib/site';
import { getSkills } from '@/lib/skills';

export const dynamic = 'force-static';

const APP = 'site/src/app';
const CONTENT = 'site/src/content';

// Every indexable page, with the source files whose last commit is its <lastmod>.
const PAGES: { path: string; priority: number; sources: string[] }[] = [
  { path: '/', priority: 1, sources: [`${APP}/page.tsx`, `${CONTENT}/home.ts`, 'skills'] },
  { path: '/docs', priority: 0.8, sources: [`${APP}/docs/page.tsx`, 'site/src/lib/snippets.ts', 'site/src/lib/adapters.ts'] },
  { path: '/docs/api', priority: 0.8, sources: [`${APP}/docs/api`, `${CONTENT}/tools.ts`] },
  { path: '/docs/cli', priority: 0.7, sources: [`${APP}/docs/cli`, `${CONTENT}/tools.ts`] },
  { path: '/contribute', priority: 0.6, sources: [`${APP}/contribute`, `${CONTENT}/contribute.ts`] },
  { path: '/about', priority: 0.5, sources: [`${APP}/about`, `${CONTENT}/trust.ts`] },
  { path: '/contact', priority: 0.4, sources: [`${APP}/contact`, `${CONTENT}/trust.ts`] },
  { path: '/privacy', priority: 0.3, sources: [`${APP}/privacy`, `${CONTENT}/trust.ts`] },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((p) => ({
      url: `${SITE.url}${p.path}`,
      lastModified: lastModified(p.sources),
      changeFrequency: 'weekly' as const,
      priority: p.priority,
    })),
    ...getSkills().map((s) => ({
      url: `${SITE.url}/skills/${s.slug}`,
      lastModified: lastModified([`skills/${s.slug}`]),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
