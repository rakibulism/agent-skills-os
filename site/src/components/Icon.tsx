import type { CSSProperties } from 'react';

/*
 * Hugeicons, named by meaning so a glyph can change without touching every screen.
 * The artwork lives in one cached sprite, /icons.svg (built from lib/icon-data.ts), and
 * each icon is a <use> of it, so pages don't repeat the path data in their HTML.
 */
export type IconName =
  | 'search' | 'copy' | 'check' | 'alert' | 'close' | 'menu' | 'next' | 'back' | 'external'
  | 'github' | 'npm' | 'fork' | 'pullRequest' | 'edit' | 'docs' | 'library' | 'file' | 'code'
  | 'terminal' | 'package' | 'add' | 'people' | 'ai' | 'aiSearch' | 'retry';

type Props = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
};

/** Keeps the visual stroke the same at any size, like Hugeicons' absoluteStrokeWidth=false. */
export function SpriteIcon({ id, size, strokeWidth, className, style }: { id: string; size: number; strokeWidth?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      color="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      style={{ flexShrink: 0, ...style }}
      aria-hidden
      focusable={false}
    >
      <use href={`/icons.svg#${id}`} />
    </svg>
  );
}

export function Icon({ name, size = 18, strokeWidth = 1.6, className, style }: Props) {
  return <SpriteIcon id={`i-${name}`} size={size} strokeWidth={strokeWidth} className={className} style={style} />;
}
