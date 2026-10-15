// /llms.txt: a plain-text briefing for AI assistants and answer engines (GEO).
// Built from the same data files as the pages, so it stays current automatically.
import type { APIRoute } from 'astro';
import { site, reviews } from '../data/site';
import { currentEvent as ev, nextUp } from '../data/current-event';
import { pastEvents } from '../data/past-events';

export const GET: APIRoute = ({ site: origin }) => {
  const url = (p: string) => new URL(p, origin).toString();
  const body = `# ${site.name}

> ${site.name} is a Cebuano non-profit running organization and community event organizer based in Catarman, Liloan, Cebu, Philippines. It organizes inclusive, beginner-friendly community fun runs (night runs, costume runs, birthday runs and fiesta fundraisers) for all fitness levels. Every peso earned goes back into organizing the next run.

## Key facts
- Founder: ${site.founder}
- Address: ${site.address}
- Phone: ${site.phone}
- Facebook (fastest response): ${site.facebook}
- Google Maps: ${site.maps}
- Website: ${url('/')}
- Areas served: ${site.coverage.join(', ')} and the greater Cebu North area
- Google rating: 5.0 stars
- Services: community runs and fitness activations; event management for brand activations and sports gatherings; digital marketing for local wellness events

## Current event: ${ev.name}
- Date: ${ev.dateLabel}; ${ev.schedule.map((s) => `${s.time} ${s.label}`).join('; ')}
- Venue: ${ev.venue}, ${ev.address}
- Registration fee: ${ev.fee}; ${ev.included.join('; ')}
- Distances: ${ev.categories.map((c) => `${c.name} (${c.detail})`).join('; ')}
- Register (Google Form): ${ev.registerUrl}
- Registration closes: ${ev.registrationCloses}
- ${ev.notes}

## Coming up: ${nextUp.name}
- Date: ${nextUp.dateLabel}
- Place: ${nextUp.place}
- ${nextUp.blurb}

## Past events
${pastEvents.map((e) => `- ${e.name} (${e.when}, ${e.where}): ${e.summary}`).join('\n')}

## What runners say (Google reviews)
${reviews.map((r) => `- "${r.text}" (${r.name})`).join('\n')}

## Pages
- [Home](${url('/')}): who we are, next run, past runs, reviews
- [Events](${url('/events/')}): ${ev.name} details, FAQ, upcoming and past runs
- [About](${url('/about/')}): mission, non-profit promise, services, founder story
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
