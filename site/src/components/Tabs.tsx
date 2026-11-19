'use client';

import * as stylex from '@stylexjs/stylex';
import { Children, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { colors, fonts, motion, radii } from '@/styles/tokens.stylex';

type Item = { id: string; label: string };

/** Segmented tablist with roving focus: arrows, Home and End move between tabs. */
export function TabList({
  label, items, value, onChange, idBase,
}: {
  label: string;
  items: readonly Item[];
  value: string;
  onChange: (id: string) => void;
  idBase: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = items.findIndex((it) => it.id === value);
    const next =
      e.key === 'ArrowRight' ? (i + 1) % items.length
      : e.key === 'ArrowLeft' ? (i - 1 + items.length) % items.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? items.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    onChange(items[next].id);
    const el = refs.current[next];
    el?.focus();
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} {...stylex.props(s.list)}>
      {items.map((it, i) => {
        const on = it.id === value;
        return (
          <button
            key={it.id}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="tab"
            id={`${idBase}-tab-${it.id}`}
            aria-selected={on}
            aria-controls={`${idBase}-panel`}
            tabIndex={on ? 0 : -1}
            onClick={(e) => {
              onChange(it.id);
              e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }}
            {...stylex.props(s.tab, on && s.on)}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/** Tabs whose panels are server-rendered children, one per item, in order. */
export function Tabs({ label, items, children }: { label: string; items: readonly Item[]; children: ReactNode }) {
  const idBase = useId().replace(/:/g, '');
  const [value, setValue] = useState(items[0].id);
  const panels = Children.toArray(children);
  const active = Math.max(0, items.findIndex((it) => it.id === value));
  return (
    <div>
      <TabList label={label} items={items} value={value} onChange={setValue} idBase={idBase} />
      <div role="tabpanel" id={`${idBase}-panel`} aria-labelledby={`${idBase}-tab-${value}`} {...stylex.props(s.panel)}>
        {panels.map((p, i) => (
          <div key={i} hidden={i !== active}>{p}</div>
        ))}
      </div>
    </div>
  );
}

const s = stylex.create({
  list: {
    display: 'flex',
    gap: 2,
    width: 'max-content',
    maxWidth: '100%',
    padding: 4,
    overflowX: 'auto',
    scrollbarWidth: 'none',
    backgroundColor: colors.sunk,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: radii.md,
  },
  tab: {
    flexShrink: 0,
    minHeight: 36,
    paddingInline: 14,
    fontFamily: fonts.sans,
    fontSize: 14,
    whiteSpace: 'nowrap',
    color: { default: colors.ink2, ':hover': colors.ink },
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: radii.sm,
    transitionProperty: 'color, background-color, border-color, box-shadow',
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  on: {
    color: colors.ink,
    fontWeight: 500,
    backgroundColor: colors.surface,
    borderColor: colors.line2,
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  },
  panel: { marginTop: 16 },
});
