// News and stories, newest first. Each one gets its own page at /news/<slug>/.
// Photos are file names in src/assets/photos (without .jpg).
export const news = [
  {
    slug: 'duster-king-lpg-haunted-night-run-2026',
    // The run this story is about (links the two pages together)
    run: 'haunted-night-run-2026',
    published: '2026-11-23',
    title: 'The scariest costume at the Haunted Night Run? An LPG tank.',
    headingLines: ['The scariest', 'costume was', 'an LPG tank.'],
    // Short version for cards, search results and social shares (under ~160 characters)
    description:
      'At the Haunted Night Run 2026, the Duster King skipped the ghouls and ran barefoot with an LPG tank. The photo went viral and made the news across Cebu.',
    dek: 'At the Haunted Night Run 2026, the Duster King skipped the ghouls and ran barefoot carrying an LPG tank. The photo went viral, and the news followed.',
    cover: 'duster-king-fotopedia',
    coverAlt: 'The Duster King running barefoot at night with an LPG tank on his shoulder, smiling',
    coverCredit: 'Photo: Fotopedia',
    body: [
      {
        p: 'On November 7, 2026, 548 runners lined up at Bakeria Box in Bajac, Liloan for the Haunted Night Run, the biggest crowd an Outbound Society run has ever drawn. There were witches, zombies, ghosts, fairies and at least one nun. But the runner everyone was talking about the next morning had no mask and no fake blood.',
      },
      {
        p: 'The Duster King, a familiar face at Cebu races who is known for running barefoot and for the props he carries along the route, ran the night in a checkered dress with a full-size LPG cylinder on his shoulder. His point needed no explanation: forget ghosts, the thing that really scares Filipino households right now is the price of cooking gas.',
      },
      {
        photo: 'duster-king',
        alt: 'The Duster King laughing as he runs with a green LPG cylinder on his shoulder, other runners behind him',
        credit: 'Photo: Iskwad',
      },
      { h: 'From the race route to the news' },
      {
        p: 'Photos of him from Fotopedia and Iskwad, two of the photographers covering the run, spread fast on Facebook. Balitang Bisdak featured him with a line that sums it up: not a witch, not a zombie, not a killer clown, but an LPG tank was what frightened the crowd. DotTv Nationwide picked up the story too, and Liloan Beam reported the record 548-runner turnout.',
      },
      {
        p: 'The cylinder was a real one, borrowed for the night from Phoenix Super LPG Liloan & Compostela and Brew & Blend Cafe, two of the run’s 34 sponsors. Carrying it for 5 km, barefoot, is a workout we do not recommend trying at home.',
      },
      { h: 'Why it matters to us' },
      {
        p: 'We started Outbound Society to make runs that are about the people who show up, not the podium. A runner turning a costume run into a joke the whole country got is exactly that.',
      },
      {
        quote:
          'One of the biggest goals of Outbound Society has always been to create a meaningful impact in our local community. It’s never been about how much we earn, but how many lives we touch.',
        cite: 'Outbound Society, after the run made the news',
      },
      {
        p: 'Thank you to the Duster King for the laughs, to Fotopedia, Iskwad and MoTo-JeT Shots for the photos, and to Balitang Bisdak, DotTv Nationwide and Liloan Beam for telling the story. See you at the next start line.',
      },
    ],
    // Where the story ran. Links open on Facebook.
    sources: [
      { name: 'Balitang Bisdak', href: 'https://www.facebook.com/photo/?fbid=1567087795453542&set=a.600935752068756' },
      { name: 'DotTv Nationwide', href: 'https://www.facebook.com/dottvlive/posts/pfbid0AHJHkStH5gZSSdP5Zmmxsnhx173NmtDMQEttKtQfWCHT4MHvqnfvfDakpxnwTjJwl' },
      { name: 'Outbound Society on Facebook', href: 'https://www.facebook.com/OutboundSociety/posts/pfbid02LnugXkZBeZ2aWWPW84rqzttxVuHsxCpmwogffoiMn5Gf1uZdeGkgmAxMd1LGvBMcl' },
    ],
  },
];

export type NewsItem = (typeof news)[number];
