import * as stylex from '@stylexjs/stylex';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CodePane } from '@/components/CodePane';
import { CopyButton } from '@/components/CopyButton';
import { Icon } from '@/components/Icon';
import { Install } from '@/components/Install';
import { Tabs } from '@/components/Tabs';
import { SITE } from '@/lib/site';
import { getSkill, getSkills } from '@/lib/skills';
import { usageFor } from '@/lib/snippets';
import { ui } from '@/styles/shared';
import { colors, fonts, radii } from '@/styles/tokens.stylex';

type Params = { params: Promise<{ name: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getSkills().map((sk) => ({ name: sk.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const skill = getSkill((await params).name);
  if (!skill) return {};
  return {
    title: skill.name,
    description: skill.description,
    alternates: { canonical: `/skills/${skill.slug}` },
    openGraph: { title: `${skill.name} · ${SITE.name}`, description: skill.description, url: `/skills/${skill.slug}` },
  };
}

const LG = '@media (min-width: 960px)';

export default async function SkillPage({ params }: Params) {
  const skill = getSkill((await params).name);
  if (!skill) notFound();
  const all = getSkills();
  const related = skill.related.map((r) => all.find((s) => s.slug === r || s.name === r)).filter((r) => !!r);
  const call = `forClaude("${skill.name}")`;

  return (
    <div {...stylex.props(ui.wrap, s.page)}>
      <Link href="/" {...stylex.props(s.back)}>
        <Icon name="back" size={16} /> All skills
      </Link>

      <header {...stylex.props(s.head)}>
        <div {...stylex.props(s.titleRow)}>
          <h1 {...stylex.props(s.h1)}>{skill.name}</h1>
          <span {...stylex.props(s.tag)}>{skill.category}</span>
          {skill.version && <span {...stylex.props(s.ver)}>v{skill.version}</span>}
        </div>
        <p {...stylex.props(s.lede)}>{skill.description}</p>
        <div {...stylex.props(s.actions)}>
          <a href={skill.sourceUrl} target="_blank" rel="noopener" {...stylex.props(ui.btn, ui.btnPrimary)}>
            <Icon name="github" size={18} /> View source
          </a>
          <a href={skill.editUrl} target="_blank" rel="noopener" {...stylex.props(ui.btn)}>
            <Icon name="edit" size={18} /> Suggest an edit
          </a>
          <a href={SITE.npm} target="_blank" rel="noopener" {...stylex.props(ui.btn)}>
            <Icon name="npm" size={18} /> npm
          </a>
        </div>
      </header>

      <div {...stylex.props(s.layout)}>
        <div {...stylex.props(s.main)}>
          <section aria-labelledby="use-title">
            <h2 id="use-title" {...stylex.props(s.h2)}>Use it</h2>
            <Tabs label="Framework" items={usageFor(skill.name).map(({ id, label }) => ({ id, label }))}>
              {usageFor(skill.name).map((u) => (
                <CodePane key={u.id} file={u.file} code={u.code} lang={u.lang} what="Code" />
              ))}
            </Tabs>
          </section>

          <section aria-labelledby="file-title">
            <h2 id="file-title" {...stylex.props(s.h2)}>The skill file</h2>
            <CodePane file={`skills/${skill.slug}/SKILL.md`} code={skill.raw} lang="md" what="SKILL.md" wrap />
            {skill.hasReferences && (
              <p {...stylex.props(s.note)}>
                This skill also ships a <code {...stylex.props(ui.inlineCode)}>references/</code> folder.{' '}
                <a href={`${skill.sourceUrl}/references`} target="_blank" rel="noopener" {...stylex.props(s.inlineLink)}>Browse it on GitHub</a>.
              </p>
            )}
          </section>
        </div>

        <aside aria-label="Details" {...stylex.props(s.aside)}>
          <div {...stylex.props(s.card)}>
            <p {...stylex.props(s.cardTitle)}>Install</p>
            <Install tone="quiet" full />
            <div {...stylex.props(s.callRow)}>
              <code {...stylex.props(s.call)}>{call}</code>
              <CopyButton text={call} what="Function call" size="sm" />
            </div>
          </div>

          <dl {...stylex.props(s.card, s.details)}>
            <p {...stylex.props(s.cardTitle)}>Details</p>
            <div {...stylex.props(s.dRow)}><dt {...stylex.props(s.dt)}>Category</dt><dd>{skill.category}</dd></div>
            {skill.version && <div {...stylex.props(s.dRow)}><dt {...stylex.props(s.dt)}>Version</dt><dd {...stylex.props(s.mono)}>{skill.version}</dd></div>}
            {skill.tags.length > 0 && (
              <div {...stylex.props(s.dRow)}>
                <dt {...stylex.props(s.dt)}>Tags</dt>
                <dd {...stylex.props(s.tags)}>
                  {skill.tags.map((t) => (
                    <Link key={t} href={`/?q=${encodeURIComponent(t)}`} {...stylex.props(s.tagLink)}>{t}</Link>
                  ))}
                </dd>
              </div>
            )}
            {skill.author && (
              <div {...stylex.props(s.dRow)}>
                <dt {...stylex.props(s.dt)}>Author</dt>
                <dd>
                  {skill.authorUrl
                    ? <a href={skill.authorUrl} target="_blank" rel="noopener" {...stylex.props(s.inlineLink)}>{skill.author}</a>
                    : skill.author}
                </dd>
              </div>
            )}
            <div {...stylex.props(s.dRow)}>
              <dt {...stylex.props(s.dt)}>Inputs</dt>
              <dd>
                {skill.inputs.length === 0 ? <span {...stylex.props(s.muted)}>None</span> : (
                  <ul {...stylex.props(s.inputs)}>
                    {skill.inputs.map((i) => (
                      <li key={i.name}>
                        <code {...stylex.props(s.mono)}>{i.name}</code>
                        {i.required && <span {...stylex.props(s.req)}> required</span>}
                        {i.description && <span {...stylex.props(s.muted)}> — {i.description}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          </dl>

          {related.length > 0 && (
            <div {...stylex.props(s.card)}>
              <p {...stylex.props(s.cardTitle)}>Related skills</p>
              {related.map((r) => (
                <Link key={r!.slug} href={`/skills/${r!.slug}`} {...stylex.props(s.relLink)}>
                  {r!.name} <Icon name="next" size={16} />
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

const s = stylex.create({
  page: { paddingTop: { default: 24, '@media (min-width: 720px)': 40 }, paddingBottom: { default: 64, '@media (min-width: 720px)': 96 } },
  back: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    fontWeight: 500,
    color: { default: colors.ink2, ':hover': colors.ink },
  },
  head: { display: 'grid', gap: 16, paddingTop: 24, paddingBottom: { default: 32, '@media (min-width: 720px)': 48 } },
  titleRow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 14, rowGap: 8 },
  h1: {
    fontFamily: fonts.mono,
    fontSize: 'clamp(30px, 5vw, 48px)',
    lineHeight: 1.1,
    fontWeight: 500,
    letterSpacing: '-0.03em',
    overflowWrap: 'anywhere',
  },
  tag: {
    fontSize: 13,
    paddingBlock: 2,
    paddingInline: 10,
    color: colors.ink2,
    backgroundColor: colors.sunk,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: radii.pill,
  },
  ver: { fontFamily: fonts.mono, fontSize: 13, color: colors.ink3 },
  lede: { maxWidth: '64ch', fontSize: { default: 17, '@media (min-width: 720px)': 19 }, lineHeight: 1.55, color: colors.ink2 },
  actions: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  layout: {
    display: 'grid',
    gap: 32,
    alignItems: 'start',
    gridTemplateColumns: { default: 'minmax(0, 1fr)', [LG]: 'minmax(0, 1fr) 340px' },
  },
  main: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 40, minWidth: 0 },
  h2: { fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 14 },
  note: { marginTop: 12, fontSize: 14, color: colors.ink2 },
  aside: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16, position: { default: 'static', [LG]: 'sticky' }, top: 84 },
  card: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: 12,
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: radii.md,
    boxShadow: colors.shadow,
    minWidth: 0,
  },
  cardTitle: { fontSize: 12, fontWeight: 500, color: colors.ink3, fontFamily: fonts.mono },
  callRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  call: { fontFamily: fonts.mono, fontSize: 13, overflowWrap: 'anywhere' },
  details: { gap: 0 },
  dRow: {
    display: 'grid',
    gridTemplateColumns: '84px minmax(0, 1fr)',
    gap: 12,
    paddingBlock: 10,
    fontSize: 14,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
  },
  dt: { color: colors.ink3 },
  mono: { fontFamily: fonts.mono, fontSize: 13 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tagLink: {
    fontSize: 12,
    paddingBlock: 1,
    paddingInline: 8,
    color: { default: colors.ink2, ':hover': colors.ink },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: radii.pill,
  },
  inputs: { display: 'grid', gap: 6 },
  req: { fontSize: 12, color: colors.accentInk },
  muted: { color: colors.ink3 },
  inlineLink: { textDecorationLine: 'underline', textDecorationColor: colors.line2, textUnderlineOffset: 3 },
  relLink: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: fonts.mono, fontSize: 14, paddingBlock: 6 },
});
