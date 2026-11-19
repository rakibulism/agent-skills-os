import 'server-only';
import { ABOUT, CONTACT, PRIVACY } from '@/content/trust';
import { ACCEPT, STEPS } from '@/content/contribute';
import { HOW } from '@/content/home';
import { API_DOC, CLI_DOC } from '@/content/tools';
import { ADAPTERS, ADAPTER_KEYS } from '@/lib/adapters';
import { absoluteLinks } from '@/lib/doc';
import { SITE, TARGETS } from '@/lib/site';
import { getSkills } from '@/lib/skills';
import { API, RULES, TEMPLATE_FILE, USAGE } from '@/lib/snippets';

/*
 * Markdown twins of the hand-built pages (home, docs, contribute) and /llms.txt.
 * Built from the same data the pages render, so the two can't drift apart.
 */

const fence = (code: string, lang = '') => `\`\`\`${lang === 'text' ? '' : lang}\n${code.trimEnd()}\n\`\`\``;
const footer = (path: string) => `---\n\nPage: ${SITE.url}${path} · Site guide for agents: ${SITE.url}/llms.txt`;
const join = (parts: string[]) => `${parts.join('\n\n')}\n`;

export function homeMarkdown() {
  const skills = getSkills();
  return join([
    `# ${SITE.name}: universal agent skills`,
    `> ${SITE.description}`,
    `${SITE.name} is an open, MIT-licensed library of agent skills, one Markdown file each, and the \`${SITE.pkg}\` npm package that loads any of them into ${TARGETS.join(', ')}.`,
    '## Install',
    fence(SITE.install, 'sh'),
    fence(`import { forClaude } from "${SITE.pkg}";\n\nconst { system } = forClaude("super-ui");`, 'js'),
    `## Skills (${skills.length})`,
    skills
      .map((s) => `- [${s.name}](${SITE.url}/skills/${s.slug}.md): ${s.description}${s.tags.length ? ` Tags: ${s.tags.join(', ')}.` : ''}`)
      .join('\n'),
    `Search them as JSON with \`GET ${SITE.url}/api/skills?q=<keywords>\`.`,
    `## ${HOW.title}`,
    HOW.note,
    HOW.steps.map((step, i) => `${i + 1}. **${step.title}.** ${absoluteLinks(step.text)}`).join('\n'),
    `## ${HOW.whenTitle}`,
    HOW.when.map((w) => `- ${w}`).join('\n'),
    '## Keep going',
    [
      `- [Docs](${SITE.url}/docs.md): adapters, usage for every framework, and the package API.`,
      `- [API reference](${SITE.url}/docs/api.md): search and read skills over HTTP. OpenAPI: ${SITE.url}/openapi.json`,
      `- [CLI](${SITE.url}/docs/cli.md): \`npx ${SITE.pkg} list\`.`,
      `- [Contribute](${SITE.url}/contribute.md): add a skill with one Markdown file and a pull request.`,
      `- [Source on GitHub](${SITE.repo}): every SKILL.md, the loader and the issues.`,
      `- [npm package](${SITE.npm}): ${SITE.pkg}, MIT, no dependencies.`,
    ].join('\n'),
    '## Works with',
    TARGETS.map((t) => `- ${t}`).join('\n'),
    footer('/'),
  ]);
}

export function docsMarkdown() {
  return join([
    '# Write a skill once. Load it into any agent.',
    'A skill is one Markdown file. The package reads it and hands each runtime exactly what it expects: a system prompt, an assistant config, a prompt template, a rule file.',
    fence(SITE.install, 'sh'),
    '## One file in, the right shape out (adapters)',
    'Every adapter reads the same file, so there is nothing to keep in sync.',
    ADAPTER_KEYS.map((k) => `- **${ADAPTERS[k].label}:** \`${ADAPTERS[k].fn}(name)\`. ${ADAPTERS[k].hint}.`).join('\n'),
    '## Drop it into the code you already have (usage)',
    'Each adapter is one function call. Python frameworks read the same Markdown files straight from `node_modules`.',
    ...USAGE.flatMap((u) => [`### ${u.label}`, `\`${u.file}\``, fence(u.code, u.lang)]),
    "## Fourteen functions. That's the whole API.",
    'Everything takes a skill name and returns plain data. Types ship in `src/index.d.ts`.',
    '### Load',
    API.load.map(([fn, ret]) => `- \`${fn}\` → \`${ret}\``).join('\n'),
    '### Adapt',
    API.adapt.map(([fn, ret]) => `- \`${fn}\` → \`${ret}\``).join('\n'),
    '## A folder and a Markdown file (write a skill)',
    "Put a `SKILL.md` in `skills/<name>/`. There's no registry and no build step. Add a `references/` folder for longer material the skill points to.",
    fence(TEMPLATE_FILE, 'md'),
    RULES.map(([title, text]) => `- **${title}** ${text}`).join('\n'),
    '## More',
    [
      `- [API reference](${SITE.url}/docs/api.md): the HTTP API and its OpenAPI spec.`,
      `- [CLI](${SITE.url}/docs/cli.md): the \`agent-skills\` command.`,
      `- [Contribute](${SITE.url}/contribute.md): add your skill to the library.`,
    ].join('\n'),
    footer('/docs'),
  ]);
}

export function contributeMarkdown() {
  return join([
    '# Add a skill to the library',
    'Every skill here is one Markdown file someone wrote and shared. Fork the repo, add yours, and open a pull request. Fixes to existing skills and to the loader are just as welcome.',
    `- [Fork on GitHub](${SITE.fork})\n- [Open issues](${SITE.issues})\n- [CONTRIBUTING.md](${SITE.contributing})`,
    '## Four steps, about ten minutes',
    ...STEPS.flatMap((step, i) => [`### Step ${i + 1}: ${step.title}`, step.text, fence(step.code, step.lang)]),
    '## What makes a skill worth adding',
    '### How to write it',
    RULES.map(([title, text], i) => `${i + 1}. **${title}** ${text}`).join('\n'),
    '### What gets merged',
    ACCEPT.map((a) => `- ${a}`).join('\n'),
    footer('/contribute'),
  ]);
}

/** /llms.txt, following https://llmstxt.org: H1, summary, notes, then H2 link lists. */
export function llmsTxt() {
  const skills = getSkills();
  const page = (title: string, path: string, note: string) => `- [${title}](${SITE.url}${path}): ${note}`;
  return join([
    `# ${SITE.name}`,
    `> ${SITE.name} is an open library of AI agent skills: reusable instructions, one SKILL.md file each, that the \`${SITE.pkg}\` npm package loads into ${TARGETS.slice(0, 6).join(', ')} and any AGENTS.md tool. Free and MIT licensed.`,
    [
      '**When to use Agent Skills OS:**',
      '',
      '- A user or task needs proven instructions for a specific job (for example a UI review) and you want to check whether a ready-made skill exists before writing your own prompt.',
      '- You need the same instructions in several agent runtimes (Claude Agent SDK, OpenAI Assistants, LangChain, CrewAI, AutoGen) or as a Cursor rule or an AGENTS.md section.',
      '- You are setting up a project for coding agents and want versioned, reviewed rule files instead of pasted text.',
      '',
      'Do not use it for general web search, hosted model inference or storing private prompts: it is a public, read-only library.',
    ].join('\n'),
    [
      '**How an agent should call it:**',
      '',
      `1. Find a skill: \`GET ${SITE.url}/api/skills?q=<keywords>\` returns JSON, best match first.`,
      `2. Read it: \`GET ${SITE.url}/api/skills/<name>\` returns the full SKILL.md in \`markdown\`; or fetch \`${SITE.url}/skills/<name>.md\` directly.`,
      `3. Use it: give the SKILL.md body to the model as instructions, or in code \`import { forClaude } from "${SITE.pkg}"\`. In a shell: \`npx ${SITE.pkg} show <name>\`.`,
      `4. Unsure which skill fits? \`POST ${SITE.url}/api/ask\` with \`{"question": "..."}\`.`,
      '',
      `Every page also answers \`Accept: text/markdown\` with Markdown. The API is described in OpenAPI 3.1 at ${SITE.url}/openapi.json; errors are JSON with \`error\`, \`code\` and \`hint\`.`,
    ].join('\n'),
    '## Docs',
    [
      page('Docs', '/docs.md', 'adapters for every framework, usage snippets and the package API'),
      page(API_DOC.title, '/docs/api.md', 'HTTP endpoints, parameters, errors and Markdown negotiation'),
      page(CLI_DOC.title, '/docs/cli.md', 'the agent-skills command: list, search, show and export skills'),
      `- [OpenAPI 3.1 spec](${SITE.url}/openapi.json): machine-readable API description`,
      page('Contribute', '/contribute.md', 'how to add a skill with one Markdown file and a pull request'),
    ].join('\n'),
    '## Skills',
    skills.map((s) => `- [${s.name}](${SITE.url}/skills/${s.slug}.md): ${s.description}`).join('\n'),
    '## Optional',
    [
      page('Home', '/index.md', 'the catalog and an overview'),
      page(ABOUT.title, '/about.md', 'who makes it and why'),
      page(CONTACT.title, '/contact.md', 'email and issue tracker'),
      page(PRIVACY.title, '/privacy.md', 'what data the site and Ask AI handle'),
      `- [Source code](${SITE.repo}): skills, loader and website on GitHub`,
      `- [npm package](${SITE.npm}): ${SITE.pkg}`,
      `- [Sitemap](${SITE.url}/sitemap.xml)`,
    ].join('\n'),
  ]);
}
