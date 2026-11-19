/*
 * Browser copies of the adapters in ../../src/index.js, for the live demo.
 * They must return exactly what the package returns: scripts/check-adapters.mjs
 * compares the two on every build.
 */
export type DemoSkill = {
  name: string;
  description: string;
  version: string;
  tags: string[];
  inputs: { name: string; description: string; required: boolean }[];
  related: string[];
  author: string | null;
  author_url: string | null;
  instructions: string;
};

export type AdapterKey =
  | 'claude' | 'openai' | 'langchain' | 'crewai' | 'autogen'
  | 'cursor' | 'agentsMd' | 'stitch' | 'generic';

type Adapter = {
  label: string;
  fn: string;
  hint: string;
  /** Returns a file's text rather than an object to pass to an SDK. */
  file?: boolean;
  run: (s: DemoSkill) => Record<string, unknown>;
};

export const ADAPTERS: Record<AdapterKey, Adapter> = {
  claude: {
    label: 'Claude', fn: 'forClaude', hint: 'Pass system to anthropic.messages.create()',
    run: (s) => ({ system: s.instructions, metadata: { skill_name: s.name, skill_version: s.version, related_skills: s.related } }),
  },
  openai: {
    label: 'OpenAI', fn: 'forOpenAI', hint: 'Spread into openai.beta.assistants.create()',
    run: (s) => ({ name: s.name, description: s.description, instructions: s.instructions }),
  },
  langchain: {
    label: 'LangChain', fn: 'forLangChain', hint: 'Give template to PromptTemplate.fromTemplate()',
    run: (s) => {
      const inputVariables = s.inputs.map((i) => i.name);
      const section = inputVariables.length
        ? '\n\n---\n\n' + inputVariables.map((v) => `${v}:\n{${v}}`).join('\n\n')
        : '';
      return { template: s.instructions + section, inputVariables };
    },
  },
  crewai: {
    label: 'CrewAI', fn: 'forCrewAI', hint: 'Maps onto a CrewAI Agent',
    run: (s) => ({ role: s.name, goal: s.description, backstory: s.instructions }),
  },
  autogen: {
    label: 'AutoGen', fn: 'forAutoGen', hint: 'Pass to AssistantAgent()',
    run: (s) => ({ name: s.name, system_message: s.instructions }),
  },
  cursor: {
    label: 'Cursor', fn: 'forCursor', hint: 'Write to .cursor/rules/', file: true,
    run: (s) => ({
      filename: `${s.name}.mdc`,
      content: `---\ndescription: ${JSON.stringify(s.description.replace(/\n/g, ' ').trim())}\nalwaysApply: false\n---\n\n${s.instructions}\n`,
    }),
  },
  agentsMd: {
    label: 'AGENTS.md', fn: 'forAgentsMd', hint: "Append to your project's AGENTS.md", file: true,
    run: (s) => ({
      filename: `${s.name}.agents.md`,
      content: `## ${s.name} (via universal-agent-skills)\n\n${s.description}\n\n${s.instructions}\n`,
    }),
  },
  stitch: {
    label: 'Stitch', fn: 'forStitchPrompt', hint: 'Paste into the prompt box', file: true,
    run: (s) => ({ content: `${s.description}\n\n${s.instructions}` }),
  },
  generic: {
    label: 'Generic', fn: 'forGeneric', hint: 'For your own runtime or tool registry',
    run: (s) => ({
      name: s.name, description: s.description, version: s.version, tags: s.tags, inputs: s.inputs,
      related: s.related, author: s.author, author_url: s.author_url, instructions: s.instructions,
    }),
  },
};

export const ADAPTER_KEYS = Object.keys(ADAPTERS) as AdapterKey[];
