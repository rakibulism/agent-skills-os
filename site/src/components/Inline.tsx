import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ui } from '@/styles/shared';
import { colors } from '@/styles/tokens.stylex';

/** Renders the inline syntax used in lib/doc.ts: `code`, **bold** and [text](href). */
export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = m.index;
    if (m[1] != null) out.push(<code key={key} {...stylex.props(ui.inlineCode)}>{m[1]}</code>);
    else if (m[2] != null) out.push(<strong key={key} {...stylex.props(s.strong)}>{m[2]}</strong>);
    else {
      const [label, href] = [m[3], m[4]];
      out.push(
        href.startsWith('/') || href.startsWith('#') ? (
          <Link key={key} href={href} {...stylex.props(s.link)}>{label}</Link>
        ) : (
          <a key={key} href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener" {...stylex.props(s.link)}>{label}</a>
        ),
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

const s = stylex.create({
  strong: { fontWeight: 600, color: colors.ink },
  link: {
    color: colors.ink,
    textDecorationLine: 'underline',
    textDecorationColor: { default: colors.line2, ':hover': colors.accent },
    textUnderlineOffset: '0.2em',
    textDecorationThickness: 1,
  },
});
