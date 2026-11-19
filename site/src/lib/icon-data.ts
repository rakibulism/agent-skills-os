import 'server-only';
import {
  AiSearchIcon,
  Alert02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  BookOpen01Icon,
  Cancel01Icon,
  CodeIcon,
  Copy01Icon,
  Edit02Icon,
  File01Icon,
  GitForkIcon,
  GitPullRequestIcon,
  GithubIcon,
  LibraryIcon,
  Menu01Icon,
  NpmIcon,
  PackageIcon,
  PlusSignIcon,
  RefreshIcon,
  SparklesIcon,
  Search01Icon,
  TerminalIcon,
  Tick02Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { ChatGptIcon, GoogleIcon, MicrosoftIcon } from '@hugeicons/core-free-icons';
import { siClaude, siCrewai, siCursor, siGithubcopilot, siLangchain, siOpencode, siWindsurf } from 'simple-icons';

/*
 * Icon artwork, used only at build time to write the /icons.svg sprite (app/icons.svg/route.ts).
 * Pages reference symbols with <use>, so the path data isn't repeated in every page's HTML.
 */

/** Hugeicons, named by meaning so a glyph can change without touching every screen. */
export const ICONS = {
  search: Search01Icon,
  copy: Copy01Icon,
  check: Tick02Icon,
  alert: Alert02Icon,
  close: Cancel01Icon,
  menu: Menu01Icon,
  next: ArrowRight01Icon,
  back: ArrowLeft01Icon,
  external: ArrowUpRight01Icon,
  github: GithubIcon,
  npm: NpmIcon,
  fork: GitForkIcon,
  pullRequest: GitPullRequestIcon,
  edit: Edit02Icon,
  docs: BookOpen01Icon,
  library: LibraryIcon,
  file: File01Icon,
  code: CodeIcon,
  terminal: TerminalIcon,
  package: PackageIcon,
  add: PlusSignIcon,
  people: UserGroupIcon,
  ai: SparklesIcon,
  aiSearch: AiSearchIcon,
  retry: RefreshIcon,
} as const;

type IconNode = [string, Record<string, string>][];

/** Hugeicons for the brands Simple Icons no longer ships. */
export const BRAND_STROKE: Record<string, IconNode> = {
  openai: ChatGptIcon as IconNode,
  microsoft: MicrosoftIcon as IconNode,
  google: GoogleIcon as IconNode,
};

/** Simple Icons marks, drawn with fill. */
export const BRAND_FILL: Record<string, string> = {
  claude: siClaude.path,
  langchain: siLangchain.path,
  crewai: siCrewai.path,
  cursor: siCursor.path,
  opencode: siOpencode.path,
  windsurf: siWindsurf.path,
  copilot: siGithubcopilot.path,
};

const kebab = (k: string) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Hugeicons elements without their own stroke width, so the <svg> using them sets it. */
function strokeSymbol(id: string, node: IconNode) {
  const els = node.map(([tag, attrs]) => {
    const a = Object.entries(attrs)
      .filter(([k]) => k !== 'key' && k !== 'strokeWidth')
      .map(([k, v]) => `${kebab(k)}="${esc(String(v))}"`)
      .join(' ');
    return `<${tag} ${a}/>`;
  });
  return `<symbol id="${id}" viewBox="0 0 24 24" fill="none">${els.join('')}</symbol>`;
}

export function sprite() {
  const symbols = [
    ...Object.entries(ICONS).map(([name, node]) => strokeSymbol(`i-${name}`, node as unknown as IconNode)),
    ...Object.entries(BRAND_STROKE).map(([name, node]) => strokeSymbol(`b-${name}`, node)),
    ...Object.entries(BRAND_FILL).map(([name, d]) => `<symbol id="b-${name}" viewBox="0 0 24 24" fill="currentColor"><path d="${esc(d)}"/></symbol>`),
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>\n`;
}
