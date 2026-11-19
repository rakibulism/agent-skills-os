import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import { PAGES, SITE } from '@/lib/site';
import { ui } from '@/styles/shared';
import { colors, motion, radii } from '@/styles/tokens.stylex';
import { Icon, type IconName } from './Icon';
import { Install } from './Install';
import { Logo } from './Logo';

const SOURCES: { href: string; label: string; icon: IconName }[] = [
  { href: SITE.repo, label: 'GitHub', icon: 'github' },
  { href: SITE.npm, label: 'npm', icon: 'npm' },
  { href: SITE.issues, label: 'Issues', icon: 'alert' },
];

export function SiteFooter() {
  return (
    <footer {...stylex.props(s.footer)}>
      <div {...stylex.props(ui.wrap)}>
        <div {...stylex.props(s.cta)}>
          <h2 {...stylex.props(s.title)}>Give your agent a skill.</h2>
          <Install tone="quiet" />
        </div>

        <div {...stylex.props(s.grid)}>
          <div {...stylex.props(s.about)}>
            <Link href="/" aria-label="Agent Skills OS, home"><Logo id="logo-footer" size={22} /></Link>
            <p {...stylex.props(s.blurb)}>An open library of agent skills. One Markdown file per skill, loaded into any agent runtime.</p>
          </div>
          <nav aria-label="Site" {...stylex.props(s.col)}>
            <p {...stylex.props(s.colTitle)}>Site</p>
            {PAGES.map((p) => (
              <Link key={p.href} href={p.href} {...stylex.props(s.link)}>{p.label}</Link>
            ))}
          </nav>
          <nav aria-label="Sources" {...stylex.props(s.col)}>
            <p {...stylex.props(s.colTitle)}>Sources</p>
            {SOURCES.map((src) => (
              <a key={src.href} href={src.href} target="_blank" rel="noopener" {...stylex.props(s.link)}>
                <Icon name={src.icon} size={16} /> {src.label}
              </a>
            ))}
          </nav>
        </div>

        <p {...stylex.props(s.meta)}>
          MIT License. Built by{' '}
          <a href={SITE.authorUrl} target="_blank" rel="noopener" {...stylex.props(s.metaLink)}>{SITE.author}</a>.
        </p>
      </div>
    </footer>
  );
}

const MD = '@media (min-width: 720px)';

const s = stylex.create({
  footer: {
    marginTop: 'auto',
    paddingTop: { default: 64, [MD]: 96 },
    paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
  },
  cta: {
    display: 'grid',
    gap: 20,
    justifyItems: 'start',
    alignItems: 'center',
    gridTemplateColumns: { default: 'minmax(0, 1fr)', '@media (min-width: 880px)': 'minmax(0, 1fr) auto' },
    paddingBottom: { default: 48, [MD]: 64 },
  },
  title: { fontSize: 'clamp(26px, 3.6vw, 38px)', lineHeight: 1.1, fontWeight: 600, letterSpacing: '-0.03em' },
  grid: {
    display: 'grid',
    gap: 32,
    gridTemplateColumns: { default: '1fr 1fr', [MD]: '2fr 1fr 1fr' },
    paddingBlock: 32,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
  },
  about: { display: 'grid', alignContent: 'start', gap: 12, gridColumn: { default: '1 / -1', [MD]: 'auto' } },
  blurb: { maxWidth: '36ch', fontSize: 14, color: colors.ink3 },
  col: { display: 'grid', alignContent: 'start', gap: 10 },
  colTitle: { fontSize: 12, fontWeight: 500, color: colors.ink3, marginBottom: 2 },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    width: 'fit-content',
    fontSize: 14,
    borderRadius: radii.sm,
    color: { default: colors.ink2, ':hover': colors.ink },
    transitionProperty: 'color',
    transitionDuration: motion.fast,
  },
  meta: { fontSize: 13, color: colors.ink3, paddingTop: 20, borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: colors.line },
  metaLink: {
    textDecorationLine: 'underline',
    textDecorationColor: colors.line2,
    textUnderlineOffset: 3,
    color: { default: 'inherit', ':hover': colors.ink },
  },
});
