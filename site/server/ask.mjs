// The "Ask AI" endpoint, shared by the Vercel Function (../../api/ask.mjs) and the local servers.
//
// Grounded by design: the model only sees the skills our own search ranks highest, and it
// answers in a fixed JSON shape that picks cards by id. The site renders every command and
// code block from its own data, so the model can explain and choose but never invent a command.

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const SITE_URL = 'https://agent-skills-os.vercel.app';
const MAX_QUESTION = 300;
const MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'];
const FRAMEWORKS = ['claude', 'openai', 'langchain', 'python', 'files'];

// Best-effort per-instance rate limit. Serverless instances don't share memory, so this
// slows down a single abuser rather than guaranteeing a global cap.
const WINDOW_MS = 60_000;
const LIMIT = 12;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

let indexCache = null;
async function loadIndex(url) {
  if (indexCache && Date.now() - indexCache.at < 5 * 60_000) return indexCache.skills;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`search index ${res.status}`);
  const { skills } = await res.json();
  indexCache = { at: Date.now(), skills };
  return skills;
}

/** The same token scoring the site's search uses, so the AI sees what search would show. */
export function rank(skills, query, limit = 6) {
  const tokens = query.toLowerCase().split(/[^a-z0-9-]+/).filter((t) => t.length > 1);
  const scored = skills.map((s) => {
    const name = s.name.toLowerCase();
    const hay = [name, s.description, s.category, ...(s.tags ?? []), s.excerpt ?? ''].join(' ').toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (name.includes(t)) score += 4;
      else if ((s.tags ?? []).some((tag) => tag.startsWith(t))) score += 2;
      else if (hay.includes(t)) score += 1;
    }
    return { s, score };
  });
  const hitsOnly = scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  // With few or no matches, still give the model the catalog so it can say what exists.
  const picked = hitsOnly.length ? hitsOnly : scored;
  return picked.slice(0, limit).map((x) => x.s);
}

function systemPrompt(skills, total) {
  const catalog = skills
    .map((s) => `- slug: ${s.slug}\n  description: ${s.description}\n  category: ${s.category}; tags: ${(s.tags ?? []).join(', ')}\n  excerpt: ${(s.excerpt ?? '').replace(/\s+/g, ' ').slice(0, 600)}`)
    .join('\n');
  return `You are the assistant on the Agent Skills OS website, a library of AI agent skills published as the npm package "universal-agent-skills".

Facts you may rely on:
- A skill is one Markdown file, skills/<name>/SKILL.md: YAML frontmatter then instructions.
- Install with npm, pnpm, yarn or bun. Node 18+, MIT, no dependencies.
- Adapters: forClaude, forOpenAI, forLangChain, forCrewAI, forAutoGen, forCursor, forAgentsMd, forStitchPrompt, forGeneric. Loaders: loadAllSkills, getSkill, listSkills, getRelatedSkills, asSystemPrompt.
- Python frameworks (CrewAI, AutoGen) read the Markdown files or a JSON catalog built from Node.
- Cursor and AGENTS.md tools (Codex, OpenCode, Antigravity, Windsurf, Copilot) get files from scripts/export-skill.js.
- Anyone can contribute a skill: fork the repo, add skills/<name>/SKILL.md, open a pull request.

The library has ${total} skill${total === 1 ? '' : 's'}. The most relevant to this question:
${catalog || '(none)'}

Reply with JSON only, exactly this shape:
{"answer": string, "cards": Card[], "followups": string[]}
Card is one of:
{"type":"skill","slug":string}            a skill from the list above, by its exact slug
{"type":"install","manager":"npm"|"pnpm"|"yarn"|"bun"}
{"type":"usage","framework":"claude"|"openai"|"langchain"|"python"|"files","skill":string}   code for using a listed skill

Rules:
- "answer": at most 70 words, plain sentences, no Markdown, no code, no commands. The cards carry the commands and code; refer to them ("the card below").
- Only name skills from the list above. If none fits, say so plainly and suggest requesting or contributing one.
- Add an install card whenever the user asks how to install or get started; use the package manager they mention, else npm.
- Add a usage card when they ask how to use a skill with a framework. "python" covers CrewAI and AutoGen; "files" covers Cursor and AGENTS.md tools.
- At most 3 cards and 3 followups. Followups are short questions the user might ask next, under 8 words each.
- If the question is unrelated to agent skills or this library, answer briefly that you only help with this library, with no cards.`;
}

function clean(raw, skills) {
  let data;
  try {
    const text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '');
    data = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  } catch {
    return { answer: raw.trim().slice(0, 600), cards: [], followups: [] };
  }
  const slugs = new Set(skills.map((s) => s.slug));
  const cards = (Array.isArray(data.cards) ? data.cards : [])
    .filter((c) =>
      (c?.type === 'skill' && slugs.has(c.slug)) ||
      (c?.type === 'install' && MANAGERS.includes(c.manager)) ||
      (c?.type === 'usage' && FRAMEWORKS.includes(c.framework) && slugs.has(c.skill)))
    .slice(0, 3)
    .map((c) => (c.type === 'skill' ? { type: 'skill', slug: c.slug }
      : c.type === 'install' ? { type: 'install', manager: c.manager }
      : { type: 'usage', framework: c.framework, skill: c.skill }));
  const followups = (Array.isArray(data.followups) ? data.followups : [])
    .filter((f) => typeof f === 'string' && f.trim()).map((f) => f.trim().slice(0, 80)).slice(0, 3);
  return { answer: String(data.answer ?? '').trim().slice(0, 700), cards, followups };
}

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });

/**
 * @param {Request} request
 * @param {{ apiKey?: string, model?: string, indexUrl?: string, complete?: (messages: object[]) => Promise<string> }} opts
 *   `complete` replaces the OpenRouter call (used by tests).
 */
export async function handleAsk(request, opts = {}) {
  if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405, { Allow: 'POST' });

  const apiKey = opts.apiKey ?? process.env.OPENROUTER_API_KEY;
  if (!apiKey && !opts.complete) return json({ error: 'Ask AI is not set up yet.' }, 503);

  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'local';
  if (rateLimited(ip)) return json({ error: 'Too many questions. Try again in a minute.' }, 429, { 'Retry-After': '60' });

  let question = '';
  try {
    question = String((await request.json())?.question ?? '').trim();
  } catch {}
  if (!question) return json({ error: 'Ask a question first.' }, 400);
  if (question.length > MAX_QUESTION) question = question.slice(0, MAX_QUESTION);

  let skills;
  try {
    skills = await loadIndex(opts.indexUrl ?? process.env.SKILLS_INDEX_URL ?? new URL('/search-index.json', request.url).href);
  } catch {
    return json({ error: 'The skills index is unavailable.' }, 503);
  }
  const relevant = rank(skills, question);
  const messages = [
    { role: 'system', content: systemPrompt(relevant, skills.length) },
    { role: 'user', content: question },
  ];

  let raw;
  try {
    if (opts.complete) {
      raw = await opts.complete(messages);
    } else {
      const model = opts.model ?? process.env.OPENROUTER_MODEL ?? 'openrouter/auto';
      const call = (structured) => fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': SITE_URL,
          'X-Title': 'Agent Skills OS',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
          max_tokens: 600,
          ...(structured ? { response_format: { type: 'json_object' } } : {}),
        }),
        signal: AbortSignal.timeout(25_000),
      });
      let res = await call(true);
      // Some models reject JSON mode; the prompt alone still asks for JSON, and clean() copes.
      if (res.status === 400) res = await call(false);
      if (!res.ok) {
        const status = res.status === 429 ? 429 : 502;
        return json({ error: status === 429 ? 'The AI is busy. Try again shortly.' : 'The AI is unavailable right now.' }, status);
      }
      raw = (await res.json())?.choices?.[0]?.message?.content ?? '';
    }
  } catch {
    return json({ error: 'The AI took too long to answer.' }, 504);
  }

  const answer = clean(String(raw), relevant);
  if (!answer.answer && !answer.cards.length) return json({ error: 'The AI returned an empty answer.' }, 502);
  return json(answer);
}
