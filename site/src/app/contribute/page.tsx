import * as stylex from '@stylexjs/stylex';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/Breadcrumbs';
import { CodePane } from '@/components/CodePane';
import { Icon } from '@/components/Icon';
import { PageHead, Section } from '@/components/Section';
import { getContributors } from '@/lib/contributors';
import { SITE } from '@/lib/site';
import { Inline } from '@/components/Inline';
import { ACCEPT, STEPS } from '@/content/contribute';
import { pageMetadata } from '@/lib/doc';
import { RULES } from '@/lib/snippets';
import { ui } from '@/styles/shared';
import { colors, fonts, radii } from '@/styles/tokens.stylex';

export const metadata: Metadata = pageMetadata(
  '/contribute',
  'Contribute',
  'Add a skill to the library: fork the repo, write one SKILL.md, check it loads, and open a pull request.',
);

export default async function Contribute() {
  const contributors = await getContributors();

  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: 'Contribute', path: '/contribute' }]} />
      <PageHead
        kicker="Contribute"
        title="Add a skill to the library."
        lede="Every skill here is one Markdown file someone wrote and shared. Fork the repo, add yours, and open a pull request. Fixes to existing skills and to the loader are just as welcome."
      >
        <div {...stylex.props(s.actions)}>
          <a href={SITE.fork} target="_blank" rel="noopener" {...stylex.props(ui.btn, ui.btnPrimary)}>
            <Icon name="fork" size={18} /> Fork on GitHub
          </a>
          <a href={SITE.issues} target="_blank" rel="noopener" {...stylex.props(ui.btn)}>
            <Icon name="github" size={18} /> Open issues
          </a>
          <a href={SITE.contributing} target="_blank" rel="noopener" {...stylex.props(ui.btn)}>
            <Icon name="docs" size={18} /> CONTRIBUTING.md
          </a>
        </div>
      </PageHead>

      <Section id="steps" kicker="How to" title="Four steps, about ten minutes." first>
        <ol {...stylex.props(s.steps)}>
          {STEPS.map((step, i) => (
            <li key={step.title} {...stylex.props(s.step)}>
              <div {...stylex.props(s.stepText)}>
                <span {...stylex.props(s.stepIcon)}><Icon name={step.icon} size={20} /></span>
                <p {...stylex.props(s.stepNum)}>Step {i + 1}</p>
                <h3 {...stylex.props(s.stepTitle)}>{step.title}</h3>
                <p {...stylex.props(s.stepBody)}><Inline text={step.text} /></p>
              </div>
              <CodePane file={step.file} code={step.code} lang={step.lang} what={step.what} />
            </li>
          ))}
        </ol>
      </Section>

      <Section id="guidelines" kicker="Guidelines" title="What makes a skill worth adding">
        <div {...stylex.props(s.guides)}>
          <div>
            <h3 {...stylex.props(s.listTitle)}>How to write it</h3>
            <ol {...stylex.props(s.rules)}>
              {RULES.map(([title, text], i) => (
                <li key={title} {...stylex.props(s.rule)}>
                  <span aria-hidden {...stylex.props(s.ruleNum)}>{String(i + 1).padStart(2, '0')}</span>
                  <span><strong {...stylex.props(s.strong)}>{title}</strong> {text}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 {...stylex.props(s.listTitle)}>What gets merged</h3>
            <ul {...stylex.props(s.rules)}>
              {ACCEPT.map((a) => (
                <li key={a} {...stylex.props(s.rule)}>
                  <span aria-hidden {...stylex.props(s.check)}><Icon name="check" size={16} strokeWidth={2} /></span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section
        id="contributors"
        kicker="Contributors"
        title="The people behind the library"
        lede={contributors.length ? 'Everyone who has landed a change in the repository. Your avatar shows up here after your first merged pull request.' : 'Your avatar shows up here after your first merged pull request.'}
      >
        {contributors.length > 0 ? (
          <ul {...stylex.props(s.people)}>
            {contributors.map((c) => (
              <li key={c.login}>
                <a href={c.url} target="_blank" rel="noopener" {...stylex.props(s.person)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.avatar} alt="" width={40} height={40} loading="lazy" decoding="async" {...stylex.props(s.avatar)} />
                  <span {...stylex.props(s.personText)}>
                    <span {...stylex.props(s.login)}>{c.login}</span>
                    <span {...stylex.props(s.commits)}>{c.contributions} {c.contributions === 1 ? 'commit' : 'commits'}</span>
                  </span>
                </a>
              </li>
            ))}
            <li>
              <Link href="#steps" {...stylex.props(s.person, s.you)}>
                <span {...stylex.props(s.youIcon)}><Icon name="add" size={20} /></span>
                <span {...stylex.props(s.personText)}>
                  <span {...stylex.props(s.login)}>You?</span>
                  <span {...stylex.props(s.commits)}>Add a skill</span>
                </span>
              </Link>
            </li>
          </ul>
        ) : (
          <a href={`${SITE.repo}/graphs/contributors`} target="_blank" rel="noopener" {...stylex.props(ui.btn)}>
            <Icon name="people" size={18} /> See contributors on GitHub
          </a>
        )}
      </Section>
    </>
  );
}

const LG = '@media (min-width: 960px)';

const s = stylex.create({
  actions: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  steps: { display: 'grid', gap: { default: 40, [LG]: 56 } },
  step: {
    display: 'grid',
    gap: { default: 16, [LG]: 48 },
    alignItems: 'start',
    gridTemplateColumns: { default: 'minmax(0, 1fr)', [LG]: 'minmax(0, 0.8fr) minmax(0, 1.2fr)' },
  },
  stepText: { display: 'grid', gap: 8, alignContent: 'start' },
  stepIcon: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 40,
    height: 40,
    marginBottom: 6,
    color: colors.accentInk,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: 10,
  },
  stepNum: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink3 },
  stepTitle: { fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' },
  stepBody: { fontSize: 16, color: colors.ink2, maxWidth: '46ch' },
  guides: {
    display: 'grid',
    gap: 40,
    gridTemplateColumns: { default: 'minmax(0, 1fr)', [LG]: 'repeat(2, minmax(0, 1fr))' },
  },
  listTitle: {
    paddingBottom: 12,
    fontFamily: fonts.mono,
    fontSize: 12,
    fontWeight: 500,
    color: colors.ink3,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.ink,
  },
  rules: { display: 'grid' },
  rule: {
    display: 'grid',
    gridTemplateColumns: '40px 1fr',
    paddingBlock: 14,
    fontSize: 15,
    color: colors.ink2,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.line,
  },
  ruleNum: { paddingTop: 2, fontFamily: fonts.mono, fontSize: 12, color: colors.accentInk },
  check: { paddingTop: 3, color: colors.accent, display: 'inline-flex' },
  strong: { fontWeight: 600, color: colors.ink },
  people: {
    display: 'grid',
    gap: 10,
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  },
  person: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: { default: colors.surface, ':hover': colors.sunk },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: radii.md,
  },
  avatar: { width: 40, height: 40, borderRadius: radii.pill, backgroundColor: colors.sunk, flexShrink: 0 },
  personText: { display: 'grid', minWidth: 0 },
  login: { fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  commits: { fontSize: 13, color: colors.ink3 },
  you: { borderStyle: 'dashed', borderColor: colors.line2, backgroundColor: { default: 'transparent', ':hover': colors.surface } },
  youIcon: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 40,
    height: 40,
    color: colors.accent,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line2,
    borderRadius: radii.pill,
    flexShrink: 0,
  },
});
