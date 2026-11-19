import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { AdapterDemo } from '@/components/AdapterDemo';
import { CodePane } from '@/components/CodePane';
import { ArrowIcon } from '@/components/icons';
import { Install } from '@/components/Install';
import { Logo } from '@/components/Logo';
import { Nav } from '@/components/Nav';
import { Tabs } from '@/components/Tabs';
import { SITE, TARGETS } from '@/lib/site';
import { getSkills } from '@/lib/skills';
import { API, RULES, TEMPLATE_FILE, USAGE } from '@/lib/snippets';
import { ui } from '@/styles/shared';
import { colors, fonts, motion, radii } from '@/styles/tokens.stylex';

const MD = '@media (min-width: 720px)';
const LG = '@media (min-width: 880px)';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareSourceCode',
  name: SITE.pkg,
  alternateName: SITE.name,
  description: SITE.description,
  url: `${SITE.url}/`,
  codeRepository: SITE.repo,
  programmingLanguage: 'JavaScript',
  runtimePlatform: 'Node.js 18+',
  license: 'https://opensource.org/licenses/MIT',
  author: { '@type': 'Person', name: SITE.author, url: SITE.authorUrl },
};

export default function Home() {
  const skills = getSkills();

  return (
    <>
      <a href="#main" {...stylex.props(s.skip)}>Skip to content</a>
      <Nav />

      <main id="main">
        {/* Hero */}
        <section id="top" {...stylex.props(s.hero)}>
          <div {...stylex.props(ui.wrap)}>
            <p {...stylex.props(s.eyebrow)}>
              {[SITE.pkg, 'MIT', 'Node 18+', 'No dependencies'].map((t, i) => (
                <span key={t} {...stylex.props(s.chip, i === 0 && s.chipFirst)}>{t}</span>
              ))}
            </p>
            <h1 {...stylex.props(s.h1)}>
              Write a skill once.<br />Load it into any agent.
            </h1>
            <p {...stylex.props(s.lede)}>
              A skill is one Markdown file of carefully written instructions. This package turns it into exactly what
              each runtime expects: a Claude system prompt, an OpenAI assistant, a LangChain template, a Cursor rule,
              an AGENTS.md section and more.
            </p>
            <div {...stylex.props(s.actions)}>
              <Install />
              <a href="#adapters" {...stylex.props(s.textLink)}>
                See what it outputs <ArrowIcon {...stylex.props(s.down)} />
              </a>
            </div>

            <div {...stylex.props(s.targets)}>
              <p {...stylex.props(s.targetsLabel)}>Works with</p>
              <ul {...stylex.props(s.targetsList)}>
                {TARGETS.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <Section id="adapters" n="01" kicker="Adapters" title="One file in, the right shape out."
          lede={<>
          Pick a target to see what its adapter returns for this example skill. Every adapter reads the same file, so
          there&apos;s nothing to keep in sync.
          </>}
        >
          <AdapterDemo />
        </Section>

        <Section id="usage" n="02" kicker="Usage" title="Drop it into the code you already have."
          lede={<>
          Each adapter is one function call. Python frameworks read the same Markdown files straight from{' '}
          <code {...stylex.props(ui.inlineCode)}>node_modules</code>.
          </>}
        >
          <Tabs label="Framework" items={USAGE.map(({ id, label }) => ({ id, label }))}>
            {USAGE.map((u) => (
              <CodePane key={u.id} file={u.file} code={u.code} lang={u.lang} what="Code" />
            ))}
          </Tabs>
        </Section>

        <Section
          id="skills"
          n="03"
          kicker="Skills"
          title="Skills in the package"
          aside={
            <>
              Every skill lives in <code {...stylex.props(ui.inlineCode)}>skills/&lt;name&gt;/SKILL.md</code> and
              installs with the package.{' '}
              <span {...stylex.props(s.count)}>{skills.length} so far.</span>
            </>
          }
        >
          <ul {...stylex.props(s.skills)}>
            {skills.map((sk) => (
              <li key={sk.name} {...stylex.props(s.skill)}>
                <div {...stylex.props(s.skillHead)}>
                  <a href={sk.url} target="_blank" rel="noopener" {...stylex.props(s.skillName, s.skillLink)}>{sk.name}</a>
                  <span {...stylex.props(s.tag)}>{sk.category}</span>
                  {sk.version && <span {...stylex.props(s.ver)}>v{sk.version}</span>}
                </div>
                <p {...stylex.props(s.skillDesc)}>{sk.description}</p>
              </li>
            ))}
            <li {...stylex.props(s.addCard)}>
              <a href="#write" {...stylex.props(s.addLink)}>
                <span {...stylex.props(s.skillName)}>
                  Add your own <ArrowIcon {...stylex.props(s.accentIcon)} />
                </span>
                <span {...stylex.props(s.skillDesc)}>
                  Drop a folder into <code {...stylex.props(ui.inlineCode)}>skills/</code> and it loads on the next call.
                </span>
              </a>
            </li>
          </ul>
        </Section>

        <Section id="api" n="04" kicker="API" title="Fourteen functions. That's the whole API."
          lede={<>
          Everything takes a skill name and returns plain data. Types ship in{' '}
          <code {...stylex.props(ui.inlineCode)}>src/index.d.ts</code>.
          </>}
        >
          <div {...stylex.props(s.api)}>
            {([['Load', API.load], ['Adapt', API.adapt]] as const).map(([title, rows]) => (
              <div key={title}>
                <h3 {...stylex.props(s.apiTitle)}>{title}</h3>
                <dl>
                  {rows.map(([fn, ret]) => (
                    <div key={fn} {...stylex.props(s.apiRow)}>
                      <dt {...stylex.props(s.apiFn)}>{fn}</dt>
                      <dd {...stylex.props(s.apiRet)}>{ret}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </Section>

        <Section id="write" n="05" kicker="Write a skill" title="A folder and a Markdown file."
          lede={<>
          Put a <code {...stylex.props(ui.inlineCode)}>SKILL.md</code> in{' '}
          <code {...stylex.props(ui.inlineCode)}>skills/&lt;name&gt;/</code>. There&apos;s no registry and no build step.
          Add a <code {...stylex.props(ui.inlineCode)}>references/</code> folder for longer material the skill points to.
          </>}
        >
          <div {...stylex.props(s.write)}>
            <CodePane file="skills/my-skill/SKILL.md" code={TEMPLATE_FILE} lang="md" what="Template" />
            <ol {...stylex.props(s.rules)}>
              {RULES.map(([title, text], i) => (
                <li key={title} {...stylex.props(s.rule, i === 0 && s.ruleFirst)}>
                  <span aria-hidden {...stylex.props(s.ruleNum)}>{String(i + 1).padStart(2, '0')}</span>
                  <span><strong {...stylex.props(s.ruleTitle)}>{title}</strong> {text}</span>
                </li>
              ))}
            </ol>
          </div>
        </Section>
      </main>

      <footer {...stylex.props(s.footer)}>
        <div {...stylex.props(ui.wrap)}>
          <div {...stylex.props(s.cta)}>
            <h2 {...stylex.props(s.h2)}>Give your agent a skill.</h2>
            <Install tone="quiet" />
          </div>
          <div {...stylex.props(s.bar)}>
            <a href="#top" aria-label="Agent Skills OS, back to top"><Logo size={18} /></a>
            <nav aria-label="Project links" {...stylex.props(s.footLinks)}>
              <a href={SITE.repo} target="_blank" rel="noopener" {...stylex.props(s.footLink)}>GitHub</a>
              <a href={SITE.npm} target="_blank" rel="noopener" {...stylex.props(s.footLink)}>npm</a>
              <a href={SITE.issues} target="_blank" rel="noopener" {...stylex.props(s.footLink)}>Issues</a>
            </nav>
            <p {...stylex.props(s.meta)}>
              MIT License. Built by{' '}
              <a href={SITE.authorUrl} target="_blank" rel="noopener" {...stylex.props(s.metaLink)}>{SITE.author}</a>.
            </p>
          </div>
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

function Section({
  id, n, kicker, title, lede, aside, children,
}: {
  id: string;
  n: string;
  kicker: string;
  title: string;
  lede?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} {...stylex.props(s.section)}>
      <div {...stylex.props(ui.wrap)}>
        <div {...stylex.props(s.head, aside != null && s.headRow)}>
          <div {...stylex.props(s.headMain)}>
            <p {...stylex.props(s.kicker)}>{n} — {kicker}</p>
            <h2 id={`${id}-title`} {...stylex.props(s.h2)}>{title}</h2>
            {lede && <p {...stylex.props(s.sectionLede)}>{lede}</p>}
          </div>
          {aside && <p {...stylex.props(s.sectionLede)}>{aside}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

const s = stylex.create({
  skip: {
    position: 'absolute',
    left: 12,
    top: { default: -48, ':focus': 12 },
    zIndex: 100,
    paddingBlock: 8,
    paddingInline: 12,
    fontSize: 14,
    color: colors.bg,
    backgroundColor: colors.ink,
    borderRadius: radii.sm,
  },

  /* Hero */
  hero: { paddingTop: { default: 64, [MD]: 112 }, paddingBottom: { default: 56, [MD]: 88 } },
  eyebrow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 },
  chip: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.ink2,
    paddingBlock: 3,
    paddingInline: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: radii.pill,
  },
  chipFirst: { color: colors.ink },
  h1: {
    maxWidth: '18ch',
    fontSize: 'clamp(34px, 7.4vw, 80px)',
    lineHeight: 1.02,
    fontWeight: 600,
    letterSpacing: '-0.035em',
    textWrap: 'balance',
  },
  lede: {
    marginTop: 24,
    maxWidth: '58ch',
    fontSize: 'clamp(17px, 1.6vw, 19px)',
    lineHeight: 1.55,
    color: colors.ink2,
    textWrap: 'pretty',
  },
  actions: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 24, rowGap: 16, marginTop: 36 },
  textLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 2,
    fontSize: 15,
    fontWeight: 500,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: { default: colors.line2, ':hover': colors.ink },
    transitionProperty: 'border-color',
    transitionDuration: motion.fast,
  },
  down: { transform: 'rotate(90deg)' },
  targets: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: { default: '1fr', [MD]: '120px 1fr' },
    marginTop: { default: 64, [MD]: 96 },
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
  },
  targetsLabel: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink3, paddingTop: 3 },
  targetsList: { display: 'flex', flexWrap: 'wrap', columnGap: 22, rowGap: 6, fontSize: 15, color: colors.ink2 },

  /* Sections */
  section: {
    paddingTop: { default: 72, [MD]: 112 },
    paddingBottom: { default: 72, [MD]: 112 },
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
  },
  head: { display: 'grid', gap: 14, maxWidth: 720, marginBottom: { default: 32, [MD]: 48 } },
  headRow: {
    maxWidth: 'none',
    gridTemplateColumns: { default: '1fr', [LG]: '1fr minmax(0, 440px)' },
    alignItems: 'end',
    columnGap: 32,
  },
  headMain: { display: 'grid', gap: 14 },
  kicker: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink3 },
  h2: {
    fontSize: 'clamp(30px, 4.2vw, 46px)',
    lineHeight: 1.08,
    fontWeight: 600,
    letterSpacing: '-0.03em',
    textWrap: 'balance',
  },
  sectionLede: { maxWidth: '60ch', fontSize: 17, color: colors.ink2, textWrap: 'pretty' },
  count: { color: colors.ink3, fontVariantNumeric: 'tabular-nums' },

  /* Skills */
  skills: {
    display: 'grid',
    gap: 16,
    gridTemplateColumns: {
      default: 'minmax(0, 1fr)',
      [MD]: 'repeat(2, minmax(0, 1fr))',
      '@media (min-width: 1040px)': 'repeat(3, minmax(0, 1fr))',
    },
  },
  skill: {
    display: 'grid',
    alignContent: 'start',
    gap: 10,
    padding: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: radii.md,
    boxShadow: colors.shadow,
  },
  skillHead: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  skillName: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginRight: 'auto',
    fontFamily: fonts.mono,
    fontSize: 15,
    fontWeight: 500,
    color: colors.ink,
  },
  skillLink: {
    textDecorationLine: { default: 'none', ':hover': 'underline' },
    textUnderlineOffset: 3,
  },
  tag: {
    fontSize: 12,
    paddingBlock: 1,
    paddingInline: 8,
    color: colors.ink2,
    backgroundColor: colors.sunk,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: radii.pill,
  },
  ver: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink3, fontVariantNumeric: 'tabular-nums' },
  skillDesc: { fontSize: 14, lineHeight: 1.55, color: colors.ink2 },
  addCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line2,
    borderRadius: radii.md,
  },
  addLink: {
    display: 'grid',
    alignContent: 'start',
    gap: 10,
    height: '100%',
    padding: 20,
    borderRadius: radii.md,
    backgroundColor: { default: 'transparent', ':hover': colors.surface },
    transitionProperty: 'background-color',
    transitionDuration: motion.fast,
  },
  accentIcon: { color: colors.accent },

  /* API */
  api: {
    display: 'grid',
    gap: { default: 40, [LG]: 48 },
    gridTemplateColumns: { default: 'minmax(0, 1fr)', [LG]: 'minmax(0, 1fr) minmax(0, 1.4fr)' },
  },
  apiTitle: {
    paddingBottom: 12,
    fontFamily: fonts.mono,
    fontSize: 12,
    fontWeight: 500,
    color: colors.ink3,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.ink,
  },
  apiRow: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 1fr)', '@media (min-width: 560px)': 'minmax(0, 1fr) auto' },
    alignItems: 'baseline',
    columnGap: 24,
    rowGap: 2,
    paddingBlock: 12,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.line,
  },
  apiFn: { fontFamily: fonts.mono, fontSize: 14, fontWeight: 500 },
  apiRet: { fontFamily: fonts.mono, fontSize: 13, color: colors.ink3 },

  /* Write */
  write: {
    display: 'grid',
    alignItems: 'start',
    gap: { default: 40, '@media (min-width: 960px)': 56 },
    gridTemplateColumns: { default: 'minmax(0, 1fr)', '@media (min-width: 960px)': 'minmax(0, 1.2fr) minmax(0, 1fr)' },
  },
  rules: { display: 'grid' },
  rule: {
    display: 'grid',
    gridTemplateColumns: '44px 1fr',
    paddingBlock: 16,
    fontSize: 15,
    color: colors.ink2,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.line,
  },
  ruleFirst: { borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: colors.ink },
  ruleNum: { paddingTop: 2, fontFamily: fonts.mono, fontSize: 12, color: colors.accentInk, fontVariantNumeric: 'tabular-nums' },
  ruleTitle: { fontWeight: 600, color: colors.ink },

  /* Footer */
  footer: {
    paddingTop: { default: 72, [MD]: 112 },
    paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
  },
  cta: {
    display: 'grid',
    gap: 24,
    justifyItems: 'start',
    alignItems: 'center',
    gridTemplateColumns: { default: 'minmax(0, 1fr)', [LG]: 'minmax(0, 1fr) auto' },
    paddingBottom: 64,
  },
  bar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 32,
    rowGap: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
  },
  footLinks: { display: 'flex', gap: 20, fontSize: 14 },
  footLink: { color: { default: colors.ink2, ':hover': colors.ink } },
  meta: {
    marginLeft: { default: 0, '@media (min-width: 640px)': 'auto' },
    width: { default: '100%', '@media (min-width: 640px)': 'auto' },
    fontSize: 13,
    color: colors.ink3,
  },
  metaLink: {
    textDecorationLine: 'underline',
    textDecorationColor: colors.line2,
    textUnderlineOffset: 3,
    color: { default: 'inherit', ':hover': colors.ink },
  },
});
