import type { Doc } from '@/lib/doc';
import { SITE } from '@/lib/site';

const BASE = SITE.url;

export const API_DOC: Doc = {
  path: '/docs/api',
  metaTitle: 'Agent Skills OS API reference',
  description: 'The Agent Skills OS REST API: search the skill library, read any SKILL.md as JSON, and ask which skill fits a task. No key needed. OpenAPI 3.1 spec at /openapi.json.',
  kicker: 'Docs · API',
  title: 'Agent Skills OS API',
  lede: `A small public REST API over the skill library. Search for a skill, read its full instructions, or ask in plain language which one fits. No key, no sign-up, JSON in and out. The machine-readable description is [/openapi.json](/openapi.json) (OpenAPI 3.1).`,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          table: {
            head: ['Operation', 'Request', 'Returns'],
            rows: [
              ['`listSkills`', '`GET /api/skills?q=&limit=`', 'Skills matching the query, best first (or all of them)'],
              ['`getSkill`', '`GET /api/skills/{name}`', 'One skill with its full SKILL.md and usage snippets'],
              ['`askSkills`', '`POST /api/ask`', 'A short answer plus cards for the skills it means'],
            ],
          },
        },
        {
          list: [
            `**Base URL:** \`${BASE}\``,
            '**Authentication:** none. The read endpoints allow cross-origin requests (`Access-Control-Allow-Origin: *`).',
            '**Format:** JSON with UTF-8. Every error is JSON too (see [Errors](#errors)).',
            '**Limits:** `POST /api/ask` allows about 12 questions a minute per client. The read endpoints are cached for a few minutes and have no fixed limit.',
          ],
        },
      ],
    },
    {
      id: 'when',
      title: 'When to use it',
      blocks: [
        {
          list: [
            'An agent needs instructions for a task (a UI review, an accessibility audit) and wants to check whether a ready-made skill exists: call `listSkills` with a few keywords.',
            'A tool wants to load a skill at runtime without installing the npm package: call `getSkill` and use the `markdown` field as the system prompt.',
            'A user asks a fuzzy question ("how do I use this with LangChain?"): call `askSkills` and show its answer and cards.',
          ],
        },
        { p: 'If you write JavaScript or TypeScript and can install a package, the [npm package](/docs) is faster and works offline. For shell scripts, use the [CLI](/docs/cli).' },
      ],
    },
    {
      id: 'list',
      title: 'Search or list skills',
      lede: '`GET /api/skills` returns every skill sorted by name. Add `q` to keep only skills whose name, description, tags or text contain every word, best match first.',
      blocks: [
        { code: `curl "${BASE}/api/skills?q=ui&limit=5"`, lang: 'sh', file: 'terminal' },
        {
          code: `{
  "query": "ui",
  "total": 1,
  "count": 1,
  "skills": [
    {
      "name": "super-ui",
      "title": "super-ui",
      "description": "…",
      "version": "0.1.0",
      "tags": ["design", "ui"],
      "url": "${BASE}/skills/super-ui",
      "markdownUrl": "${BASE}/skills/super-ui.md",
      "apiUrl": "${BASE}/api/skills/super-ui"
    }
  ]
}`,
          lang: 'json',
          file: '200 OK',
        },
        { table: { head: ['Parameter', 'Type', 'Meaning'], rows: [['`q`', 'string, up to 200 characters', 'Keywords for the task. Optional.'], ['`limit`', 'integer, 1 to 100', 'Most skills to return. Defaults to 100.']] } },
      ],
    },
    {
      id: 'get',
      title: 'Get one skill',
      lede: '`GET /api/skills/{name}` returns the same fields plus `markdown` (the whole SKILL.md), `usage` snippets and `sourceUrl`.',
      blocks: [
        { code: `curl ${BASE}/api/skills/super-ui`, lang: 'sh', file: 'terminal' },
        { p: 'Only need the file? Request [/skills/super-ui.md](/skills/super-ui.md) directly, or send `Accept: text/markdown` to the skill page.' },
      ],
    },
    {
      id: 'ask',
      title: 'Ask a question',
      lede: '`POST /api/ask` with a JSON body. The answer is grounded in the skills search ranks highest, and cards point at skills, install commands or usage snippets the site can render.',
      blocks: [
        {
          code: `curl -X POST ${BASE}/api/ask \\
  -H "Content-Type: application/json" \\
  -d '{"question": "Which skill reviews UI?"}'`,
          lang: 'sh',
          file: 'terminal',
        },
        {
          code: `{
  "answer": "super-ui is the closest skill …",
  "cards": [{ "type": "skill", "slug": "super-ui" }],
  "followups": ["How do I use it with LangChain?"]
}`,
          lang: 'json',
          file: '200 OK',
        },
      ],
    },
    {
      id: 'errors',
      title: 'Errors',
      lede: 'Errors use normal HTTP status codes and always return the same JSON shape, so an agent can read what went wrong and what to do next.',
      blocks: [
        {
          code: `{
  "error": "There is no skill named \\"nope\\".",
  "code": "skill_not_found",
  "hint": "GET /api/skills?q=<keywords> to find the right name.",
  "docs": "${BASE}/docs/api"
}`,
          lang: 'json',
          file: '404 Not Found',
        },
        {
          table: {
            head: ['Status', 'code', 'What to do'],
            rows: [
              ['400', '`invalid_name`, `invalid_limit`, `query_too_long`, `missing_question`', 'Fix the request as the hint says.'],
              ['404', '`skill_not_found`, `not_found`', 'Search with `listSkills`, or check the path against `/openapi.json`.'],
              ['405', '`method_not_allowed`', 'Use the method in the `Allow` header.'],
              ['429', '`rate_limited`, `ai_busy`', 'Wait for `Retry-After` seconds, or use `listSkills`.'],
              ['502, 503, 504', '`ai_unavailable`, `empty_answer`, `index_unavailable`, `skill_file_unavailable`, `not_configured`, `ai_timeout`', 'Try again shortly.'],
            ],
          },
        },
      ],
    },
    {
      id: 'markdown',
      title: 'Markdown for agents',
      blocks: [
        { p: 'Every page on this site has a Markdown version. Send `Accept: text/markdown` to any page URL and you get Markdown with `Content-Type: text/markdown` and `Vary: Accept`; browsers keep getting HTML. You can also add `.md` to a path, for example [/docs.md](/docs.md), or use [/index.md](/index.md) for the home page.' },
        { code: `curl -H "Accept: text/markdown" ${BASE}/`, lang: 'sh', file: 'terminal' },
        { p: 'Start from [/llms.txt](/llms.txt) for a map of the site written for language models, and [/sitemap.xml](/sitemap.xml) for every page.' },
      ],
    },
  ],
};

export const CLI_DOC: Doc = {
  path: '/docs/cli',
  metaTitle: 'Agent Skills OS CLI (agent-skills)',
  description: 'The agent-skills command-line tool: list, search, print and export AI agent skills from the universal-agent-skills npm package. Run it with npx, no install needed.',
  kicker: 'Docs · CLI',
  title: 'Agent Skills OS CLI',
  lede: '`agent-skills` is the command-line tool in the [universal-agent-skills](https://www.npmjs.com/package/universal-agent-skills) package. It lists, searches, prints and exports the bundled skills, offline, so scripts and coding agents can use a skill without writing any code.',
  sections: [
    {
      id: 'run',
      title: 'Run it',
      blocks: [
        { p: 'Run it once with npx, or install the package and call `agent-skills` from your project. It needs Node.js 18 or newer and has no dependencies.' },
        {
          code: `npx universal-agent-skills list

# or, inside a project
npm install universal-agent-skills
npx agent-skills search ui`,
          lang: 'sh',
          file: 'terminal',
        },
      ],
    },
    {
      id: 'commands',
      title: 'Commands',
      blocks: [
        {
          table: {
            head: ['Command', 'What it does'],
            rows: [
              ['`agent-skills list [--json]`', 'List every skill with its description.'],
              ['`agent-skills search <words...> [--json]`', 'Skills whose name, description or tags contain every word.'],
              ['`agent-skills show <name>`', 'Print the skill\'s SKILL.md.'],
              ['`agent-skills prompt <name>`', 'Print the instructions only, ready to use as a system prompt.'],
              ['`agent-skills json <name>`', 'Print the skill as JSON: name, tags, inputs, related skills and instructions.'],
              ['`agent-skills export <name> --format cursor|agents-md|stitch [--out <dir>]`', 'Write a Cursor rule, an AGENTS.md section or a Stitch prompt. Without `--out`, print it.'],
              ['`agent-skills --version`, `agent-skills --help`', 'Show the version or the help.'],
            ],
          },
        },
      ],
    },
    {
      id: 'examples',
      title: 'Examples',
      blocks: [
        {
          code: `# Add a skill to Cursor as an agent-requested rule
npx universal-agent-skills export super-ui --format cursor --out .cursor/rules

# Append a skill to your project's AGENTS.md
npx universal-agent-skills export super-ui --format agents-md >> AGENTS.md

# Machine-readable output for scripts and agents
npx universal-agent-skills search ui --json`,
          lang: 'sh',
          file: 'terminal',
        },
        { p: 'Exit codes: `0` on success, `1` when a skill isn\'t found, `2` for a usage mistake such as a missing argument. Errors go to stderr, output to stdout, so `--json` output can be piped straight into `jq`.' },
      ],
    },
    {
      id: 'when',
      title: 'When to use the CLI',
      blocks: [
        {
          list: [
            'In a shell script or CI job that writes rule files for Cursor or AGENTS.md tools.',
            'When a coding agent can run commands but shouldn\'t add code to the project just to read a skill.',
            'To check what a skill says before loading it with the [npm package](/docs) or the [API](/docs/api).',
          ],
        },
      ],
    },
  ],
};
