import * as stylex from '@stylexjs/stylex';
import { colors } from '@/styles/tokens.stylex';

/** The mark: four tiles, one lit — skills slotting into a system. */
export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden focusable={false} {...stylex.props(s.mark)}>
      <rect x="2" y="2" width="12.5" height="12.5" rx="2.5" />
      <rect x="17.5" y="2" width="12.5" height="12.5" rx="2.5" {...stylex.props(s.lit)} />
      <rect x="2" y="17.5" width="12.5" height="12.5" rx="2.5" />
      <rect x="17.5" y="17.5" width="12.5" height="12.5" rx="2.5" />
    </svg>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span {...stylex.props(s.logo)}>
      <LogoMark size={size} />
      <span>
        Agent Skills <span {...stylex.props(s.os)}>OS</span>
      </span>
    </span>
  );
}

const s = stylex.create({
  logo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
  },
  mark: { flexShrink: 0, fill: colors.ink },
  lit: { fill: colors.accent },
  os: {
    marginLeft: 2,
    paddingBlock: 1,
    paddingInline: 5,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: colors.ink2,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: 4,
    verticalAlign: 1,
  },
});
