'use client';

import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { copyText } from '@/lib/clipboard';
import { colors, motion, radii } from '@/styles/tokens.stylex';
import { CheckIcon, CopyIcon } from './icons';

type Props = {
  text: string;
  /** What was copied, for the toast and the accessible name: "Install command". */
  what: string;
  tone?: 'plain' | 'inverse';
  size?: 'sm' | 'md';
  /** Hide the "Copy" label on phones, keeping only the icon. */
  compact?: boolean;
};

export function CopyButton({ text, what, tone = 'plain', size = 'md', compact = false }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function onCopy() {
    try {
      await copyText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
      toast.success(`${what} copied`, { id: 'copy' });
    } catch {
      toast.error("Couldn't copy. Select the text and copy it instead.", { id: 'copy' });
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy ${what.toLowerCase()}`}
      {...stylex.props(s.btn, size === 'sm' && s.sm, tone === 'inverse' ? s.inverse : s.plain)}
    >
      <span {...stylex.props(s.icons)}>
        <CopyIcon size={size === 'sm' ? 14 : 16} {...stylex.props(s.icon, copied && s.hidden)} />
        <CheckIcon size={size === 'sm' ? 14 : 16} {...stylex.props(s.icon, s.check, !copied && s.hidden)} />
      </span>
      {/* Both labels share one grid cell, so the button keeps the wider one's width. */}
      <span aria-hidden {...stylex.props(s.labels, compact && s.compactLabel)}>
        <span {...stylex.props(s.label, copied && s.labelOff)}>Copy</span>
        <span {...stylex.props(s.label, !copied && s.labelOff)}>Copied</span>
      </span>
    </button>
  );
}

const s = stylex.create({
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    minHeight: 34,
    paddingInline: 12,
    fontSize: 13,
    fontWeight: 500,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: radii.sm,
    backgroundColor: 'transparent',
    transitionProperty: 'background-color, transform',
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
    transform: { default: null, ':active': 'scale(0.97)' },
  },
  sm: { minHeight: 28, paddingInline: 10, fontSize: 12, gap: 5 },
  plain: {
    color: colors.ink2,
    borderColor: colors.line2,
    backgroundColor: { default: 'transparent', ':hover': colors.surface },
  },
  inverse: {
    color: colors.bg,
    borderColor: 'rgba(127,127,127,0.35)',
    backgroundColor: { default: 'transparent', ':hover': 'rgba(127,127,127,0.18)' },
  },
  icons: { position: 'relative', display: 'inline-grid', width: 16, height: 16, placeItems: 'center' },
  icon: {
    gridArea: '1 / 1',
    transitionProperty: 'opacity, transform',
    transitionDuration: motion.base,
    transitionTimingFunction: motion.ease,
  },
  check: { color: colors.accent },
  labels: { display: 'inline-grid', textAlign: 'left' },
  label: { gridArea: '1 / 1' },
  labelOff: { visibility: 'hidden' },
  hidden: { opacity: 0, transform: 'scale(0.6)' },
  compactLabel: {
    position: { default: null, '@media (max-width: 420px)': 'absolute' },
    width: { default: null, '@media (max-width: 420px)': 1 },
    height: { default: null, '@media (max-width: 420px)': 1 },
    overflow: { default: null, '@media (max-width: 420px)': 'hidden' },
    clipPath: { default: null, '@media (max-width: 420px)': 'inset(50%)' },
    whiteSpace: { default: null, '@media (max-width: 420px)': 'nowrap' },
  },
});
