import 'server-only';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
 * Reads the package's skills/ folder at build time, so the site can never drift
 * from the repo. Mirrors the loader in ../../src/index.js for the fields shown here.
 */
export type SkillCard = { name: string; description: string; version: string; category: string; url: string };

const SKILLS_DIR = join(process.cwd(), '..', 'skills');

const CATEGORY_BY_TAG: Record<string, string> = {
  design: 'Design', ui: 'Design', ux: 'Design', accessibility: 'Design',
  engineering: 'Engineering', testing: 'Engineering', 'code-review': 'Engineering',
  writing: 'Writing', marketing: 'Marketing', seo: 'SEO', research: 'Research', productivity: 'Productivity',
};

function frontmatter(raw: string): Record<string, string> {
  const m = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/);
  const fm: Record<string, string> = {};
  if (!m) return fm;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return fm;
}

export function getSkills(): SkillCard[] {
  let dirs: string[] = [];
  try {
    dirs = readdirSync(SKILLS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }
  return dirs
    .flatMap((dir) => {
      let raw: string;
      try {
        raw = readFileSync(join(SKILLS_DIR, dir, 'SKILL.md'), 'utf8');
      } catch {
        return [];
      }
      const fm = frontmatter(raw);
      const tags = (fm.tags ?? '').replace(/^\[|\]$/g, '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      const category = tags.map((t) => CATEGORY_BY_TAG[t]).find(Boolean) ?? 'General';
      return [{
        name: fm.name || dir,
        description: fm.description ?? '',
        version: fm.version ?? '',
        category,
        url: `https://github.com/rakibulism/agent-skills-os/tree/main/skills/${dir}`,
      }];
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
