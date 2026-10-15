// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Replace with the real domain once the Squarespace domain points at Cloudflare.
  site: 'https://outboundsociety.pages.dev',
  output: 'static',
  devToolbar: { enabled: false },
  prefetch: { prefetchAll: true },
  image: {
    responsiveStyles: true,
  },
});
