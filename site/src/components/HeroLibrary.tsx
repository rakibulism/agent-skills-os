'use client';

import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { SkillSummary } from '@/lib/skills';
import { Shelf } from './Shelf';
import { SkillSearch } from './SkillSearch';

/**
 * The home hero: the shelf, the headline (server-rendered, passed as children) and the search.
 * Pulling a book types a skill's name into the search, so the play teaches the search.
 */
export function HeroLibrary({ skills, children }: { skills: SkillSummary[]; children: ReactNode }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const last = useRef<string | null>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function typeIn(text: string) {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setQuery(text);
      return;
    }
    setQuery('');
    [...text].forEach((_, i) => {
      timers.current.push(setTimeout(() => setQuery(text.slice(0, i + 1)), 260 + i * 45));
    });
  }

  function onPick() {
    if (!skills.length) return;
    const pool = skills.length > 1 ? skills.filter((s) => s.name !== last.current) : skills;
    const skill = pool[Math.floor(Math.random() * pool.length)];
    last.current = skill.name;
    typeIn(skill.name);
  }

  return (
    <div {...stylex.props(s.hero)}>
      <Shelf onPick={onPick} label="Pull a skill off the shelf and search for it" />
      <div {...stylex.props(s.copy)}>{children}</div>
      <div {...stylex.props(s.search)}>
        <SkillSearch skills={skills} query={query} onQueryChange={setQuery} inputRef={inputRef} />
      </div>
    </div>
  );
}

const s = stylex.create({
  hero: { display: 'grid', justifyItems: 'center', textAlign: 'center' },
  copy: { display: 'grid', justifyItems: 'center', gap: 16, marginTop: { default: 28, '@media (min-width: 720px)': 36 } },
  search: { width: '100%', maxWidth: 680, marginTop: { default: 28, '@media (min-width: 720px)': 36 } },
});
