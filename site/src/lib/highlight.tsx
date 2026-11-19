import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { colors } from '@/styles/tokens.stylex';

/*
 * A deliberately tiny highlighter: a handful of token kinds, two-tone palette.
 * Runs at build time for static blocks and in the browser for the demo.
 */
export type Lang = 'js' | 'py' | 'sh' | 'md' | 'json' | 'text';
type Kind = 'k' | 's' | 'c' | 'n' | 'p' | 'key' | 'h';

const RULES: Partial<Record<Lang, RegExp>> = {
  js: /(?<c>\/\/.*$)|(?<s>"(?:\\.|[^"\\])*")|\b(?<k>import|from|const|let|new|await|export|return|async|function)\b|\b(?<n>\d+)\b/gm,
  py: /(?<c>#.*$)|(?<s>"(?:\\.|[^"\\])*")|\b(?<k>import|from|for|in|def|return)\b/gm,
  sh: /(?<c>#.*$)/gm,
  json: /(?<key>"(?:\\.|[^"\\])*"(?=\s*:))|(?<s>"(?:\\.|[^"\\])*")|\b(?<k>true|false|null)\b|\b(?<n>\d+(?:\.\d+)?)\b/g,
};

function tokenize(code: string, re: RegExp): [Kind | null, string][] {
  const out: [Kind | null, string][] = [];
  let last = 0;
  for (const m of code.matchAll(re)) {
    const kind = (Object.entries(m.groups ?? {}).find(([, v]) => v !== undefined)?.[0] ?? null) as Kind | null;
    if (m.index! > last) out.push([null, code.slice(last, m.index)]);
    out.push([kind, m[0]]);
    last = m.index! + m[0].length;
  }
  if (last < code.length) out.push([null, code.slice(last)]);
  return out;
}

/** SKILL.md files: YAML frontmatter keys, trailing comments, then Markdown headings. */
function tokenizeMd(code: string): [Kind | null, string][] {
  const out: [Kind | null, string][] = [];
  let fences = 0;
  code.split('\n').forEach((line, i, lines) => {
    const nl = i < lines.length - 1 ? '\n' : '';
    if (line === '---' && fences < 2) {
      fences++;
      out.push(['p', line], [null, nl]);
      return;
    }
    if (fences === 1) {
      const m = line.match(/^(\s*-?\s*)([A-Za-z_]+)(:)(.*?)(\s{2,}#.*)?$/);
      if (m) {
        out.push([null, m[1]], ['key', m[2]], [null, m[3] + m[4]]);
        if (m[5]) out.push(['c', m[5]]);
        out.push([null, nl]);
        return;
      }
    }
    out.push([fences >= 2 && line.startsWith('#') ? 'h' : null, line], [null, nl]);
  });
  return out;
}

export function highlight(code: string, lang: Lang): ReactNode[] {
  const tokens = lang === 'md' ? tokenizeMd(code) : RULES[lang] ? tokenize(code, RULES[lang]!) : [[null, code] as [null, string]];
  return tokens.map(([kind, text], i) =>
    kind ? <span key={i} {...stylex.props(t[kind])}>{text}</span> : text,
  );
}

const t = stylex.create({
  k: { color: colors.ink, fontWeight: 500 },
  s: { color: colors.accentInk },
  c: { color: colors.ink3 },
  n: { color: colors.ink2 },
  p: { color: colors.ink3 },
  key: { color: colors.ink2 },
  h: { fontWeight: 500, color: colors.ink },
});
