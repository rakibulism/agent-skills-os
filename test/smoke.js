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
  "academic-researcher",
  "accessibility-auditor",
  "animated-component-architect",
  "brand-voice-reviewer",
  "campaign-planner",
  "code-reviewer",
  "color-grading",
  "competitive-analyst",
  "component-designer",
  "creative-artist",
  "data-analyst",
  "de1-aesthetic-deconstruction",
  "de1-grid-spacing",
  "de1-micro-typography",
  "de1-optical-alignment",
  "de1-perceptual-color",
  "de2-figma-to-code",
  "de2-interaction-storyboarding",
  "de2-motion-prototyping",
  "de2-perspective-sketching",
  "de3-asset-pipeline",
  "de3-glsl-shaders",
  "de3-linear-algebra",
  "de3-threejs-r3f",
  "de4-bezier-splines",
  "de4-collision-detection",
  "de4-euler-integration",
  "de4-momentum-inertia",
  "de4-spring-damper",
  "de5-canvas-2d",
  "de5-critical-rendering-path",
  "de5-gpu-compositing",
  "de5-lowlevel-js",
  "de5-pointer-gestures",
  "de6-component-composition",
  "de6-state-systems",
  "de6-token-pipeline",
  "de6-typescript",
  "de7-core-web-vitals",
  "de7-profiling",
  "de7-resource-budgets",
  "de7-webgl-fallbacks",
  "de8-bundling",
  "de8-cicd",
  "de8-edge-deployment",
  "de8-telemetry",
  "debugger",
  "deploy-checklist-writer",
  "design-critic",
  "design-engineer",
  "design-to-code",
  "design-token-architect",
  "doc-writer",
  "email-sequence-writer",
  "ffmpeg-operator",
  "founder-coach",
  "frontend-performance-engineer",
  "incident-commander",
  "interaction-designer",
  "interactive-web-engineer",
  "mathematician",
  "motion-design-engineer",
  "motion-graphics",
  "page-flip-builder",
  "philosopher",
  "physician",
  "product-designer",
  "refactorer",
  "researcher",
  "scientist",
  "seo-strategist",
  "sound-design",
  "standup-reporter",
  "startup-advisor",
  "student",
  "summarizer",
  "system-architect",
  "task-manager",
  "tech-debt-auditor",
  "test-writer",
  "testing-strategist",
  "user-researcher",
  "ux-copywriter",
  "ux-expert-rakibulism",
  "ux-ui-designer",
  "venture-capitalist",
  "video-editor",
  "visual-polish-reviewer",
  "webgl-creative-coder",
  "webgl-motion-stack",
  "wgl-creative-vision",
  "wgl-draw-call-batching",
  "wgl-gsap-motion",
  "wgl-pixijs-2d-engine",
  "wgl-theatrejs-editor",
];

const all = loadAllSkills();
assert.deepEqual(
  all.map((s) => s.name),
  EXPECTED,
  "all skills load with the expected names"
);

for (const s of all) {
  assert.ok(s.description, `${s.name} has a description`);
  assert.ok(s.instructions.length > 200, `${s.name} has substantive instructions`);
  assert.ok(Array.isArray(s.tags), `${s.name} tags is an array`);
}

const summary = listSkills();
assert.equal(summary.length, EXPECTED.length);
assert.ok(summary.every((s) => s.name && s.description));

// Each new skill should declare at least one input and carry tags.
for (const name of [
  "ux-ui-designer",
  "product-designer",
  "creative-artist",
  "scientist",
  "academic-researcher",
  "philosopher",
  "mathematician",
  "physician",
  "student",
  "startup-advisor",
  "venture-capitalist",
  "founder-coach",
  "video-editor",
  "color-grading",
  "sound-design",
  "motion-graphics",
  "ffmpeg-operator",
]) {
  const s = getSkill(name);
  assert.ok(s.inputs.length > 0, `${name} declares inputs`);
  assert.ok(s.tags.length > 0, `${name} declares tags`);
  assert.ok(s.instructions.length > 500, `${name} has substantive instructions`);
}

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

// Spot-check a LangChain template for one of the new skills.
const phil = forLangChain("philosopher");
assert.ok(phil.inputVariables.includes("question"));
assert.ok(phil.template.includes("{question}"));

console.log("OK — all smoke checks passed (" + all.length + " skills loaded)");
