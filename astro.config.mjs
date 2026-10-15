// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The live site is https://outboundsociety.org (GitHub Pages, custom domain).
// SITE_URL / BASE_PATH can override this, e.g. to build for a sub-path preview.
const site = process.env.SITE_URL || 'https://outboundsociety.org';
const base = process.env.BASE_PATH || '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    // sitemap-index.xml + sitemap-0.xml for Google, Bing and AI crawlers (404 page excluded)
    sitemap({ filter: (page) => !page.includes('/404'), changefreq: 'weekly', lastmod: new Date() }),
  ],
  devToolbar: { enabled: false },
  prefetch: { prefetchAll: true },
  image: {
    responsiveStyles: true,
  },
});
