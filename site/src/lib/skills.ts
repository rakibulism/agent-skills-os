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
  sourceUrl: string;
  editUrl: string;
};

/** What the browser needs for search: no file bodies. */
export type SkillSummary = Pick<Skill, 'slug' | 'name' | 'description' | 'version' | 'tags' | 'category'>;

const SKILLS_DIR = join(process.cwd(), '..', 'skills');
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

function readDir(dir: string): Skill[] {
  let dirs: string[] = [];
  try {
    dirs = readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }
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
      author: fm.author || null,
      authorUrl: fm.author_url || null,
      related: list(fm.related),
      inputs,
      raw: raw.replace(/\r\n/g, '\n').trimEnd(),
      hasReferences,
      sourceUrl: `${SITE.repo}/tree/main/skills/${slug}`,
      editUrl: `${SITE.repo}/edit/main/skills/${slug}/SKILL.md`,
    }];
  });
}

let cache: Skill[] | null = null;

export function getSkills(): Skill[] {
  if (cache) return cache;
  cache = readDir(SKILLS_DIR).sort((a, b) => a.name.localeCompare(b.name));
  return cache;
}

export function getSkill(slug: string): Skill | undefined {
  return getSkills().find((s) => s.slug === slug);
}

export function toSummary(s: Skill): SkillSummary {
  return { slug: s.slug, name: s.name, description: s.description, version: s.version, tags: s.tags, category: s.category };
}
