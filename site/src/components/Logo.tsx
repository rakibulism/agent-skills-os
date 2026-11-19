import * as stylex from '@stylexjs/stylex';
import { colors } from '@/styles/tokens.stylex';

/**
 * The mark: a shelf of skills, one pulled out and leaning — the one your agent picks.
 * Bands are cut through the spines with a mask, so they show the page behind in any theme.
 * `id` keeps the mask unique when the mark appears more than once on a page.
 */
export function LogoMark({ size = 24, id = 'logo' }: { size?: number; id?: string }) {
  const mask = `${id}-bands`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden focusable={false} {...stylex.props(s.mark)}>
      <defs>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
          <rect width="32" height="32" fill="#fff" />
          <rect x="2" y="12" width="6" height="1.6" fill="#000" />
          <rect x="2" y="22.5" width="6" height="1.6" fill="#000" />
          <rect x="9" y="8" width="6" height="1.6" fill="#000" />
          <rect x="16" y="22.5" width="5" height="1.6" fill="#000" />
          <rect x="25.56" y="11.5" width="5.4" height="1.6" fill="#000" transform="rotate(-15 25.56 27)" />
        </mask>
      </defs>
      <g mask={`url(#${mask})`}>
        <rect x="2" y="8" width="6" height="19" rx="1.4" />
        <rect x="9" y="4" width="6" height="23" rx="1.4" />
        <rect x="16" y="10" width="5" height="17" rx="1.4" />
        <rect x="25.56" y="8" width="5.4" height="19" rx="1.4" transform="rotate(-15 25.56 27)" {...stylex.props(s.picked)} />
      </g>
      <rect x="1" y="28.2" width="30" height="2.2" rx="1.1" />
    </svg>
  );
}

export function Logo({ size = 24, id }: { size?: number; id?: string }) {
  return (
    <span {...stylex.props(s.logo)}>
      <LogoMark size={size} id={id} />
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
    gap: 9,
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
  },
  mark: { flexShrink: 0, fill: colors.ink },
  picked: { fill: colors.accent },
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
