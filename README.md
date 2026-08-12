# universal-agent-skills

Framework-agnostic agent skill loader for any AI agent runtime. Drop-in adapters for **Claude Agent SDK**, **OpenAI Assistants**, **LangChain**, **CrewAI**, **AutoGen**, and any system that takes a system prompt.

Each skill is a markdown file with frontmatter and a careful, prompt-engineered body — load it, hand it to your agent as a system prompt or role, done.

## Install

```bash
npm install universal-agent-skills
```

## Quick start

```js
import { forClaude, forOpenAI, forLangChain, listSkills } from "universal-agent-skills";

// See what's available
console.log(listSkills());
// [
//   { name: "ux-expert-rakibulism", description: "...", tags: ["design","ux","review",...] },
// ]

// Use with Claude Agent SDK / Anthropic Messages API
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();
const { system } = forClaude("ux-expert-rakibulism");
const msg = await anthropic.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 4096,
  system,
  messages: [{ role: "user", content: "Review this dashboard screen:\n\n" + designDescription }],
});

// Use with OpenAI Assistants
import OpenAI from "openai";
const openai = new OpenAI();
const assistant = await openai.beta.assistants.create({
  model: "gpt-4o",
  ...forOpenAI("ux-expert-rakibulism"),
});

// Use with LangChain
import { PromptTemplate } from "@langchain/core/prompts";
const skill = forLangChain("ux-expert-rakibulism");
const prompt = PromptTemplate.fromTemplate(skill.template);
const formatted = await prompt.format({
  design: "...",
  format: "pinned comments",
});
```

## Skills

### Design

| Skill | What it does |
|---|---|
| `ux-expert-rakibulism` | Reviews UI screens in "rakibulism" voice — direct, client-facing, promise-list-style feedback |

Every skill follows the same authoring principles: lead with the spine, prioritize findings, prefer concrete output formats, name what to avoid. Larger skills also bundle a `references/` directory of deeper material the body points to.

## API

```ts
// Load
loadAllSkills(): Skill[]
getSkill(name: string): Skill
listSkills(): SkillSummary[]
getRelatedSkills(name: string): RelatedSkillSummary[]
asSystemPrompt(name: string): string

// Framework adapters
forClaude(name):       { system, metadata }              // metadata includes related_skills: string[]
forOpenAI(name):       { name, description, instructions }
forLangChain(name):    { template, inputVariables }
forCrewAI(name):       { role, goal, backstory }
forAutoGen(name):      { name, system_message }
forCursor(name):       { filename, content }             // Cursor .cursor/rules/*.mdc file
forAgentsMd(name):     { filename, content }             // AGENTS.md section (Codex, OpenCode, Antigravity, Cursor, Windsurf, Copilot...)
forStitchPrompt(name): { content }                       // plain paste-ready prompt, no file convention
forGeneric(name):      { name, description, version, tags, inputs, related, author, author_url, instructions }
```

### Author attribution

`Skill.author` / `Skill.author_url` are populated from a skill's own frontmatter (`author: rakibulism`, `author_url: https://x.com/rakibulism`) and are `null` when a skill doesn't declare them. Only add these fields to a skill you actually wrote; never overwrite another skill's existing attribution.

### Related skills — so an agent doesn't need every name typed up front

A skill can declare `related: [other-skill-name, ...]` in its frontmatter to point at complements it's commonly loaded alongside. `getRelatedSkills(name)` resolves those into full summaries (dropping any name that no longer resolves, rather than throwing), so a consuming agent can decide to pull in a companion skill automatically instead of requiring the user to already know and type its name:

```js
import { getSkill, getRelatedSkills } from "universal-agent-skills";

const skill = getSkill("ux-expert-rakibulism");
const related = getRelatedSkills("ux-expert-rakibulism");
// -> [] unless a future skill declares `related: [ux-expert-rakibulism]` or vice versa

// e.g. in an agent loop: if the request looks like it needs a related skill too,
// load it without waiting for the user to name it explicitly.
```

This is opt-in per skill — only add `related` where two skills are genuinely complementary, not as a blanket cross-link between every skill in a domain.

## Using a skill in Cursor, Codex, OpenCode, Antigravity, or other IDE/agent tools

Claude Agent SDK and Claude Code read `SKILL.md` natively — no export needed. Other tools have their own file conventions, so three more adapters generate ready-to-drop content for them:

| Tool | Format | Adapter |
|---|---|---|
| Cursor | `.cursor/rules/<name>.mdc` (YAML frontmatter + body) | `forCursor(name)` |
| OpenAI Codex, OpenCode, Google Antigravity, Windsurf, GitHub Copilot | `AGENTS.md` — the open, tool-agnostic standard all of these read | `forAgentsMd(name)` |
| Stitch (or any prompt-only design tool with no rule-file concept) | plain-text prompt, paste directly | `forStitchPrompt(name)` |

```js
import { forCursor, forAgentsMd, forStitchPrompt } from "universal-agent-skills";

const cursor = forCursor("ux-expert-rakibulism");
// -> { filename: "ux-expert-rakibulism.mdc", content: "---\ndescription: ...\nalwaysApply: false\n---\n\n..." }
// Write this to .cursor/rules/ in your project.

const agentsMd = forAgentsMd("ux-expert-rakibulism");
// -> { filename: "ux-expert-rakibulism.agents.md", content: "## ux-expert-rakibulism ...\n\n..." }
// AGENTS.md conventionally holds every convention for a whole project, not just one skill —
// append this section onto your project's existing AGENTS.md rather than replacing it wholesale.

const stitch = forStitchPrompt("ux-expert-rakibulism");
// -> { content: "..." } — copy-paste directly into Stitch's prompt box.
```

Or generate all three at once for a skill (or every skill) with the bundled script, which writes into `skills/<name>/exports/`:

```bash
node scripts/export-skill.js ux-expert-rakibulism
node scripts/export-skill.js --all
```

**A skill with a `references/` folder loses those links when exported as a single file.** A skill's body commonly links to `references/*.md` for deep-dive material (see "Authoring your own skills" below) — those relative links only resolve if the `references/` folder is copied alongside the exported file at the same relative path. If you're dropping a Cursor `.mdc` or `AGENTS.md` section into a different project, copy the skill's `references/` folder too (or inline the reference content you need) rather than shipping just the single exported file.

## Use with Python frameworks (CrewAI, AutoGen)

The package is ESM JS, but the markdown skills are framework-neutral. To consume from Python:

```bash
# After npm install, the markdown files are at:
node_modules/universal-agent-skills/skills/<name>/SKILL.md
```

Read the file directly, strip frontmatter (`---...---`), use the body as your agent's `backstory` (CrewAI) or `system_message` (AutoGen).

Or generate a JSON catalog from Node and hand it to Python:

```bash
node -e "import('universal-agent-skills').then(m => console.log(JSON.stringify(m.loadAllSkills(), null, 2)))" > skills.json
```

## Authoring your own skills

A skill is a directory containing `SKILL.md`, optionally with a `references/` directory of supporting docs:

```
skills/
  my-skill/
    SKILL.md
    references/        # optional deep-dive docs the SKILL.md body points to
      topic-a.md
      topic-b.md
```

`loadAllSkills()` reads `SKILL.md` as the system prompt; `references/` files are progressive-disclosure material the agent (or a human) opens as needed.

`SKILL.md` frontmatter:

```yaml
---
name: my-skill
description: One sentence describing when to use this skill and what it produces.
version: 0.1.0
tags: [domain, capability]
inputs:
  - name: input_name
    description: What this input is.
    required: true
related: [other-skill-name]  # optional — see "Related skills" above
author: your-name            # optional — only if you wrote this skill yourself
author_url: https://...      # optional — link to your profile/site
---

# Body

The system-prompt content. Be specific about process, output format, and what to avoid.
```

Drop the directory into `skills/` and `loadAllSkills()` picks it up.

## Design principles

These skills were written to follow a few rules:

- **Lead with intent.** The first paragraph tells the model when to apply the skill.
- **Process before output.** How to think, not just what to emit.
- **Specify output shape.** Models drift without a target format.
- **Name failure modes.** "What to avoid" sections prevent common errors.
- **Concrete over abstract.** Concrete examples beat abstract advice.

## License

MIT
