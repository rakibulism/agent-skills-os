# universal-agent-skills

Framework-agnostic agent skills for any AI agent runtime. Drop-in adapters for **Claude Agent SDK**, **OpenAI Assistants**, **LangChain**, **CrewAI**, **AutoGen**, and any system that takes a system prompt.

Each skill is a markdown file with frontmatter and a careful, prompt-engineered body — load it, hand it to your agent as a system prompt or role, done.

## Install

```bash
npm install universal-agent-skills
```

## Quick start

```js
import { forClaude, forOpenAI, forLangChain, listSkills } from "universal-agent-skills";

// See what's available
console.log(listSkills());
// [
//   { name: "code-reviewer",  description: "...", tags: ["code","review",...] },
//   { name: "data-analyst",   description: "...", tags: [...] },
//   ...
// ]

// Use with Claude Agent SDK / Anthropic Messages API
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();
const { system } = forClaude("code-reviewer");
const msg = await anthropic.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 4096,
  system,
  messages: [{ role: "user", content: "Review this diff:\n\n" + diff }],
});

// Use with OpenAI Assistants
import OpenAI from "openai";
const openai = new OpenAI();
const assistant = await openai.beta.assistants.create({
  model: "gpt-4o",
  ...forOpenAI("researcher"),
});

// Use with LangChain
import { PromptTemplate } from "@langchain/core/prompts";
const tw = forLangChain("test-writer");
const prompt = PromptTemplate.fromTemplate(tw.template);
const formatted = await prompt.format({
  target_code: "...",
  framework: "vitest",
  existing_tests: "",
});
```

## Skills

### Engineering

| Skill | What it does |
|---|---|
| `code-reviewer` | Reviews code for bugs, security, performance — prioritized findings with file:line + fixes |
| `test-writer` | Generates unit/integration tests covering happy path, edges, errors |
| `testing-strategist` | Designs a test strategy — pyramid shape, risk mapping, what to explicitly not test |
| `refactorer` | Refactors with a behavior-equivalence argument; small safe steps |
| `debugger` | Diagnoses errors with root cause, fix, and verification step |
| `doc-writer` | Generates READMEs, API refs, JSDoc/docstrings |
| `system-architect` | Designs services/APIs/data models, or writes an ADR comparing options with trade-offs |
| `tech-debt-auditor` | Categorizes and prioritizes tech debt into a risk-ranked refactoring backlog |
| `deploy-checklist-writer` | Builds a pre-deployment checklist with rollback triggers, specific to the actual change |
| `incident-commander` | Runs incident triage, status updates, and blameless postmortems |
| `standup-reporter` | Turns commits/tickets/notes into a yesterday/today/blockers update |
| `fix-github-issues` | Sweeps a GitHub Projects board or every repo an account owns for open issues, then investigates and fixes them |

### Design & Design Engineering

| Skill | What it does |
|---|---|
| `ux-ui-designer` | Designs and critiques end-to-end UX/UI — flows, IA, hierarchy, states, accessibility |
| `product-designer` | Connects user problems to product decisions — framing, opportunity, metrics, MVP scope |
| `component-designer` | Specs a UI component — anatomy, states, variants, API, accessibility, edge cases |
| `visual-polish-reviewer` | Reviews UI for alignment, spacing, typography, shadows — the details that separate fine from great |
| `interaction-designer` | Designs micro-interactions with timing, easing, purpose; outputs animation code |
| `design-token-architect` | Designs primitive/semantic/component token layers with theme support |
| `design-to-code` | Translates Figma or design specs into accessible, responsive, token-driven component code |
| `design-critic` | Structured design feedback on hierarchy, flow, and consistency, calibrated to design stage |
| `accessibility-auditor` | Audits against WCAG 2.1/2.2 AA — contrast, keyboard nav, semantics, touch targets |
| `user-researcher` | Plans studies (interviews/usability tests/surveys) and synthesizes findings into themes |
| `ux-copywriter` | Writes microcopy — errors, empty states, buttons, confirmation dialogs |
| `ux-expert-rakibulism` | Reviews UI screens in "rakibulism" voice — direct, client-facing, promise-list-style feedback |

### Marketing

| Skill | What it does |
|---|---|
| `article-writer` | Writes essays/newsletters — hero's-journey structure, sentence-level craft rules, titles, and short-post/comment spinoffs |
| `campaign-planner` | Full campaign brief — objectives, audience, channels, content calendar, success metrics |
| `brand-voice-reviewer` | Reviews copy against a brand's voice/style guide with before/after fixes |
| `email-sequence-writer` | Designs multi-email sequences with timing, branching logic, and exit conditions |
| `competitive-analyst` | Positioning/messaging comparison across competitors — gaps, threats, opportunities |
| `seo-strategist` | SEO audit — on-page, technical, content gaps, keyword opportunities, prioritized plan |
| `technical-seo-audit` | Audits Google Search compliance — crawlability, indexability, canonical/duplicate URLs, sitemaps, Search Essentials, image SEO |

### Productivity

| Skill | What it does |
|---|---|
| `task-manager` | Organizes rough notes/tickets into a prioritized, trackable task list |

### Creativity

| Skill | What it does |
|---|---|
| `creative-artist` | Generates original concepts and creative work — pushes past clichés to bold, developed ideas |

### Creative & Interactive Web Engineering

| Skill | What it does |
|---|---|
| `interactive-web-engineer` | Plans/reviews award-tier interactive sites — feeling → technique → frame budget → fallback |
| `motion-design-engineer` | Physically-feeling motion — springs, momentum, flick/drag, rubber-banding, easing |
| `webgl-creative-coder` | Three.js/R3F scenes, GLSL shaders, SDFs, noise, particle systems |
| `frontend-performance-engineer` | Profiles jank/leaks, fixes Core Web Vitals, sets enforced asset/bundle budgets |
| `animated-component-architect` | Structures animation-heavy component state — avoids re-render storms, types motion APIs |
| `page-flip-builder` | Builds page-turn/flipbook effects from scratch — fold geometry, drag physics, virtualization |

### Design Engineer Curriculum

A 9-track training system for building award-tier interactive web experiences. `design-engineer` is the top-level orchestrator; each `deN-*` skill is one rail of the curriculum, and the `wgl-*` skills are the Track 9 rendering/animation library layer under `webgl-motion-stack`.

| Skill | What it does |
|---|---|
| `design-engineer` | Orchestrates elite design engineering — fuses visual taste with GPU-level performance across all tracks |
| `de1-aesthetic-deconstruction` | Reverse-engineers premium interactions into exact timing, easing, shadow, and type values |
| `de1-grid-spacing` | Geometric spacing scales, spacing-as-hierarchy, fluid `clamp()` layouts, deliberate grid-breaking |
| `de1-micro-typography` | Size-responsive tracking/line-height curves, orphan/widow control, OpenType features |
| `de1-optical-alignment` | Rules for nudging icons/shapes off mathematical center so they read as balanced |
| `de1-perceptual-color` | Builds OKLCH/HCT palettes with uniform perceptual contrast across light/dark modes |
| `de2-figma-to-code` | Structures Figma files with auto-layout, components, and variables as a direct DOM mirror |
| `de2-interaction-storyboarding` | Cell-by-cell keyframe specs for animation — timing, easing, interruption behavior |
| `de2-motion-prototyping` | Validates motion with After Effects/Spline/Rive before writing shader or animation code |
| `de2-perspective-sketching` | 1/2/3-point perspective sketching to block out 3D scenes before building |
| `de3-asset-pipeline` | Low-poly modeling, lighting bakes, GLTF/GLB compression to under 500kb |
| `de3-glsl-shaders` | Vertex/fragment shader writing — SDFs, raymarching, procedural noise |
| `de3-linear-algebra` | Vector/matrix math for graphics — dot/cross products, transforms, quaternions |
| `de3-threejs-r3f` | Three.js/R3F scene architecture — cameras, lighting, materials, draw-call budgets |
| `de4-bezier-splines` | Bezier/spline math — `cubic-bezier()` easing, Catmull-Rom paths, arc-length reparameterization |
| `de4-collision-detection` | AABB/SAT collision tests, resolution, spatial-hash broad-phase for UI physics |
| `de4-euler-integration` | Real-time physics loops with delta-time, dt clamping, frame-rate independence |
| `de4-momentum-inertia` | Pointer velocity tracking, friction glide, snap-point projection, rubber-band overscroll |
| `de4-spring-damper` | Custom spring-mass-damper solvers, damping presets, interruptible retargeting |
| `de5-canvas-2d` | Production-quality Canvas 2D — high-DPI setup, offscreen pre-rendering, particle batching |
| `de5-critical-rendering-path` | Diagnoses jank via JS→Style→Layout→Paint→Composite; eliminates layout thrashing |
| `de5-gpu-compositing` | Promotes elements to GPU compositor layers with transform/will-change/opacity |
| `de5-lowlevel-js` | Typed arrays, zero-allocation render loops, Web Workers, the canonical RAF ticker |
| `de5-pointer-gestures` | Unified Pointer Events, capture, velocity tracking, multi-touch pinch/rotate math |
| `de6-component-composition` | Isolated, accessible drop-in components — compound patterns, headless-core/styled-shell |
| `de6-state-systems` | Interaction state without re-render storms — Zustand, XState, Signals, re-render audits |
| `de6-token-pipeline` | Automates Figma-variable exports into Tailwind/CSS/SCSS/TS design token pipelines |
| `de6-typescript` | Strict typing for animation/gesture code — discriminated unions, branded types, generics |
| `de7-core-web-vitals` | Elite LCP/INP/CLS on animation-heavy sites — poster LCP, hydration, layout reservation |
| `de7-profiling` | Chrome DevTools profiling — flame charts, Long Tasks, heap-snapshot leak hunting |
| `de7-resource-budgets` | Concrete JS/3D/image/font budgets, lazy-loading, KTX2/AVIF asset strategy |
| `de7-webgl-fallbacks` | Device-tiered quality, FPS-monitored degradation, WebGL context-loss recovery |
| `de8-bundling` | Vite/Rollup/Webpack setup — three.js tree-shaking, code splitting, bundle analysis |
| `de8-cicd` | GitHub Actions pipelines — perf budgets, Lighthouse CI, visual regression, auto deploys |
| `de8-edge-deployment` | Static-first edge architecture — platform choice, CDN caching, preview deployments |
| `de8-telemetry` | Production monitoring — Sentry, WebGL error capture, RUM Core Web Vitals, FPS sampling |
| `webgl-motion-stack` | Chooses the rendering/animation library layer — GSAP, PixiJS, Theatre.js, batching |
| `wgl-creative-vision` | Concepts a visual mechanism before code — feeling → mechanism → illusion over brute force |
| `wgl-draw-call-batching` | Deep draw-call reduction — instancing, texture atlases, frustum culling, LOD |
| `wgl-gsap-motion` | GSAP timelines, ScrollTrigger, custom easing, syncing to WebGL/Canvas render loops |
| `wgl-pixijs-2d-engine` | PixiJS 2D WebGL engine — ParticleContainer, sprite batching, custom GLSL filters |
| `wgl-theatrejs-editor` | Theatre.js scrubbable timeline editor bound to Three.js/R3F objects and uniforms |

### Video & Media

| Skill | What it does |
|---|---|
| `video-editor` | Cuts footage into a finished edit — story structure, pacing, cut types (J/L, match, cut-on-action) |
| `color-grading` | Corrects then grades video — scope-driven balance, log/LUT handling, look-building, shot matching |
| `sound-design` | Layers and mixes dialogue/music/ambience/SFX to platform loudness targets (LUFS) |
| `motion-graphics` | Designs titles, lower thirds, captions, and animated overlays — legibility, timing, safe areas |
| `ffmpeg-operator` | Generates correct, least-destructive FFmpeg commands with every flag explained (+ recipe cookbook) |

### Knowledge & Research

| Skill | What it does |
|---|---|
| `summarizer` | Faithful summaries at TLDR / short / medium / long lengths |
| `researcher` | Decomposes a question, gathers cited sources, synthesizes a brief |
| `academic-researcher` | Scholarly rigor — research questions, literature review, methodology, academic writing |
| `data-analyst` | Profiles, analyzes, and reports on tabular data with caveats |

### Reasoning & Science

| Skill | What it does |
|---|---|
| `scientist` | Empirical thinking — hypotheses, experiment design, confounds, evidence with uncertainty |
| `mathematician` | Rigorous proof, problem-solving, modeling, and verification |
| `philosopher` | Argument analysis, conceptual clarity, thought experiments, ethical reasoning |

### Professions & Learning

| Skill | What it does |
|---|---|
| `physician` | Clinical reasoning and health literacy — differentials, EBM, communication (educational, not medical advice) |
| `student` | Learn anything faster — active recall, spaced repetition, Feynman technique, exam prep |

### Startup & Venture

| Skill | What it does |
|---|---|
| `startup-advisor` | Lean operating guidance — validation, product-market fit, GTM, startup metrics |
| `venture-capitalist` | Investor lens — deal evaluation, market sizing, valuation/terms, portfolio strategy |
| `founder-coach` | The human side — decisions, prioritization, leadership, fundraising story, resilience |

Every skill follows the same authoring principles: lead with the spine, prioritize findings, prefer concrete output formats, name what to avoid. Larger skills also bundle a `references/` directory of deeper material the body points to.

## API

```ts
// Load
loadAllSkills(): Skill[]
getSkill(name: string): Skill
listSkills(): SkillSummary[]
getRelatedSkills(name: string): RelatedSkillSummary[]
asSystemPrompt(name: string): string

// Framework adapters
forClaude(name):       { system, metadata }              // metadata includes related_skills: string[]
forOpenAI(name):       { name, description, instructions }
forLangChain(name):    { template, inputVariables }
forCrewAI(name):       { role, goal, backstory }
forAutoGen(name):      { name, system_message }
forCursor(name):       { filename, content }             // Cursor .cursor/rules/*.mdc file
forAgentsMd(name):     { filename, content }             // AGENTS.md section (Codex, OpenCode, Antigravity, Cursor, Windsurf, Copilot...)
forStitchPrompt(name): { content }                       // plain paste-ready prompt, no file convention
forGeneric(name):      { name, description, version, tags, inputs, related, author, author_url, instructions }
```

### Author attribution

`Skill.author` / `Skill.author_url` are populated from a skill's own frontmatter (`author: rakibulism`, `author_url: https://x.com/rakibulism`) and are `null` when a skill doesn't declare them — including every third-party-authored and plugin-marketplace-sourced skill in this repo, whose real author is credited in their own frontmatter/metadata instead. Only add these fields to a skill you actually wrote; never overwrite another skill's existing attribution.

### Related skills — so an agent doesn't need every name typed up front

A skill can declare `related: [other-skill-name, ...]` in its frontmatter to point at complements it's commonly loaded alongside. `getRelatedSkills(name)` resolves those into full summaries (dropping any name that no longer resolves, rather than throwing), so a consuming agent can decide to pull in a companion skill automatically instead of requiring the user to already know and type its name:

```js
import { getSkill, getRelatedSkills } from "universal-agent-skills";

const skill = getSkill("design-engineer");
const related = getRelatedSkills("design-engineer");
// -> [{ name: "webgl-creative-animator", description: "...", tags: [...] }]

// e.g. in an agent loop: if the request looks like it needs a related skill too,
// load it without waiting for the user to name it explicitly.
```

This is opt-in per skill — only add `related` where two skills are genuinely complementary (like `design-engineer`'s Track 3/9 rails and `webgl-creative-animator`'s deep shader/particle/fluid formulas), not as a blanket cross-link between every skill in a domain.

## Using a skill in Cursor, Codex, OpenCode, Antigravity, or other IDE/agent tools

Claude Agent SDK and Claude Code read `SKILL.md` natively — no export needed. Other tools have their own file conventions, so three more adapters generate ready-to-drop content for them:

| Tool | Format | Adapter |
|---|---|---|
| Cursor | `.cursor/rules/<name>.mdc` (YAML frontmatter + body) | `forCursor(name)` |
| OpenAI Codex, OpenCode, Google Antigravity, Windsurf, GitHub Copilot | `AGENTS.md` — the open, tool-agnostic standard all of these read | `forAgentsMd(name)` |
| Stitch (or any prompt-only design tool with no rule-file concept) | plain-text prompt, paste directly | `forStitchPrompt(name)` |

```js
import { forCursor, forAgentsMd, forStitchPrompt } from "universal-agent-skills";

const cursor = forCursor("elite-website-ux-ui-designer");
// -> { filename: "elite-website-ux-ui-designer.mdc", content: "---\ndescription: ...\nalwaysApply: false\n---\n\n..." }
// Write this to .cursor/rules/ in your project.

const agentsMd = forAgentsMd("elite-website-ux-ui-designer");
// -> { filename: "elite-website-ux-ui-designer.agents.md", content: "## elite-website-ux-ui-designer ...\n\n..." }
// AGENTS.md conventionally holds every convention for a whole project, not just one skill —
// append this section onto your project's existing AGENTS.md rather than replacing it wholesale.

const stitch = forStitchPrompt("elite-website-ux-ui-designer");
// -> { content: "..." } — copy-paste directly into Stitch's prompt box.
```

Or generate all three at once for a skill (or every skill) with the bundled script, which writes into `skills/<name>/exports/`:

```bash
node scripts/export-skill.js elite-website-ux-ui-designer
node scripts/export-skill.js --all
```

**A skill with a `references/` folder loses those links when exported as a single file.** A skill's body commonly links to `references/*.md` for deep-dive material (see "Authoring your own skills" below) — those relative links only resolve if the `references/` folder is copied alongside the exported file at the same relative path. If you're dropping a Cursor `.mdc` or `AGENTS.md` section into a different project, copy the skill's `references/` folder too (or inline the reference content you need) rather than shipping just the single exported file.

## Use with Python frameworks (CrewAI, AutoGen)

The package is ESM JS, but the markdown skills are framework-neutral. To consume from Python:

```bash
# After npm install, the markdown files are at:
node_modules/universal-agent-skills/skills/<name>/SKILL.md
```

Read the file directly, strip frontmatter (`---...---`), use the body as your agent's `backstory` (CrewAI) or `system_message` (AutoGen).

Or generate a JSON catalog from Node and hand it to Python:

```bash
node -e "import('universal-agent-skills').then(m => console.log(JSON.stringify(m.loadAllSkills(), null, 2)))" > skills.json
```

## Authoring your own skills

A skill is a directory containing `SKILL.md`, optionally with a `references/` directory of supporting docs:

```
skills/
  my-skill/
    SKILL.md
    references/        # optional deep-dive docs the SKILL.md body points to
      topic-a.md
      topic-b.md
```

`loadAllSkills()` reads `SKILL.md` as the system prompt; `references/` files are progressive-disclosure material the agent (or a human) opens as needed.

`SKILL.md` frontmatter:

```yaml
---
name: my-skill
description: One sentence describing when to use this skill and what it produces.
version: 0.1.0
tags: [domain, capability]
inputs:
  - name: input_name
    description: What this input is.
    required: true
related: [other-skill-name]  # optional — see "Related skills" above
author: your-name            # optional — only if you wrote this skill yourself
author_url: https://...      # optional — link to your profile/site
---

# Body

The system-prompt content. Be specific about process, output format, and what to avoid.
```

Drop the directory into `skills/` and `loadAllSkills()` picks it up.

## Design principles

These skills were written to follow a few rules:

- **Lead with intent.** The first paragraph tells the model when to apply the skill.
- **Process before output.** How to think, not just what to emit.
- **Specify output shape.** Models drift without a target format.
- **Name failure modes.** "What to avoid" sections prevent common errors.
- **Concrete over abstract.** Concrete examples beat abstract advice.

## License

MIT
