import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { ui } from '@/styles/shared';
import { colors, fonts, radii } from '@/styles/tokens.stylex';
import { CopyButton } from './CopyButton';
import { Icon } from './Icon';
import { Logo, LogoMark } from './Logo';

/*
 * The footer closes the page the way the hero opens it: with a shelf.
 * Left, a library checkout card for the package; below, the site's links stand as
 * book spines on a shelf, the npm book leaning like the one in the logo.
 */

type Tone = 'ink' | 'ink2' | 'ink3' | 'paper' | 'accent';
type Spine = { label: string; href: string; h: number; tone: Tone; external?: boolean; lean?: boolean; bands: number[] };

const SPINES: Spine[] = [
  { label: 'Skills', href: '/', h: 176, tone: 'ink', bands: [10, 86] },
  { label: 'Docs', href: '/docs', h: 204, tone: 'ink2', bands: [8] },
  { label: 'Contribute', href: '/contribute', h: 232, tone: 'paper', bands: [7, 90] },
  { label: 'GitHub', href: SITE.repo, h: 214, tone: 'ink', external: true, bands: [9] },
  { label: 'Issues', href: SITE.issues, h: 188, tone: 'ink3', external: true, bands: [88] },
  { label: 'npm', href: SITE.npm, h: 198, tone: 'accent', external: true, lean: true, bands: [10] },
];

const CARD_ROWS: { label: string; value: string; copy?: boolean }[] = [
  { label: 'Title', value: SITE.pkg },
  { label: 'Install', value: SITE.install, copy: true },
  { label: 'License', value: 'MIT, no dependencies' },
  { label: 'Due back', value: 'Never. Keep it.' },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer {...stylex.props(s.footer)}>
      <div {...stylex.props(ui.wrap, s.top)}>
        <div {...stylex.props(s.pitch)}>
          <p {...stylex.props(s.kicker)}>Checkout desk</p>
          <h2 {...stylex.props(s.title)}>Give your agent a skill.</h2>
          <p {...stylex.props(s.sub)}>Borrow any skill in the library. One install, every runtime, no return date.</p>
        </div>

        <figure {...stylex.props(s.card)} aria-label="Library card for universal-agent-skills">
          <figcaption {...stylex.props(s.cardHead)}>
            <LogoMark size={18} id="logo-card" />
            <span {...stylex.props(s.cardTitle)}><span {...stylex.props(s.cardBrand)}>Agent Skills OS · </span>Library card</span>
            <span {...stylex.props(s.cardNo)}>No. 0001</span>
          </figcaption>
          <dl {...stylex.props(s.rows)}>
            {CARD_ROWS.map((r) => (
              <div key={r.label} {...stylex.props(s.row)}>
                <dt {...stylex.props(s.rowLabel)}>{r.label}</dt>
                <dd {...stylex.props(s.rowValue, r.copy && s.rowValueCmd)}>
                  <span {...stylex.props(s.typed)}>{r.value}</span>
                  {r.copy && <CopyButton text={r.value} what="Install command" size="sm" />}
                </dd>
              </div>
            ))}
          </dl>
          <span aria-hidden {...stylex.props(s.stamp)}>
            <span {...stylex.props(s.stampTop)}>Open source</span>
            <span {...stylex.props(s.stampBig)}>MIT</span>
            <span {...stylex.props(s.stampTop)}>Approved</span>
          </span>
        </figure>
      </div>

      <nav aria-label="Footer" {...stylex.props(ui.wrap, s.shelfWrap)}>
        <ul {...stylex.props(s.shelf)}>
          {SPINES.map((b) => {
            const body = (
              <>
                {b.bands.map((top) => (
                  <span key={top} aria-hidden style={{ top: `${top}%` }} {...stylex.props(s.band)} />
                ))}
                <span {...stylex.props(s.spineLabel)}>{b.label}</span>
                {b.external && <span aria-hidden {...stylex.props(s.spineIcon)}><Icon name="external" size={14} /></span>}
              </>
            );
            const style = { height: b.h };
            const props = stylex.props(s.spine, s[b.tone], b.lean && s.lean);
            return (
              <li key={b.label} {...stylex.props(s.slot, b.lean && s.slotLean)}>
                {b.external ? (
                  <a href={b.href} target="_blank" rel="noopener" style={style} {...props}>{body}</a>
                ) : (
                  <Link href={b.href} style={style} {...props}>{body}</Link>
                )}
              </li>
            );
          })}
          <li {...stylex.props(s.nameplate)}>
            <Link href="/" aria-label="Agent Skills OS, home" {...stylex.props(s.nameplateLink)}>
              <Logo id="logo-footer" size={26} />
            </Link>
            <span {...stylex.props(s.nameplateNote)}>An open library of agent skills</span>
          </li>
        </ul>
        <span aria-hidden {...stylex.props(s.plank)} />
      </nav>

      <div {...stylex.props(ui.wrap, s.meta)}>
        <span>
          MIT License · Built by{' '}
          <a href={SITE.authorUrl} target="_blank" rel="noopener" {...stylex.props(s.metaLink)}>{SITE.author}</a>
        </span>
        <span>© {year} Agent Skills OS</span>
      </div>
    </footer>
  );
}

const MD = '@media (min-width: 720px)';
const LG = '@media (min-width: 960px)';
const spring = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

const s = stylex.create({
  footer: {
    marginTop: 'auto',
    paddingTop: { default: 64, [MD]: 112 },
    paddingBottom: 'calc(28px + env(safe-area-inset-bottom))',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
    overflow: 'hidden',
  },

  /* Pitch + library card */
  top: {
    display: 'grid',
    alignItems: 'center',
    gap: { default: 40, [LG]: 64 },
    gridTemplateColumns: { default: 'minmax(0, 1fr)', [LG]: 'minmax(0, 1fr) minmax(0, 1.05fr)' },
  },
  pitch: { display: 'grid', gap: 14 },
  kicker: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink3 },
  title: {
    fontSize: 'clamp(36px, 6vw, 64px)',
    lineHeight: 1.0,
    fontWeight: 600,
    letterSpacing: '-0.04em',
    textWrap: 'balance',
  },
  sub: { maxWidth: '36ch', fontSize: { default: 15, [MD]: 17 }, color: colors.ink2 },

  card: {
    position: 'relative',
    margin: 0,
    paddingTop: 0,
    paddingBottom: { default: 18, [MD]: 22 },
    paddingInline: { default: 18, [MD]: 24 },
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: 6,
    boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 24px 48px -24px rgba(0,0,0,0.35)',
    transform: { default: 'rotate(-1.2deg)', [MD]: 'rotate(-1.6deg)' },
    // The accent strip along the top edge, like the coloured band on a library card.
    borderTopWidth: 6,
    borderTopColor: colors.accent,
  },
  cardHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingBlock: 14,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: colors.ink2,
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.ink,
  },
  cardTitle: { whiteSpace: 'nowrap' },
  cardBrand: { display: { default: 'none', [MD]: 'inline' } },
  cardNo: { marginLeft: 'auto', whiteSpace: 'nowrap', color: colors.ink3 },
  rows: { display: 'grid' },
  row: {
    display: 'grid',
    gridTemplateColumns: { default: '72px minmax(0, 1fr)', [MD]: '92px minmax(0, 1fr)' },
    alignItems: 'center',
    columnGap: 12,
    minHeight: 46,
    borderBottomWidth: 1,
    borderBottomStyle: 'dashed',
    borderBottomColor: colors.line2,
  },
  rowLabel: { fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.ink3 },
  rowValue: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, margin: 0 },
  rowValueCmd: { justifyContent: 'space-between' },
  typed: {
    minWidth: 0,
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    scrollbarWidth: 'none',
    fontFamily: fonts.mono,
    fontSize: { default: 13, [MD]: 14 },
    color: colors.ink,
  },
  stamp: {
    position: 'absolute',
    right: { default: 14, [MD]: 22 },
    bottom: { default: -26, [MD]: -30 },
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    width: { default: 84, [MD]: 100 },
    height: { default: 84, [MD]: 100 },
    color: colors.accentInk,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.accent,
    borderRadius: '50%',
    outlineWidth: 1,
    outlineStyle: 'solid',
    outlineColor: colors.accent,
    outlineOffset: -7,
    backgroundColor: colors.bg,
    transform: 'rotate(-14deg)',
    opacity: 0.92,
    pointerEvents: 'none',
  },
  stampTop: { fontFamily: fonts.mono, fontSize: { default: 7, [MD]: 8 }, letterSpacing: '0.14em', textTransform: 'uppercase' },
  stampBig: { fontSize: { default: 22, [MD]: 26 }, fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1.05 },

  /* The bookshelf of links */
  shelfWrap: { marginTop: { default: 88, [MD]: 120 } },
  shelf: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: { default: 5, [MD]: 8 },
    paddingInline: { default: 4, [MD]: 12 },
  },
  slot: { display: 'flex' },
  slotLean: { marginLeft: { default: 30, [MD]: 46 } },
  spine: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    width: { default: 40, [MD]: 54 },
    paddingBlock: 14,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    boxShadow: 'inset 2px 0 0 rgba(255,255,255,0.16), inset -3px 0 0 rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.12)',
    transformOrigin: 'bottom left',
    transitionProperty: 'transform',
    transitionDuration: '320ms',
    transitionTimingFunction: spring,
    transform: { default: 'translateY(0)', ':hover': 'translateY(-12px)', ':focus-visible': 'translateY(-12px)' },
    outlineOffset: 4,
  },
  ink: { backgroundColor: colors.ink, color: colors.bg },
  ink2: { backgroundColor: colors.ink2, color: colors.bg },
  ink3: { backgroundColor: colors.ink3, color: colors.bg },
  paper: { backgroundColor: colors.line2, color: colors.ink },
  // Dark ink on the accent reads in both themes.
  accent: { backgroundColor: colors.accent, color: '#17171a' },
  lean: {
    transform: {
      default: 'rotate(-12deg)',
      ':hover': 'translateY(-10px) rotate(-6deg)',
      ':focus-visible': 'translateY(-10px) rotate(-6deg)',
    },
  },
  band: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: 'currentColor', opacity: 0.35 },
  spineLabel: {
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
    fontSize: { default: 13, [MD]: 15 },
    fontWeight: 600,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },
  spineIcon: { display: 'inline-flex', opacity: 0.75 },
  nameplate: {
    display: { default: 'none', [MD]: 'grid' },
    justifyItems: 'end',
    gap: 6,
    marginLeft: 'auto',
    paddingBottom: 14,
  },
  nameplateLink: { borderRadius: radii.sm, opacity: { default: 1, ':hover': 0.8 } },
  nameplateNote: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink3 },
  plank: {
    display: 'block',
    height: 14,
    marginTop: -1,
    backgroundColor: colors.ink,
    borderRadius: 4,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 22px 32px -16px rgba(0,0,0,0.45)',
  },

  /* Last line */
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    columnGap: 24,
    rowGap: 6,
    marginTop: 28,
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.ink3,
  },
  metaLink: {
    color: { default: colors.ink2, ':hover': colors.ink },
    textDecorationLine: 'underline',
    textDecorationColor: colors.line2,
    textUnderlineOffset: 3,
    borderRadius: radii.sm,
  },
});
