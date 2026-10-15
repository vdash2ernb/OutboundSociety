// ─────────────────────────────────────────────────────────────
//  CURRENT EVENT — edit this one file when the next run opens.
//  Everything on the Home and Events pages reads from here.
// ─────────────────────────────────────────────────────────────

export const currentEvent = {
  name: 'Haunted Night Run 2026',
  // How the name breaks across lines in the big headings
  headingLines: ['Haunted', 'Night Run', '2026'],
  tagline: 'The night is calling. Will you answer?',
  // ISO date + local start time (Philippine time, UTC+8). Used for the countdown.
  startsAt: '2026-11-07T19:00:00+08:00',
  endsAt: '2026-11-07T23:00:00+08:00', // for search engines' event listings
  registrationOpens: '2026-09-08T00:00:00+08:00',
  registrationClosesAt: '2026-10-28T23:59:00+08:00',
  dateLabel: 'November 7, 2026',
  venue: 'Bakeria Box',
  address: 'Bajac, Liloan, Cebu',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Bakeria+Box+Bajac+Liloan+Cebu',
  fee: '₱180',
  registerUrl: 'https://forms.gle/w1sueWBvCA7E2ENM6',
  registrationCloses: 'October 28, 2026',
  // Set to false once registration closes to swap the button for "Registration closed".
  registrationOpen: true,
  poster: 'hnr26-poster', // file name in src/assets/photos (without .jpg)
  heroPhoto: 'hnr25-group', // wide photo behind the Events page header
  featurePhoto: 'hnr25-capes', // portrait photo beside the event on the Home page
  featurePhotoAlt: 'Runners in Halloween costumes with their medals at the Haunted Night Run 2025',
  featureTag: 'Last year · 300+ runners',
  schedule: [
    { time: '7:00 PM', label: 'Program starts' },
    { time: '8:00 PM', label: 'Gun start: Kids 3 km Trick-or-Treat Run' },
    { time: '9:00 PM', label: 'Gun start: Adults 5 km Run' },
  ],
  categories: [
    { name: 'Kids 3 km', detail: 'Trick-or-Treat Run with candy stations along the route' },
    { name: 'Adults 5 km', detail: 'Night run through the streets of Liloan' },
  ],
  included: [
    "Finisher's medal",
    'Post-run meal from The Bakeria',
    'Entry to 100+ raffle prizes',
    'Free loot bag for the first 100 kids',
    'Best in Costume cash prizes (Kids, Adult, Senior)',
    'Top 1 prize package: plaque, 2 kg rice, foot spa',
  ],
  notes: 'Costumes are not required. Come in comfortable running attire and enjoy the night.',
  candyStations: [
    'Bakeria Box',
    "Chikito's Unlimited Korean Chicken",
    'Verdant Misto Cafe',
    'BIG APPLE by the bay',
    'Angela Hair & Nail Salon by Beth',
    'Kurairen Pasalubong',
    'Skylun Restaurant',
    'FERC Fuels Liloan',
    'JJ&M Sugbahanan Restobar',
    'Dr. Dirk Yuson Dental Clinic',
    'Liloan Event Space',
  ],
  sponsors: [
    'Bakeria Box',
    'Skylun Restaurant',
    'BIG APPLE by the bay',
    'Cafe 8020',
    'Liloan Event Space',
    'FERC Fuels',
    'Espressooh Nails Spa Cafe',
    "Chen's Creations",
    "AVA's Catering",
    'Calamansi Zero',
    'Phoenix Super LPG',
    'Conquer Fitness & Gym',
    "FatBum's Burgers",
    'Japal Food Manufacturing',
    'FantasyWorld PH',
    'Sabon Station Cebu',
    'Quezych LINE',
    'Yalu Shop',
    'Kurairen Dried Mangoes',
    'JJ&M Sugbahanan Restobar',
  ],
};

// The run after this one. Shown as "Coming up" on the Events page.
export const nextUp = {
  name: 'Pit Señor Fiesta Run',
  dateLabel: 'January 3, 2027',
  date: '2027-01-03',
  place: 'Sitio Suba, Poblacion, Liloan, Cebu',
  blurb:
    'Start 2027 moving. Every registration helps raise funds to replace the ceiling of the Señor Santo Niño Chapel. Raffle prizes and cash rewards for top finishers.',
  poster: 'pit-senyor-poster',
  link: 'https://www.facebook.com/OutboundSociety/',
};
