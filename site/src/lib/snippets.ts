import type { DemoSkill } from './adapters';
import type { Lang } from './highlight';

export const EXAMPLE_SKILL_FILE = `---
name: release-notes
description: Turn merged pull requests into release notes grouped by what users notice.
version: 0.1.0
tags: [writing, engineering]
inputs:
  - name: changes
    description: Merged PR titles and descriptions.
    required: true
---

# release-notes

Group changes under New, Improved and Fixed.
Write one line per change, in plain words, present tense.
Leave out internal refactors unless they change behavior.`;

/** What the package's loader produces for EXAMPLE_SKILL_FILE. */
export const EXAMPLE_SKILL: DemoSkill = {
  name: 'release-notes',
  description: 'Turn merged pull requests into release notes grouped by what users notice.',
  version: '0.1.0',
  tags: ['writing', 'engineering'],
  inputs: [{ name: 'changes', description: 'Merged PR titles and descriptions.', required: true }],
  related: [],
  author: null,
  author_url: null,
  instructions:
    '# release-notes\n\nGroup changes under New, Improved and Fixed.\nWrite one line per change, in plain words, present tense.\nLeave out internal refactors unless they change behavior.',
};

export type Snippet = { id: string; label: string; file: string; lang: Lang; code: string };

export const USAGE: Snippet[] = [
  {
    id: 'claude', label: 'Claude', file: 'agent.js', lang: 'js',
    code: `import Anthropic from "@anthropic-ai/sdk";
import { forClaude } from "universal-agent-skills";

const anthropic = new Anthropic();
const { system } = forClaude("super-ui");

const msg = await anthropic.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 4096,
  system,
  messages: [{ role: "user", content: "Review this dashboard screen." }],
});`,
  },
  {
    id: 'openai', label: 'OpenAI', file: 'assistant.js', lang: 'js',
    code: `import OpenAI from "openai";
import { forOpenAI } from "universal-agent-skills";

const openai = new OpenAI();
const assistant = await openai.beta.assistants.create({
  model: "gpt-4o",
  ...forOpenAI("super-ui"), // { name, description, instructions }
});`,
  },
  {
    id: 'langchain', label: 'LangChain', file: 'chain.js', lang: 'js',
    code: `import { PromptTemplate } from "@langchain/core/prompts";
import { forLangChain } from "universal-agent-skills";

// Each declared input becomes a {placeholder} in the template.
const { template, inputVariables } = forLangChain("super-ui");
const prompt = PromptTemplate.fromTemplate(template);`,
  },
  {
    id: 'python', label: 'CrewAI & AutoGen', file: 'agents.py', lang: 'py',
    code: `# Build a catalog once from Node:
#   node -e "import('universal-agent-skills').then(m =>
#     console.log(JSON.stringify(m.loadAllSkills())))" > skills.json
import json
from crewai import Agent
from autogen import AssistantAgent

skills = {s["name"]: s for s in json.load(open("skills.json"))}
skill = skills["super-ui"]

crew_agent = Agent(role=skill["name"], goal=skill["description"],
                   backstory=skill["instructions"])
autogen_agent = AssistantAgent(name=skill["name"],
                               system_message=skill["instructions"])`,
  },
  {
    id: 'files', label: 'Cursor & AGENTS.md', file: 'terminal', lang: 'sh',
    code: `# Write Cursor, AGENTS.md and Stitch versions to skills/<name>/exports/
node scripts/export-skill.js super-ui
node scripts/export-skill.js --all

# Or from code: forCursor(name), forAgentsMd(name), forStitchPrompt(name)
# Copy a skill's references/ folder alongside the file so its links resolve.`,
  },
];

export const TEMPLATE_FILE = `---
name: my-skill
description: When to use this skill and what it produces.
version: 0.1.0
tags: [domain, capability]
inputs:
  - name: input_name
    description: What this input is.
    required: true
related: [other-skill]   # optional
author: your-name        # optional, only if you wrote it
---

# my-skill

The instructions the agent follows: the process,
the output shape, and what to avoid.`;

export const API = {
  load: [
    ['loadAllSkills()', 'Skill[]'],
    ['getSkill(name)', 'Skill'],
    ['listSkills()', 'SkillSummary[]'],
    ['getRelatedSkills(name)', 'RelatedSkillSummary[]'],
    ['asSystemPrompt(name)', 'string'],
  ],
  adapt: [
    ['forClaude(name)', '{ system, metadata }'],
    ['forOpenAI(name)', '{ name, description, instructions }'],
    ['forLangChain(name)', '{ template, inputVariables }'],
    ['forCrewAI(name)', '{ role, goal, backstory }'],
    ['forAutoGen(name)', '{ name, system_message }'],
    ['forCursor(name)', '{ filename, content }'],
    ['forAgentsMd(name)', '{ filename, content }'],
    ['forStitchPrompt(name)', '{ content }'],
    ['forGeneric(name)', '{ name, description, version, … }'],
  ],
} as const;

export const RULES = [
  ['Lead with intent.', 'The first paragraph says when the skill applies.'],
  ['Process before output.', 'Describe how to think, not only what to emit.'],
  ['Specify the output shape.', 'Models drift without a target format.'],
  ['Name the failure modes.', 'A "what to avoid" section prevents the common mistakes.'],
  ['Be concrete.', 'One real example teaches more than a paragraph of advice.'],
] as const;
