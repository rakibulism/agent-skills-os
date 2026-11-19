'use client';

import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { colors, fonts } from '@/styles/tokens.stylex';

/*
 * The logo, made physical: a shelf of skills you can play with. Each book lifts on hover;
 * pulling one tips it off the shelf and hands a skill to the search below.
 */
type Tone = 'ink' | 'ink2' | 'ink3' | 'paper' | 'accent';
type Book = { w: number; h: number; tone: Tone; bands: number[]; lean?: boolean };

const BOOKS: Book[] = [
  { w: 27, h: 116, tone: 'ink', bands: [16, 80] },
  { w: 20, h: 132, tone: 'ink2', bands: [12] },
  { w: 32, h: 104, tone: 'paper', bands: [72] },
  { w: 22, h: 142, tone: 'ink', bands: [10, 86] },
  { w: 17, h: 98, tone: 'ink3', bands: [] },
  { w: 27, h: 124, tone: 'ink2', bands: [78] },
  { w: 30, h: 120, tone: 'accent', bands: [18], lean: true },
];

export function Shelf({ onPick, label }: { onPick: () => void; label: string }) {
  const [picked, setPicked] = useState<{ i: number; n: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function pick(i: number) {
    setPicked((p) => ({ i, n: (p?.n ?? 0) + 1 }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPicked(null), 900);
    onPick();
  }

  function onClick(e: MouseEvent<HTMLButtonElement>) {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-book]');
    // Keyboard activation has no target book: take one at random.
    pick(el ? Number(el.dataset.book) : Math.floor(Math.random() * BOOKS.length));
  }

  return (
    <div {...stylex.props(s.wrap)}>
      <button type="button" onClick={onClick} aria-label={label} {...stylex.props(s.button)}>
        <span {...stylex.props(s.row)}>
          {BOOKS.map((b, i) => {
            const isPicked = picked?.i === i;
            return (
              <span
                key={isPicked ? `${i}-${picked!.n}` : i}
                data-book={i}
                style={{ width: b.w, height: b.h }}
                {...stylex.props(s.book, s[b.tone], b.lean && s.lean, isPicked && (b.lean ? s.pullLean : s.pull))}
              >
                {b.bands.map((top) => (
                  <span key={top} style={{ top: `${top}%` }} {...stylex.props(s.band)} />
                ))}
              </span>
            );
          })}
        </span>
        <span {...stylex.props(s.plank)} />
      </button>
      <p aria-hidden {...stylex.props(s.caption)}>Pull a book</p>
    </div>
  );
}

const spring = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

const pull = stylex.keyframes({
  '0%': { transform: 'translateY(0) rotate(0deg)' },
  '35%': { transform: 'translateY(-26px) rotate(-7deg)' },
  '60%': { transform: 'translateY(-20px) rotate(-5deg)' },
  '100%': { transform: 'translateY(0) rotate(0deg)' },
});

const pullLean = stylex.keyframes({
  '0%': { transform: 'rotate(-16deg)' },
  '35%': { transform: 'translateY(-24px) rotate(2deg)' },
  '60%': { transform: 'translateY(-18px) rotate(0deg)' },
  '100%': { transform: 'rotate(-16deg)' },
});

const s = stylex.create({
  wrap: { display: 'grid', justifyItems: 'center', gap: 14 },
  button: {
    // The shelf is ~324px wide; shrink it on the smallest phones so it never forces a scroll.
    zoom: { default: 1, '@media (max-width: 359px)': 0.86 },
    position: 'relative',
    display: 'grid',
    justifyItems: 'center',
    paddingTop: 40,
    paddingInline: 12,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 12,
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  row: { display: 'flex', alignItems: 'flex-end', gap: 4, paddingInline: 18 },
  book: {
    position: 'relative',
    display: 'block',
    flexShrink: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    boxShadow:
      'inset 2px 0 0 rgba(255,255,255,0.16), inset -3px 0 0 rgba(0,0,0,0.18), inset 0 2px 0 rgba(255,255,255,0.12)',
    transformOrigin: 'bottom left',
    transitionProperty: 'transform',
    transitionDuration: '320ms',
    transitionTimingFunction: spring,
    transform: { default: 'translateY(0)', ':hover': 'translateY(-8px)' },
  },
  ink: { backgroundColor: colors.ink },
  ink2: { backgroundColor: colors.ink2 },
  ink3: { backgroundColor: colors.ink3 },
  paper: { backgroundColor: colors.line2 },
  accent: { backgroundColor: colors.accent },
  lean: {
    marginLeft: 33,
    transform: { default: 'rotate(-16deg)', ':hover': 'translateY(-6px) rotate(-12deg)' },
  },
  pull: { animationName: pull, animationDuration: '850ms', animationTimingFunction: 'ease-in-out' },
  pullLean: { animationName: pullLean, animationDuration: '850ms', animationTimingFunction: 'ease-in-out' },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: colors.bg,
    opacity: 0.85,
  },
  plank: {
    display: 'block',
    width: '100%',
    height: 14,
    marginTop: -1,
    backgroundColor: colors.ink,
    borderRadius: 4,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 30px -14px rgba(0,0,0,0.45)',
  },
  caption: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink3 },
});
