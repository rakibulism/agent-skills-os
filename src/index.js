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
    instructions: skill.instructions,
  };
}

export const adapters = {
  claude: forClaude,
  openai: forOpenAI,
  langchain: forLangChain,
  crewai: forCrewAI,
  autogen: forAutoGen,
  generic: forGeneric,
};
