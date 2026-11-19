#!/usr/bin/env node
// agent-skills: the command-line tool for universal-agent-skills.
// Works offline from the skills bundled in the package, so agents and scripts can list,
// search, print and export skills without writing any code.
//
//   npx universal-agent-skills list
//   npx universal-agent-skills search accessibility
//   npx universal-agent-skills show super-ui
//   npx universal-agent-skills export super-ui --format cursor --out .cursor/rules

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadAllSkills,
  getSkill,
  asSystemPrompt,
  forCursor,
  forAgentsMd,
  forStitchPrompt,
  forGeneric,
} from "../src/index.js";

const PKG = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf8"));

const HELP = `agent-skills ${PKG.version} — find and load AI agent skills from ${PKG.name}

Usage
  agent-skills list [--json]                 List every bundled skill
  agent-skills search <words...> [--json]    Find skills whose name, description or tags match
  agent-skills show <name>                   Print a skill's SKILL.md
  agent-skills prompt <name>                 Print the skill as a system prompt
  agent-skills json <name>                   Print the skill as JSON (name, tags, inputs, instructions)
  agent-skills export <name> --format <cursor|agents-md|stitch> [--out <dir>]
                                             Write a rule/instructions file (or print it without --out)
  agent-skills help | --help                 Show this help
  agent-skills --version                     Show the version

Run it with npx without installing:  npx ${PKG.name} list
Docs: https://skills.rakibulism.space/docs/cli`;

class UsageError extends Error {}

function flag(args, name) {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const value = args[i + 1];
  if (!value || value.startsWith("--")) throw new UsageError(`${name} needs a value.`);
  args.splice(i, 2);
  return value;
}

function bool(args, name) {
  const i = args.indexOf(name);
  if (i === -1) return false;
  args.splice(i, 1);
  return true;
}

function need(name, command) {
  if (!name) throw new UsageError(`Usage: agent-skills ${command} <name>`);
  return getSkill(name);
}

function table(skills) {
  if (!skills.length) return "No skills found.";
  const width = Math.max(...skills.map((s) => s.name.length));
  return skills.map((s) => `${s.name.padEnd(width)}  ${s.description}`).join("\n");
}

export function search(query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return loadAllSkills().filter((s) => {
    const hay = [s.name, s.description, ...s.tags].join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

const brief = (s) => ({ name: s.name, description: s.description, version: s.version, tags: s.tags });

/** Runs one command and returns what to print. Throws UsageError or the loader's errors. */
export function run(argv) {
  const args = [...argv];
  const json = bool(args, "--json");
  const [command, ...rest] = args;

  switch (command) {
    case undefined:
    case "help":
    case "--help":
    case "-h":
      return HELP;
    case "--version":
    case "-v":
      return PKG.version;
    case "list": {
      const skills = loadAllSkills();
      return json ? JSON.stringify(skills.map(brief), null, 2) : table(skills);
    }
    case "search": {
      if (!rest.length) throw new UsageError("Usage: agent-skills search <words...>");
      const found = search(rest.join(" "));
      return json ? JSON.stringify(found.map(brief), null, 2) : table(found);
    }
    case "show":
      return readFileSync(need(rest[0], "show").path, "utf8").trimEnd();
    case "prompt":
      need(rest[0], "prompt");
      return asSystemPrompt(rest[0]).trimEnd();
    case "json":
      need(rest[0], "json");
      return JSON.stringify(forGeneric(rest[0]), null, 2);
    case "export": {
      const format = flag(rest, "--format");
      const out = flag(rest, "--out");
      const name = rest[0];
      need(name, "export <name> --format <cursor|agents-md|stitch>");
      const file =
        format === "cursor" ? forCursor(name)
        : format === "agents-md" ? forAgentsMd(name)
        : format === "stitch" ? { filename: `${name}.stitch.txt`, ...forStitchPrompt(name) }
        : null;
      if (!file) throw new UsageError("--format must be cursor, agents-md or stitch.");
      if (!out) return file.content.trimEnd();
      const dir = resolve(out);
      mkdirSync(dir, { recursive: true });
      const target = join(dir, file.filename);
      writeFileSync(target, file.content, "utf8");
      return `Wrote ${target}`;
    }
    default:
      throw new UsageError(`Unknown command "${command}". Run agent-skills --help.`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.stdout.write(`${run(process.argv.slice(2))}\n`);
  } catch (err) {
    process.stderr.write(`agent-skills: ${err.message}\n`);
    process.exitCode = err instanceof UsageError ? 2 : 1;
  }
}
