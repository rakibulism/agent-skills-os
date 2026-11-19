import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/Icon';
import { Install } from '@/components/Install';
import { SkillSearch } from '@/components/SkillSearch';
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
        <div {...stylex.props(ui.wrap, s.heroInner)}>
          <p {...stylex.props(s.eyebrow)}>
            <span {...stylex.props(s.dot)} aria-hidden />
            Open-source skills library · {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
          </p>
          <h1 id="hero-title" {...stylex.props(s.h1)}>Find a skill for your agent.</h1>
          <p {...stylex.props(s.lede)}>
            Each skill is one Markdown file of carefully written instructions. Load it into Claude, OpenAI, LangChain,
            CrewAI, AutoGen, Cursor or any AGENTS.md tool with one function call.
          </p>
          <div {...stylex.props(s.search)}>
            <SkillSearch skills={skills} />
          </div>
        </div>
      </section>

      <section aria-labelledby="start-title" {...stylex.props(s.start)}>
        <div {...stylex.props(ui.wrap)}>
          <div {...stylex.props(s.installRow)}>
            <div>
              <h2 id="start-title" {...stylex.props(s.h2)}>Install once, use any skill.</h2>
              <p {...stylex.props(s.sub)}>Node 18+, MIT licensed, no dependencies.</p>
            </div>
            <Install />
          </div>

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
  hero: { paddingTop: { default: 40, [MD]: 88 }, paddingBottom: { default: 56, [MD]: 88 } },
  heroInner: { maxWidth: 'calc(880px + 64px)' },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingBlock: 4,
    paddingInline: 10,
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.ink2,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: radii.pill,
  },
  dot: { width: 6, height: 6, borderRadius: radii.pill, backgroundColor: colors.accent },
  h1: {
    fontSize: 'clamp(36px, 6.6vw, 68px)',
    lineHeight: 1.03,
    fontWeight: 600,
    letterSpacing: '-0.035em',
    textWrap: 'balance',
  },
  lede: {
    marginTop: 18,
    maxWidth: '60ch',
    fontSize: { default: 17, [MD]: 19 },
    lineHeight: 1.55,
    color: colors.ink2,
    textWrap: 'pretty',
  },
  search: { marginTop: { default: 28, [MD]: 40 } },

  start: {
    paddingBlock: { default: 56, [MD]: 88 },
    backgroundColor: colors.sunk,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
  },
  installRow: {
    display: 'grid',
    gap: 20,
    alignItems: 'center',
    justifyItems: 'start',
    gridTemplateColumns: { default: 'minmax(0, 1fr)', '@media (min-width: 880px)': 'minmax(0, 1fr) auto' },
  },
  h2: { fontSize: 'clamp(26px, 3.6vw, 36px)', lineHeight: 1.1, fontWeight: 600, letterSpacing: '-0.03em' },
  sub: { marginTop: 8, fontSize: 15, color: colors.ink3 },
  cards: {
    display: 'grid',
    gap: 12,
    marginTop: { default: 32, [MD]: 48 },
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
