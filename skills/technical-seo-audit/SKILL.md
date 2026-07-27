---
name: technical-seo-audit
description: Audits a website for technical Google Search compliance — crawlability, indexability, canonicalization/duplicate URLs, sitemaps, Search Essentials (technical requirements + spam policies), and image SEO. Use whenever assessing whether a site meets Google's documented crawling/indexing rules, debugging why pages aren't indexed or ranking, migrating URLs/domains, or reviewing robots.txt, sitemaps, canonical tags, or structured data for Google Search.
version: 0.1.0
tags: [marketing, seo, technical-seo, google-search, crawling, indexing]
inputs:
  - name: site_or_page
    description: The site, page, or set of URLs being audited.
    required: true
  - name: context
    description: Relevant context — recent migration, ranking/indexing drop, new launch, etc.
    required: false
related: [seo-strategist]
author: rakibulism
author_url: https://x.com/rakibulism
---

# Technical SEO Audit (Google Search Compliance)

Audit sites against Google's documented requirements for crawling, indexing, and serving. Grounded in Google Search Central docs (fundamentals, essentials, crawling/indexing, sitemaps, image SEO) — cite the specific rule when flagging an issue, don't just say "this could hurt SEO."

## Audit Checklist

### 1. Crawlability
- `robots.txt` doesn't block important pages/resources (CSS, JS) needed to render content.
- No accidental `noindex` meta tags or `X-Robots-Tag` headers on pages meant to be indexed.
- Internal links use crawlable `<a href>` tags (not JS-only click handlers) — Googlebot must be able to discover pages via links.
- Server returns proper HTTP status codes (200 for live pages, 301 for permanent moves, 404/410 for gone pages) — no "soft 404s" (pages that return 200 but show error content).
- Site uses HTTPS throughout, with HTTP redirecting via 301.

### 2. Indexability
- Check indexing status per URL with Search Console's **URL Inspection tool**: distinguishes "URL is on Google," "on Google but has issues," "not on Google," and "alternate version" (duplicate/AMP).
- Being crawled ≠ being indexed. Indexing can still fail on quality grounds, `noindex`, or duplicate-content consolidation even if crawling succeeds.
- For a "not on Google" page: check robots.txt, `noindex`, canonical pointing elsewhere, and low-quality/thin-content signals, in that order.

### 3. Duplicate URLs & Canonicalization
Identify duplicate-content sources: URL parameters (tracking/session params like `?gclid=`), `http` vs `https`, `www` vs non-`www`, trailing slashes, separate mobile URLs, print/AMP variants.

Fix in order of signal strength:
1. **301 redirect** — strongest signal; use when one URL should permanently replace another.
2. **`rel="canonical"`** — `<link rel="canonical" href="...">` in `<head>` (or HTTP header for non-HTML files) when both URLs must stay live but one is preferred.
3. **Sitemap entries** — list only the preferred/canonical URLs; weakest signal, but reinforces the others.

Flag any page whose canonical tag points to a different URL than expected, or where internal links point to non-canonical versions (dilutes the consolidation signal).

### 4. Sitemaps
- Confirm a sitemap exists and is submitted in Search Console if the site is: large (500+ pages), new with few inbound links, or media/news-heavy.
- Small sites with strong internal linking may not need one — don't flag its absence as a defect by default.
- Verify the sitemap lists only canonical, indexable (200-status, non-`noindex`) URLs — not redirects, errors, or duplicates.
- For media-heavy sites, check for image/video sitemap extensions (image locations, video runtime/rating, last-modified dates).
- Remember: a sitemap aids discovery, it does not guarantee crawling or indexing.

### 5. Search Essentials (baseline technical requirements)
- Site is technically accessible to Googlebot (no auth walls, JS-rendering failures, or blocked resources).
- No manual actions or spam policy violations: cloaking, doorway pages, scraped/auto-generated content, link schemes, keyword stuffing, sneaky redirects, hidden text.
- Titles, meta descriptions, and headings contain relevant keywords placed naturally — not stuffed.
- Content is helpful and reliable, written for users first.
- Mobile-friendly / responsive design (60%+ of traffic is mobile).
- Structured data (schema.org) implemented where relevant, and validated (no required-field errors) to qualify for rich results.

### 6. Image SEO (if the site is image-heavy)
- Images use real `<img src>` (or `<picture>`/`srcset` with a fallback `src`) — not CSS-only background images, which Google may not index.
- Descriptive filenames (`dalmatian-puppy-playing.jpg`, not `IMG_00234.jpg`) and meaningful (non-stuffed) `alt` text.
- Supported formats: JPEG, PNG, WebP, SVG, AVIF.
- Image sitemap present for images not otherwise discoverable via crawlable HTML.
- Preferred landing-page image indicated via `og:image` or schema `primaryImageOfPage`.
- Image URLs are stable/consistent (aids caching) and placed near relevant contextual text.

## Output Format

Report findings as: **Issue → Google rule violated/relevant doc → Evidence on this site → Fix**, ordered by impact (things blocking indexing entirely first, then consolidation/duplicate issues, then on-page/image polish). Don't flag a missing sitemap or missing image sitemap as high-severity unless the site's size/link profile actually calls for one.
