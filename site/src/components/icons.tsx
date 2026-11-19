import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 16): SVGProps<SVGSVGElement> => ({
  width: size, height: size, viewBox: '0 0 16 16', 'aria-hidden': true, focusable: false,
});

export function CopyIcon({ size, ...p }: P) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth={1.4} {...p}>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 3.5V3A1.5 1.5 0 0 0 9 1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" />
    </svg>
  );
}

export function CheckIcon({ size, ...p }: P) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

export function MenuIcon({ size, ...p }: P) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" {...p}>
      <path d="M2.5 5h11M2.5 11h11" />
    </svg>
  );
}

export function CloseIcon({ size, ...p }: P) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" {...p}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function ArrowIcon({ size, ...p }: P) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function GitHubIcon({ size, ...p }: P) {
  return (
    <svg {...base(size)} {...p}>
      <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.22 1.88.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
