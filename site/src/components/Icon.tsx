import { HugeiconsIcon } from '@hugeicons/react';
import {
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
  Search01Icon,
  TerminalIcon,
  Tick02Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import type { CSSProperties } from 'react';

/** Hugeicons, named by meaning so a glyph can change without touching every screen. */
const icons = {
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
} as const;

export type IconName = keyof typeof icons;

type Props = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
};

export function Icon({ name, size = 18, strokeWidth = 1.6, className, style }: Props) {
  return (
    <HugeiconsIcon
      icon={icons[name]}
      size={size}
      strokeWidth={strokeWidth}
      color="currentColor"
      className={className}
      style={{ flexShrink: 0, ...style }}
      aria-hidden
      focusable={false}
    />
  );
}
