'use client';

import * as stylex from '@stylexjs/stylex';
import { useId, useMemo, useState } from 'react';
import { ADAPTERS, ADAPTER_KEYS, type AdapterKey } from '@/lib/adapters';
import { highlight } from '@/lib/highlight';
import { EXAMPLE_SKILL, EXAMPLE_SKILL_FILE } from '@/lib/snippets';
import { ui } from '@/styles/shared';
import { colors, fonts } from '@/styles/tokens.stylex';
import { CopyButton } from './CopyButton';
import { TabList } from './Tabs';

const ITEMS = ADAPTER_KEYS.map((id) => ({ id, label: ADAPTERS[id].label }));
const SOURCE = highlight(EXAMPLE_SKILL_FILE, 'md');

export function AdapterDemo() {
  const idBase = useId().replace(/:/g, '');
  const [key, setKey] = useState<AdapterKey>('claude');
  const adapter = ADAPTERS[key];

  const { text, body } = useMemo(() => {
    const result = adapter.run(EXAMPLE_SKILL);
    if (adapter.file) {
      const content = String(result.content);
      return { text: content, body: content };
    }
    const json = JSON.stringify(result, null, 2);
    return { text: json, body: highlight(json, 'json') };
  }, [adapter]);

  const fileName = adapter.file ? (adapter.run(EXAMPLE_SKILL).filename as string | undefined) : undefined;

  return (
    <div>
      <TabList label="Adapter target" items={ITEMS} value={key} onChange={(id) => setKey(id as AdapterKey)} idBase={idBase} />

      <div {...stylex.props(s.grid)}>
        <figure {...stylex.props(ui.pane)}>
          <figcaption {...stylex.props(ui.paneBar)}>
            <span {...stylex.props(ui.paneFile)}>skills/release-notes/SKILL.md</span>
            <span {...stylex.props(ui.pill, s.badge)}>Example</span>
          </figcaption>
          <pre {...stylex.props(ui.code, ui.codeWrap)}><code>{SOURCE}</code></pre>
        </figure>

        <section
          role="tabpanel"
          id={`${idBase}-panel`}
          aria-labelledby={`${idBase}-tab-${key}`}
          {...stylex.props(ui.pane)}
        >
          <div {...stylex.props(ui.paneBar)}>
            <span {...stylex.props(ui.paneFile)}>{fileName ?? 'Returned value'}</span>
            <CopyButton text={text} what={adapter.file ? 'File contents' : 'Returned value'} size="sm" />
          </div>
          <p {...stylex.props(s.call)}>
            <code {...stylex.props(s.fn)}>
              <span aria-hidden {...stylex.props(s.arrow)}>→ </span>
              {adapter.fn}(&quot;{EXAMPLE_SKILL.name}&quot;)
            </code>
            <span {...stylex.props(s.hint)}>{adapter.hint}</span>
          </p>
          <pre key={key} {...stylex.props(ui.code, ui.codeWrap, s.out)}><code>{body}</code></pre>
        </section>
      </div>
    </div>
  );
}

const fadeIn = stylex.keyframes({
  from: { opacity: 0, transform: 'translateY(3px)' },
  to: { opacity: 1, transform: 'none' },
});

const s = stylex.create({
  grid: {
    display: 'grid',
    gap: 16,
    marginTop: 16,
    alignItems: 'start',
    gridTemplateColumns: { default: 'minmax(0, 1fr)', '@media (min-width: 960px)': 'minmax(0, 1fr) minmax(0, 1.15fr)' },
  },
  badge: { marginRight: 8 },
  call: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    columnGap: 16,
    rowGap: 4,
    paddingBlock: 14,
    paddingInline: 20,
    borderBottomWidth: 1,
    borderBottomStyle: 'dashed',
    borderBottomColor: colors.line2,
  },
  fn: { fontFamily: fonts.mono, fontSize: 13, color: colors.ink },
  arrow: { color: colors.accent },
  hint: { fontSize: 13, color: colors.ink3 },
  out: {
    minHeight: 300,
    maxHeight: 460,
    overflowY: 'auto',
    animationName: fadeIn,
    animationDuration: '200ms',
    animationTimingFunction: 'ease-out',
  },
});
