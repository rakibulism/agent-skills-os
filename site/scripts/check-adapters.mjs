// Checks that the demo's browser adapters (src/lib/adapters.ts) return exactly what the
// package's real adapters (../src/index.js) return for the example skill on the page.
// Copies the package into a temp folder with only the example skill, so the real loader runs unchanged.
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { ADAPTERS } from '../src/lib/adapters.ts';
import { EXAMPLE_SKILL, EXAMPLE_SKILL_FILE } from '../src/lib/snippets.ts';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'skills-check-'));
try {
  cpSync(join(repo, 'src'), join(tmp, 'src'), { recursive: true });
  cpSync(join(repo, 'package.json'), join(tmp, 'package.json'));
  mkdirSync(join(tmp, 'skills', EXAMPLE_SKILL.name), { recursive: true });
  writeFileSync(join(tmp, 'skills', EXAMPLE_SKILL.name, 'SKILL.md'), EXAMPLE_SKILL_FILE + '\n');
  const pkg = await import(pathToFileURL(join(tmp, 'src', 'index.js')).href);

  let failed = 0;
  for (const [key, a] of Object.entries(ADAPTERS)) {
    const site = a.run(EXAMPLE_SKILL);
    const real = JSON.parse(JSON.stringify(pkg[a.fn](EXAMPLE_SKILL.name)));
    const ok = isDeepStrictEqual(site, real);
    if (!ok) failed++;
    console.log(`${ok ? 'ok  ' : 'DIFF'} ${key}${ok ? '' : `\n  site: ${JSON.stringify(site)}\n  pkg:  ${JSON.stringify(real)}`}`);
  }
  if (failed) {
    console.error(`${failed} adapter(s) differ from the package.`);
    process.exitCode = 1;
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
