import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { highlight, type Lang } from '@/lib/highlight';
import { ui } from '@/styles/shared';
import { CopyButton } from './CopyButton';

/** A file-like code block: name bar, optional badge, copy button. Rendered at build time. */
export function CodePane({
  file, code, lang, what, badge, wrap = false,
}: {
  file: string;
  code: string;
  lang: Lang;
  what?: string;
  badge?: ReactNode;
  wrap?: boolean;
}) {
  return (
    <figure {...stylex.props(ui.pane)}>
      <figcaption {...stylex.props(ui.paneBar)}>
        <span {...stylex.props(ui.paneFile)}>{file}</span>
        {badge ?? (what ? <CopyButton text={code} what={what} size="sm" /> : null)}
      </figcaption>
      <pre {...stylex.props(ui.code, wrap && ui.codeWrap)}>
        <code>{highlight(code, lang)}</code>
      </pre>
    </figure>
  );
}
