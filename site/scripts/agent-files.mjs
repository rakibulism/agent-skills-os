// Runs after `next build`: writes each skill's SKILL.md to out/skills/<name>.md, the
// Markdown twin of /skills/<name> (Next can't name a dynamic route "<name>.md").
// The other Markdown twins, llms.txt, sitemap.xml, robots.txt and openapi.json are
// route handlers under src/app.
import { copyFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = fileURLToPath(new URL('..', import.meta.url));
const skillsDir = join(site, '..', 'skills');
const outDir = join(site, 'out', 'skills');

let n = 0;
for (const slug of readdirSync(skillsDir)) {
  const file = join(skillsDir, slug, 'SKILL.md');
  // Only skills that got a page: the page and its Markdown twin come as a pair.
  if (!existsSync(file) || !existsSync(join(outDir, `${slug}.html`))) continue;
  copyFileSync(file, join(outDir, `${slug}.md`));
  n++;
}
console.log(`agent-files: wrote ${n} skill Markdown file${n === 1 ? '' : 's'} to out/skills/`);
