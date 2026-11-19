import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { getSkills } from '@/lib/skills';

export const dynamic = 'force-static';

// Every indexable page. lastmod is the build time: the site is rebuilt on every change.
const PAGES: [string, number][] = [
  ['/', 1], ['/docs', 0.8], ['/docs/api', 0.8], ['/docs/cli', 0.7], ['/contribute', 0.6],
  ['/about', 0.5], ['/contact', 0.4], ['/privacy', 0.3],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    ...PAGES.map(([path, priority]) => ({ url: `${SITE.url}${path === '/' ? '/' : path}`, lastModified, changeFrequency: 'weekly' as const, priority })),
    ...getSkills().map((s) => ({ url: `${SITE.url}/skills/${s.slug}`, lastModified, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
