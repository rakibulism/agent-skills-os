'use client';

import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState } from 'react';
import { SECTIONS, SITE } from '@/lib/site';
import { ui } from '@/styles/shared';
import { colors, layout, motion, radii } from '@/styles/tokens.stylex';
import { CloseIcon, GitHubIcon, MenuIcon } from './icons';
import { Logo } from './Logo';

export function Nav() {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Highlight the section in view.
  useEffect(() => {
    const els = SECTIONS.map((sec) => document.getElementById(sec.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    const top = new IntersectionObserver(([e]) => e.isIntersecting && setActive(null));
    const hero = document.getElementById('top');
    if (hero) top.observe(hero);
    return () => { io.disconnect(); top.disconnect(); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the phone menu on Escape, outside tap, or when the layout grows past it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !buttonRef.current?.contains(t)) setOpen(false);
    };
    const mq = window.matchMedia('(min-width: 880px)');
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
    <header {...stylex.props(s.nav, (scrolled || open) && s.navScrolled)}>
      <div {...stylex.props(ui.wrap, s.inner)}>
        <a href="#top" aria-label="Agent Skills OS, back to top" {...stylex.props(s.brand)} onClick={() => setOpen(false)}>
          <Logo />
        </a>

        <nav aria-label="Sections" {...stylex.props(s.links)}>
          {SECTIONS.map((sec) => (
            <a key={sec.id} href={`#${sec.id}`} aria-current={active === sec.id ? 'true' : undefined} {...stylex.props(s.link, active === sec.id && s.linkOn)}>
              {sec.label}
            </a>
          ))}
        </nav>

        <a href={SITE.repo} target="_blank" rel="noopener" {...stylex.props(s.gh)}>
          <GitHubIcon />
          <span {...stylex.props(s.ghLabel)}>GitHub</span>
        </a>

        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
          {...stylex.props(s.menuBtn)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
      <div ref={menuRef} id="mobile-menu" {...stylex.props(s.sheet)}>
        <nav aria-label="Sections" {...stylex.props(ui.wrap, s.sheetInner)}>
          {SECTIONS.map((sec) => (
            <a key={sec.id} href={`#${sec.id}`} onClick={() => setOpen(false)} {...stylex.props(s.sheetLink, active === sec.id && s.sheetLinkOn)}>
              {sec.label}
            </a>
          ))}
        </nav>
      </div>
      )}
    </header>
  );
}

const DESKTOP = '@media (min-width: 880px)';

const slideIn = stylex.keyframes({
  from: { opacity: 0, transform: 'translateY(-6px)' },
  to: { opacity: 1, transform: 'none' },
});

const s = stylex.create({
  nav: {
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
  navScrolled: { borderBottomColor: colors.line },
  inner: { display: 'flex', alignItems: 'center', gap: 16, height: layout.navH },
  brand: { borderRadius: radii.sm, marginRight: 'auto' },
  links: { display: { default: 'none', [DESKTOP]: 'flex' }, gap: 2 },
  link: {
    fontSize: 14,
    paddingBlock: 6,
    paddingInline: 10,
    borderRadius: radii.sm,
    color: { default: colors.ink2, ':hover': colors.ink },
    backgroundColor: { default: 'transparent', ':hover': colors.sunk },
    transitionProperty: 'color, background-color',
    transitionDuration: motion.fast,
  },
  linkOn: { color: colors.ink, backgroundColor: colors.sunk },
  gh: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 36,
    paddingInline: { default: 10, [DESKTOP]: 12 },
    fontSize: 14,
    color: { default: colors.ink2, ':hover': colors.ink },
    backgroundColor: { default: 'transparent', ':hover': colors.sunk },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: radii.sm,
    transitionProperty: 'color, background-color',
    transitionDuration: motion.fast,
  },
  ghLabel: { display: { default: 'none', '@media (min-width: 420px)': 'inline' } },
  menuBtn: {
    display: { default: 'inline-grid', [DESKTOP]: 'none' },
    placeItems: 'center',
    width: 40,
    height: 36,
    color: colors.ink,
    backgroundColor: { default: 'transparent', ':hover': colors.sunk },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line2,
    borderRadius: radii.sm,
  },
  sheet: {
    display: { default: 'block', [DESKTOP]: 'none' },
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
    boxShadow: '0 24px 48px -24px rgba(0,0,0,0.35)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.line,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.line,
    animationName: slideIn,
    animationDuration: '180ms',
    animationTimingFunction: 'ease-out',
  },
  sheetInner: { display: 'grid', paddingBlock: 8 },
  sheetLink: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 48,
    fontSize: 17,
    fontWeight: 500,
    color: colors.ink2,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: { default: colors.line, ':last-child': 'transparent' },
  },
  sheetLinkOn: { color: colors.ink },
});
