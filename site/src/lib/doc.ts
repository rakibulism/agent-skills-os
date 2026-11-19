import type { Lang } from './highlight';
import { SITE } from './site';

/*
 * A page written once as data, rendered two ways: as HTML by components/DocPage.tsx and
 * as Markdown (for agents that send Accept: text/markdown) by toMarkdown() below.
 *
 * Inline text supports `code`, **bold** and [text](href). Relative hrefs become absolute
 * in the Markdown.
 */
export type Block =
  | { p: string }
  | { list: string[]; ordered?: boolean }
  | { code: string; lang: Lang; file: string }
  | { table: { head: string[]; rows: string[][] } }
  | { h3: string };

export type DocSection = { id: string; kicker?: string; title: string; lede?: string; blocks: Block[] };

export type Doc = {
  /** The page's URL path, e.g. "/docs/api". */
  path: string;
  /** <title> (before " · Agent Skills OS"). */
  metaTitle: string;
  description: string;
  kicker: string;
  title: string;
  lede: string;
  /** Shown under the title, e.g. "Last updated …". */
  note?: string;
  sections: DocSection[];
};

export const absolute = (href: string) => (href.startsWith('/') ? `${SITE.url}${href}` : href);

/** Rewrites relative Markdown links in inline text to absolute URLs. */
export const absoluteLinks = (text: string) => text.replace(/\]\((\/[^)]*)\)/g, (_, href: string) => `](${absolute(href)})`);

const fence = (code: string, lang: string) => {
  const ticks = code.includes('```') ? '````' : '```';
  return `${ticks}${lang === 'text' ? '' : lang}\n${code.trimEnd()}\n${ticks}`;
};

export function blockToMarkdown(b: Block): string {
  if ('p' in b) return absoluteLinks(b.p);
  if ('h3' in b) return `### ${b.h3}`;
  if ('list' in b) return b.list.map((item, i) => `${b.ordered ? `${i + 1}.` : '-'} ${absoluteLinks(item)}`).join('\n');
  if ('code' in b) return fence(b.code, b.lang);
  const cell = (c: string) => absoluteLinks(c).replace(/\|/g, '\\|');
  return [
    `| ${b.table.head.map(cell).join(' | ')} |`,
    `| ${b.table.head.map(() => '---').join(' | ')} |`,
    ...b.table.rows.map((r) => `| ${r.map(cell).join(' | ')} |`),
  ].join('\n');
}

export function toMarkdown(doc: Doc): string {
  const parts = [`# ${doc.title}`, absoluteLinks(doc.lede)];
  if (doc.note) parts.push(`_${doc.note}_`);
  for (const sec of doc.sections) {
    parts.push(`## ${sec.title}`);
    if (sec.lede) parts.push(absoluteLinks(sec.lede));
    for (const b of sec.blocks) parts.push(blockToMarkdown(b));
  }
  parts.push(`---\n\nPage: ${absolute(doc.path)} · Site guide for agents: ${SITE.url}/llms.txt`);
  return `${parts.join('\n\n')}\n`;
}

/** A static Markdown response for a route handler. */
export function markdownResponse(text: string) {
  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}

/** The shared social card (Next replaces, not merges, a page's openGraph). */
export const OG_IMAGE = { url: '/og.png', width: 1200, height: 630, alt: `${SITE.name}: find a skill, load it into any agent. ${SITE.install}` };

/** Per-page metadata: own canonical URL and a pointer to the Markdown twin. */
export function pageMetadata(path: string, title: string, description: string) {
  const md = path === '/' ? '/index.md' : `${path}.md`;
  // Titles that already name the product skip the " · Agent Skills OS" suffix.
  const full = title.includes(SITE.name) ? title : `${title} · ${SITE.name}`;
  return {
    title: { absolute: full },
    description,
    alternates: { canonical: path, types: { 'text/markdown': md } },
    openGraph: { url: path, type: 'website' as const, siteName: SITE.name, title: full, description, images: [OG_IMAGE] },
  };
}
