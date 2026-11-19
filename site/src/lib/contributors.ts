import 'server-only';
import { SITE } from './site';

export type Contributor = { login: string; avatar: string; url: string; contributions: number };

/**
 * Fetched once at build time from the public GitHub API. If GitHub is unreachable or
 * rate-limited, the page still builds and links to the contributors graph instead.
 */
export async function getContributors(): Promise<Contributor[]> {
  try {
    const res = await fetch(`https://api.github.com/repos/${SITE.repoSlug}/contributors?per_page=60`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'agent-skills-os-site' },
      cache: 'force-cache',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { login: string; avatar_url: string; html_url: string; contributions: number; type: string }[];
    return data
      .filter((c) => c.type === 'User')
      .map((c) => ({ login: c.login, avatar: `${c.avatar_url}${c.avatar_url.includes('?') ? '&' : '?'}s=96`, url: c.html_url, contributions: c.contributions }));
  } catch {
    return [];
  }
}
