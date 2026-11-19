export const SITE = {
  name: 'Agent Skills OS',
  title: 'Agent Skills OS — find a skill, load it into any agent',
  description:
    'An open library of agent skills. Search for one, then load it into Claude, OpenAI, LangChain, CrewAI, AutoGen, Cursor or any AGENTS.md tool with one function call.',
  shortDescription:
    'An open library of agent skills. Find one, load it into Claude, OpenAI, LangChain, Cursor and more.',
  url: 'https://agent-skills-os.vercel.app',
  pkg: 'universal-agent-skills',
  install: 'npm install universal-agent-skills',
  repo: 'https://github.com/rakibulism/agent-skills-os',
  npm: 'https://www.npmjs.com/package/universal-agent-skills',
  issues: 'https://github.com/rakibulism/agent-skills-os/issues',
  newIssue: 'https://github.com/rakibulism/agent-skills-os/issues/new',
  fork: 'https://github.com/rakibulism/agent-skills-os/fork',
  pulls: 'https://github.com/rakibulism/agent-skills-os/pulls',
  contributing: 'https://github.com/rakibulism/agent-skills-os/blob/main/CONTRIBUTING.md',
  repoSlug: 'rakibulism/agent-skills-os',
  author: 'Rakibul Islam',
  authorUrl: 'https://rakibulism.space',
  twitter: '@rakibulism',
} as const;

export const PAGES = [
  { href: '/', label: 'Skills' },
  { href: '/docs', label: 'Docs' },
  { href: '/contribute', label: 'Contribute' },
] as const;

/** Sections on the docs page. */
export const SECTIONS = [
  { id: 'adapters', label: 'Adapters' },
  { id: 'usage', label: 'Usage' },
  { id: 'api', label: 'API' },
  { id: 'write', label: 'Write a skill' },
] as const;

export const TARGETS = [
  'Claude Agent SDK', 'OpenAI Assistants', 'LangChain', 'CrewAI', 'AutoGen', 'Cursor',
  'Codex', 'OpenCode', 'Antigravity', 'Windsurf', 'Copilot', 'Stitch',
] as const;
