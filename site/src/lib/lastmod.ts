import 'server-only';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

/*
 * When a page's content last changed, from git, for sitemap.xml's <lastmod>.
 * Google ignores lastmod values that always say "now", so each page gets the date of the
 * last commit touching its own source files.
 */
const ROOT = join(process.cwd(), '..');

function git(args: string[]) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

let floor: string | undefined;

/** Last commit date for any of these repo-relative paths. */
export function lastModified(paths: string[]): Date {
  const date = git(['log', '-1', '--format=%cI', '--', ...paths]);
  if (date) return new Date(date);
  // A shallow clone may not reach the commit that last touched these files: use the
  // oldest commit it has, which is stable across deploys. No git at all: build time.
  floor ??= git(['log', '--reverse', '--format=%cI']).split('\n')[0] ?? '';
  return floor ? new Date(floor) : new Date();
}
