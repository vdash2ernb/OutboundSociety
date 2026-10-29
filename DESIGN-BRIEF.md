# Outbound Society — Design Direction

## Reference
https://www.sixmorevodka.com/ is the kind of website we want: a bold creative-agency feel, big type, full-bleed imagery/video, smooth weighted scrolling, scroll-triggered reveals, pinned sections, and smooth page transitions. Match the **style and feel**, not their design, code, or branding.

## Visual rules (from the client)
- **Textured**: the whole site should feel tactile (grain / noise / paper or grunge texture overlay), not flat.
- **Background**: black, with texture on top.
- **Text**: white.
- **Typography**: bold, ALL CAPS, especially headlines and nav. Big and confident.
- **CTA colour**: orange. Orange is reserved for calls to action (buttons, key links, hover accents) so it stands out.
- **Logo**: use the provided logo exactly as is (`source/brand/logo-circle.webp`). Do not redraw, recolour, crop, or restyle it.

## Decisions (2026-10-15)
- **Hosting**: Astro, deployed on Cloudflare (free plan, auto-deploy from GitHub). Squarespace domain pointed at Cloudflare later.
- **Pages**: simplified (see proposed structure below).
- **Registration**: Google Forms, with the link changing per event. The current event is Haunted Night Run 2026 (forms.gle/7jVeCPXSEvYX2gEw8). The current event (name, date, venue, fee, poster, form link) is kept in one data file, so switching to the next event means editing that one file.
- **Event history**: built from Facebook photos and videos plus the Google Maps and Google Site material.

## Proposed page structure (pending client OK)
1. **Home**: big hero (photo or video) → what Outbound Society is → current event teaser with an orange REGISTER button → past events strip → reviews → Facebook / contact footer.
2. **Events**: current event in full (details, poster, REGISTER → Google Form, FAQ, participant declaration) + past events archive, with each past event's photos/videos (replaces the separate Registration and Gallery pages).
3. **About**: who we are, mission, non-profit promise, what we do (services), founder.
4. **Contact**: could be folded into the footer of every page plus a short section on About, to get down to 3 pages.

## Suggested stack (original)
- Next.js or Astro, deployed on Vercel
- GSAP + ScrollTrigger for scroll animations and text reveals
- Lenis for smooth scroll
- Optional: Three.js / WebGL for image distortion effects
- Page transitions (Next.js view transitions or Barba.js)

## Content
Use the existing material in `source/` (Google Site text, Google Maps photos and reviews).
