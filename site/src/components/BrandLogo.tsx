import { SpriteIcon } from './Icon';

/*
 * Logos for the "Works with" grid, drawn in currentColor so they follow the theme.
 * Simple Icons where it has the mark; Hugeicons for OpenAI, Microsoft and Google,
 * which Simple Icons no longer ships. Trademarks belong to their owners.
 * The artwork is in the /icons.svg sprite (lib/icon-data.ts).
 */
const LOGO: Record<string, { id: string; stroke?: boolean }> = {
  'Claude Agent SDK': { id: 'claude' },
  LangChain: { id: 'langchain' },
  CrewAI: { id: 'crewai' },
  Cursor: { id: 'cursor' },
  OpenCode: { id: 'opencode' },
  Windsurf: { id: 'windsurf' },
  Copilot: { id: 'copilot' },
  'OpenAI Assistants': { id: 'openai', stroke: true },
  Codex: { id: 'openai', stroke: true },
  AutoGen: { id: 'microsoft', stroke: true },
  Antigravity: { id: 'google', stroke: true },
  Stitch: { id: 'google', stroke: true },
};

export function BrandLogo({ name, size = 28 }: { name: string; size?: number }) {
  const logo = LOGO[name];
  if (!logo) return null;
  return <SpriteIcon id={`b-${logo.id}`} size={size} strokeWidth={logo.stroke ? 1.8 : undefined} />;
}
