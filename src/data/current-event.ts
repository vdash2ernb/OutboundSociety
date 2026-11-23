// ─────────────────────────────────────────────────────────────
//  CURRENT EVENT — edit this one file when the next run opens.
//  Everything on the Home and Events pages reads from here.
// ─────────────────────────────────────────────────────────────

export const currentEvent = {
  name: 'Pit Señor Fiesta Run 2027',
  // The run's own page lives at /events/<slug>/
  slug: 'pit-senyor-fiesta-run-2027',
  // How the name breaks across lines in the big headings
  headingLines: ['Pit Señor', 'Fiesta Run', '2027'],
  tagline: 'Start 2027 with faith, fitness and purpose.',
  // One or two sentences under the big heading on the Events page and the run's page
  heroLede: 'Run 3 km or 10 km through Suba, stay for the lechon, and help rebuild the Señor Santo Niño Chapel.',
  // For search results and social shares (keep under ~160 characters)
  description:
    'Pit Señor Fiesta Run 2027: Jan 3 in Sitio Suba, Poblacion, Liloan, Cebu. 3 km ₱350 or 10 km ₱450, with lechon, raffle and cash prizes. Register online.',
  // A few short paragraphs for the run's page
  story: [
    "Our first run of 2027 is a fiesta run. On January 3, we're running through Sitio Suba in Poblacion, Liloan for the Pit Señor Fiesta Run, organized with the Suba Sto. Niño Association.",
    'Every registration helps raise funds to replace the ceiling of the Señor Santo Niño Chapel in Suba. Pick the 3 km fun run or take on the 10 km, and race for cash prizes if you want to: the top 3 men and women in each distance win up to ₱3,000.',
    'After the finish there is post-run lechon and a raffle with prizes from our sponsors. Walk, jog or run: every finisher counts. Viva Pit Señor!',
  ],
  // Photos from a past run, shown on this run's page until race day
  galleryFrom: 'haunted-night-run-2026',
  // Race day (Philippine time, UTC+8). Used for the countdown and search engines' event listings.
  // The gun-start time hasn't been announced yet, so the countdown runs to the start of the day.
  date: '2027-01-03',
  startsAt: '2027-01-03T00:00:00+08:00',
  registrationOpens: '2026-10-29T00:00:00+08:00',
  // Leave both empty while there is no announced deadline
  registrationClosesAt: '',
  registrationCloses: '',
  dateLabel: 'January 3, 2027',
  venue: 'Sitio Suba',
  address: 'Poblacion, Liloan, Cebu',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Sitio+Suba+Poblacion+Liloan+Cebu',
  fee: 'From ₱350',
  price: '350', // lowest entry fee in pesos, for search engines
  feeNote: '3 km ₱350 · 10 km ₱450',
  distances: '3 km · 10 km',
  registerUrl: 'https://forms.gle/oJAswEfAtsa95upa9',
  registerNote: 'Register online, or onsite at BIG APPLE by the bay.',
  // Set to false once registration closes to swap the button for "Registration closed".
  registrationOpen: true,
  poster: 'pit-senyor-poster', // file name in src/assets/photos (without .jpg)
  heroPhoto: 'hnr26-crew', // wide photo behind the Events page header
  featurePhoto: 'hnr26-joy', // portrait photo beside the event on the Home page
  featurePhotoAlt: 'A runner celebrating at the Haunted Night Run 2026',
  featureTag: 'Our last run · 548 runners',
  // Race-day program. Leave empty until it's announced (the block is hidden when empty).
  schedule: [] as { time: string; label: string }[],
  categories: [
    { name: '3 km', detail: '₱350. Fun run for every age. Top 3 men and women win ₱2,000, ₱1,500 and ₱1,000.' },
    { name: '10 km', detail: '₱450. Top 3 men and women win ₱3,000, ₱2,000 and ₱1,000.' },
  ],
  included: ['Race bib', "Finisher's medal", 'Post-run lechon', 'Raffle entry'],
  notes:
    'Every registration helps raise funds to replace the ceiling of the Señor Santo Niño Chapel. Race-day updates are posted by the Suba Sto. Niño Association on Facebook.',
  // Kids' candy stations (Haunted Night Run only). Hidden when empty.
  candyStations: [] as string[],
  // Logos from the "Our valued sponsors" poster (updated Nov 22, 2026), plus earlier partners
  sponsors: [
    'Little Santorini Mountain Resort',
    'Bakeria Box',
    'BIG APPLE by the bay',
    'Sisterfields Coffee & Pastry',
    'vivo',
    'MJ Royal Enterprises',
    'BLUETTI Power Hub',
    'KentLloyd Autoparts',
    'Supremacy International',
    'Wise Choice Supplements Cebu',
    'Angela Hair and Nail Salon by Beth',
    'Japal Food Manufacturing',
    'Calamansi Zero',
    'ZM Suba Best Lechon Belly',
  ],
  // The sponsor poster, shown on the run page. Leave empty to hide it.
  sponsorPoster: 'pit-senyor-sponsors',
  sponsorPosterAlt:
    'Pit Señor Fiesta Run Suba 2027 sponsors: Wise Choice, MJ Royal Enterprises, ZM Suba Best Lechon Belly, Sisterfields Coffee & Pastry, KentLloyd Autoparts, Supremacy International, Angela Hair and Nail Salon by Beth, Calamansi Zero, Little Santorini Mountain Resort, vivo and Japal Food Manufacturing',
};

// The runs after this one, soonest first. Shown under "Coming up" on the Events page.
// When the current run's registration closes, the general Register buttons (menu, footer,
// home hero) sign people up for the first of these whose registration is open.
export const comingUp = [
  {
    name: 'Virtual Santa Run 2026',
    shortName: 'Santa Run', // for button labels
    headingLines: ['Virtual', 'Santa Run'],
    registerUrl: '',
    registrationOpen: false,
    dateLabel: 'December 25, 2026',
    date: '2026-12-25',
    virtual: true,
    place: 'Anywhere in the world · 10 km · Free',
    blurb:
      "A free 10 km Christmas run. Runners in different countries run on the same day, at the same time, and claim an official virtual race bib. The sign-up form is coming soon.",
    poster: 'santa-run-poster',
    posterAlt: 'Virtual Santa Run poster: a running Santa Claus with a race bib',
    link: 'https://strava.app.link/9qbX0VCni8b',
    linkLabel: 'Join the Strava group',
    soonNote: 'Registration and race-bib details are posted in our Strava group.',
  },
  {
    name: 'Heart & Sole 2027',
    shortName: 'Heart & Sole',
    headingLines: ['Heart & Sole', '2027'],
    registerUrl: '',
    registrationOpen: false,
    dateLabel: 'February 14, 2027',
    date: '2027-02-14',
    virtual: false,
    place: 'Liloan, Cebu · 1 km or 5 km · ₱150',
    blurb:
      "Our Valentine's run is back. ₱150 gets you a race bib and medal, Valentine's sweets, official event photos and a raffle entry. The first 30 registrants get a Valentine's gift from Chen's Creations.",
    poster: 'hs26-medals',
    posterAlt: 'Heart & Sole medals from the 2026 run',
    link: 'https://www.facebook.com/OutboundSociety/',
    linkLabel: 'Get notified on Facebook',
    soonNote: 'Registration opens December 1, 2026 at 9:00 AM.',
  },
];

export type UpcomingRun = (typeof comingUp)[number];
