import * as stylex from '@stylexjs/stylex';
import { CodePane } from '@/components/CodePane';
import { Inline } from '@/components/Inline';
import { PageHead, Section } from '@/components/Section';
import type { Block, Doc } from '@/lib/doc';
import { colors, fonts, radii } from '@/styles/tokens.stylex';

const MD = '@media (min-width: 720px)';

function BlockView({ b }: { b: Block }) {
  if ('p' in b) return <p {...stylex.props(s.p)}><Inline text={b.p} /></p>;
  if ('h3' in b) return <h3 {...stylex.props(s.h3)}>{b.h3}</h3>;
  if ('list' in b) {
    const items = b.list.map((item) => <li key={item} {...stylex.props(s.li)}><Inline text={item} /></li>);
    return b.ordered ? <ol {...stylex.props(s.list, s.ol)}>{items}</ol> : <ul {...stylex.props(s.list, s.ul)}>{items}</ul>;
  }
  if ('code' in b) return <div {...stylex.props(s.code)}><CodePane file={b.file} code={b.code} lang={b.lang} what="Code" /></div>;
  return (
    <div {...stylex.props(s.tableWrap)}>
      <table {...stylex.props(s.table)}>
        <thead>
          <tr>{b.table.head.map((h) => <th key={h} scope="col" {...stylex.props(s.th)}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {b.table.rows.map((row) => (
            <tr key={row.join('|')}>{row.map((c, i) => <td key={i} {...stylex.props(s.td)}><Inline text={c} /></td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** An inner page built from a Doc (lib/doc.ts); its Markdown twin comes from the same data. */
export function DocPage({ doc }: { doc: Doc }) {
  return (
    <>
      <PageHead kicker={doc.kicker} title={doc.title} lede={<Inline text={doc.lede} />}>
        {doc.note && <p {...stylex.props(s.note)}>{doc.note}</p>}
      </PageHead>
      {doc.sections.map((sec, i) => (
        <Section key={sec.id} id={sec.id} kicker={sec.kicker} title={sec.title} lede={sec.lede && <Inline text={sec.lede} />} first={i === 0}>
          <div {...stylex.props(s.prose)}>
            {sec.blocks.map((b, j) => <BlockView key={j} b={b} />)}
          </div>
        </Section>
      ))}
    </>
  );
}

const s = stylex.create({
  note: { marginTop: 16, fontFamily: fonts.mono, fontSize: 12, color: colors.ink3 },
  prose: { display: 'grid', gap: 18, maxWidth: 760 },
  p: { fontSize: { default: 16, [MD]: 17 }, lineHeight: 1.65, color: colors.ink2 },
  h3: { marginTop: 10, fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', color: colors.ink },
  list: { display: 'grid', gap: 8, paddingLeft: 22, fontSize: { default: 16, [MD]: 17 }, lineHeight: 1.6, color: colors.ink2 },
  ul: { listStyleType: 'disc' },
  ol: { listStyleType: 'decimal' },
  li: { paddingLeft: 4 },
  code: { minWidth: 0 },
  tableWrap: {
    overflowX: 'auto',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: radii.md,
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14, lineHeight: 1.5 },
  th: {
    paddingBlock: 10,
    paddingInline: 14,
    textAlign: 'left',
    fontFamily: fonts.mono,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: colors.ink3,
    backgroundColor: colors.sunk,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.line2,
  },
  td: {
    paddingBlock: 10,
    paddingInline: 14,
    verticalAlign: 'top',
    color: colors.ink2,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.line,
  },
});
