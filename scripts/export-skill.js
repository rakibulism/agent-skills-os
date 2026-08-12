#!/usr/bin/env node
// Writes a skill's content in every supported non-native export format
// (Cursor .mdc, AGENTS.md section, Stitch prompt) to skills/<name>/exports/.
// Claude and the other JS-framework adapters (OpenAI, LangChain, CrewAI,
// AutoGen, generic) don't need a static file — they're consumed by calling
// the adapter function directly at runtime.
//
// Usage:
//   node scripts/export-skill.js <skill-name>
//   node scripts/export-skill.js --all

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadAllSkills,
  forCursor,
  forAgentsMd,
  forStitchPrompt,
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, "..", "skills");

function exportOne(name) {
  const dir = join(SKILLS_DIR, name, "exports");
  mkdirSync(dir, { recursive: true });

  const cursor = forCursor(name);
  writeFileSync(join(dir, cursor.filename), cursor.content, "utf8");

  const agentsMd = forAgentsMd(name);
  writeFileSync(join(dir, agentsMd.filename), agentsMd.content, "utf8");

  const stitch = forStitchPrompt(name);
  writeFileSync(join(dir, `${name}.stitch-prompt.md`), stitch.content, "utf8");

  console.log(`Exported ${name} -> skills/${name}/exports/`);
}

const arg = process.argv[2];
if (!arg) {
  console.error("Usage: node scripts/export-skill.js <skill-name> | --all");
  process.exit(1);
}

if (arg === "--all") {
  for (const skill of loadAllSkills()) exportOne(skill.name);
} else {
  exportOne(arg);
}
