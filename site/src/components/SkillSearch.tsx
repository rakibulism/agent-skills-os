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
  // Best match first; on ties, real skills before demos, then by name.
  return out.sort((a, b) => b.score - a.score || Number(a.skill.demo) - Number(b.skill.demo) || a.skill.name.localeCompare(b.skill.name));
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
  const [ai, setAi] = useState<AiState | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  function runAsk(question: string) {
    const q = question.trim();
    if (!q) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setAi({ status: 'loading', question: q });
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
      if (e.metaKey || e.ctrlKey || looksLikeQuestion(query) || !results[0]) runAsk(query);
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

  const countLabel = `${results.length} ${results.length === 1 ? 'skill' : 'skills'}`;

  return (
    <div>
      <div role="search" {...stylex.props(s.box)}>
        <Icon name="search" size={22} style={{ color: colors.ink3 }} />
        <label htmlFor="skill-search" {...stylex.props(s.srOnly)}>Search skills</label>
        <input
          ref={inputRef}
          id="skill-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKey}
          placeholder="Search skills or ask a question"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          aria-controls="skill-results"
          aria-describedby="skill-count"
          {...stylex.props(s.input)}
        />
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
          <kbd aria-hidden {...stylex.props(s.kbd)}>/</kbd>
        )}
      </div>

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

      {ai && <AiAnswer state={ai} skills={skills} onAsk={(q) => { setQuery(q); runAsk(q); }} onClose={closeAi} />}

      <p id="skill-count" aria-live="polite" {...stylex.props(s.count)}>
        {query || category !== 'all' ? `${countLabel} found` : countLabel}
        <span {...stylex.props(s.hint)}>Enter opens the top match · ⌘Enter asks AI</span>
      </p>

      <div ref={listRef} onKeyDown={onListKey}>
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
                <span {...stylex.props(s.rowMain)}>
                  <span {...stylex.props(s.rowHead)}>
                    <span {...stylex.props(s.name)}><Highlight text={skill.name} query={query} /></span>
                    <span {...stylex.props(s.tag)}>{skill.category}</span>
                    {skill.demo && <span {...stylex.props(s.demo)}>Demo</span>}
                    {skill.version && <span {...stylex.props(s.ver)}>v{skill.version}</span>}
                  </span>
                  <span {...stylex.props(s.desc)}><Highlight text={skill.description} query={query} /></span>
                </span>
                <span {...stylex.props(s.chev)}><Icon name="next" size={18} /></span>
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
  );
}

const HOVER = '@media (hover: hover)';

const s = stylex.create({
  srOnly: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' },
  box: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: { default: 56, '@media (min-width: 720px)': 64 },
    paddingLeft: 18,
    paddingRight: 12,
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
    backgroundColor: { default: 'transparent', ':hover': colors.surface, ':focus-visible': colors.surface },
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
  chips: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 16 },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 34,
    paddingInline: 12,
    fontSize: 14,
    fontWeight: 500,
    color: { default: colors.ink2, ':hover': colors.ink },
    backgroundColor: { default: 'transparent', ':hover': colors.sunk },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: radii.pill,
    transitionProperty: 'color, background-color, border-color',
    transitionDuration: motion.fast,
  },
  chipOn: { color: colors.bg, backgroundColor: { default: colors.ink, ':hover': colors.ink }, borderColor: colors.ink },
  chipN: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink3, fontVariantNumeric: 'tabular-nums' },
  chipNOn: { color: 'inherit', opacity: 0.7 },
  count: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 28,
    paddingBottom: 10,
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.ink3,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.line,
  },
  hint: { display: { default: 'none', [HOVER]: 'inline' } },
  list: { display: 'grid', textAlign: 'left' },
  item: { borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: colors.line },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    paddingBlock: 18,
    paddingInline: 12,
    marginInline: -12,
    borderRadius: radii.md,
    backgroundColor: { default: 'transparent', ':hover': colors.surface, ':focus-visible': colors.surface },
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
  },
  rowMain: { display: 'grid', gap: 6, minWidth: 0, flexGrow: 1 },
  rowHead: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  name: { fontFamily: fonts.mono, fontSize: 16, fontWeight: 500, color: colors.ink },
  tag: {
    fontSize: 12,
    paddingBlock: 1,
    paddingInline: 8,
    color: colors.ink2,
    backgroundColor: colors.sunk,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: radii.pill,
  },
  ver: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink3 },
  demo: {
    fontSize: 11,
    fontWeight: 500,
    paddingBlock: 1,
    paddingInline: 7,
    color: colors.accentInk,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    borderRadius: radii.pill,
  },
  more: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
  moreCount: { width: '100%', textAlign: 'center', fontFamily: fonts.mono, fontSize: 12, color: colors.ink3 },
  desc: { fontSize: 15, lineHeight: 1.5, color: colors.ink2 },
  chev: { color: colors.ink3, display: 'inline-flex' },
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
