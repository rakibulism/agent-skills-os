import assert from "node:assert/strict";
import {
  loadAllSkills,
  getSkill,
  listSkills,
  asSystemPrompt,
  forClaude,
  forOpenAI,
  forLangChain,
  forCrewAI,
  forAutoGen,
  forGeneric,
  adapters,
} from "../src/index.js";

const EXPECTED = [
  "code-reviewer",
  "component-designer",
  "data-analyst",
  "debugger",
  "design-to-code",
  "design-token-architect",
  "doc-writer",
  "interaction-designer",
  "refactorer",
  "researcher",
  "summarizer",
  "test-writer",
  "visual-polish-reviewer",
];

const all = loadAllSkills();
assert.deepEqual(
  all.map((s) => s.name),
  EXPECTED,
  "all 8 skills load with the expected names"
);

for (const s of all) {
  assert.ok(s.description, `${s.name} has a description`);
  assert.ok(s.instructions.length > 200, `${s.name} has substantive instructions`);
  assert.ok(Array.isArray(s.tags), `${s.name} tags is an array`);
}

const summary = listSkills();
assert.equal(summary.length, 13);
assert.ok(summary.every((s) => s.name && s.description));

const reviewer = getSkill("code-reviewer");
assert.equal(reviewer.name, "code-reviewer");

assert.throws(() => getSkill("nope"), /not found/);

assert.ok(asSystemPrompt("debugger").includes("root cause"));

const claude = forClaude("summarizer");
assert.ok(claude.system && claude.metadata.skill_name === "summarizer");

const openai = forOpenAI("researcher");
assert.equal(openai.name, "researcher");
assert.ok(openai.instructions);

const lc = forLangChain("test-writer");
assert.ok(lc.template.includes("{target_code}"));
assert.ok(lc.inputVariables.includes("target_code"));

const crew = forCrewAI("refactorer");
assert.ok(crew.role && crew.goal && crew.backstory);

const ag = forAutoGen("doc-writer");
assert.ok(ag.system_message);

const gen = forGeneric("data-analyst");
assert.equal(gen.name, "data-analyst");
assert.ok(Array.isArray(gen.inputs) && gen.inputs.length > 0);

assert.equal(adapters.claude, forClaude);

console.log("OK — all smoke checks passed (" + all.length + " skills loaded)");
