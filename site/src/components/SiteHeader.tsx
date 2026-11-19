'use client';

import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { PAGES, SITE } from '@/lib/site';
import { ui } from '@/styles/shared';
import { colors, layout, motion, radii } from '@/styles/tokens.stylex';
import { Icon, type IconName } from './Icon';
import { Logo } from './Logo';

const SOURCES: { href: string; label: string; icon: IconName }[] = [
  { href: SITE.repo, label: 'Source on GitHub', icon: 'github' },
  { href: SITE.npm, label: 'Package on npm', icon: 'npm' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname.startsWith('/skills');
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the phone menu on Escape, an outside tap, or when the layout grows past it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !buttonRef.current?.contains(t)) setOpen(false);
    };
    const mq = window.matchMedia('(min-width: 720px)');
    const onMq = () => mq.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
      mq.removeEventListener('change', onMq);
    };
  }, [open]);

  return (
    <header {...stylex.props(s.header, (scrolled || open) && s.headerLine)}>
      <div {...stylex.props(ui.wrap, s.inner)}>
        <Link href="/" aria-label="Agent Skills OS, home" {...stylex.props(s.brand)}>
          <Logo id="logo-header" />
        </Link>

        <nav aria-label="Main" {...stylex.props(s.pages)}>
          {PAGES.map((p) => {
            const on = isActive(pathname, p.href);
            return (
              <Link key={p.href} href={p.href} aria-current={on ? 'page' : undefined} {...stylex.props(s.page, on && s.pageOn)}>
                {p.label}
              </Link>
            );
          })}
        </nav>

        <div {...stylex.props(s.sources)}>
          {SOURCES.map((src) => (
            <a key={src.href} href={src.href} target="_blank" rel="noopener" aria-label={src.label} title={src.label} {...stylex.props(s.iconBtn)}>
              <Icon name={src.icon} size={19} />
            </a>
          ))}
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
            {...stylex.props(s.iconBtn, s.menuBtn)}
          >
            <Icon name={open ? 'close' : 'menu'} size={19} />
          </button>
        </div>
      </div>

      {open && (
        <div ref={menuRef} id="site-menu" {...stylex.props(s.sheet)}>
          <nav aria-label="Main" {...stylex.props(ui.wrap, s.sheetInner)}>
            {PAGES.map((p) => {
              const on = isActive(pathname, p.href);
              return (
                <Link key={p.href} href={p.href} onClick={() => setOpen(false)} aria-current={on ? 'page' : undefined} {...stylex.props(s.sheetLink, on && s.sheetLinkOn)}>
                  {p.label}
                  <Icon name="next" size={18} />
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

const WIDE = '@media (min-width: 720px)';

const slideIn = stylex.keyframes({
  from: { opacity: 0, transform: 'translateY(-6px)' },
  to: { opacity: 1, transform: 'none' },
});

const s = stylex.create({
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    backgroundColor: colors.navBg,
    backdropFilter: 'saturate(1.4) blur(14px)',
    WebkitBackdropFilter: 'saturate(1.4) blur(14px)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    transitionProperty: 'border-color',
    transitionDuration: motion.base,
  },
  headerLine: { borderBottomColor: colors.line },
  inner: { display: 'flex', alignItems: 'center', gap: 16, height: layout.navH },
  brand: { borderRadius: radii.sm },
  pages: { display: { default: 'none', [WIDE]: 'flex' }, gap: 2, marginLeft: 16 },
  page: {
    fontSize: 14,
    fontWeight: 500,
    paddingBlock: 6,
    paddingInline: 10,
    borderRadius: radii.sm,
    color: { default: colors.ink2, ':hover': colors.ink },
    backgroundColor: { default: 'transparent', ':hover': colors.sunk },
    transitionProperty: 'color, background-color',
    transitionDuration: motion.fast,
  },
  pageOn: { color: colors.ink, backgroundColor: colors.sunk },
  sources: { display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  iconBtn: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 38,
    height: 38,
    padding: 0,
    color: { default: colors.ink2, ':hover': colors.ink },
    backgroundColor: { default: 'transparent', ':hover': colors.sunk },
    borderWidth: 0,
    borderRadius: radii.sm,
    transitionProperty: 'color, background-color, transform',
    transitionDuration: motion.fast,
    transform: { default: null, ':active': 'scale(0.94)' },
  },
  menuBtn: { display: { default: 'inline-grid', [WIDE]: 'none' }, color: colors.ink },
  sheet: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
    boxShadow: '0 24px 48px -24px rgba(0,0,0,0.35)',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.line,
    animationName: slideIn,
    animationDuration: '180ms',
    animationTimingFunction: 'ease-out',
  },
  sheetInner: { display: 'grid', paddingBlock: 8 },
  sheetLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    fontSize: 17,
    fontWeight: 500,
    color: colors.ink2,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: { default: colors.line, ':last-child': 'transparent' },
  },
  sheetLinkOn: { color: colors.ink },
});
