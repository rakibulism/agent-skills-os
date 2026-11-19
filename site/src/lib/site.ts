export const SITE = {
  name: 'Agent Skills OS',
  title: 'Agent Skills OS — write a skill once, load it into any agent',
  description:
    'universal-agent-skills turns one Markdown skill file into the exact shape Claude, OpenAI, LangChain, CrewAI, AutoGen, Cursor and AGENTS.md tools expect. MIT licensed, no dependencies.',
  shortDescription:
    'One Markdown skill file, adapted for Claude, OpenAI, LangChain, CrewAI, AutoGen, Cursor and AGENTS.md tools.',
  url: 'https://agent-skills-os.vercel.app',
  pkg: 'universal-agent-skills',
  install: 'npm install universal-agent-skills',
  repo: 'https://github.com/rakibulism/agent-skills-os',
  npm: 'https://www.npmjs.com/package/universal-agent-skills',
  issues: 'https://github.com/rakibulism/agent-skills-os/issues',
  author: 'Rakibul Islam',
  authorUrl: 'https://rakibulism.space',
  twitter: '@rakibulism',
} as const;

export const SECTIONS = [
  { id: 'adapters', label: 'Adapters' },
  { id: 'usage', label: 'Usage' },
  { id: 'skills', label: 'Skills' },
  { id: 'api', label: 'API' },
  { id: 'write', label: 'Write a skill' },
] as const;

export const TARGETS = [
  'Claude Agent SDK', 'OpenAI Assistants', 'LangChain', 'CrewAI', 'AutoGen', 'Cursor',
  'Codex', 'OpenCode', 'Antigravity', 'Windsurf', 'Copilot', 'Stitch',
] as const;
