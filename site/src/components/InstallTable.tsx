import * as stylex from '@stylexjs/stylex';
import { SITE } from '@/lib/site';
import { colors, fonts, radii } from '@/styles/tokens.stylex';
import { CopyButton } from './CopyButton';
import { Icon } from './Icon';
import { Tabs } from './Tabs';

const MANAGERS = [
  { id: 'npm', label: 'npm', cmd: `npm install ${SITE.pkg}` },
  { id: 'pnpm', label: 'pnpm', cmd: `pnpm add ${SITE.pkg}` },
  { id: 'yarn', label: 'yarn', cmd: `yarn add ${SITE.pkg}` },
  { id: 'bun', label: 'bun', cmd: `bun add ${SITE.pkg}` },
];

const IMPORT = `import { forClaude } from "${SITE.pkg}"`;

/** Package-manager switch over a compact table: install, import, source. */
export function InstallTable({ initial, bare = false }: { initial?: string; bare?: boolean } = {}) {
  return (
    <div {...stylex.props(s.wrap, bare && s.bare)}>
      <Tabs label="Package manager" items={MANAGERS.map(({ id, label }) => ({ id, label }))} center={!bare} initial={initial}>
        {MANAGERS.map((m) => (
          <div key={m.id} {...stylex.props(s.table)}>
            <div {...stylex.props(s.row)}>
              <span {...stylex.props(s.label)}>Install</span>
              <code {...stylex.props(s.value)}>{m.cmd}</code>
              <CopyButton text={m.cmd} what="Install command" iconOnly />
            </div>
            <div {...stylex.props(s.row)}>
              <span {...stylex.props(s.label)}>Import</span>
              <code {...stylex.props(s.value)}>{IMPORT}</code>
              <CopyButton text={IMPORT} what="Import" iconOnly />
            </div>
            <div {...stylex.props(s.row, s.last)}>
              <span {...stylex.props(s.label)}>Source</span>
              <span {...stylex.props(s.value, s.plain)}>MIT, on GitHub and npm</span>
              <span {...stylex.props(s.links)}>
                <a href={SITE.npm} target="_blank" rel="noopener" aria-label="Package on npm" title="Package on npm" {...stylex.props(s.iconBtn)}>
                  <Icon name="npm" size={17} />
                </a>
                <a href={SITE.repo} target="_blank" rel="noopener" aria-label="Source on GitHub" title="Source on GitHub" {...stylex.props(s.iconBtn, s.iconBtnSolid)}>
                  <Icon name="github" size={17} />
                </a>
              </span>
            </div>
          </div>
        ))}
      </Tabs>
    </div>
  );
}

const s = stylex.create({
  wrap: { width: '100%', maxWidth: 680, marginInline: 'auto' },
  bare: { maxWidth: 'none' },
  table: {
    textAlign: 'left',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: 12,
    boxShadow: colors.shadow,
    overflow: 'hidden',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: { default: '64px minmax(0, 1fr) auto', '@media (min-width: 560px)': '96px minmax(0, 1fr) auto' },
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingBlock: 8,
    paddingLeft: { default: 14, '@media (min-width: 560px)': 18 },
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.line,
  },
  last: { borderBottomColor: 'transparent' },
  label: { fontSize: 14, fontWeight: 600 },
  value: {
    minWidth: 0,
    fontFamily: fonts.mono,
    fontSize: { default: 12, '@media (min-width: 560px)': 13 },
    color: colors.ink2,
    whiteSpace: 'nowrap',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },
  plain: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink3 },
  links: { display: 'flex', gap: 6 },
  iconBtn: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 34,
    height: 34,
    color: colors.ink2,
    backgroundColor: { default: 'transparent', ':hover': colors.sunk },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: radii.sm,
  },
  iconBtnSolid: {
    color: colors.bg,
    backgroundColor: { default: colors.ink, ':hover': colors.ink2 },
    borderColor: colors.ink,
  },
});
