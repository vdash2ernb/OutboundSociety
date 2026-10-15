# SEO & GEO audit: outboundsociety.org (2026-10-15)

SEO = ranking in Google and Bing. GEO = being found and quoted by AI assistants (ChatGPT, Gemini / Google AI Overviews, Perplexity, Copilot, Claude).

## What was checked and fixed

| Area | Before | Now |
|---|---|---|
| Sitemap | missing | `/sitemap-index.xml` lists Home, Events and About; it updates on every deploy |
| robots.txt | missing | `/robots.txt` allows all search engines and AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended and others) and points to the sitemap |
| AI briefing (`/llms.txt`) | missing | Plain-text facts: who, where, founder, contact, current event (date, venue, fee, form), next run, past runs, reviews. Built from the site data, so it never goes stale |
| Structured data (schema.org) | basic organization only | Organization + LocalBusiness (address, map pin, hours, phone, founder, areas served, Facebook and Google Maps links), WebSite, **Event** for Haunted Night Run 2026 (date, venue, ₱180 price, registration link, sale window), Pit Señor Fiesta Run, the 4 past runs, FAQ, breadcrumbs, AboutPage. **Validator: 0 errors, 0 warnings** on all pages |
| Page titles | "Events · Outbound Society" (generic) | Keyword-led, under 60 characters: "Haunted Night Run 2026 · Liloan Fun Runs \| Outbound Society", "Outbound Society \| Community Fun Runs in Liloan, Cebu" |
| Descriptions | generic | Specific per page (date, venue, price, distances) |
| Social share cards | image only | Full Open Graph and X cards with a title, description, a 1200×630 image per page and alt text (Facebook, Messenger, Viber, X, LinkedIn) |
| Local signals | none | `en-PH` language, geo tags for Liloan, Cebu (PH-CEB) and coordinates |
| Icons | favicon.ico missing | favicon.ico, Apple touch icon, Android icons, web manifest |
| 404 page | indexable, pointed to itself as a real page | `noindex` |
| Crawlability | good | Every page is pre-rendered HTML with one H1 and descriptive image alt text; works without JavaScript |
| HTTPS / domain | done | HTTPS enforced; www, http and the old github.io link all 301-redirect to https://outboundsociety.org |

## Your to-do list (needs your accounts; about 30 minutes)

These have the biggest impact, roughly in order.

1. **Google Search Console** (search.google.com/search-console). Add a **Domain** property for `outboundsociety.org`. It verifies through a TXT record in Squarespace DNS, added the same way as the earlier records; leave the existing Google TXT records alone. Then go to **Sitemaps**, submit `https://outboundsociety.org/sitemap-index.xml`, and use **URL inspection → Request indexing** for the Home and Events pages.
2. **Bing Webmaster Tools** (bing.com/webmasters). Choose "Import from Google Search Console". Bing feeds ChatGPT search, Microsoft Copilot and DuckDuckGo, so this matters for GEO.
3. **Google Business Profile.** Change the website from the old `sites.google.com/...` address to `https://outboundsociety.org`. Post Haunted Night Run 2026 as an **Event** post linking to `/events/`. Keep adding photos, and keep asking happy runners for reviews.
4. **Facebook page.** Set the Website field to `https://outboundsociety.org`, and link `/events/` in event posts.
5. **Old Google Site.** Either unpublish it, or replace its pages with a single line: "We've moved to outboundsociety.org". Two sites saying the same thing compete with each other in search.
6. **Running calendars and local listings.** List each run, with a link to `outboundsociety.org/events/`, on Philippine running-event calendars such as PinoyFitness and on Cebu community and events pages. Ask sponsors (Bakeria Box, Skylun, BIG APPLE by the bay and others) to link to you from their Facebook or websites. These links are what lift you in Google and what AI assistants cite.
7. **Apple Business Connect** (businessconnect.apple.com). Claim the place, so Apple Maps and Siri show the right website and hours.
8. If you open Instagram or TikTok accounts, send me the links and I'll add them to the structured data.

## Recommended next improvements (site side)

- **One page per run** (for example `/events/haunted-night-run-2026/`) with its own photos, route, results and FAQ. Separate pages rank much better for searches like "Haunted Night Run Liloan" and give AI assistants a clear source to quote. Past runs then build a permanent archive that keeps attracting searches.
- **Results and recaps.** Post the top finishers and the photo albums after each run. Fresh, unique content is the strongest ongoing signal.
- **Cebuano and Tagalog phrasing.** Add a few natural lines, such as "dagan sa Liloan" and "fun run sa Cebu", where they fit.
- **Video weight.** The desktop hero loads about 12 MB of video. This is fine on Wi-Fi, but it could be halved for faster mobile loading, which counts toward Google's page-experience signals.

## Expectations

Google usually indexes a new domain within days of submitting the sitemap. Ranking for "fun run Liloan" or "community run Cebu" builds over 2–8 weeks and depends mostly on the to-do items above (Business Profile, backlinks, regular new event content). The event listing in Google can show the run with its date and price, but Google decides when to display it.
