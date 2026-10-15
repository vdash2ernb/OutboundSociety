# Outbound Society website

Astro static site for Outbound Society, a non-profit community running organizer in Liloan, Cebu. It is hosted on Cloudflare Pages.

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

## Deploying to Cloudflare Pages

1. In Cloudflare go to **Workers & Pages → Create → Pages → Connect to Git** and pick `vdash2ernb/OutboundSociety`.
2. Set the framework preset to **Astro**, the build command to `npm run build`, and the output directory to `dist`.
3. Every push to `main` then redeploys the site automatically.
4. Add the Squarespace domain under **Custom domains** and follow the DNS steps Cloudflare shows. After that, update `site` in `astro.config.mjs` to the real domain.

## Folders

- `src/pages/`: Home, Events, About and 404 pages
- `src/components/`, `src/layouts/`, `src/styles/`: UI building blocks; colours and grain are in `global.css`
- `src/scripts/motion.ts`: smooth scrolling (Lenis) and scroll animations (GSAP)
- `public/video/`: hero clips, re-encoded to H.264
- `scripts/prepare-media.mjs`: picks, resizes and encodes media from `source/`
- `source/`: archived Google Site, Google Maps and Facebook material. Raw Facebook media is git-ignored because of its size.
- `DESIGN-BRIEF.md`: design direction and decisions
