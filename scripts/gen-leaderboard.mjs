#!/usr/bin/env node
// Regenerates the skills list (between the skills:start / skills:end markers) in site/index.html
// from the actual skills/ directory, so the site never drifts from the repo.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SKILLS_DIR = "skills";
const INDEX_HTML = "site/index.html";

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const lines = m[1].split("\n");
  const fm = {};
  let curKey = null;
  for (const line of lines) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (kv && !line.startsWith(" ") && !line.startsWith("-")) {
      curKey = kv[1];
      let val = kv[2].trim();
      if (val.startsWith("[") && val.endsWith("]")) {
        fm[curKey] = val
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (val !== "") {
        fm[curKey] = val;
      } else {
        fm[curKey] = [];
      }
    }
  }
  return fm;
}

const CATEGORIES = [
  { key: "deng", label: "Design Engineering", badge: "DENG", css: "deng" },
  { key: "seo", label: "SEO", badge: "SEO", css: "seo" },
  { key: "figma", label: "Figma", badge: "FIG", css: "figma" },
  { key: "marketing", label: "Marketing", badge: "MKT", css: "marketing" },
  { key: "brand", label: "Brand", badge: "BRD", css: "brand" },
  { key: "engineering", label: "Engineering", badge: "ENG", css: "eng" },
  { key: "design", label: "Design", badge: "DES", css: "des" },
  { key: "research", label: "Research", badge: "RES", css: "res" },
  { key: "productivity", label: "Productivity", badge: "PROD", css: "productivity" },
  { key: "general", label: "General", badge: "GEN", css: "general" },
];

function categorize(dir, tags) {
  const t = new Set(tags.map((s) => s.toLowerCase()));
  if (/^de\d/.test(dir) || dir.startsWith("wgl-") || dir === "design-engineer" || dir.includes("webgl"))
    return "deng";
  if (dir.startsWith("figma-") || dir === "figma") return "figma";
  if (dir.startsWith("seo-") || dir === "seo" || dir === "technical-seo-audit" || dir === "keyword-research")
    return "seo";
  if (dir.startsWith("brand-voice") || dir === "brand-guidelines") return "brand";
  if (dir.startsWith("marketing-") || dir === "marketing" || t.has("marketing") || t.has("campaign") || t.has("copywriting"))
    return "marketing";
  if (dir.startsWith("engineering-") || t.has("engineering") || t.has("code-review") || t.has("testing") || t.has("deployment") || t.has("architecture"))
    return "engineering";
  if (
    dir.startsWith("design-") ||
    t.has("ui") ||
    t.has("ux") ||
    t.has("accessibility") ||
    t.has("design-system") ||
    t.has("web-design")
  )
    return "design";
  if (dir.startsWith("productivity-") || dir.startsWith("cowork-") || t.has("productivity") || t.has("automation"))
    return "productivity";
  if (t.has("research") || t.has("academia") || t.has("statistics") || dir.includes("research"))
    return "research";
  return "general";
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

const dirs = readdirSync(SKILLS_DIR).sort();
const skills = [];
for (const dir of dirs) {
  let md;
  try {
    md = readFileSync(join(SKILLS_DIR, dir, "SKILL.md"), "utf8");
  } catch {
    continue;
  }
  const fm = parseFrontmatter(md);
  const tags = Array.isArray(fm.tags) ? fm.tags : [];
  const description = (fm.description || "").replace(/\s+/g, " ").trim();
  skills.push({
    dir,
    description,
    tags,
    version: fm.version || "",
    cat: categorize(dir, tags),
  });
}

skills.sort((a, b) => {
  const ai = CATEGORIES.findIndex((c) => c.key === a.cat);
  const bi = CATEGORIES.findIndex((c) => c.key === b.cat);
  if (ai !== bi) return ai - bi;
  return a.dir.localeCompare(b.dir);
});

const cards = skills.map((s) => {
  const catInfo = CATEGORIES.find((c) => c.key === s.cat);
  const version = s.version ? `\n              <span class="skill__ver">v${escapeHtml(s.version)}</span>` : "";
  return `          <li class="skill">
            <div class="skill__head">
              <a class="skill__name" href="https://github.com/rakibulism/agent-skills-os/tree/main/skills/${s.dir}" target="_blank" rel="noopener">${escapeHtml(s.dir)}</a>
              <span class="tag">${catInfo.label}</span>${version}
            </div>
            <p class="skill__desc">${escapeHtml(s.description)}</p>
          </li>`;
});

let html = readFileSync(INDEX_HTML, "utf8");

const listRe = /(<!-- skills:start -->\n)[\s\S]*?(\n\s*<!-- skills:end -->)/;
if (!listRe.test(html)) {
  console.error(`Couldn't find the skills:start / skills:end markers in ${INDEX_HTML}`);
  process.exit(1);
}
html = html.replace(listRe, `$1${cards.join("\n")}$2`);
html = html.replace(/(<span data-skill-count>)\d+(<\/span>)/, `$1${skills.length}$2`);

writeFileSync(INDEX_HTML, html, "utf8");
console.log(`Wrote ${skills.length} skill${skills.length === 1 ? "" : "s"} to ${INDEX_HTML}`);
