'use client';

import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { SkillSummary } from '@/lib/skills';
import { SITE } from '@/lib/site';
import { colors, fonts, motion, radii } from '@/styles/tokens.stylex';
import { Icon } from './Icon';

type Scored = { skill: SkillSummary; score: number };

function search(skills: SkillSummary[], query: string, category: string): Scored[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const out: Scored[] = [];
  for (const skill of skills) {
    if (category !== 'all' && skill.category !== category) continue;
    const name = skill.name.toLowerCase();
    const hay = [name, skill.description.toLowerCase(), skill.category.toLowerCase(), ...skill.tags].join(' ');
    let score = 0;
    let ok = true;
    for (const t of tokens) {
      if (!hay.includes(t)) { ok = false; break; }
      score += name.startsWith(t) ? 4 : name.includes(t) ? 3 : skill.tags.some((tag) => tag.startsWith(t)) ? 2 : 1;
    }
    if (ok) out.push({ skill, score });
  }
  return out.sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name));
}

/** Wraps every query token found in `text` in <mark>. */
function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return <>{text}</>;
  const re = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts: ReactNode[] = text.split(re).map((part, i) =>
    i % 2 ? <mark key={i} {...stylex.props(s.mark)}>{part}</mark> : part,
  );
  return <>{parts}</>;
}

export function SkillSearch({ skills }: { skills: SkillSummary[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const sk of skills) counts.set(sk.category, (counts.get(sk.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [skills]);

  const results = useMemo(() => search(skills, query, category), [skills, query, category]);

  // Restore ?q= and ?category= so a search can be shared or survive a back navigation.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('q')) setQuery(p.get('q')!);
    if (p.get('category')) setCategory(p.get('category')!);
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
  }, []);

  const links = () => Array.from(listRef.current?.querySelectorAll<HTMLAnchorElement>('a[data-result]') ?? []);

  function onInputKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      links()[0]?.focus();
    } else if (e.key === 'Enter' && results[0]) {
      e.preventDefault();
      router.push(`/skills/${results[0].skill.slug}`);
    } else if (e.key === 'Escape') {
      if (query) setQuery(''); else inputRef.current?.blur();
    }
  }

  function onListKey(e: KeyboardEvent<HTMLUListElement>) {
    const all = links();
    const i = all.indexOf(document.activeElement as HTMLAnchorElement);
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
          placeholder="Search skills by name, task or tag"
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
          <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="Clear search" {...stylex.props(s.clear)}>
            <Icon name="close" size={16} />
          </button>
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

      <p id="skill-count" aria-live="polite" {...stylex.props(s.count)}>
        {query || category !== 'all' ? `${countLabel} found` : countLabel}
        <span {...stylex.props(s.hint)}>Enter opens the first match · ↑↓ to move</span>
      </p>

      {results.length > 0 ? (
        <ul id="skill-results" ref={listRef} onKeyDown={onListKey} {...stylex.props(s.list)}>
          {results.map(({ skill }) => (
            <li key={skill.slug} {...stylex.props(s.item)}>
              <Link href={`/skills/${skill.slug}`} data-result {...stylex.props(s.row)}>
                <span {...stylex.props(s.rowMain)}>
                  <span {...stylex.props(s.rowHead)}>
                    <span {...stylex.props(s.name)}><Highlight text={skill.name} query={query} /></span>
                    <span {...stylex.props(s.tag)}>{skill.category}</span>
                    {skill.version && <span {...stylex.props(s.ver)}>v{skill.version}</span>}
                  </span>
                  <span {...stylex.props(s.desc)}><Highlight text={skill.description} query={query} /></span>
                </span>
                <span {...stylex.props(s.chev)}><Icon name="next" size={18} /></span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
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
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 },
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
  list: { display: 'grid' },
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
