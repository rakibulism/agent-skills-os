import * as stylex from '@stylexjs/stylex';
import { SITE } from '@/lib/site';
import { colors, fonts, radii } from '@/styles/tokens.stylex';
import { CopyButton } from './CopyButton';

export function Install({ tone = 'solid', full = false }: { tone?: 'solid' | 'quiet'; full?: boolean }) {
  return (
    <div {...stylex.props(s.box, tone === 'solid' ? s.solid : s.quiet, full && s.full)}>
      <code {...stylex.props(s.cmd)}>
        <span aria-hidden {...stylex.props(s.prompt)}>$</span>
        {SITE.install}
      </code>
      <CopyButton text={SITE.install} what="Install command" tone={tone === 'solid' ? 'inverse' : 'plain'} compact />
    </div>
  );
}

const s = stylex.create({
  box: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
    paddingBlock: 6,
    paddingRight: 6,
    paddingLeft: { default: 16, '@media (max-width: 420px)': 12 },
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  solid: { backgroundColor: colors.ink, color: colors.bg, borderColor: colors.ink, boxShadow: colors.shadow },
  quiet: { backgroundColor: colors.surface, color: colors.ink, borderColor: colors.line2 },
  full: { display: 'flex', width: '100%' },
  cmd: {
    flexGrow: 1,
    minWidth: 0,
    paddingBlock: 6,
    fontFamily: fonts.mono,
    fontSize: { default: 14, '@media (max-width: 420px)': 12.5 },
    whiteSpace: 'nowrap',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },
  prompt: { opacity: 0.5, marginRight: { default: 8, '@media (max-width: 420px)': 5 }, userSelect: 'none' },
});
