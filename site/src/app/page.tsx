import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { HeroLibrary } from '@/components/HeroLibrary';
import { InstallTable } from '@/components/InstallTable';
import { SITE, TARGETS } from '@/lib/site';
import { getSkills, toSummary } from '@/lib/skills';
import { ui } from '@/styles/shared';
import { colors, fonts, motion, radii } from '@/styles/tokens.stylex';

const MD = '@media (min-width: 720px)';
const LG = '@media (min-width: 960px)';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: `${SITE.url}/`,
  description: SITE.description,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE.url}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

const NEXT: { href: string; title: string; text: string; external?: boolean }[] = [
  { href: '/docs', title: 'Docs', text: 'Adapters, usage for every framework, and the full API.' },
  { href: '/contribute', title: 'Contribute', text: 'Add a skill with one Markdown file and a pull request.' },
  { href: SITE.repo, title: 'Source', text: 'Every SKILL.md, the loader and the issues, on GitHub.', external: true },
  { href: SITE.npm, title: 'npm', text: `${SITE.pkg}, MIT, no dependencies.`, external: true },
];

export default function Home() {
  const skills = getSkills().map(toSummary);

  return (
    <>
      <section aria-labelledby="hero-title" {...stylex.props(s.hero)}>
        <div {...stylex.props(ui.wrap)}>
          <HeroLibrary skills={skills}>
            <h1 id="hero-title" {...stylex.props(s.h1)}>Universal agent skills</h1>
            <p {...stylex.props(s.lede)}>
              An open library of agent skills, one Markdown file each.{' '}
              {/* The framework list only fits two lines on wider screens. */}
              <span {...stylex.props(s.ledeMore)}>Ready for Claude, OpenAI, LangChain, CrewAI, AutoGen, Cursor and every AGENTS.md tool.</span>
            </p>
          </HeroLibrary>
          <div {...stylex.props(s.install)}>
            <InstallTable />
          </div>
        </div>
      </section>

      <section aria-labelledby="next-title" {...stylex.props(s.next)}>
        <div {...stylex.props(ui.wrap, s.nextGrid)}>
          <div {...stylex.props(s.nextHead)}>
            <p {...stylex.props(s.kicker)}>Next</p>
            <h2 id="next-title" {...stylex.props(s.h2)}>Keep going</h2>
            <p {...stylex.props(s.nextNote)}>Everything here is open source and MIT licensed.</p>
          </div>

          <ol {...stylex.props(s.index)}>
            {NEXT.map((n, i) => {
              const inner = (
                <>
                  <span {...stylex.props(s.num)}>{String(i + 1).padStart(2, '0')}</span>
                  <span {...stylex.props(s.rowText)}>
                    <span {...stylex.props(s.rowTitle)}>{n.title}</span>
                    <span {...stylex.props(s.rowDesc)}>{n.text}</span>
                  </span>
                  <span {...stylex.props(s.arrow)}><Icon name={n.external ? 'external' : 'next'} size={22} /></span>
                </>
              );
              return (
                <li key={n.href} {...stylex.props(s.item)}>
                  {n.external ? (
                    <a href={n.href} target="_blank" rel="noopener" {...stylex.props(s.row)}>{inner}</a>
                  ) : (
                    <Link href={n.href} {...stylex.props(s.row)}>{inner}</Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div {...stylex.props(ui.wrap, s.works)}>
          <p {...stylex.props(s.kicker)}>Works with</p>
          <ul {...stylex.props(s.worksGrid)}>
            {TARGETS.map((t) => <li key={t} {...stylex.props(s.worksCell)}>{t}</li>)}
          </ul>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

const s = stylex.create({
  hero: { paddingTop: { default: 24, [MD]: 48 }, paddingBottom: { default: 56, [MD]: 96 } },
  h1: {
    // Scales with the viewport so it stays on one line down to a 320px phone.
    fontSize: 'clamp(26px, 9.4vw, 76px)',
    lineHeight: 1.0,
    fontWeight: 600,
    letterSpacing: '-0.04em',
    whiteSpace: 'nowrap',
  },
  lede: {
    maxWidth: 620,
    fontSize: { default: 15, [MD]: 16 },
    lineHeight: 1.55,
    color: colors.ink2,
    textWrap: 'balance',
  },
  ledeMore: { display: { default: 'none', '@media (min-width: 600px)': 'inline' } },

  install: { marginTop: { default: 40, [MD]: 56 } },

  next: {
    paddingTop: { default: 56, [MD]: 96 },
    paddingBottom: { default: 56, [MD]: 88 },
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
  },
  nextGrid: {
    display: 'grid',
    alignItems: 'start',
    gap: { default: 28, [LG]: 64 },
    gridTemplateColumns: { default: 'minmax(0, 1fr)', [LG]: 'minmax(0, 0.8fr) minmax(0, 1.6fr)' },
  },
  nextHead: { display: 'grid', gap: 12, position: { default: 'static', [LG]: 'sticky' }, top: 96 },
  kicker: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink3 },
  h2: { fontSize: 'clamp(30px, 4vw, 44px)', lineHeight: 1.05, fontWeight: 600, letterSpacing: '-0.035em' },
  nextNote: { maxWidth: '30ch', fontSize: 15, color: colors.ink2 },
  index: { display: 'grid' },
  item: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
    borderBottomWidth: { default: 0, ':last-child': 1 },
    borderBottomStyle: 'solid',
    borderBottomColor: colors.line,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: { default: '36px minmax(0, 1fr) auto', [MD]: '56px minmax(0, 1fr) auto' },
    alignItems: 'center',
    columnGap: 16,
    paddingBlock: { default: 20, [MD]: 26 },
    color: colors.ink,
  },
  num: { alignSelf: 'start', paddingTop: { default: 6, [MD]: 10 }, fontFamily: fonts.mono, fontSize: 12, color: colors.ink3, fontVariantNumeric: 'tabular-nums' },
  rowText: { display: 'grid', gap: 4, minWidth: 0 },
  rowTitle: {
    fontSize: { default: 24, [MD]: 32 },
    lineHeight: 1.1,
    fontWeight: 600,
    letterSpacing: '-0.03em',
    transitionProperty: 'color, transform',
    transitionDuration: motion.base,
    transitionTimingFunction: motion.ease,
    color: { default: colors.ink, ':is(a:hover *)': colors.accentInk },
    transform: { default: 'none', ':is(a:hover *)': 'translateX(6px)' },
  },
  rowDesc: { fontSize: { default: 14, [MD]: 15 }, color: colors.ink2 },
  arrow: {
    display: 'inline-flex',
    color: { default: colors.ink3, ':is(a:hover *)': colors.accentInk },
    transitionProperty: 'color, transform',
    transitionDuration: motion.base,
    transitionTimingFunction: motion.ease,
    transform: { default: 'none', ':is(a:hover *)': 'translateX(4px)' },
  },
  works: { display: 'grid', gap: 16, marginTop: { default: 56, [MD]: 88 } },
  worksGrid: {
    display: 'grid',
    gridTemplateColumns: { default: 'repeat(3, minmax(0, 1fr))', [MD]: 'repeat(4, minmax(0, 1fr))', [LG]: 'repeat(6, minmax(0, 1fr))' },
    // 1px gaps over a line-coloured background draw the grid's hairlines.
    gap: 1,
    backgroundColor: colors.line,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  worksCell: {
    display: 'grid',
    placeItems: 'center',
    minHeight: { default: 64, [MD]: 76 },
    paddingInline: 8,
    textAlign: 'center',
    fontSize: { default: 13, [MD]: 14 },
    color: colors.ink2,
    backgroundColor: colors.bg,
  },
});
