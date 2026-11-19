import type { NextConfig } from 'next';

// Static export: `next build` writes plain HTML/CSS/JS to out/, served by any CDN.
const config: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,
  trailingSlash: false,
  images: { unoptimized: true },
  // Pin the workspace root so Turbopack doesn't walk up into the package at the repo root.
  turbopack: { root: __dirname },
};

export default config;
