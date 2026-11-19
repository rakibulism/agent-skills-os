import * as stylex from '@stylexjs/stylex';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AdapterDemo } from '@/components/AdapterDemo';
import { CodePane } from '@/components/CodePane';
import { Icon } from '@/components/Icon';
import { Install } from '@/components/Install';
import { PageHead, Section } from '@/components/Section';
import { Tabs } from '@/components/Tabs';
import { pageMetadata } from '@/lib/doc';
import { SECTIONS } from '@/lib/site';
import { API, RULES, TEMPLATE_FILE, USAGE } from '@/lib/snippets';
import { ui } from '@/styles/shared';
import { colors, fonts, radii } from '@/styles/tokens.stylex';

export const metadata: Metadata = pageMetadata(
  '/docs',
  'Docs',
  'How universal-agent-skills turns one SKILL.md into the shape each agent runtime expects: adapters, usage for every framework, and the full API.',
);

const LG = '@media (min-width: 880px)';

export default function Docs() {
  return (
    <>
      <PageHead
        kicker="Docs"
        title="Write a skill once. Load it into any agent."
        lede="A skill is one Markdown file. The package reads it and hands each runtime exactly what it expects: a system prompt, an assistant config, a prompt template, a rule file."
      >
        <div {...stylex.props(s.headActions)}>
          <Install />
        </div>
        <nav aria-label="On this page" {...stylex.props(s.toc)}>
          {SECTIONS.map((sec) => (
            <a key={sec.id} href={`#${sec.id}`} {...stylex.props(s.tocLink)}>{sec.label}</a>
          ))}
          <Link href="/docs/api" {...stylex.props(s.tocLink)}>HTTP API</Link>
          <Link href="/docs/cli" {...stylex.props(s.tocLink)}>CLI</Link>
        </nav>
      </PageHead>

      <Section
        id="adapters"
        kicker="01 — Adapters"
        title="One file in, the right shape out."
        lede={<>Pick a target to see what its adapter returns for this example skill. Every adapter reads the same file, so there&apos;s nothing to keep in sync.</>}
      >
        <AdapterDemo />
      </Section>

      <Section
        id="usage"
        kicker="02 — Usage"
        title="Drop it into the code you already have."
        lede={<>Each adapter is one function call. Python frameworks read the same Markdown files straight from <code {...stylex.props(ui.inlineCode)}>node_modules</code>.</>}
      >
        <Tabs label="Framework" items={USAGE.map(({ id, label }) => ({ id, label }))}>
          {USAGE.map((u) => (
            <CodePane key={u.id} file={u.file} code={u.code} lang={u.lang} what="Code" />
          ))}
        </Tabs>
      </Section>

      <Section
        id="api"
        kicker="03 — API"
        title="Fourteen functions. That's the whole API."
        lede={<>Everything takes a skill name and returns plain data. Types ship in <code {...stylex.props(ui.inlineCode)}>src/index.d.ts</code>.</>}
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

      <Section
        id="write"
        kicker="04 — Write a skill"
        title="A folder and a Markdown file."
        lede={<>Put a <code {...stylex.props(ui.inlineCode)}>SKILL.md</code> in <code {...stylex.props(ui.inlineCode)}>skills/&lt;name&gt;/</code>. There&apos;s no registry and no build step. Add a <code {...stylex.props(ui.inlineCode)}>references/</code> folder for longer material the skill points to.</>}
      >
        <div {...stylex.props(s.write)}>
          <CodePane file="skills/my-skill/SKILL.md" code={TEMPLATE_FILE} lang="md" what="Template" />
          <div>
            <ol {...stylex.props(s.rules)}>
              {RULES.map(([title, text], i) => (
                <li key={title} {...stylex.props(s.rule, i === 0 && s.ruleFirst)}>
                  <span aria-hidden {...stylex.props(s.ruleNum)}>{String(i + 1).padStart(2, '0')}</span>
                  <span><strong {...stylex.props(s.ruleTitle)}>{title}</strong> {text}</span>
                </li>
              ))}
            </ol>
            <Link href="/contribute" {...stylex.props(ui.btn, ui.btnPrimary, s.contribute)}>
              <Icon name="fork" size={18} /> Contribute it to the library
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

const s = stylex.create({
  headActions: { marginTop: 12 },
  toc: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 20 },
  tocLink: {
    fontSize: 14,
    paddingBlock: 5,
    paddingInline: 12,
    color: { default: colors.ink2, ':hover': colors.ink },
    backgroundColor: { default: 'transparent', ':hover': colors.sunk },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: radii.pill,
  },
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
  contribute: { marginTop: 24 },
});
