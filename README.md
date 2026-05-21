# universal-agent-skills

Framework-agnostic agent skills for any AI agent runtime. Drop-in adapters for **Claude Agent SDK**, **OpenAI Assistants**, **LangChain**, **CrewAI**, **AutoGen**, and any system that takes a system prompt.

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
//   { name: "code-reviewer",  description: "...", tags: ["code","review",...] },
//   { name: "data-analyst",   description: "...", tags: [...] },
//   ...
// ]

// Use with Claude Agent SDK / Anthropic Messages API
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();
const { system } = forClaude("code-reviewer");
const msg = await anthropic.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 4096,
  system,
  messages: [{ role: "user", content: "Review this diff:\n\n" + diff }],
});

// Use with OpenAI Assistants
import OpenAI from "openai";
const openai = new OpenAI();
const assistant = await openai.beta.assistants.create({
  model: "gpt-4o",
  ...forOpenAI("researcher"),
});

// Use with LangChain
import { PromptTemplate } from "@langchain/core/prompts";
const tw = forLangChain("test-writer");
const prompt = PromptTemplate.fromTemplate(tw.template);
const formatted = await prompt.format({
  target_code: "...",
  framework: "vitest",
  existing_tests: "",
});
```

## Skills

### Engineering

| Skill | What it does |
|---|---|
| `code-reviewer` | Reviews code for bugs, security, performance — prioritized findings with file:line + fixes |
| `test-writer` | Generates unit/integration tests covering happy path, edges, errors |
| `refactorer` | Refactors with a behavior-equivalence argument; small safe steps |
| `debugger` | Diagnoses errors with root cause, fix, and verification step |
| `doc-writer` | Generates READMEs, API refs, JSDoc/docstrings |

### Design & Design Engineering

| Skill | What it does |
|---|---|
| `ux-ui-designer` | Designs and critiques end-to-end UX/UI — flows, IA, hierarchy, states, accessibility |
| `product-designer` | Connects user problems to product decisions — framing, opportunity, metrics, MVP scope |
| `component-designer` | Specs a UI component — anatomy, states, variants, API, accessibility, edge cases |
| `visual-polish-reviewer` | Reviews UI for alignment, spacing, typography, shadows — the details that separate fine from great |
| `interaction-designer` | Designs micro-interactions with timing, easing, purpose; outputs animation code |
| `design-token-architect` | Designs primitive/semantic/component token layers with theme support |
| `design-to-code` | Translates Figma or design specs into accessible, responsive, token-driven component code |

### Creativity

| Skill | What it does |
|---|---|
| `creative-artist` | Generates original concepts and creative work — pushes past clichés to bold, developed ideas |

### Knowledge & Research

| Skill | What it does |
|---|---|
| `summarizer` | Faithful summaries at TLDR / short / medium / long lengths |
| `researcher` | Decomposes a question, gathers cited sources, synthesizes a brief |
| `academic-researcher` | Scholarly rigor — research questions, literature review, methodology, academic writing |
| `data-analyst` | Profiles, analyzes, and reports on tabular data with caveats |

### Reasoning & Science

| Skill | What it does |
|---|---|
| `scientist` | Empirical thinking — hypotheses, experiment design, confounds, evidence with uncertainty |
| `mathematician` | Rigorous proof, problem-solving, modeling, and verification |
| `philosopher` | Argument analysis, conceptual clarity, thought experiments, ethical reasoning |

### Professions & Learning

| Skill | What it does |
|---|---|
| `physician` | Clinical reasoning and health literacy — differentials, EBM, communication (educational, not medical advice) |
| `student` | Learn anything faster — active recall, spaced repetition, Feynman technique, exam prep |

### Startup & Venture

| Skill | What it does |
|---|---|
| `startup-advisor` | Lean operating guidance — validation, product-market fit, GTM, startup metrics |
| `venture-capitalist` | Investor lens — deal evaluation, market sizing, valuation/terms, portfolio strategy |
| `founder-coach` | The human side — decisions, prioritization, leadership, fundraising story, resilience |

Every skill follows the same authoring principles: lead with the spine, prioritize findings, prefer concrete output formats, name what to avoid. Larger skills also bundle a `references/` directory of deeper material the body points to.

## API

```ts
// Load
loadAllSkills(): Skill[]
getSkill(name: string): Skill
listSkills(): SkillSummary[]
asSystemPrompt(name: string): string

// Framework adapters
forClaude(name):     { system, metadata }
forOpenAI(name):     { name, description, instructions }
forLangChain(name):  { template, inputVariables }
forCrewAI(name):     { role, goal, backstory }
forAutoGen(name):    { name, system_message }
forGeneric(name):    { name, description, version, tags, inputs, instructions }
```

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
