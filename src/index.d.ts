export interface SkillInput {
  name: string;
  description?: string;
  required?: boolean;
}

export interface Skill {
  name: string;
  description: string;
  version: string;
  tags: string[];
  inputs: SkillInput[];
  instructions: string;
  path: string;
}

export interface SkillSummary {
  name: string;
  description: string;
  tags: string[];
}

export interface ClaudeAdapter {
  system: string;
  metadata: { skill_name: string; skill_version: string };
}

export interface OpenAIAdapter {
  name: string;
  description: string;
  instructions: string;
}

export interface LangChainAdapter {
  template: string;
  inputVariables: string[];
}

export interface CrewAIAdapter {
  role: string;
  goal: string;
  backstory: string;
}

export interface AutoGenAdapter {
  name: string;
  system_message: string;
}

export interface GenericAdapter {
  name: string;
  description: string;
  version: string;
  tags: string[];
  inputs: SkillInput[];
  instructions: string;
}

export function loadAllSkills(): Skill[];
export function getSkill(name: string): Skill;
export function listSkills(): SkillSummary[];
export function asSystemPrompt(name: string): string;

export function forClaude(name: string): ClaudeAdapter;
export function forOpenAI(name: string): OpenAIAdapter;
export function forLangChain(name: string): LangChainAdapter;
export function forCrewAI(name: string): CrewAIAdapter;
export function forAutoGen(name: string): AutoGenAdapter;
export function forGeneric(name: string): GenericAdapter;

export const adapters: {
  claude: typeof forClaude;
  openai: typeof forOpenAI;
  langchain: typeof forLangChain;
  crewai: typeof forCrewAI;
  autogen: typeof forAutoGen;
  generic: typeof forGeneric;
};
