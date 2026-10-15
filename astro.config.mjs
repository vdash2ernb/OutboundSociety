// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL / BASE_PATH are set by the GitHub Pages workflow
// (https://vdash2ernb.github.io + /OutboundSociety). Elsewhere the site builds for the domain root.
// Replace the default with the real domain once the Squarespace domain is connected.
const site = process.env.SITE_URL || 'https://outboundsociety.pages.dev';
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
