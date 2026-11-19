import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { ui } from '@/styles/shared';
import { colors, fonts } from '@/styles/tokens.stylex';

const MD = '@media (min-width: 720px)';

/** A titled page section. `kicker` is the small mono label above the title. */
export function Section({
  id, kicker, title, lede, aside, children, first = false,
}: {
  id: string;
  kicker?: string;
  title: string;
  lede?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} {...stylex.props(s.section, first && s.first)}>
      <div {...stylex.props(ui.wrap)}>
        <div {...stylex.props(s.head, aside != null && s.headRow)}>
          <div {...stylex.props(s.headMain)}>
            {kicker && <p {...stylex.props(s.kicker)}>{kicker}</p>}
            <h2 id={`${id}-title`} {...stylex.props(s.h2)}>{title}</h2>
            {lede && <p {...stylex.props(s.lede)}>{lede}</p>}
          </div>
          {aside && <div {...stylex.props(s.lede)}>{aside}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Title block at the top of an inner page. */
export function PageHead({ kicker, title, lede, children }: { kicker: string; title: string; lede: ReactNode; children?: ReactNode }) {
  return (
    <div {...stylex.props(ui.wrap, s.pageHead)}>
      <p {...stylex.props(s.kicker)}>{kicker}</p>
      <h1 {...stylex.props(s.h1)}>{title}</h1>
      <p {...stylex.props(s.pageLede)}>{lede}</p>
      {children}
    </div>
  );
}

const s = stylex.create({
  section: {
    paddingBlock: { default: 64, [MD]: 96 },
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
  },
  first: { borderTopColor: 'transparent', paddingTop: { default: 24, [MD]: 32 } },
  head: { display: 'grid', gap: 14, maxWidth: 720, marginBottom: { default: 28, [MD]: 40 } },
  headRow: {
    maxWidth: 'none',
    gridTemplateColumns: { default: '1fr', '@media (min-width: 880px)': '1fr minmax(0, 440px)' },
    alignItems: 'end',
    columnGap: 32,
  },
  headMain: { display: 'grid', gap: 12 },
  kicker: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink3 },
  h2: { fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.08, fontWeight: 600, letterSpacing: '-0.03em', textWrap: 'balance' },
  lede: { maxWidth: '60ch', fontSize: 17, color: colors.ink2, textWrap: 'pretty' },
  pageHead: {
    display: 'grid',
    gap: 16,
    paddingTop: { default: 48, [MD]: 80 },
    paddingBottom: { default: 40, [MD]: 56 },
  },
  h1: { maxWidth: '20ch', fontSize: 'clamp(34px, 6vw, 64px)', lineHeight: 1.04, fontWeight: 600, letterSpacing: '-0.035em', textWrap: 'balance' },
  pageLede: { maxWidth: '60ch', fontSize: 'clamp(17px, 1.6vw, 19px)', lineHeight: 1.55, color: colors.ink2, textWrap: 'pretty' },
});
