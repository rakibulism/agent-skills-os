import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { ui } from '@/styles/shared';
import { colors, fonts } from '@/styles/tokens.stylex';

export default function NotFound() {
  return (
    <div {...stylex.props(ui.wrap, s.page)}>
      <p {...stylex.props(s.code)}>404</p>
      <h1 {...stylex.props(s.h1)}>This page isn&apos;t on the shelf.</h1>
      <p {...stylex.props(s.text)}>The link may be old, or the skill may have been renamed. Search the library instead.</p>
      <div {...stylex.props(s.actions)}>
        <Link href="/" {...stylex.props(ui.btn, ui.btnPrimary)}><Icon name="search" size={18} /> Search skills</Link>
        <Link href="/docs" {...stylex.props(ui.btn)}><Icon name="docs" size={18} /> Docs</Link>
      </div>
    </div>
  );
}

const s = stylex.create({
  page: { display: 'grid', justifyItems: 'start', gap: 14, paddingBlock: { default: 72, '@media (min-width: 720px)': 128 } },
  code: { fontFamily: fonts.mono, fontSize: 13, color: colors.accentInk },
  h1: { fontSize: 'clamp(30px, 5vw, 48px)', lineHeight: 1.1, fontWeight: 600, letterSpacing: '-0.03em' },
  text: { fontSize: 17, color: colors.ink2, maxWidth: '50ch' },
  actions: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 },
});
