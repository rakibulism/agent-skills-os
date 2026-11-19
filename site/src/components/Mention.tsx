'use client';

import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { copyText } from '@/lib/clipboard';
import { SITE } from '@/lib/site';
import type { SkillSummary } from '@/lib/skills';
import { colors, fonts, motion, radii } from '@/styles/tokens.stylex';
import { Icon } from './Icon';

/*
 * A highlighted mention inside an AI answer: a skill, the package, or an API function.
 * Hover, focus or tap opens a small popover with copy and open actions.
 */
export type MentionKind =
  | { kind: 'skill'; skill: SkillSummary }
  | { kind: 'package' }
  | { kind: 'api'; fn: string; returns: string };

type Action = { label: string; icon: 'copy' | 'next' | 'external' | 'docs'; copy?: string; what?: string; href?: string; external?: boolean };

function actionsFor(m: MentionKind): { title: string; kicker: string; body?: string; actions: Action[] } {
  if (m.kind === 'skill') {
    const n = m.skill.name;
    return {
      title: n,
      kicker: 'Skill',
      body: m.skill.description,
      actions: [
        { label: 'Copy name', icon: 'copy', copy: n, what: 'Skill name' },
        { label: 'Copy code', icon: 'copy', copy: `forClaude("${n}")`, what: 'Code' },
        { label: 'Open skill', icon: 'next', href: `/skills/${m.skill.slug}` },
      ],
    };
  }
  if (m.kind === 'package') {
    return {
      title: SITE.pkg,
      kicker: 'npm package',
      body: 'MIT, no dependencies. Node 18+.',
      actions: [
        { label: 'Copy install', icon: 'copy', copy: SITE.install, what: 'Install command' },
        { label: 'Copy name', icon: 'copy', copy: SITE.pkg, what: 'Package name' },
        { label: 'npm', icon: 'external', href: SITE.npm, external: true },
      ],
    };
  }
  return {
    title: `${m.fn}()`,
    kicker: 'Function',
    body: `Returns ${m.returns}`,
    actions: [
      { label: 'Copy import', icon: 'copy', copy: `import { ${m.fn} } from "${SITE.pkg}"`, what: 'Import' },
      { label: 'Docs', icon: 'docs', href: '/docs#api' },
    ],
  };
}

export function Mention({ mention, children }: { mention: MentionKind; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState({ x: 0, below: false });
  const wrapRef = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);
  const chipRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();
  const info = actionsFor(mention);

  const show = (delay = 0) => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(true), delay); };
  const hide = (delay = 0) => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(false), delay); };
  useEffect(() => () => clearTimeout(timer.current), []);

  // Keep the popover on screen: nudge it sideways, and drop it below if there's no room above.
  useLayoutEffect(() => {
    if (!open) { setShift({ x: 0, below: false }); return; }
    const pop = popRef.current?.getBoundingClientRect();
    if (!pop) return;
    const vw = document.documentElement.clientWidth;
    let x = 0;
    if (pop.right > vw - 12) x = vw - 12 - pop.right;
    if (pop.left + x < 12) x = 12 - pop.left;
    setShift({ x, below: pop.top < 72 });
    // Measure once per opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Tap outside or Escape closes it.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); chipRef.current?.focus(); } };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  async function run(a: Action) {
    if (!a.copy) return;
    try {
      await copyText(a.copy);
      toast.success(`${a.what ?? 'Text'} copied`, { id: 'copy' });
    } catch {
      toast.error("Couldn't copy. Select the text and copy it instead.", { id: 'copy' });
    }
  }

  return (
    <span
      ref={wrapRef}
      onMouseEnter={() => show(120)}
      onMouseLeave={() => hide(160)}
      onFocus={() => show()}
      onBlur={(e) => { if (!wrapRef.current?.contains(e.relatedTarget as Node)) hide(); }}
      {...stylex.props(s.wrap)}
    >
      <button
        ref={chipRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        {...stylex.props(s.chip, mention.kind === 'skill' && s.chipSkill, open && s.chipOpen)}
      >
        {children}
      </button>
      {open && (
        <span
          ref={popRef}
          id={id}
          role="group"
          aria-label={`${info.kicker}: ${info.title}`}
          style={{ transform: `translateX(${shift.x}px)` }}
          {...stylex.props(s.pop, shift.below && s.popBelow)}
        >
          <span {...stylex.props(s.kicker)}>{info.kicker}</span>
          <span {...stylex.props(s.title)}>{info.title}</span>
          {info.body && <span {...stylex.props(s.body)}>{info.body}</span>}
          <span {...stylex.props(s.actions)}>
            {info.actions.map((a) =>
              a.href ? (
                a.external ? (
                  <a key={a.label} href={a.href} target="_blank" rel="noopener" {...stylex.props(s.action)}>
                    <Icon name={a.icon} size={14} /> {a.label}
                  </a>
                ) : (
                  <Link key={a.label} href={a.href} {...stylex.props(s.action, s.actionPrimary)}>
                    {a.label} <Icon name={a.icon} size={14} />
                  </Link>
                )
              ) : (
                <button key={a.label} type="button" onClick={() => run(a)} {...stylex.props(s.action)}>
                  <Icon name={a.icon} size={14} /> {a.label}
                </button>
              ),
            )}
          </span>
        </span>
      )}
    </span>
  );
}

const popIn = stylex.keyframes({
  from: { opacity: 0, transform: 'translateY(4px)' },
  to: { opacity: 1, transform: 'none' },
});

const s = stylex.create({
  wrap: { position: 'relative', display: 'inline' },
  chip: {
    display: 'inline',
    paddingBlock: 1,
    paddingInline: 5,
    marginInline: 1,
    fontFamily: fonts.mono,
    fontSize: '0.9em',
    fontWeight: 500,
    lineHeight: 'inherit',
    color: colors.ink,
    backgroundColor: { default: colors.selection, ':hover': colors.line2 },
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomStyle: 'dashed',
    borderBottomColor: colors.accent,
    borderRadius: 4,
    cursor: 'pointer',
    WebkitBoxDecorationBreak: 'clone',
    boxDecorationBreak: 'clone',
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
  },
  chipSkill: { color: colors.accentInk },
  chipOpen: { backgroundColor: colors.line2 },
  pop: {
    position: 'absolute',
    left: 0,
    bottom: 'calc(100% + 8px)',
    zIndex: 40,
    display: 'grid',
    gap: 6,
    width: 'max-content',
    maxWidth: 'min(300px, calc(100vw - 24px))',
    minWidth: 220,
    padding: 14,
    textAlign: 'left',
    whiteSpace: 'normal',
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 1.45,
    color: colors.ink,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: 12,
    boxShadow: '0 18px 40px -14px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.08)',
    animationName: popIn,
    animationDuration: '160ms',
    animationTimingFunction: 'ease-out',
  },
  popBelow: { bottom: 'auto', top: 'calc(100% + 8px)' },
  kicker: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.ink3 },
  title: { fontFamily: fonts.mono, fontSize: 14, fontWeight: 600, overflowWrap: 'anywhere' },
  body: { color: colors.ink2 },
  actions: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  action: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 30,
    paddingInline: 10,
    fontSize: 12,
    fontWeight: 500,
    color: colors.ink,
    backgroundColor: { default: colors.sunk, ':hover': colors.line },
    borderWidth: 0,
    borderRadius: radii.sm,
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
  },
  actionPrimary: { color: colors.bg, backgroundColor: { default: colors.ink, ':hover': colors.ink2 } },
});
