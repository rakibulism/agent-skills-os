import * as stylex from '@stylexjs/stylex';

/*
 * Design tokens. Warm paper + ink, one accent. Every color has a dark value
 * under prefers-color-scheme. Literal hex copies for metadata live in brand.ts.
 */
export const colors = stylex.defineVars({
  bg: { default: '#f7f6f2', '@media (prefers-color-scheme: dark)': '#111112' },
  surface: { default: '#ffffff', '@media (prefers-color-scheme: dark)': '#19191b' },
  sunk: { default: '#efede7', '@media (prefers-color-scheme: dark)': '#0c0c0d' },
  ink: { default: '#17171a', '@media (prefers-color-scheme: dark)': '#ededea' },
  /** 8.9:1 on bg (light), 9.6:1 (dark). */
  ink2: { default: '#47474d', '@media (prefers-color-scheme: dark)': '#b7b7b1' },
  /** 5.0:1 on bg (light), 5.6:1 (dark). Smallest text allowed. */
  ink3: { default: '#6b6b71', '@media (prefers-color-scheme: dark)': '#8d8d88' },
  line: { default: '#e4e2db', '@media (prefers-color-scheme: dark)': '#29292c' },
  line2: { default: '#d2cfc5', '@media (prefers-color-scheme: dark)': '#3a3a3e' },
  /** Fills and the logo tile. Not for small text. */
  accent: { default: '#e04a2a', '@media (prefers-color-scheme: dark)': '#ff6b4a' },
  /** Accent for text: 5.3:1 on bg (light), 6.4:1 (dark). */
  accentInk: { default: '#b3361a', '@media (prefers-color-scheme: dark)': '#ff8a6e' },
  shadow: {
    default: '0 1px 0 rgba(23,23,26,0.04), 0 8px 24px -12px rgba(23,23,26,0.14)',
    '@media (prefers-color-scheme: dark)': '0 1px 0 rgba(0,0,0,0.3), 0 8px 24px -12px rgba(0,0,0,0.6)',
  },
  navBg: { default: 'rgba(247,246,242,0.82)', '@media (prefers-color-scheme: dark)': 'rgba(17,17,18,0.82)' },
  selection: { default: 'rgba(224,74,42,0.2)', '@media (prefers-color-scheme: dark)': 'rgba(255,107,74,0.28)' },
});

export const fonts = stylex.defineVars({
  sans: 'var(--font-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: 'var(--font-mono), ui-monospace, "SF Mono", Menlo, Consolas, monospace',
});

export const radii = stylex.defineVars({ sm: '6px', md: '10px', pill: '999px' });

export const motion = stylex.defineVars({
  fast: '140ms',
  base: '220ms',
  ease: 'cubic-bezier(0.2, 0, 0, 1)',
});

export const layout = stylex.defineVars({
  max: '1120px',
  gutter: { default: '16px', '@media (min-width: 720px)': '32px' },
  navH: '60px',
});
