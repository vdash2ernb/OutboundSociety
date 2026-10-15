// @ts-check
import { defineConfig } from 'astro/config';

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
  devToolbar: { enabled: false },
  prefetch: { prefetchAll: true },
  image: {
    responsiveStyles: true,
  },
});
