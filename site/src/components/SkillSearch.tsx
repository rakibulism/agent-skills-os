'use client';

import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ask, looksLikeQuestion } from '@/lib/ask';
import type { SkillSummary } from '@/lib/skills';
import { SITE } from '@/lib/site';
import { colors, fonts, motion, radii } from '@/styles/tokens.stylex';
import { AiAnswer, type AiState } from './AiAnswer';
import { Icon } from './Icon';

type Scored = { skill: SkillSummary; score: number };

/** Cycled in the empty bar so people see it answers questions, not only names. */
const HINTS: { ask: boolean; text: string }[] = [
  { ask: false, text: 'Search skills by name or task' },
  { ask: true, text: 'how do I install with pnpm?' },
  { ask: true, text: 'which skill reviews accessibility?' },
  { ask: true, text: 'how do I use a skill with LangChain?' },
];

/** Example questions under the bar; one click asks the AI. */
const TRY = ['How do I install with pnpm?', 'Which skill reviews accessibility?', 'Use a skill with LangChain'];

// Words that carry no meaning in a search, so "how do I use super-ui?" still finds super-ui.
const STOP = new Set(
  'a an and are can could do does for from get help helps how i in is it me my of on or show skill skills the this to use using want what when where which who why will with you your'.split(' '),
);

export function terms(query: string) {
  return query.toLowerCase().split(/[^a-z0-9.+#-]+/).map((t) => t.replace(/^[.-]+|[.-]+$/g, '')).filter((t) => t && !STOP.has(t));
}

function search(skills: SkillSummary[], query: string, category: string): Scored[] {
  const tokens = terms(query);
  // Short queries must match every word; longer, question-like ones need about half.
  const need = tokens.length <= 2 ? tokens.length : Math.ceil(tokens.length / 2);
  const out: Scored[] = [];
  for (const skill of skills) {
    if (category !== 'all' && skill.category !== category) continue;
    const name = skill.name.toLowerCase();
    const hay = [name, skill.description.toLowerCase(), skill.category.toLowerCase(), ...skill.tags].join(' ');
    let score = 0;
    let matched = 0;
    for (const t of tokens) {
      if (!hay.includes(t)) continue;
      matched++;
      score += name.startsWith(t) ? 4 : name.includes(t) ? 3 : skill.tags.some((tag) => tag.startsWith(t)) ? 2 : 1;
    }
    if (matched >= need) out.push({ skill, score: score + matched * 10 });
  }
  return out.sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name));
}

/** Wraps every query token found in `text` in <mark>. */
function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = terms(query);
  if (!tokens.length) return <>{text}</>;
  const re = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts: ReactNode[] = text.split(re).map((part, i) =>
    i % 2 ? <mark key={i} {...stylex.props(s.mark)}>{part}</mark> : part,
  );
  return <>{parts}</>;
}

export function SkillSearch({
  skills, query: controlledQuery, onQueryChange, inputRef: outerInputRef,
}: {
  skills: SkillSummary[];
  /** Pass both to control the query from outside, e.g. the shelf in the hero. */
  query?: string;
  onQueryChange?: (q: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const router = useRouter();
  const [innerQuery, setInnerQuery] = useState('');
  const query = controlledQuery ?? innerQuery;
  const setQuery = onQueryChange ?? setInnerQuery;
  const [category, setCategory] = useState('all');
  const ownInputRef = useRef<HTMLInputElement>(null);
  const inputRef = outerInputRef ?? ownInputRef;
  const listRef = useRef<HTMLDivElement>(null);

  // Once its spot in the hero scrolls away under the header, the search bar docks to the
  // bottom of the screen; scrolling back up returns it. The dock keeps its space in the hero.
  const dockRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const [floating, setFloating] = useState(false);
  useEffect(() => {
    const el = dockRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setFloating(!e.isIntersecting && e.boundingClientRect.top < 60),
      { rootMargin: '-60px 0px 0px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Make room for the floating bar: lift toasts above it and pad the end of the page.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--toast-bottom', floating ? '96px' : '');
    document.body.style.paddingBottom = floating ? '88px' : '';
    return () => {
      root.style.removeProperty('--toast-bottom');
      document.body.style.paddingBottom = '';
    };
  }, [floating]);

  /** Scrolls so `el` sits just under the header, keeping the hero dock hidden. */
  function bringIntoView(el: HTMLElement | null) {
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top >= 70 && top <= window.innerHeight * 0.5) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: window.scrollY + top - 76, behavior: reduce ? 'auto' : 'smooth' });
  }

  const [ai, setAi] = useState<AiState | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [focused, setFocused] = useState(false);
  const [askMode, setAskMode] = useState(false);
  const [hint, setHint] = useState(0);
  useEffect(() => {
    if (query || focused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setHint((i) => (i + 1) % HINTS.length), 3200);
    return () => clearInterval(t);
  }, [query, focused]);

  function startAsking() {
    if (query.trim()) { runAsk(query); return; }
    setAskMode(true);
    inputRef.current?.focus();
  }

  useEffect(() => {
    if (floating && query && document.activeElement === inputRef.current) bringIntoView(panelRef.current);
    // Only when the query changes; scrolling must not fight the reader otherwise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function runAsk(question: string) {
    const q = question.trim();
    if (!q) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setAi({ status: 'loading', question: q });
    if (floating) requestAnimationFrame(() => bringIntoView(aiRef.current));
    ask(q, ctrl.signal).then(
      (data) => setAi({ status: 'done', question: q, data }),
      (err: Error) => {
        if (err.name !== 'AbortError') setAi({ status: 'error', question: q, message: err.message });
      },
    );
  }

  function closeAi() {
    abortRef.current?.abort();
    setAi(null);
    inputRef.current?.focus();
  }

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const sk of skills) counts.set(sk.category, (counts.get(sk.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [skills]);

  const results = useMemo(() => search(skills, query, category), [skills, query, category]);

  // Library-style call numbers: category code + position in that category, e.g. DES.001.
  // Built from the full list so a skill keeps its number whatever the filter.
  const callNo = useMemo(() => {
    const byCat = new Map<string, SkillSummary[]>();
    for (const sk of skills) byCat.set(sk.category, [...(byCat.get(sk.category) ?? []), sk]);
    const out = new Map<string, { code: string; num: string }>();
    const used = new Set<string>();
    const codeFor = (cat: string) => {
      const w = cat.replace(/[^A-Za-z]/g, '').toUpperCase();
      const consonants = w.slice(1).replace(/[AEIOU]/g, '');
      const candidates = [w.slice(0, 3), w[0] + consonants.slice(0, 2), w[0] + consonants.slice(1, 3), w[0] + w.slice(-2)];
      const code = candidates.find((c) => c.length === 3 && !used.has(c)) ?? w.slice(0, 2) + String(used.size % 10);
      used.add(code);
      return code;
    };
    for (const [cat, list] of [...byCat].sort((a, b) => a[0].localeCompare(b[0]))) {
      const code = codeFor(cat);
      [...list].sort((a, b) => a.name.localeCompare(b.name)).forEach((sk, i) => out.set(sk.slug, { code, num: String(i + 1).padStart(3, '0') }));
    }
    return out;
  }, [skills]);

  // Show a page of results at a time; a new search starts from the top again.
  const PAGE = 12;
  const [shown, setShown] = useState(PAGE);
  useEffect(() => setShown(PAGE), [query, category]);
  const visible = results.slice(0, shown);
  const remaining = results.length - visible.length;

  // Restore ?q= and ?category= so a search can be shared or survive a back navigation.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('q')) setQuery(p.get('q')!);
    if (p.get('category')) setCategory(p.get('category')!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (query) p.set('q', query); else p.delete('q');
    if (category !== 'all') p.set('category', category); else p.delete('category');
    const qs = p.toString();
    window.history.replaceState(window.history.state, '', qs ? `?${qs}` : window.location.pathname);
  }, [query, category]);

  // "/" or Cmd/Ctrl+K focuses the search from anywhere on the page.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inputRef]);

  const links = () => Array.from(listRef.current?.querySelectorAll<HTMLElement>('[data-result]') ?? []);

  function onInputKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      links()[0]?.focus();
    } else if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      // Questions go to the AI; names and keywords open the top match.
      if (e.metaKey || e.ctrlKey || askMode || looksLikeQuestion(query) || !results[0]) runAsk(query);
      else router.push(`/skills/${results[0].skill.slug}`);
    } else if (e.key === 'Escape') {
      if (ai) closeAi();
      else if (query) setQuery('');
      else inputRef.current?.blur();
    }
  }

  function onListKey(e: KeyboardEvent<HTMLDivElement>) {
    const all = links();
    const i = all.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); all[Math.min(i + 1, all.length - 1)]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); (i === 0 ? inputRef.current : all[i - 1])?.focus(); }
    if (e.key === 'Escape') inputRef.current?.focus();
  }

  const countLabel = `${results.length} ${results.length === 1 ? 'entry' : 'entries'}`;

  return (
    <div>
      <div ref={dockRef} {...stylex.props(s.dock)}>
      <div {...stylex.props(floating && s.floating)}>
      <div role="search" {...stylex.props(s.box, floating && s.boxFloating)}>
        <Icon name="aiSearch" size={22} style={{ color: colors.ink3 }} />
        <label htmlFor="skill-search" {...stylex.props(s.srOnly)}>Search skills or ask AI a question</label>
        <span {...stylex.props(s.field)}>
        <input
          ref={inputRef}
          id="skill-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKey}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setAskMode(false); }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          aria-controls="skill-results"
          aria-describedby="skill-count"
          {...stylex.props(s.input)}
        />
        {!query && (
          <span aria-hidden key={focused ? (askMode ? 'ask' : 'focus') : hint} {...stylex.props(s.hint2)}>
            {focused ? (
              askMode ? 'Type a question, then press Enter' : 'Search skills or ask a question'
            ) : HINTS[hint].ask ? (
              <><span {...stylex.props(s.hintAsk)}>Ask AI</span> {HINTS[hint].text}</>
            ) : (
              HINTS[hint].text
            )}
          </span>
        )}
        </span>
        {query ? (
          <>
            <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="Clear search" {...stylex.props(s.clear)}>
              <Icon name="close" size={16} />
            </button>
            <button type="button" onClick={() => runAsk(query)} aria-label="Ask AI" {...stylex.props(s.askBtn)}>
              <Icon name="ai" size={16} />
              <span {...stylex.props(s.askLabel)}>Ask AI</span>
            </button>
          </>
        ) : (
          <>
            <kbd aria-hidden {...stylex.props(s.kbd)}>/</kbd>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={startAsking} aria-label="Ask AI a question" {...stylex.props(s.askBtn)}>
              <Icon name="ai" size={16} />
              <span {...stylex.props(s.askLabel)}>Ask AI</span>
            </button>
          </>
        )}
      </div>
      </div>

      </div>

      <div role="group" aria-label="Example questions" {...stylex.props(s.try)}>
        <span {...stylex.props(s.tryLabel)}>Try asking</span>
        {TRY.map((q) => (
          <button key={q} type="button" onClick={() => { setQuery(q); runAsk(q); }} {...stylex.props(s.tryChip)}>
            <Icon name="ai" size={13} style={{ color: colors.accentInk }} /> {q}
          </button>
        ))}
      </div>

      <div ref={aiRef}>
        {ai && <AiAnswer state={ai} skills={skills} onAsk={(q) => { setQuery(q); runAsk(q); }} onClose={closeAi} />}
      </div>

      <section ref={panelRef} aria-label="Skills catalog" {...stylex.props(s.catalog)}>
      {/* Category filters as index tabs on the catalog drawer. */}
      <div role="group" aria-label="Filter by category" {...stylex.props(s.chips)}>
        {[['all', skills.length] as const, ...categories].map(([cat, n]) => {
          const on = category === cat;
          return (
            <button key={cat} type="button" aria-pressed={on} onClick={() => setCategory(cat)} {...stylex.props(s.chip, on && s.chipOn)}>
              {cat === 'all' ? 'All' : cat}
              <span {...stylex.props(s.chipN, on && s.chipNOn)}>{n}</span>
            </button>
          );
        })}
      </div>

      <div {...stylex.props(s.panel)}>
      <div {...stylex.props(s.panelHead)}>
      <p id="skill-count" aria-live="polite" {...stylex.props(s.count)}>
        <span><span {...stylex.props(s.countLabel)}>Catalog</span> · {query || category !== 'all' ? `${countLabel} found` : countLabel}</span>
        <span {...stylex.props(s.hint)}>Enter opens the top match · ⌘Enter asks AI</span>
      </p>
      </div>

      <div ref={listRef} onKeyDown={onListKey} {...stylex.props(s.panelBody)}>
      {query.trim() && ai?.question !== query.trim() && (
        <button type="button" data-result onClick={() => runAsk(query)} {...stylex.props(s.askRow)}>
          <span {...stylex.props(s.askIcon)}><Icon name="ai" size={16} /></span>
          <span {...stylex.props(s.askText)}>
            Ask AI <span {...stylex.props(s.askQuery)}>“{query.trim()}”</span>
          </span>
          <kbd aria-hidden {...stylex.props(s.kbd, s.askKbd)}>{looksLikeQuestion(query) ? '↵' : '⌘↵'}</kbd>
        </button>
      )}
      {results.length > 0 ? (
        <ul id="skill-results" {...stylex.props(s.list)}>
          {visible.map(({ skill }) => (
            <li key={skill.slug} {...stylex.props(s.item)}>
              <Link href={`/skills/${skill.slug}`} data-result {...stylex.props(s.row)}>
                <span aria-hidden {...stylex.props(s.call)}>
                  <span {...stylex.props(s.callCode)}>{callNo.get(skill.slug)?.code}</span>
                  <span {...stylex.props(s.callNum)}>.{callNo.get(skill.slug)?.num}</span>
                </span>
                <span {...stylex.props(s.rowMain)}>
                  <span {...stylex.props(s.name)}><Highlight text={skill.name} query={query} /></span>
                  <span {...stylex.props(s.desc)}><Highlight text={skill.description} query={query} /></span>
                  <span {...stylex.props(s.meta)}>
                    <span {...stylex.props(s.metaCall)}>{callNo.get(skill.slug)?.code}.{callNo.get(skill.slug)?.num} · </span>
                    {skill.category}
                    {skill.demo && <> · <span {...stylex.props(s.demoMark)}>demo</span></>}
                    {skill.version && <> · v{skill.version}</>}
                    {skill.tags.length > 0 && <> · {skill.tags.map((t) => `#${t}`).join(' ')}</>}
                  </span>
                </span>
                <span {...stylex.props(s.chev)}><Icon name="next" size={20} /></span>
              </Link>
            </li>
          ))}
        </ul>
      ) : ai && ai.question === query.trim() ? null : (
        <div id="skill-results" {...stylex.props(s.empty)}>
          <span {...stylex.props(s.emptyIcon)}><Icon name="library" size={26} /></span>
          <p {...stylex.props(s.emptyTitle)}>
            {query ? <>No skills match “{query}”.</> : 'No skills in this category yet.'}
          </p>
          <p {...stylex.props(s.emptyText)}>The library grows with contributions. Ask for this skill, or write it yourself.</p>
          <div {...stylex.props(s.emptyActions)}>
            <a
              href={`${SITE.newIssue}?title=${encodeURIComponent(`Skill request: ${query || category}`)}`}
              target="_blank"
              rel="noopener"
              {...stylex.props(s.btn)}
            >
              <Icon name="github" size={16} /> Request it
            </a>
            <Link href="/contribute" {...stylex.props(s.btn, s.btnPrimary)}>
              <Icon name="add" size={16} /> Contribute a skill
            </Link>
            {(query || category !== 'all') && (
              <button type="button" onClick={() => { setQuery(''); setCategory('all'); }} {...stylex.props(s.btn, s.btnGhost)}>
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}
      </div>

      {remaining > 0 && (
        <div {...stylex.props(s.more)}>
          <button type="button" onClick={() => setShown((n) => n + PAGE)} {...stylex.props(s.btn)}>
            Show {Math.min(PAGE, remaining)} more
          </button>
          <button type="button" onClick={() => setShown(results.length)} {...stylex.props(s.btn, s.btnGhost)}>
            Show all {results.length}
          </button>
          <span {...stylex.props(s.moreCount)}>Showing {visible.length} of {results.length}</span>
        </div>
      )}
      </div>
      </section>
    </div>
  );
}

const HOVER = '@media (hover: hover)';

const hintIn = stylex.keyframes({
  from: { opacity: 0, transform: 'translateY(6px)' },
  to: { opacity: 1, transform: 'none' },
});

const dockIn = stylex.keyframes({
  from: { opacity: 0, transform: 'translate(-50%, 16px)' },
  to: { opacity: 1, transform: 'translate(-50%, 0)' },
});

const s = stylex.create({
  srOnly: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' },
  box: {
    display: 'flex',
    alignItems: 'center',
    gap: { default: 10, '@media (min-width: 720px)': 14 },
    height: { default: 56, '@media (min-width: 720px)': 64 },
    paddingLeft: { default: 16, '@media (min-width: 720px)': 20 },
    paddingRight: { default: 10, '@media (min-width: 720px)': 12 },
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: colors.line2, ':focus-within': colors.ink },
    borderRadius: 14,
    boxShadow: {
      default: colors.shadow,
      ':focus-within': `0 0 0 4px ${colors.selection}`,
    },
    transitionProperty: 'border-color, box-shadow',
    transitionDuration: motion.fast,
  },
  input: {
    flexGrow: 1,
    minWidth: 0,
    height: '100%',
    padding: 0,
    fontFamily: fonts.sans,
    fontSize: { default: 17, '@media (min-width: 720px)': 19 },
    color: colors.ink,
    backgroundColor: 'transparent',
    borderWidth: 0,
    outline: 'none',
    '::placeholder': { color: colors.ink3 },
    '::-webkit-search-cancel-button': { display: 'none' },
  },
  kbd: {
    display: { default: 'none', [HOVER]: 'inline-grid' },
    placeItems: 'center',
    minWidth: 26,
    height: 26,
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.ink3,
    backgroundColor: colors.sunk,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: 6,
  },
  clear: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 32,
    height: 32,
    padding: 0,
    color: colors.ink2,
    backgroundColor: { default: colors.sunk, ':hover': colors.line },
    borderWidth: 0,
    borderRadius: radii.pill,
  },
  askBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    height: 36,
    paddingInline: { default: 10, '@media (min-width: 480px)': 12 },
    fontSize: 14,
    fontWeight: 500,
    color: colors.bg,
    backgroundColor: { default: colors.ink, ':hover': colors.ink2 },
    borderWidth: 0,
    borderRadius: 10,
    transitionProperty: 'background-color, transform',
    transitionDuration: motion.fast,
    transform: { default: null, ':active': 'scale(0.97)' },
  },
  askLabel: { display: { default: 'none', '@media (min-width: 480px)': 'inline' } },
  askRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: 'calc(100% + 24px)',
    marginInline: -12,
    marginTop: 8,
    paddingBlock: 14,
    paddingInline: 12,
    textAlign: 'left',
    fontSize: 15,
    color: colors.ink,
    backgroundColor: { default: 'transparent', ':hover': colors.sunk, ':focus-visible': colors.sunk },
    borderWidth: 0,
    borderRadius: radii.md,
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
  },
  askIcon: {
    display: 'inline-grid',
    placeItems: 'center',
    flexShrink: 0,
    width: 30,
    height: 30,
    color: colors.accentInk,
    backgroundColor: colors.sunk,
    borderRadius: 8,
  },
  askText: { flexGrow: 1, minWidth: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  askQuery: { fontWeight: 400, color: colors.ink2 },
  askKbd: { minWidth: 34, paddingInline: 6 },
  field: { position: 'relative', display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0, height: '100%' },
  hint2: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    pointerEvents: 'none',
    fontSize: { default: 17, '@media (min-width: 720px)': 19 },
    color: colors.ink3,
    animationName: hintIn,
    animationDuration: '420ms',
    animationTimingFunction: 'ease-out',
  },
  hintAsk: {
    flexShrink: 0,
    paddingBlock: 2,
    paddingInline: 8,
    fontSize: 13,
    fontWeight: 600,
    color: colors.accentInk,
    backgroundColor: colors.selection,
    borderRadius: 6,
  },
  try: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 10,
    rowGap: 10,
    marginTop: { default: 20, '@media (min-width: 720px)': 24 },
  },
  tryLabel: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink3, marginRight: 4 },
  tryChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 34,
    paddingInline: 14,
    fontSize: 13,
    fontWeight: 500,
    color: { default: colors.ink2, ':hover': colors.ink },
    backgroundColor: { default: colors.surface, ':hover': colors.sunk },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: radii.pill,
    transitionProperty: 'background-color, color',
    transitionDuration: motion.fast,
  },
  dock: { minHeight: { default: 56, '@media (min-width: 720px)': 64 } },
  floating: {
    position: 'fixed',
    left: '50%',
    bottom: 'calc(16px + env(safe-area-inset-bottom))',
    zIndex: 30,
    width: 'min(680px, calc(100vw - 32px))',
    transform: 'translateX(-50%)',
    animationName: dockIn,
    animationDuration: '260ms',
    animationTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
  },
  boxFloating: {
    height: 56,
    borderColor: { default: colors.line2, ':focus-within': colors.ink },
    boxShadow: {
      default: '0 18px 40px -12px rgba(0,0,0,0.38), 0 2px 6px rgba(0,0,0,0.08)',
      ':focus-within': `0 18px 40px -12px rgba(0,0,0,0.38), 0 0 0 4px ${colors.selection}`,
    },
  },
  catalog: { marginTop: { default: 36, '@media (min-width: 720px)': 48 }, textAlign: 'left' },
  panel: {
    position: 'relative',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: 14,
    borderTopLeftRadius: { default: 0, '@media (min-width: 720px)': 14 },
    boxShadow: colors.shadow,
    overflow: 'hidden',
  },
  panelHead: {
    paddingTop: 16,
    paddingInline: { default: 16, '@media (min-width: 720px)': 22 },
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.ink,
    marginInline: { default: 16, '@media (min-width: 720px)': 22 },
    paddingLeft: 0,
    paddingRight: 0,
  },
  panelBody: { paddingInline: { default: 16, '@media (min-width: 720px)': 22 }, paddingBlock: 4 },
  // Index tabs: they sit on the drawer's top edge and the active one joins it.
  chips: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: -1,
    paddingLeft: { default: 0, '@media (min-width: 720px)': 18 },
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },
  chip: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 34,
    paddingInline: 14,
    fontFamily: fonts.mono,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: { default: colors.ink3, ':hover': colors.ink },
    backgroundColor: { default: colors.sunk, ':hover': colors.line },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderBottomColor: 'transparent',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    transitionProperty: 'color, background-color, height',
    transitionDuration: motion.fast,
  },
  chipOn: {
    height: 40,
    color: colors.ink,
    backgroundColor: { default: colors.surface, ':hover': colors.surface },
    borderTopWidth: 3,
    borderTopColor: colors.accent,
    borderBottomColor: colors.surface,
  },
  chipN: { fontSize: 11, color: colors.ink3, fontVariantNumeric: 'tabular-nums' },
  chipNOn: { color: colors.accentInk },
  count: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    paddingBottom: 12,
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.ink3,
  },
  countLabel: { fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.ink },
  hint: { display: { default: 'none', [HOVER]: 'inline' } },
  list: { display: 'grid', textAlign: 'left' },
  item: {
    borderBottomWidth: 1,
    borderBottomStyle: 'dashed',
    borderBottomColor: { default: colors.line2, ':last-child': 'transparent' },
  },
  row: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 1fr) auto', '@media (min-width: 720px)': '84px minmax(0, 1fr) auto' },
    alignItems: 'center',
    columnGap: { default: 12, '@media (min-width: 720px)': 20 },
    paddingBlock: { default: 18, '@media (min-width: 720px)': 22 },
    paddingInline: 12,
    marginInline: -12,
    borderRadius: radii.md,
    backgroundColor: { default: 'transparent', ':hover': colors.sunk, ':focus-visible': colors.sunk },
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
  },
  // The call number, like the label on a book's spine.
  call: {
    display: { default: 'none', '@media (min-width: 720px)': 'grid' },
    alignSelf: 'start',
    justifyItems: 'start',
    paddingTop: 3,
    fontFamily: fonts.mono,
    lineHeight: 1.25,
  },
  callCode: { fontSize: 15, fontWeight: 600, letterSpacing: '0.04em', color: colors.accentInk },
  callNum: { fontSize: 12, color: colors.ink3, fontVariantNumeric: 'tabular-nums' },
  rowMain: { display: 'grid', gap: 6, minWidth: 0 },
  name: { fontFamily: fonts.mono, fontSize: { default: 16, '@media (min-width: 720px)': 18 }, fontWeight: 500, color: colors.ink },
  meta: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink3, overflowWrap: 'anywhere' },
  demoMark: { color: colors.accentInk },
  metaCall: { display: { default: 'inline', '@media (min-width: 720px)': 'none' }, color: colors.accentInk, fontWeight: 600 },

  more: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBlock: 16,
    paddingInline: 16,
    backgroundColor: colors.sunk,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
  },
  moreCount: { width: '100%', textAlign: 'center', fontFamily: fonts.mono, fontSize: 12, color: colors.ink3 },
  desc: { fontSize: 15, lineHeight: 1.5, color: colors.ink2 },
  chev: {
    display: 'inline-flex',
    color: { default: colors.ink3, ':is(a:hover *)': colors.accentInk },
    transform: { default: 'none', ':is(a:hover *)': 'translateX(3px)' },
    transitionProperty: 'color, transform',
    transitionDuration: motion.fast,
  },
  mark: { color: 'inherit', backgroundColor: colors.selection, borderRadius: 3, paddingInline: 1 },
  empty: {
    display: 'grid',
    justifyItems: 'center',
    gap: 10,
    paddingBlock: 48,
    paddingInline: 16,
    textAlign: 'center',
  },
  emptyIcon: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 52,
    height: 52,
    marginBottom: 4,
    color: colors.accent,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: 14,
  },
  emptyTitle: { fontSize: 18, fontWeight: 600, overflowWrap: 'anywhere' },
  emptyText: { maxWidth: '44ch', fontSize: 15, color: colors.ink2 },
  emptyActions: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 10 },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingInline: 14,
    fontSize: 14,
    fontWeight: 500,
    color: colors.ink,
    backgroundColor: { default: colors.surface, ':hover': colors.sunk },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: radii.sm,
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
  },
  btnPrimary: { color: colors.bg, backgroundColor: { default: colors.ink, ':hover': colors.ink2 }, borderColor: colors.ink },
  btnGhost: { backgroundColor: { default: 'transparent', ':hover': colors.sunk }, borderColor: 'transparent' },
});
