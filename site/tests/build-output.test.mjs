// Checks the built site in out/ (run `npm run build` first; `npm run check` does both):
// Markdown twins, metadata, structured data, machine-readable files and how much of each
// page is real content without JavaScript.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { openapi } from '../server/openapi.mjs';

const OUT = fileURLToPath(new URL('../out/', import.meta.url));
const SITE = 'https://skills.rakibulism.space';
const read = (p) => readFileSync(join(OUT, p), 'utf8');

if (!existsSync(join(OUT, 'index.html'))) throw new Error('out/ is missing: run `npm run build` before these tests.');

/** Every page: out/**.html except the 404s, as [file, urlPath]. */
function pages(dir = OUT) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = join(dir, d.name);
    if (d.isDirectory()) return d.name.startsWith('_') ? [] : pages(p);
    if (!d.name.endsWith('.html') || /^(404|_not-found)\.html$/.test(d.name)) return [];
    const rel = relative(OUT, p).replace(/\.html$/, '');
    return [[p, rel === 'index' ? '/' : `/${rel}`]];
  });
}

const textOf = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const mainOf = (html) => html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? '';
const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

const ALL = pages();

test('the expected pages exist', () => {
  const paths = ALL.map(([, p]) => p);
  for (const p of ['/', '/docs', '/docs/api', '/docs/cli', '/contribute', '/about', '/contact', '/privacy', '/skills/super-ui']) {
    assert.ok(paths.includes(p), p);
  }
});

test('every page has a non-empty Markdown twin', () => {
  for (const [, path] of ALL) {
    const md = path === '/' ? 'index.md' : `${path.slice(1)}.md`;
    assert.ok(existsSync(join(OUT, md)), `${md} exists`);
    const body = read(md);
    assert.ok(body.trim().length > 100, `${md} has content`);
    assert.match(body, /^(# |---\n)/, `${md} starts with a title or front matter`);
  }
});

test('every page has lang, its own canonical URL on this domain, og:type, og:image and a Markdown alternate', () => {
  for (const [file, path] of ALL) {
    const html = readFileSync(file, 'utf8');
    assert.match(html, /<html lang="en"/, path);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(canonical, path === '/' ? SITE : `${SITE}${path}`, `${path} canonical`);
    assert.match(html, /<meta property="og:type" content="website"/, `${path} og:type`);
    assert.match(html, new RegExp(`<meta property="og:image" content="${SITE}/og.png"`), `${path} og:image`);
    assert.match(html, /<link rel="alternate" type="text\/markdown" href="https:\/\/skills\.rakibulism\.space\/[^"]+\.md"/, `${path} markdown alternate`);
  }
});

test('the home page has enough real content in raw HTML', () => {
  const html = read('index.html');
  const main = mainOf(html);
  const text = textOf(main);
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, 'one H1');
  assert.ok(text.length >= 500, `main text is ${text.length} chars`);
  const ratio = text.length / main.length;
  assert.ok(ratio >= 0.05, `content ratio ${(ratio * 100).toFixed(1)}% is at least 5%`);
});

test('headings never skip a level', () => {
  for (const [file, path] of ALL) {
    const levels = [...readFileSync(file, 'utf8').matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    assert.equal(levels[0], 1, `${path} starts with h1`);
    for (let i = 1; i < levels.length; i++) assert.ok(levels[i] <= levels[i - 1] + 1, `${path}: h${levels[i - 1]} → h${levels[i]}`);
  }
});

test('trust pages have at least 500 characters of content each', () => {
  for (const page of ['about', 'contact', 'privacy']) {
    const text = textOf(mainOf(read(`${page}.html`)));
    assert.ok(text.length >= 500, `${page}: ${text.length} chars`);
  }
  const contact = textOf(mainOf(read('contact.html')));
  assert.match(contact, /40rakib70@gmail\.com/);
  assert.match(contact, /Khulna/);
});

test('home JSON-LD names the Organization (contact point, address) and the SoftwareApplication', () => {
  const graph = jsonLd(read('index.html')).flatMap((d) => d['@graph'] ?? [d]);
  const org = graph.find((n) => n['@type'] === 'Organization');
  assert.ok(org, 'Organization');
  assert.equal(org.url, `${SITE}/`);
  assert.equal(org.contactPoint['@type'], 'ContactPoint');
  assert.ok(org.contactPoint.email && org.contactPoint.contactType);
  assert.equal(org.address['@type'], 'PostalAddress');
  assert.ok(org.address.addressLocality && org.address.addressCountry);
  const app = graph.find((n) => n['@type'] === 'SoftwareApplication');
  assert.ok(app, 'SoftwareApplication');
  for (const k of ['name', 'description', 'url', 'applicationCategory', 'offers', 'author', 'keywords']) assert.ok(app[k], k);
  const site = graph.find((n) => n['@type'] === 'WebSite');
  assert.equal(site.potentialAction['@type'], 'SearchAction');
  // The product terms are visible on the page, not only in metadata.
  const visible = textOf(read('index.html')).toLowerCase();
  for (const term of ['agent skills', 'skill.md', 'universal-agent-skills', 'agents.md']) assert.ok(visible.includes(term), term);
});

test('no page still points at the old vercel.app address', () => {
  for (const [file, path] of ALL) assert.doesNotMatch(readFileSync(file, 'utf8'), /agent-skills-os\.vercel\.app/, path);
});

test('sitemap.xml lists every page with lastmod', () => {
  const xml = read('sitemap.xml');
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
  const locs = urls.map((u) => u.match(/<loc>([^<]+)<\/loc>/)[1]);
  for (const u of urls) assert.match(u, /<lastmod>\d{4}-\d{2}-\d{2}T/);
  for (const [, path] of ALL) assert.ok(locs.includes(path === '/' ? `${SITE}/` : `${SITE}${path}`), `${path} in sitemap`);
  assert.match(read('robots.txt'), /^Sitemap: https:\/\/skills\.rakibulism\.space\/sitemap\.xml$/m);
});

test('llms.txt follows llmstxt.org and says when to use the site', () => {
  const txt = read('llms.txt');
  const lines = txt.split('\n');
  assert.match(lines[0], /^# Agent Skills OS$/);
  assert.match(lines[2], /^> .+/);
  const firstH2 = lines.findIndex((l) => l.startsWith('## '));
  const preamble = lines.slice(1, firstH2).join('\n');
  assert.doesNotMatch(preamble, /^#/m, 'no headings before the H2 file lists');
  assert.match(preamble, /When to use Agent Skills OS/);
  assert.match(preamble, /\/api\/skills\?q=/);
  const sections = txt.split(/^## /m).slice(1);
  assert.ok(sections.some((s) => s.startsWith('Optional')), 'has an Optional section');
  for (const s of sections) {
    const items = s.split('\n').slice(1).filter((l) => l.trim());
    for (const item of items) assert.match(item, /^- \[[^\]]+\]\(https?:\/\/[^)]+\)(: .+)?$/, item);
  }
});

test('openapi.json is the spec from server/openapi.mjs', () => {
  assert.deepEqual(JSON.parse(read('openapi.json')), JSON.parse(JSON.stringify(openapi)));
});

test('the icon sprite has every symbol the pages use', () => {
  const sprite = read('icons.svg');
  const ids = new Set([...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]));
  for (const [file, path] of ALL) {
    for (const m of readFileSync(file, 'utf8').matchAll(/<use href="\/icons\.svg#([^"]+)"/g)) assert.ok(ids.has(m[1]), `${path} uses #${m[1]}`);
  }
});

test('inner pages carry BreadcrumbList data ending at the page itself', () => {
  for (const [file, path] of ALL) {
    if (path === '/') continue;
    const crumbs = jsonLd(readFileSync(file, 'utf8')).find((d) => d['@type'] === 'BreadcrumbList');
    assert.ok(crumbs, `${path} has a BreadcrumbList`);
    const items = crumbs.itemListElement;
    assert.equal(items[0].item, `${SITE}/`, `${path} starts at home`);
    assert.equal(items.at(-1).item, `${SITE}${path}`, `${path} ends at itself`);
    items.forEach((it, i) => {
      assert.equal(it.position, i + 1);
      assert.ok(it.name);
    });
  }
});

test('sitemap lastmod comes from git, not the build clock', () => {
  const xml = read('sitemap.xml');
  const git = execFileSync('git', ['log', '-1', '--format=%cI', '--', 'skills/super-ui'], { cwd: join(OUT, '..', '..'), encoding: 'utf8' }).trim();
  const entry = xml.match(/<loc>https:\/\/skills\.rakibulism\.space\/skills\/super-ui<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/);
  assert.ok(entry, 'skill entry has lastmod');
  assert.equal(new Date(entry[1]).getTime(), new Date(git).getTime());
});

test('vercel.json gives every Markdown copy a canonical Link to its HTML page', () => {
  const vercel = JSON.parse(readFileSync(join(OUT, '..', '..', 'vercel.json'), 'utf8'));
  const rules = vercel.headers
    .map((h) => ({ h, link: h.headers.find((x) => x.key === 'Link' && /rel="canonical"/.test(x.value)) }))
    .filter((r) => r.link);
  // path-to-regexp, as Vercel compiles these two sources.
  const toRegex = (src) => new RegExp(`^${src.replace(':path(', '(').replace(/\\\\/g, '\\')}$`);
  const mdFiles = ALL.map(([, path]) => (path === '/' ? '/index.md' : `${path}.md`));
  for (const md of mdFiles) {
    const hits = rules.filter((r) => toRegex(r.h.source).test(md));
    assert.equal(hits.length, 1, `${md} matches exactly one canonical rule`);
    const m = toRegex(hits[0].h.source).exec(md);
    const href = hits[0].link.value.replace(':path', m[1] ?? '').match(/<([^>]+)>/)[1];
    assert.equal(href, md === '/index.md' ? `${SITE}/` : `${SITE}${md.slice(0, -3)}`, md);
  }
});
