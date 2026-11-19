import 'server-only';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE } from './site';

/*
 * Reads the package's skills/ folder at build time, so the site can never drift
 * from the repo. Mirrors the loader in ../../src/index.js for the fields shown here.
 */
export type SkillInput = { name: string; description: string; required: boolean };

export type Skill = {
  /** Folder name; also the URL slug and the name passed to the adapters. */
  slug: string;
  name: string;
  description: string;
  version: string;
  tags: string[];
  category: string;
  author: string | null;
  authorUrl: string | null;
  related: string[];
  inputs: SkillInput[];
  /** The whole SKILL.md, as written. */
  raw: string;
  hasReferences: boolean;
  /** An example from site/demo-skills: shown on the site, never in the npm package. */
  demo: boolean;
  sourceUrl: string;
  editUrl: string;
};

/** What the browser needs for search: no file bodies. */
export type SkillSummary = Pick<Skill, 'slug' | 'name' | 'description' | 'version' | 'tags' | 'category' | 'demo'>;

const SKILLS_DIR = join(process.cwd(), '..', 'skills');
const DEMO_DIR = join(process.cwd(), 'demo-skills');

/**
 * Demo skills fill the site out for previews. On by default, off in Vercel production;
 * SKILLS_DEMO=1 or SKILLS_DEMO=0 overrides either way.
 */
export const DEMO_ENABLED = process.env.SKILLS_DEMO
  ? process.env.SKILLS_DEMO === '1'
  : process.env.VERCEL_ENV !== 'production';

const CATEGORY_BY_TAG: Record<string, string> = {
  design: 'Design', ui: 'Design', ux: 'Design', accessibility: 'Design',
  engineering: 'Engineering', testing: 'Engineering', 'code-review': 'Engineering',
  security: 'Engineering', data: 'Data', product: 'Product',
  writing: 'Writing', marketing: 'Marketing', seo: 'SEO', research: 'Research', productivity: 'Productivity',
};

const unquote = (v: string) => v.trim().replace(/^["']|["']$/g, '');
const list = (v: string | undefined) =>
  (v ?? '').replace(/^\[|\]$/g, '').split(',').map(unquote).filter(Boolean);

function parse(raw: string) {
  const text = raw.replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const fm: Record<string, string> = {};
  const inputs: SkillInput[] = [];
  if (m) {
    let inInputs = false;
    let current: Partial<SkillInput> | null = null;
    for (const line of m[1].split('\n')) {
      const top = line.match(/^([A-Za-z_]+):\s*(.*)$/);
      if (top) {
        inInputs = top[1] === 'inputs';
        if (!inInputs) fm[top[1]] = unquote(top[2]);
        continue;
      }
      if (!inInputs) continue;
      const item = line.match(/^\s*-\s*([A-Za-z_]+):\s*(.*)$/);
      const field = line.match(/^\s+([A-Za-z_]+):\s*(.*)$/);
      if (item) {
        current = { [item[1]]: unquote(item[2]) } as Partial<SkillInput>;
        inputs.push(current as SkillInput);
      } else if (field && current) {
        const v = unquote(field[2]);
        (current as Record<string, unknown>)[field[1]] = field[1] === 'required' ? v === 'true' : v;
      }
    }
  }
  return { fm, inputs: inputs.map((i) => ({ name: i.name, description: i.description ?? '', required: !!i.required })) };
}

function readDir(dir: string, demo: boolean): Skill[] {
  let dirs: string[] = [];
  try {
    dirs = readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }
  const repoPath = demo ? 'site/demo-skills' : 'skills';
  return dirs.flatMap((slug): Skill[] => {
    let raw: string;
    try {
      raw = readFileSync(join(dir, slug, 'SKILL.md'), 'utf8');
    } catch {
      return [];
    }
    const { fm, inputs } = parse(raw);
    const tags = list(fm.tags).map((t) => t.toLowerCase());
    let hasReferences = false;
    try {
      hasReferences = readdirSync(join(dir, slug)).includes('references');
    } catch {}
    return [{
      slug,
      name: fm.name || slug,
      description: fm.description ?? '',
      version: fm.version ?? '',
      tags,
      category: tags.map((t) => CATEGORY_BY_TAG[t]).find(Boolean) ?? 'General',
      author: demo ? null : fm.author || null,
      authorUrl: demo ? null : fm.author_url || null,
      related: list(fm.related),
      inputs,
      raw: raw.replace(/\r\n/g, '\n').trimEnd(),
      hasReferences,
      demo,
      sourceUrl: `${SITE.repo}/tree/main/${repoPath}/${slug}`,
      editUrl: `${SITE.repo}/edit/main/${repoPath}/${slug}/SKILL.md`,
    }];
  });
}

let cache: Skill[] | null = null;

export function getSkills(): Skill[] {
  if (cache) return cache;
  const real = readDir(SKILLS_DIR, false);
  const taken = new Set(real.map((s) => s.slug));
  const demos = DEMO_ENABLED ? readDir(DEMO_DIR, true).filter((s) => !taken.has(s.slug)) : [];
  // Real skills first, then demos; each alphabetical.
  cache = [...real.sort((a, b) => a.name.localeCompare(b.name)), ...demos.sort((a, b) => a.name.localeCompare(b.name))];
  return cache;
}

export function getSkill(slug: string): Skill | undefined {
  return getSkills().find((s) => s.slug === slug);
}

export function toSummary(s: Skill): SkillSummary {
  return { slug: s.slug, name: s.name, description: s.description, version: s.version, tags: s.tags, category: s.category, demo: s.demo };
}
