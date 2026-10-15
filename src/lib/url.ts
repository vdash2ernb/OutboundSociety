// Prefixes an internal path with the site's base path, so links work both at the
// domain root (Cloudflare) and under /OutboundSociety/ (GitHub Pages).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const url = (path: string) => `${base}${path}`;
