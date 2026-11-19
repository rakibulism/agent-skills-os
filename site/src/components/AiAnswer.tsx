'use client';

import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import type { AskAnswer, AskCard } from '@/lib/ask';
import type { SkillSummary } from '@/lib/skills';
import { usageFor } from '@/lib/snippets';
import { colors, fonts, motion, radii } from '@/styles/tokens.stylex';
import { CodePane } from './CodePane';
import { Icon } from './Icon';
import { InstallTable } from './InstallTable';

export type AiState =
  | { status: 'loading'; question: string }
  | { status: 'done'; question: string; data: AskAnswer }
  | { status: 'error'; question: string; message: string };

const FRAMEWORK_TAB: Record<string, string> = {
  claude: 'claude', openai: 'openai', langchain: 'langchain', python: 'python', files: 'files',
};

function Card({ card, skills }: { card: AskCard; skills: SkillSummary[] }) {
  if (card.type === 'install') return <InstallTable initial={card.manager} bare />;

  if (card.type === 'skill') {
    const sk = skills.find((x) => x.slug === card.slug);
    if (!sk) return null;
    return (
      <Link href={`/skills/${sk.slug}`} {...stylex.props(s.skill)}>
        <span {...stylex.props(s.skillMain)}>
          <span {...stylex.props(s.skillName)}>{sk.name}</span>
          <span {...stylex.props(s.skillDesc)}>{sk.description}</span>
        </span>
        <Icon name="next" size={18} style={{ color: colors.ink3 }} />
      </Link>
    );
  }

  const sk = skills.find((x) => x.slug === card.skill);
  const snippet = sk && usageFor(sk.name).find((u) => u.id === FRAMEWORK_TAB[card.framework]);
  if (!snippet) return null;
  return <CodePane file={snippet.file} code={snippet.code} lang={snippet.lang} what="Code" />;
}

/** Splits text into words that fade in one after another, like the answer is being spoken. */
function Reveal({ text }: { text: string }) {
  const words = text.split(/(\s+)/);
  let n = 0;
  return (
    <>
      {words.map((w, i) => {
        if (/^\s+$/.test(w)) return w;
        const delay = Math.min(n++ * 22, 900);
        return <span key={i} style={{ animationDelay: `${delay}ms` }} {...stylex.props(s.word)}>{w}</span>;
      })}
    </>
  );
}

export function AiAnswer({
  state, skills, onAsk, onClose,
}: {
  state: AiState;
  skills: SkillSummary[];
  onAsk: (q: string) => void;
  onClose: () => void;
}) {
  return (
    <section aria-label="AI answer" aria-busy={state.status === 'loading'} {...stylex.props(s.panel)}>
      <header {...stylex.props(s.head)}>
        <span {...stylex.props(s.badge, state.status === 'loading' && s.badgeBusy)}><Icon name="ai" size={16} /></span>
        <span {...stylex.props(s.headText)}>
          <span {...stylex.props(s.title)}>{state.status === 'loading' ? 'Thinking…' : 'AI answer'}</span>
          <span {...stylex.props(s.question)}>{state.question}</span>
        </span>
        <button type="button" onClick={onClose} aria-label="Close AI answer" {...stylex.props(s.close)}>
          <Icon name="close" size={16} />
        </button>
      </header>

      <div aria-live="polite">
        {state.status === 'loading' && (
          <div {...stylex.props(s.loading)}>
            <span {...stylex.props(s.line, s.line1)} />
            <span {...stylex.props(s.line, s.line2)} />
            <span {...stylex.props(s.line, s.line3)} />
          </div>
        )}

        {state.status === 'error' && (
          <div {...stylex.props(s.error)}>
            <p {...stylex.props(s.errorText)}><Icon name="alert" size={16} style={{ color: colors.accent }} /> {state.message}</p>
            <button type="button" onClick={() => onAsk(state.question)} {...stylex.props(s.chip)}>
              <Icon name="retry" size={14} /> Try again
            </button>
          </div>
        )}

        {state.status === 'done' && (
          <div key={state.question} {...stylex.props(s.body)}>
            {state.data.answer && <p {...stylex.props(s.answer)}><Reveal text={state.data.answer} /></p>}
            {state.data.cards.length > 0 && (
              <div {...stylex.props(s.cards)}>
                {state.data.cards.map((c, i) => (
                  <div key={i} style={{ animationDelay: `${250 + i * 90}ms` }} {...stylex.props(s.cardIn)}>
                    <Card card={c} skills={skills} />
                  </div>
                ))}
              </div>
            )}
            {state.data.followups.length > 0 && (
              <div {...stylex.props(s.followups)}>
                {state.data.followups.map((f) => (
                  <button key={f} type="button" onClick={() => onAsk(f)} {...stylex.props(s.chip)}>
                    <Icon name="ai" size={13} /> {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <p {...stylex.props(s.note)}>AI answers can be wrong. Commands and code come straight from the package.</p>
    </section>
  );
}

const fadeUp = stylex.keyframes({
  from: { opacity: 0, transform: 'translateY(6px)' },
  to: { opacity: 1, transform: 'none' },
});
const wordIn = stylex.keyframes({
  from: { opacity: 0, filter: 'blur(4px)' },
  to: { opacity: 1, filter: 'blur(0)' },
});
const pulse = stylex.keyframes({
  '0%, 100%': { opacity: 0.45 },
  '50%': { opacity: 1 },
});
const spin = stylex.keyframes({ to: { transform: 'rotate(360deg)' } });

const s = stylex.create({
  panel: {
    marginTop: 20,
    padding: { default: 16, '@media (min-width: 720px)': 20 },
    textAlign: 'left',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: 14,
    boxShadow: colors.shadow,
    animationName: fadeUp,
    animationDuration: '220ms',
    animationTimingFunction: 'ease-out',
  },
  head: { display: 'flex', alignItems: 'center', gap: 12 },
  badge: {
    display: 'inline-grid',
    placeItems: 'center',
    flexShrink: 0,
    width: 32,
    height: 32,
    color: colors.bg,
    backgroundColor: colors.ink,
    borderRadius: 10,
  },
  badgeBusy: { animationName: spin, animationDuration: '2.4s', animationIterationCount: 'infinite', animationTimingFunction: 'linear' },
  headText: { display: 'grid', minWidth: 0, flexGrow: 1 },
  title: { fontSize: 14, fontWeight: 600 },
  question: { fontSize: 13, color: colors.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  close: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 32,
    height: 32,
    padding: 0,
    color: colors.ink2,
    backgroundColor: { default: 'transparent', ':hover': colors.sunk },
    borderWidth: 0,
    borderRadius: radii.sm,
  },
  loading: { display: 'grid', gap: 10, paddingTop: 18, paddingBottom: 6 },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.sunk,
    animationName: pulse,
    animationDuration: '1.2s',
    animationIterationCount: 'infinite',
  },
  line1: { width: '92%' },
  line2: { width: '78%', animationDelay: '150ms' },
  line3: { width: '54%', animationDelay: '300ms' },
  body: { display: 'grid', gap: 16, paddingTop: 16 },
  answer: { fontSize: 16, lineHeight: 1.6, color: colors.ink, textWrap: 'pretty' },
  word: {
    display: 'inline-block',
    animationName: wordIn,
    animationDuration: '360ms',
    animationFillMode: 'both',
    animationTimingFunction: 'ease-out',
  },
  cards: { display: 'grid', gap: 12 },
  cardIn: {
    minWidth: 0,
    animationName: fadeUp,
    animationDuration: '280ms',
    animationFillMode: 'both',
    animationTimingFunction: 'ease-out',
  },
  skill: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: { default: colors.bg, ':hover': colors.sunk },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: radii.md,
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
  },
  skillMain: { display: 'grid', gap: 2, minWidth: 0, flexGrow: 1 },
  skillName: { fontFamily: fonts.mono, fontSize: 15, fontWeight: 500 },
  skillDesc: { fontSize: 14, color: colors.ink2 },
  followups: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 34,
    paddingInline: 12,
    fontSize: 13,
    fontWeight: 500,
    textAlign: 'left',
    color: { default: colors.ink2, ':hover': colors.ink },
    backgroundColor: { default: colors.sunk, ':hover': colors.line },
    borderWidth: 0,
    borderRadius: radii.pill,
    transitionProperty: 'background-color, color',
    transitionDuration: motion.fast,
  },
  error: { display: 'grid', justifyItems: 'start', gap: 12, paddingTop: 16 },
  errorText: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: colors.ink2 },
  note: { marginTop: 16, fontSize: 12, color: colors.ink3 },
});
