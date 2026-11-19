import { HugeiconsIcon } from '@hugeicons/react';
import { ChatGptIcon, GoogleIcon, MicrosoftIcon } from '@hugeicons/core-free-icons';
import { siClaude, siCrewai, siCursor, siGithubcopilot, siLangchain, siOpencode, siWindsurf } from 'simple-icons';

/*
 * Logos for the "Works with" grid, drawn in currentColor so they follow the theme.
 * Simple Icons where it has the mark; Hugeicons for OpenAI, Microsoft and Google,
 * which Simple Icons no longer ships. Trademarks belong to their owners.
 */
type SimpleIcon = { path: string; title: string };

const SIMPLE: Record<string, SimpleIcon> = {
  'Claude Agent SDK': siClaude,
  LangChain: siLangchain,
  CrewAI: siCrewai,
  Cursor: siCursor,
  OpenCode: siOpencode,
  Windsurf: siWindsurf,
  Copilot: siGithubcopilot,
};

const HUGE = {
  'OpenAI Assistants': ChatGptIcon,
  Codex: ChatGptIcon,
  AutoGen: MicrosoftIcon,
  Antigravity: GoogleIcon,
  Stitch: GoogleIcon,
} as const;

export function BrandLogo({ name, size = 28 }: { name: string; size?: number }) {
  const simple = SIMPLE[name];
  if (simple) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable={false}>
        <path d={simple.path} />
      </svg>
    );
  }
  const huge = HUGE[name as keyof typeof HUGE];
  if (huge) {
    return <HugeiconsIcon icon={huge} size={size} strokeWidth={1.8} color="currentColor" aria-hidden focusable={false} />;
  }
  return null;
}
