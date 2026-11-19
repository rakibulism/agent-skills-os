import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/Icon';
import { HeroLibrary } from '@/components/HeroLibrary';
import { InstallTable } from '@/components/InstallTable';
import { SITE, TARGETS } from '@/lib/site';
import { getSkills, toSummary } from '@/lib/skills';
import { ui } from '@/styles/shared';
import { colors, fonts, motion, radii } from '@/styles/tokens.stylex';

const MD = '@media (min-width: 720px)';

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

const NEXT: { href: string; icon: IconName; title: string; text: string; external?: boolean }[] = [
  { href: '/docs', icon: 'docs', title: 'Read the docs', text: 'Adapters, usage for each framework, and the full API.' },
  { href: '/contribute', icon: 'fork', title: 'Contribute a skill', text: 'Fork the repo, add a folder, open a pull request.' },
  { href: SITE.repo, icon: 'github', title: 'Browse the source', text: 'Every skill is a plain Markdown file on GitHub.', external: true },
];

export default function Home() {
  const skills = getSkills().map(toSummary);

  return (
    <>
      <section aria-labelledby="hero-title" {...stylex.props(s.hero)}>
        <div {...stylex.props(ui.wrap)}>
          <HeroLibrary skills={skills}>
            <h1 id="hero-title" {...stylex.props(s.h1)}>
              Find a skill.<br />Load it into any agent.
            </h1>
            <p {...stylex.props(s.lede)}>
              An open library of agent skills, one Markdown file each. Ready for Claude, OpenAI, LangChain, CrewAI,
              AutoGen, Cursor and every AGENTS.md tool.
            </p>
          </HeroLibrary>
          <div {...stylex.props(s.install)}>
            <InstallTable />
          </div>
        </div>
      </section>

      <section aria-labelledby="start-title" {...stylex.props(s.start)}>
        <div {...stylex.props(ui.wrap)}>
          <h2 id="start-title" {...stylex.props(s.h2)}>Where to next</h2>

          <ul {...stylex.props(s.cards)}>
            {NEXT.map((c) => {
              const inner = (
                <>
                  <span {...stylex.props(s.cardIcon)}><Icon name={c.icon} size={20} /></span>
                  <span {...stylex.props(s.cardTitle)}>
                    {c.title}
                    <Icon name={c.external ? 'external' : 'next'} size={16} style={{ color: colors.ink3 }} />
                  </span>
                  <span {...stylex.props(s.cardText)}>{c.text}</span>
                </>
              );
              return (
                <li key={c.href}>
                  {c.external ? (
                    <a href={c.href} target="_blank" rel="noopener" {...stylex.props(s.card)}>{inner}</a>
                  ) : (
                    <Link href={c.href} {...stylex.props(s.card)}>{inner}</Link>
                  )}
                </li>
              );
            })}
          </ul>

          <div {...stylex.props(s.targets)}>
            <p {...stylex.props(s.targetsLabel)}>Works with</p>
            <ul {...stylex.props(s.targetsList)}>
              {TARGETS.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

const s = stylex.create({
  hero: { paddingTop: { default: 24, [MD]: 48 }, paddingBottom: { default: 56, [MD]: 96 } },
  h1: {
    fontSize: 'clamp(38px, 7vw, 76px)',
    lineHeight: 1.0,
    fontWeight: 600,
    letterSpacing: '-0.04em',
    textWrap: 'balance',
  },
  lede: {
    maxWidth: '46ch',
    fontSize: { default: 17, [MD]: 19 },
    lineHeight: 1.5,
    color: colors.ink2,
    textWrap: 'balance',
  },
  install: { marginTop: { default: 40, [MD]: 56 } },

  start: {
    paddingBlock: { default: 56, [MD]: 88 },
    backgroundColor: colors.sunk,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
  },
  h2: { fontSize: 'clamp(26px, 3.6vw, 36px)', lineHeight: 1.1, fontWeight: 600, letterSpacing: '-0.03em' },
  cards: {
    display: 'grid',
    gap: 12,
    marginTop: { default: 24, [MD]: 32 },
    gridTemplateColumns: { default: 'minmax(0, 1fr)', [MD]: 'repeat(3, minmax(0, 1fr))' },
  },
  card: {
    display: 'grid',
    alignContent: 'start',
    gap: 8,
    height: '100%',
    padding: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: { default: colors.line, ':hover': colors.line2 },
    borderRadius: radii.md,
    boxShadow: colors.shadow,
    transitionProperty: 'border-color, transform',
    transitionDuration: motion.fast,
    transform: { default: null, ':hover': 'translateY(-1px)', ':active': 'translateY(0)' },
  },
  cardIcon: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 38,
    height: 38,
    marginBottom: 6,
    color: colors.accentInk,
    backgroundColor: colors.sunk,
    borderRadius: 10,
  },
  cardTitle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 16, fontWeight: 600 },
  cardText: { fontSize: 14, lineHeight: 1.5, color: colors.ink2 },
  targets: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: { default: '1fr', [MD]: '120px 1fr' },
    marginTop: { default: 40, [MD]: 56 },
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
  },
  targetsLabel: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink3, paddingTop: 3 },
  targetsList: { display: 'flex', flexWrap: 'wrap', columnGap: 22, rowGap: 6, fontSize: 15, color: colors.ink2 },
});
