// Structured data (schema.org JSON-LD) for search engines and AI answer engines.
import { site } from '../data/site';
import { currentEvent as ev, type UpcomingRun } from '../data/current-event';
import { pastEvents, type PastEvent } from '../data/past-events';

type Abs = (path: string) => string;

// Self-contained reference to the organization (validators resolve it even on its own)
const orgRef = (abs: Abs) => ({ '@type': 'Organization', '@id': abs('/#org'), name: site.name, url: abs('/') });

const address = {
  '@type': 'PostalAddress',
  streetAddress: 'Purok Ube, Catarman',
  addressLocality: 'Liloan',
  addressRegion: 'Cebu',
  postalCode: '6002',
  addressCountry: 'PH',
};

export function organization(abs: Abs, logo: string, image: string) {
  return {
    '@type': ['SportsOrganization', 'LocalBusiness'],
    '@id': abs('/#org'),
    name: site.name,
    url: abs('/'),
    logo,
    image,
    description: site.description,
    sport: 'Running',
    slogan: 'Run the night.',
    founder: { '@type': 'Person', name: site.founder },
    foundingDate: '2025',
    telephone: '+63 960 598 4835',
    email: site.email,
    address,
    geo: { '@type': 'GeoCoordinates', latitude: 10.3884063, longitude: 124.0022916 },
    hasMap: site.maps,
    openingHours: 'Mo-Su 05:00-23:00',
    priceRange: '₱',
    areaServed: site.coverage.map((name) => ({ '@type': 'City', name: `${name}, Cebu` })),
    knowsAbout: ['Community fun runs', 'Night runs', 'Event management', 'Sports event marketing', 'Running in Cebu'],
    sameAs: [site.facebook, site.maps],
  };
}

export function website(abs: Abs) {
  return {
    '@type': 'WebSite',
    '@id': abs('/#website'),
    url: abs('/'),
    name: site.name,
    inLanguage: 'en-PH',
    publisher: orgRef(abs),
  };
}

/** The open-for-registration run: eligible for Google's event results */
export function currentEventSchema(abs: Abs, images: string[]) {
  return {
    '@type': 'Event',
    '@id': abs(`/events/${ev.slug}/#event`),
    name: ev.name,
    description: `${ev.tagline} ${ev.categories.map((c) => `${c.name}: ${c.detail}`).join(' ')} Every entry includes ${ev.included.join(', ').toLowerCase()}. ${ev.notes}`,
    startDate: ev.date,
    endDate: ev.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: images,
    url: abs(`/events/${ev.slug}/`),
    location: {
      '@type': 'Place',
      name: `${ev.venue}, ${ev.address}`,
      address: { '@type': 'PostalAddress', streetAddress: ev.venue, addressLocality: 'Liloan', addressRegion: 'Cebu', postalCode: '6002', addressCountry: 'PH' },
    },
    offers: {
      '@type': 'Offer',
      price: ev.price,
      priceCurrency: 'PHP',
      url: ev.registerUrl,
      availability: ev.registrationOpen ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      validFrom: ev.registrationOpens,
      ...(ev.registrationClosesAt ? { validThrough: ev.registrationClosesAt } : {}),
    },
    organizer: orgRef(abs),
    performer: orgRef(abs),
    isAccessibleForFree: false,
    typicalAgeRange: 'all ages',
  };
}

export function upcomingSchema(abs: Abs, run: UpcomingRun, image: string) {
  return {
    '@type': 'Event',
    name: run.name,
    description: run.blurb,
    startDate: run.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: run.virtual ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
    image: [image],
    url: abs('/events/#coming-up'),
    location: run.virtual
      ? { '@type': 'VirtualLocation', url: run.link }
      : { '@type': 'Place', name: 'Liloan, Cebu', address: { '@type': 'PostalAddress', addressLocality: 'Liloan', addressRegion: 'Cebu', addressCountry: 'PH' } },
    organizer: orgRef(abs),
  };
}

/** A run that already happened, described on its own page */
export function pastEventSchema(abs: Abs, e: PastEvent, images: string[]) {
  return {
    '@type': 'Event',
    '@id': abs(`/events/${e.slug}/#event`),
    name: e.fullName,
    description: e.summary,
    startDate: e.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: images,
    url: abs(`/events/${e.slug}/`),
    location: { '@type': 'Place', name: e.where, address: { '@type': 'PostalAddress', addressLocality: 'Liloan', addressRegion: 'Cebu', addressCountry: 'PH' } },
    organizer: orgRef(abs),
  };
}

export function pastEventSchemas(abs: Abs, imageFor: (name: string) => string) {
  return pastEvents.map((e) => pastEventSchema(abs, e, [imageFor(e.cover)]));
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function breadcrumbs(abs: Abs, trail: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: abs(t.path),
    })),
  };
}
