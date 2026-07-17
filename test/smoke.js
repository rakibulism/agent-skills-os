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

// A handful of anchor names that must always resolve, spanning the original
// hand-authored set, the design-engineer curriculum (now folded into its
// references/, not a top-level skill — de3-glsl-shaders etc. are deliberately
// NOT in this list anymore), and later bulk additions. This intentionally
// does NOT enumerate every skill — the full roster changes too often for an
// exhaustive list to be worth maintaining; the count/uniqueness/shape checks
// below cover the roster as a whole instead.
const ANCHOR_NAMES = [
  "academic-researcher",
  "code-reviewer",
  "design-engineer",
  "webgl-creative-animator",
  "elite-website-ux-ui-designer",
  "seo-strategist",
  "philosopher",
  "ux-expert-rakibulism",
];

const all = loadAllSkills();

assert.ok(all.length >= 160, `expected at least 160 skills, got ${all.length}`);

const names = all.map((s) => s.name);
assert.deepEqual(names, [...names].sort(), "loadAllSkills() returns skills sorted by name");
assert.equal(new Set(names).size, names.length, "no duplicate skill names");

for (const anchor of ANCHOR_NAMES) {
  assert.ok(names.includes(anchor), `expected anchor skill "${anchor}" to be present`);
}

// The design-engineer curriculum (de1-de8, webgl-motion-stack, wgl-*, and the
// 8 condensed de-* track summaries) was folded into
// skills/design-engineer/references/ and must NOT resurface as top-level
// skills — regression check for that restructure.
const shouldNotBeTopLevel = names.filter(
  (n) =>
    /^de[1-8]-/.test(n) ||
    /^wgl-/.test(n) ||
    n === "webgl-motion-stack" ||
    /^de-/.test(n)
);
assert.equal(
  shouldNotBeTopLevel.length,
  0,
  `design-engineer curriculum skills leaked back to top-level: ${shouldNotBeTopLevel.join(", ")}`
);

for (const s of all) {
  assert.ok(s.description, `${s.name} has a description`);
  assert.ok(s.instructions.length > 200, `${s.name} has substantive instructions`);
  assert.ok(Array.isArray(s.tags), `${s.name} tags is an array`);
  assert.ok(Array.isArray(s.related), `${s.name} related is an array`);
}

const summary = listSkills();
assert.equal(summary.length, all.length);
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

// Related-skills auto-discovery: a consumer loading design-engineer should
// be able to find webgl-creative-animator (and vice versa) without the user
// having typed its name, and getRelatedSkills should degrade gracefully for
// a skill that declares no related links.
const deRelated = getRelatedSkills("design-engineer");
assert.ok(
  deRelated.some((s) => s.name === "webgl-creative-animator"),
  "design-engineer's related skills include webgl-creative-animator"
);

const wglRelated = getRelatedSkills("webgl-creative-animator");
assert.ok(
  wglRelated.some((s) => s.name === "design-engineer"),
  "webgl-creative-animator's related skills include design-engineer"
);

assert.deepEqual(
  getRelatedSkills("summarizer"),
  [],
  "a skill with no declared related links returns an empty array, not an error"
);

const claudeWithRelated = forClaude("design-engineer");
assert.ok(
  claudeWithRelated.metadata.related_skills.includes("webgl-creative-animator"),
  "forClaude() surfaces related_skills in metadata"
);

const genWithRelated = forGeneric("design-engineer");
assert.ok(
  genWithRelated.related.includes("webgl-creative-animator"),
  "forGeneric() surfaces the related field"
);

// design-engineer <-> elite-website-ux-ui-designer is the second proof-of-concept
// pair for related-skills auto-discovery (design decisions vs. implementation).
const deRelated2 = getRelatedSkills("design-engineer");
assert.ok(
  deRelated2.some((s) => s.name === "elite-website-ux-ui-designer"),
  "design-engineer's related skills include elite-website-ux-ui-designer"
);
const eliteRelated = getRelatedSkills("elite-website-ux-ui-designer");
assert.ok(
  eliteRelated.some((s) => s.name === "design-engineer") &&
    eliteRelated.some((s) => s.name === "ux-ui-designer"),
  "elite-website-ux-ui-designer's related skills include design-engineer and ux-ui-designer"
);
const uxUiRelated = getRelatedSkills("ux-ui-designer");
assert.ok(
  uxUiRelated.some((s) => s.name === "elite-website-ux-ui-designer"),
  "ux-ui-designer's related skills include elite-website-ux-ui-designer"
);

// Multi-tool export adapters: Cursor .mdc, AGENTS.md, and Stitch prompt.
const cursor = forCursor("code-reviewer");
assert.equal(cursor.filename, "code-reviewer.mdc");
assert.ok(cursor.content.startsWith("---\ndescription:"), "Cursor export starts with YAML frontmatter");
assert.ok(cursor.content.includes("alwaysApply: false"));
assert.ok(cursor.content.includes(getSkill("code-reviewer").instructions));

const agentsMd = forAgentsMd("code-reviewer");
assert.equal(agentsMd.filename, "code-reviewer.agents.md");
assert.ok(agentsMd.content.startsWith("## code-reviewer"));
assert.ok(agentsMd.content.includes(getSkill("code-reviewer").instructions));

const stitch = forStitchPrompt("elite-website-ux-ui-designer");
assert.ok(stitch.content.includes(getSkill("elite-website-ux-ui-designer").description));
assert.ok(stitch.content.includes(getSkill("elite-website-ux-ui-designer").instructions));
assert.equal(Object.keys(stitch).length, 1, "Stitch adapter has no file convention, just content");

assert.equal(adapters.cursor, forCursor);
assert.equal(adapters.agentsMd, forAgentsMd);
assert.equal(adapters.stitch, forStitchPrompt);

// Author attribution: present on rakibulism's own original work, absent
// (null, not a fabricated value) on third-party-authored and
// plugin-marketplace-sourced skills whose actual author is someone else.
for (const s of all) {
  assert.ok(
    s.author === null || typeof s.author === "string",
    `${s.name} author is null or a string`
  );
  assert.ok(
    s.author_url === null || typeof s.author_url === "string",
    `${s.name} author_url is null or a string`
  );
}

const designEngineerAuthor = getSkill("design-engineer");
assert.equal(designEngineerAuthor.author, "rakibulism");
assert.equal(designEngineerAuthor.author_url, "https://x.com/rakibulism");

// keyword-research's real author (aaron-he-zhu) is nested under its
// frontmatter's `metadata:` key, which this package's frontmatter parser
// doesn't unpack (only `inputs`-style list-of-objects are supported) — so
// its top-level `author` reads as null here, not "aaron-he-zhu". Either way,
// the important invariant holds: it must never read as "rakibulism".
const thirdPartySkill = getSkill("keyword-research");
assert.notEqual(
  thirdPartySkill.author,
  "rakibulism",
  "a skill with its own real (if not fully parsed) third-party author is never relabeled as rakibulism's"
);

const genWithAuthor = forGeneric("design-engineer");
assert.equal(genWithAuthor.author, "rakibulism");
assert.equal(genWithAuthor.author_url, "https://x.com/rakibulism");

console.log("OK — all smoke checks passed (" + all.length + " skills loaded)");
