import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import * as stylex from '@stylexjs/stylex';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { Toaster } from '@/components/Toaster';
import { SITE } from '@/lib/site';
import { BRAND_HEX } from '@/styles/brand';
import { colors, fonts } from '@/styles/tokens.stylex';
import './globals.css';

// Self-hosted at build time: no request to Google from the visitor's browser.
const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author, url: SITE.authorUrl }],
  creator: SITE.author,
  keywords: ['AI agents', 'agent skills', 'Claude', 'OpenAI', 'LangChain', 'CrewAI', 'AutoGen', 'Cursor', 'AGENTS.md', 'system prompt'],
  alternates: { canonical: '/' },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE.name,
    title: { default: SITE.title, template: `%s · ${SITE.name}` },
    description: SITE.shortDescription,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: `${SITE.name}: find a skill, load it into any agent. ${SITE.install}` }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: SITE.twitter,
    title: { default: SITE.title, template: `%s · ${SITE.name}` },
    description: SITE.shortDescription,
    images: ['/og.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: BRAND_HEX.bgLight },
    { media: '(prefers-color-scheme: dark)', color: BRAND_HEX.bgDark },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body {...stylex.props(s.body)}>
        <a href="#main" {...stylex.props(s.skip)}>Skip to content</a>
        <SiteHeader />
        <main id="main" {...stylex.props(s.main)}>{children}</main>
        <SiteFooter />
        <Toaster />
      </body>
    </html>
  );
}

const s = stylex.create({
  body: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100dvh',
    backgroundColor: colors.bg,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
  main: { flexGrow: 1 },
  skip: {
    position: 'absolute',
    left: 12,
    top: { default: -48, ':focus': 12 },
    zIndex: 100,
    paddingBlock: 8,
    paddingInline: 12,
    fontSize: 14,
    color: colors.bg,
    backgroundColor: colors.ink,
    borderRadius: 6,
  },
});
