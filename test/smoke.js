import assert from "node:assert/strict";
import {
  loadAllSkills,
  getSkill,
  listSkills,
  getRelatedSkills,
  asSystemPrompt,
  forClaude,
  forOpenAI,
  forLangChain,
  forCrewAI,
  forAutoGen,
  forCursor,
  forAgentsMd,
  forStitchPrompt,
  forGeneric,
  adapters,
} from "../src/index.js";

const SKILL_NAME = "ux-expert-rakibulism";

const all = loadAllSkills();

assert.equal(all.length, 1, `expected exactly 1 skill, got ${all.length}`);
assert.equal(all[0].name, SKILL_NAME);

const summary = listSkills();
assert.equal(summary.length, 1);
assert.ok(summary[0].name === SKILL_NAME && summary[0].description);

const skill = getSkill(SKILL_NAME);
assert.equal(skill.name, SKILL_NAME);
assert.ok(skill.description, "skill has a description");
assert.ok(skill.instructions.length > 200, "skill has substantive instructions");
assert.ok(Array.isArray(skill.tags) && skill.tags.length > 0, "skill declares tags");
assert.ok(Array.isArray(skill.related), "skill.related is an array");
assert.ok(skill.inputs.length > 0, "skill declares inputs");

assert.throws(() => getSkill("nope"), /not found/);

assert.ok(asSystemPrompt(SKILL_NAME).length > 200);

const claude = forClaude(SKILL_NAME);
assert.ok(claude.system && claude.metadata.skill_name === SKILL_NAME);

const openai = forOpenAI(SKILL_NAME);
assert.equal(openai.name, SKILL_NAME);
assert.ok(openai.instructions);

const lc = forLangChain(SKILL_NAME);
assert.ok(lc.template.includes("{design}"));
assert.ok(lc.inputVariables.includes("design"));

const crew = forCrewAI(SKILL_NAME);
assert.ok(crew.role && crew.goal && crew.backstory);

const ag = forAutoGen(SKILL_NAME);
assert.ok(ag.system_message);

const gen = forGeneric(SKILL_NAME);
assert.equal(gen.name, SKILL_NAME);
assert.ok(Array.isArray(gen.inputs) && gen.inputs.length > 0);

assert.equal(adapters.claude, forClaude);
assert.equal(adapters.cursor, forCursor);
assert.equal(adapters.agentsMd, forAgentsMd);
assert.equal(adapters.stitch, forStitchPrompt);

// A skill with no declared related links returns an empty array, not an error.
assert.deepEqual(getRelatedSkills(SKILL_NAME), []);

// Multi-tool export adapters: Cursor .mdc, AGENTS.md, and Stitch prompt.
const cursor = forCursor(SKILL_NAME);
assert.equal(cursor.filename, `${SKILL_NAME}.mdc`);
assert.ok(cursor.content.startsWith("---\ndescription:"), "Cursor export starts with YAML frontmatter");
assert.ok(cursor.content.includes("alwaysApply: false"));
assert.ok(cursor.content.includes(skill.instructions));

const agentsMd = forAgentsMd(SKILL_NAME);
assert.equal(agentsMd.filename, `${SKILL_NAME}.agents.md`);
assert.ok(agentsMd.content.startsWith(`## ${SKILL_NAME}`));
assert.ok(agentsMd.content.includes(skill.instructions));

const stitch = forStitchPrompt(SKILL_NAME);
assert.ok(stitch.content.includes(skill.description));
assert.ok(stitch.content.includes(skill.instructions));
assert.equal(Object.keys(stitch).length, 1, "Stitch adapter has no file convention, just content");

// Author attribution: present on rakibulism's own original work.
assert.equal(skill.author, "rakibulism");
assert.equal(skill.author_url, "https://x.com/rakibulism");

const genWithAuthor = forGeneric(SKILL_NAME);
assert.equal(genWithAuthor.author, "rakibulism");
assert.equal(genWithAuthor.author_url, "https://x.com/rakibulism");

console.log("OK — all smoke checks passed (" + all.length + " skill loaded)");
