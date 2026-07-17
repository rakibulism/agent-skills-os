import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, "..", "skills");

/**
 * Parse YAML-ish frontmatter from a SKILL.md file.
 * Supports the subset we use: scalars, lists, and `inputs:` list-of-objects.
 */
function parseFrontmatter(raw) {
  if (!raw.startsWith("---\n")) {
    return { frontmatter: {}, body: raw };
  }
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return { frontmatter: {}, body: raw };

  const header = raw.slice(4, end);
  const body = raw.slice(end + 5);

  const fm = {};
  const lines = header.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.startsWith("#")) {
      i++;
      continue;
    }
    const m = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!m) {
      i++;
      continue;
    }
    const key = m[1];
    const rest = m[2];

    if (rest === "") {
      // Either a list or a list-of-objects follows
      const items = [];
      i++;
      while (i < lines.length && /^\s+/.test(lines[i])) {
        const itemLine = lines[i];
        if (/^\s*-\s+([a-zA-Z_][\w-]*):\s*(.*)$/.test(itemLine)) {
          // list-of-objects: start a new object
          const m2 = itemLine.match(/^\s*-\s+([a-zA-Z_][\w-]*):\s*(.*)$/);
          const obj = { [m2[1]]: unquote(m2[2]) };
          i++;
          while (
            i < lines.length &&
            /^\s+/.test(lines[i]) &&
            !/^\s*-\s/.test(lines[i])
          ) {
            const m3 = lines[i].match(/^\s+([a-zA-Z_][\w-]*):\s*(.*)$/);
            if (m3) obj[m3[1]] = coerce(unquote(m3[2]));
            i++;
          }
          items.push(obj);
        } else if (/^\s*-\s+(.*)$/.test(itemLine)) {
          items.push(coerce(unquote(itemLine.match(/^\s*-\s+(.*)$/)[1])));
          i++;
        } else {
          i++;
        }
      }
      fm[key] = items;
    } else if (rest.startsWith("[") && rest.endsWith("]")) {
      // inline list: [a, b, c]
      fm[key] = rest
        .slice(1, -1)
        .split(",")
        .map((s) => coerce(unquote(s.trim())))
        .filter((s) => s !== "");
      i++;
    } else {
      fm[key] = coerce(unquote(rest));
      i++;
    }
  }
  return { frontmatter: fm, body: body.trim() };
}

function unquote(s) {
  s = s.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}

function coerce(s) {
  if (s === "true") return true;
  if (s === "false") return false;
  if (s === "null") return null;
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
  return s;
}

let _cache = null;

/**
 * Load all skills from the bundled skills/ directory.
 * Returns an array of Skill objects, sorted by name.
 */
export function loadAllSkills() {
  if (_cache) return _cache;
  const entries = readdirSync(SKILLS_DIR);
  const skills = [];
  for (const entry of entries) {
    const dir = join(SKILLS_DIR, entry);
    if (!statSync(dir).isDirectory()) continue;
    const skillPath = join(dir, "SKILL.md");
    try {
      const raw = readFileSync(skillPath, "utf8");
      const { frontmatter, body } = parseFrontmatter(raw);
      skills.push({
        name: frontmatter.name || entry,
        description: frontmatter.description || "",
        version: frontmatter.version || "0.0.0",
        tags: frontmatter.tags || [],
        inputs: frontmatter.inputs || [],
        related: frontmatter.related || [],
        instructions: body,
        path: skillPath,
      });
    } catch {
      // skip directories without SKILL.md
    }
  }
  skills.sort((a, b) => a.name.localeCompare(b.name));
  _cache = skills;
  return skills;
}

/**
 * Get a single skill by name. Throws if not found.
 */
export function getSkill(name) {
  const skill = loadAllSkills().find((s) => s.name === name);
  if (!skill) {
    const available = loadAllSkills()
      .map((s) => s.name)
      .join(", ");
    throw new Error(`Skill "${name}" not found. Available: ${available}`);
  }
  return skill;
}

/**
 * List skill names and descriptions (for menus / catalogs).
 */
export function listSkills() {
  return loadAllSkills().map((s) => ({
    name: s.name,
    description: s.description,
    tags: s.tags,
  }));
}

/**
 * Resolve the `related` skills declared in a skill's frontmatter into full
 * Skill objects (name + description, not the full instructions body, to keep
 * this cheap to call speculatively). Names that don't resolve to a real skill
 * (a typo, or a skill renamed/removed since the link was written) are dropped
 * rather than throwing — a stale related-link shouldn't break the caller.
 *
 * This exists so a consuming agent doesn't need the user to already know and
 * type every skill name up front: load one skill, inspect `.related`, and
 * decide whether the current task also calls for one of its complements
 * (e.g. loading `design-engineer` for a WebGL hero section should surface
 * `webgl-creative-animator` without the user having typed it separately).
 */
export function getRelatedSkills(name) {
  const skill = getSkill(name);
  const all = loadAllSkills();
  return skill.related
    .map((relatedName) => all.find((s) => s.name === relatedName))
    .filter(Boolean)
    .map((s) => ({ name: s.name, description: s.description, tags: s.tags }));
}

/**
 * Render a skill as a system prompt string. Framework-agnostic — works
 * anywhere you can pass a system / instructions string.
 */
export function asSystemPrompt(name) {
  const skill = getSkill(name);
  return skill.instructions;
}

/**
 * Adapter: Claude Agent SDK (or any Anthropic Messages API caller).
 * Returns { system, metadata } suitable for `anthropic.messages.create({...})`.
 */
export function forClaude(name) {
  const skill = getSkill(name);
  return {
    system: skill.instructions,
    metadata: {
      skill_name: skill.name,
      skill_version: skill.version,
      related_skills: skill.related,
    },
  };
}

/**
 * Adapter: OpenAI Assistants / Responses API.
 * Returns { instructions, name, description } suitable for `openai.beta.assistants.create({...})`.
 */
export function forOpenAI(name) {
  const skill = getSkill(name);
  return {
    name: skill.name,
    description: skill.description,
    instructions: skill.instructions,
  };
}

/**
 * Adapter: LangChain (JS/TS).
 * Returns a PromptTemplate-shaped object: { template, inputVariables }.
 * Each declared input becomes a `{var}` placeholder appended to the instructions.
 */
export function forLangChain(name) {
  const skill = getSkill(name);
  const inputVariables = (skill.inputs || []).map((i) => i.name);
  const inputSection = inputVariables.length
    ? "\n\n---\n\n" +
      inputVariables.map((v) => `${v}:\n{${v}}`).join("\n\n")
    : "";
  return {
    template: skill.instructions + inputSection,
    inputVariables,
  };
}

/**
 * Adapter: CrewAI agent config (Python framework — JSON shape).
 * Returns { role, goal, backstory } that maps cleanly into a CrewAI Agent.
 */
export function forCrewAI(name) {
  const skill = getSkill(name);
  return {
    role: skill.name,
    goal: skill.description,
    backstory: skill.instructions,
  };
}

/**
 * Adapter: AutoGen / generic system-message agent config.
 * Returns { name, system_message }.
 */
export function forAutoGen(name) {
  const skill = getSkill(name);
  return {
    name: skill.name,
    system_message: skill.instructions,
  };
}

/**
 * Adapter: Cursor IDE rule file (.cursor/rules/<name>.mdc).
 * Returns { filename, content } — `content` is a complete, ready-to-write
 * .mdc file: YAML frontmatter (description + alwaysApply) followed by the
 * skill's instructions as the rule body. Defaults to `alwaysApply: false` so
 * Cursor treats it as an "Agent Requested" rule — the agent reads
 * `description` and decides whether to pull it in, rather than it being
 * injected into every request regardless of relevance.
 */
export function forCursor(name) {
  const skill = getSkill(name);
  const description = skill.description.replace(/\n/g, " ").trim();
  const content = `---
description: ${JSON.stringify(description)}
alwaysApply: false
---

${skill.instructions}
`;
  return { filename: `${skill.name}.mdc`, content };
}

/**
 * Adapter: AGENTS.md — the open, tool-agnostic instructions format read by
 * OpenAI Codex, OpenCode, Google Antigravity (via its AGENTS.md support),
 * Cursor, Windsurf, GitHub Copilot, and others. Returns { filename, content }
 * shaped as a droppable section: a heading plus the skill's instructions,
 * meant to be pasted into (or concatenated onto) a project's existing
 * AGENTS.md rather than treated as a complete standalone file, since AGENTS.md
 * conventionally holds every convention for a project, not just one skill.
 */
export function forAgentsMd(name) {
  const skill = getSkill(name);
  const content = `## ${skill.name} (via universal-agent-skills)

${skill.description}

${skill.instructions}
`;
  return { filename: `${skill.name}.agents.md`, content };
}

/**
 * Adapter: Stitch (or any prompt-only, no-rule-file design tool). Returns
 * { content } — a single plain-text prompt combining the skill's description
 * and instructions, ready to paste directly into a prompt box. There is no
 * file convention to target here (Stitch has no skill/rule-file concept), so
 * unlike the other adapters this is meant to be copy-pasted, not written to
 * disk under a specific path.
 */
export function forStitchPrompt(name) {
  const skill = getSkill(name);
  const content = `${skill.description}\n\n${skill.instructions}`;
  return { content };
}

/**
 * Adapter: generic / framework-agnostic JSON. Useful for tool registries,
 * function-calling tool specs, or your own runtime.
 */
export function forGeneric(name) {
  const skill = getSkill(name);
  return {
    name: skill.name,
    description: skill.description,
    version: skill.version,
    tags: skill.tags,
    inputs: skill.inputs,
    related: skill.related,
    instructions: skill.instructions,
  };
}

export const adapters = {
  claude: forClaude,
  openai: forOpenAI,
  langchain: forLangChain,
  crewai: forCrewAI,
  autogen: forAutoGen,
  cursor: forCursor,
  agentsMd: forAgentsMd,
  stitch: forStitchPrompt,
  generic: forGeneric,
};
