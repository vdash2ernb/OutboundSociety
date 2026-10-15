# Outbound Society website

Astro static site for Outbound Society, a non-profit community running organizer in Liloan, Cebu.
Live at **https://outboundsociety.org**, hosted on GitHub Pages.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Updating for the next event

Edit **`src/data/current-event.ts`**. The Home and Events pages both read from it:

- Change the name, date, venue, fee, schedule, prizes and sponsors.
- Paste the new Google Form link into `registerUrl`.
- Set `registrationOpen: false` when registration closes. The orange buttons then switch to "Registration closed".
- When the event is over, move it into `src/data/past-events.ts` (newest first), and update `nextUp` for the run after that.

New photos go in `src/assets/photos/` as `.jpg` files and are referenced by file name without the extension. Astro resizes them and converts them to AVIF/WebP at build time.

## Deploying

Every push to `main` builds and publishes automatically through GitHub Actions (`.github/workflows/deploy-pages.yml`) to GitHub Pages.

- **Custom domain:** `outboundsociety.org`, set in `public/CNAME` and in the repo's Pages settings. `www` and the old `vdash2ernb.github.io/OutboundSociety` link both redirect to it.
- **HTTPS:** a free Let's Encrypt certificate is issued and renewed automatically by GitHub, and "Enforce HTTPS" is on.
- **DNS (Squarespace):** four A records for `@` point to `185.199.108.153`, `.109.153`, `.110.153` and `.111.153`, and a CNAME for `www` points to `vdash2ernb.github.io`. The Google Workspace MX/TXT records handle email; don't remove them.

## Folders

- `src/pages/`: Home, Events, About and 404 pages
- `src/components/`, `src/layouts/`, `src/styles/`: UI building blocks; colours and grain are in `global.css`
- `src/scripts/motion.ts`: smooth scrolling (Lenis) and scroll animations (GSAP)
- `public/video/`: hero clips, re-encoded to H.264
- `scripts/prepare-media.mjs`: picks, resizes and encodes media from `source/`
- `source/`: archived Google Site, Google Maps and Facebook material. Raw Facebook media is git-ignored because of its size.
- `DESIGN-BRIEF.md`: design direction and decisions
