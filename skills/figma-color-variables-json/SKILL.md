---
name: figma-color-variables-json
description: Generate light/dark Figma color-variable import files from an existing CSS/token source (e.g. globals.css custom properties), and import them into Figma's native Variables panel. Use when the user wants Figma color variables that match their codebase's design tokens, mentions Figma's "Import mode" for variables, or asks for a "tokens.json" / "color variables json" for Figma with light and dark mode.
version: 1.0.0
tags: [figma, design-tokens, color, variables, css, light-dark, dtcg]
inputs:
  - name: token_source
    description: Path to the CSS (or other) file defining the color tokens — e.g. a `:root { --color-x: ... }` block plus a `[data-theme='dark'] { ... }` override block.
    required: true
  - name: figma_target
    description: Where the variables should land — an existing Figma variable collection to import into, or "generate files only" if the user will import manually.
    required: false
author: rakibulism
author_url: https://x.com/rakibulism
---

# Figma Color Variables — JSON Generator

Turns an existing CSS token source into files Figma's **native** variable importer will actually accept, with light and dark mode. Skip this and you will burn several round-trips guessing at a schema — see "Why this exists" below.

## Why this exists

There are at least three JSON shapes in circulation for "Figma color tokens," and they are **not interchangeable**:

| Format | Shape | Where it works |
|---|---|---|
| **Figma native** ("Import mode") | One flat DTCG file **per mode**. Colors are full objects: `{colorSpace, components, alpha, hex}` — never a bare hex string. | Figma's own Variables panel → right-click a mode → **Import mode**. Nowhere else. |
| Tokens Studio | `{value, type}` keys (or `{$value, $type}` if DTCG mode is on in settings), one file can hold multiple sets, aliases resolve **within the active set** (`{primary.600}`). | The Tokens Studio plugin only. |
| Plain/W3C DTCG | `{$value, $type}`, aliases are fully qualified (`{light.primary.600}`), often wrapped in named sets in one file. | Spec-compliant importers, not Figma's built-in one. |

**The failure mode to avoid:** sending a Tokens Studio or generic-DTCG file to Figma's *native* importer. It rejects every token, and errors as a flat "encountered errors importing N tokens" with no per-token detail — so it looks like a values problem when it's actually a shape problem. If you're not certain which importer the user means, ask, or default to native (it's what "Figma's default variable importing option inside a file" means).

Confirmed against Figma's own docs: [Modes for variables – Figma Help Center](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables).

## Workflow

### 1. Find the token source — don't ask the user to redescribe it

Colors almost always already exist somewhere in the codebase before Figma enters the picture. Look for, in order:
- CSS custom properties (`--color-*` in a `:root` block, with a `[data-theme='dark']` or `.dark` override block)
- A Tailwind config's `theme.colors`
- A `tokens.json` / `theme.ts` already in the repo

Read the **actual file**, don't infer values from memory or from what the user describes verbally — token systems are large enough that transcription errors are likely, and the whole point of this workflow is a lossless bridge from code to Figma.

If the project has both a light block and a dark-mode override block, that maps directly to Figma's Light/Dark modes. If there's only one theme, generate one mode and skip the rest of this doc's dark-mode handling.

### 2. Generate per-mode JSON with `scripts/gen-figma-color-tokens.cjs`

```bash
node scripts/gen-figma-color-tokens.cjs <path/to/globals.css> [outDir]
```

Writes `figma-import-light.json` and `figma-import-dark.json` (or just `figma-import-light.json` if there's no dark block). The script:

- Strips comments before parsing (a `--color-x: var(...)` mentioned inside a `/* ... */` doc comment will otherwise get parsed as a real declaration — this bit us once)
- Emits every primitive scale (`primary/50` … `primary/950`, etc.) as `$type: "color"` with the full `{colorSpace, components, alpha, hex}` object Figma requires
- Emits semantic tokens (`accent`, `surface`, `border/default`, …) that reference a `var(--color-x)` as **aliases** — `"{primary.600}"` — not copied hex values, so editing the primitive updates every alias
- Validates its own output before writing: every alias must resolve to a real leaf within the *same* mode file, every literal must be a well-formed 6-digit hex

Adapt the `SCALES`/`SEMANTIC` maps at the top of the script if the project's token source isn't `--color-*` CSS custom properties — the DTCG-building logic below that point doesn't need to change.

### 3. Import into Figma

Native importer, one mode at a time:

1. Open the file → **Variables** panel
2. Open (or create) the target collection — needs a `Light` mode and, for multi-mode plans, a `Dark` mode already present (Figma Professional+ for >1 mode; Starter/Free is capped at 1)
3. Right-click the **Light** mode → **Import mode** → select `figma-import-light.json`
4. Right-click the **Dark** mode → **Import mode** → select `figma-import-dark.json`

Importing into a blank collection creates the variables. Importing into a collection that already has matching names updates their values instead of duplicating.

### 4. If you have Figma MCP write access instead

If `use_figma` (Plugin API) is available and authorized for write, skip the JSON dance entirely — call `figma.variables.createVariableCollection`/`createVariable` directly and alias semantics with `{type: 'VARIABLE_ALIAS', id}`. This is faster and self-verifying (read the collection back and check every alias resolves before declaring done). Load the `figma-use` skill for the Plugin API rules first. Reserve the JSON-file route in this skill for when write access isn't available, or the user explicitly wants a JSON deliverable, e.g. for a teammate to import themselves.

## Common failure → fix table

| Symptom | Cause | Fix |
|---|---|---|
| "Encountered errors importing N tokens", N = every token | Sent Tokens Studio or plain-DTCG shape to the native importer | Regenerate with full color objects, one file per mode (this skill) |
| Values look right but colors resolve to a solid gray/black | Color value was a bare hex string instead of `{colorSpace, components, alpha, hex}` | Same fix — native importer silently coerces malformed color values rather than always erroring |
| Whole import rejected, not per-token | File wrapped multiple modes in one JSON (`{light: {...}, dark: {...}}`) | Split into two files, import each into its own mode separately |
| Alias renders as literal text `{primary.600}` instead of resolving | Alias path didn't exist in *that mode's* file (e.g. referenced a token only defined in the other mode) | Every token referenced by an alias must also exist, un-aliased or alias-chained, in the same file |
