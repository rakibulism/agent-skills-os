import { SITE } from '@/lib/site';

export type Crumb = { name: string; path: string };

/**
 * BreadcrumbList structured data (schema.org) for an inner page, so search results can
 * show its place in the site. The trail mirrors the page's visible kicker ("Docs · API").
 */
export function BreadcrumbJsonLd({ trail }: { trail: Crumb[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: SITE.name, path: '/' }, ...trail].map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE.url}${c.path}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
