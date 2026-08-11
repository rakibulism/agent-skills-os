#!/usr/bin/env node
/**
 * gen-figma-color-tokens.js
 *
 * Reads --color-* CSS custom properties from a stylesheet and emits one
 * DTCG JSON file per theme mode, in the exact shape Figma's native
 * "Import mode" accepts (Variables panel -> right-click a mode -> Import
 * mode). See ../SKILL.md for why this shape and not any other.
 *
 * Expects:
 *   :root { --color-name: #hex | var(--color-other); ... }
 *   <dark selector> { --color-name: #hex; ... }   (optional override block)
 *
 * The dark selector is auto-detected from any of:
 *   [data-theme='dark'], [data-theme="dark"], [data-theme=dark], .dark
 *
 * Multi-word/segmented names (text-muted, indicator-info) split into nested
 * groups on '-', matching how Figma flattens nested groups back to
 * slash-joined variable names on import (color.text.muted -> color/text/muted).
 *
 * Usage:
 *   node gen-figma-color-tokens.js <path/to/globals.css> [outDir]
 *
 * Writes (into outDir, default: cwd):
 *   figma-import-light.json
 *   figma-import-dark.json   (only if a dark override block was found)
 */
const fs = require('fs');
const path = require('path');

const [, , cssPathArg, outDirArg] = process.argv;
if (!cssPathArg) {
  console.error('Usage: node gen-figma-color-tokens.js <path/to/globals.css> [outDir]');
  process.exit(1);
}
const cssPath = path.resolve(cssPathArg);
const outDir = path.resolve(outDirArg || '.');

// Strip comments FIRST — a token name or var() reference mentioned in prose
// inside a /* ... */ doc comment will otherwise get parsed as a real
// declaration by the regex below.
const css = fs.readFileSync(cssPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

const extractBlock = (re) => (css.match(re) || [, ''])[1];

const rootBlock = extractBlock(/:root\s*\{([\s\S]*?)\n\}/);
const darkBlock = extractBlock(
  /\[data-theme=['"]?dark['"]?\]\s*\{([\s\S]*?)\n\}/
) || extractBlock(/\.dark\s*\{([\s\S]*?)\n\}/);

const parseDeclarations = (text) => {
  const out = {};
  const re = /--color-([a-z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(text))) out[m[1]] = m[2].trim();
  return out;
};

const light = parseDeclarations(rootBlock);
// dark mode = light values with any dark-block overrides layered on top —
// most theme systems only redeclare the variables that actually change.
const dark = darkBlock ? { ...light, ...parseDeclarations(darkBlock) } : null;

if (Object.keys(light).length === 0) {
  console.error(`No --color-* declarations found in :root of ${cssPath}`);
  process.exit(1);
}

const toColorValue = (hex) => {
  const n = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(n)) {
    throw new Error(`Not a 6-digit hex color, and not a var() reference: "${hex}"`);
  }
  const components = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  return { colorSpace: 'srgb', components, alpha: 1, hex: `#${n.toUpperCase()}` };
};

const pathOf = (key) => key.split('-');

/**
 * Builds a nested DTCG tree for one mode. Direct hex values become color
 * objects; `var(--color-x)` values become same-file aliases ("{x.y}") so
 * editing the primitive updates every semantic token that points at it.
 */
const buildModeTree = (map) => {
  const tree = {};
  for (const [key, raw] of Object.entries(map)) {
    const parts = pathOf(key);
    let node = tree;
    for (const p of parts.slice(0, -1)) node = node[p] ||= {};
    const leaf = parts[parts.length - 1];

    const ref = raw.match(/^var\(--color-([a-z0-9-]+)\)$/);
    node[leaf] = ref
      ? { $type: 'color', $value: `{${pathOf(ref[1]).join('.')}}` }
      : { $type: 'color', $value: toColorValue(raw) };
  }
  return tree;
};

/** Every alias must resolve to a real leaf in the SAME file — Figma's
 * native importer does not follow cross-file references. Catch broken
 * aliases here rather than after a failed import. */
const validate = (tree, label) => {
  const get = (dotted) => dotted.split('.').reduce((n, k) => n && n[k], tree);
  const problems = [];
  const walk = (node, pathParts) => {
    for (const [k, v] of Object.entries(node)) {
      const here = [...pathParts, k];
      if ('$value' in v) {
        if (typeof v.$value === 'string') {
          const m = v.$value.match(/^\{(.+)\}$/);
          if (!m) { problems.push(`${here.join('.')}: malformed alias string ${v.$value}`); continue; }
          const target = get(m[1]);
          if (!target || !('$value' in target)) problems.push(`${here.join('.')}: unresolved alias ${v.$value}`);
        }
      } else {
        walk(v, here);
      }
    }
  };
  walk(tree, []);
  if (problems.length) {
    throw new Error(`[${label}] ${problems.length} broken alias(es):\n  ` + problems.join('\n  '));
  }
};

const countLeaves = (node) =>
  Object.values(node).reduce((n, v) => n + ('$value' in v ? 1 : countLeaves(v)), 0);

fs.mkdirSync(outDir, { recursive: true });

const lightTree = buildModeTree(light);
validate(lightTree, 'light');
fs.writeFileSync(path.join(outDir, 'figma-import-light.json'), JSON.stringify(lightTree, null, 2) + '\n');
console.error(`figma-import-light.json: ${countLeaves(lightTree)} tokens`);

if (dark) {
  const darkTree = buildModeTree(dark);
  validate(darkTree, 'dark');
  fs.writeFileSync(path.join(outDir, 'figma-import-dark.json'), JSON.stringify(darkTree, null, 2) + '\n');
  console.error(`figma-import-dark.json: ${countLeaves(darkTree)} tokens`);
} else {
  console.error('No dark-mode override block found — generated light mode only.');
}
