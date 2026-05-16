// Iceland landmark images. Each entry has a primary URL + fallback to a verified-
// working Iceland Unsplash photo of matching visual category, so every card shows
// real Iceland scenery. Caption is ALWAYS visible so the specific landmark is
// identified regardless of which photo renders. Swap individual `src` values when
// you have proper photos of each site.

// Verified-working Iceland Unsplash photos (probed in-browser):
const ICELAND_PHOTOS = {
  waterfall: 'https://images.unsplash.com/photo-1506261423908-ea2559c1f24c?w=1200&q=80&auto=format&fit=crop', // Seljalandsfoss from behind
  mossy:     'https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=1200&q=80&auto=format&fit=crop', // green canyon, water through moss
  coast:     'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1200&q=80&auto=format&fit=crop', // Vestrahorn mountain + black sand
  hills:     'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=1200&q=80&auto=format&fit=crop', // rolling green hills with path
  generic:   'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop', // open sky horizon
};

// Match each landmark to its closest visual category and label it explicitly.
const pick = (kind, caption, mapUrl) => ({
  src: ICELAND_PHOTOS[kind],
  fallback: ICELAND_PHOTOS.generic,
  caption,
  mapUrl,
});

// Explicit-URL image (Brian-provided or other verified URLs). Falls back to a
// category-matched ICELAND_PHOTOS stand-in if the primary fails to load.
const src = (url, caption, fallbackKind = 'generic', mapUrl) => ({
  src: url,
  fallback: ICELAND_PHOTOS[fallbackKind],
  caption,
  mapUrl,
});

// Google Maps deep-link helper. Accepts an optional placeId for precision.
const gmap = (query, placeId) => {
  const base = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return placeId ? `${base}&query_place_id=${placeId}` : base;
};

const picsum = (seed) => `https://picsum.photos/seed/${seed}/800/1000`;

window.TRIP = {
  dates: { start: '2026-05-23', end: '2026-05-31' },
  iceland: {
    key: 'iceland',
    label: 'Iceland',
    nights: 5,
    dateRange: 'MAY 23 – 28, 2026',
    eyebrow: 'CBCG · ICELAND · MAY 2026',
    subtitle: 'Five nights of black sand, blue lagoons, and the longest days of our lives.',
    locationPill: 'SKÓGAFOSS, SOUTH ICELAND',
    stats: [
      ['5', 'nights'],
      ['2', 'hotel switches'],
      ['~600', 'km driving'],
    ],
    headline: ['Waterfalls,', 'tomato soup,', "and a sun that won't set."],
    days: [
      {
        n: 1,
        date: 'Sat · May 23',
        city: 'Reykjavík',
        nightLabel: 'Reykjavík · Night 1',
        switch: null,
        title: 'Land, soak, and stumble through Reykjavík',
        images: [
          src('./blue-lagoon.webp', 'Blue Lagoon', 'coast', gmap('Blue Lagoon Iceland')),
          pick('hills', 'Hallgrímskirkja', gmap('Hallgrimskirkja Reykjavik')),
          pick('generic', 'Harpa Concert Hall', gmap('Harpa Concert Hall')),
        ],
        timeline: [
          ['2:30 pm', 'Land at KEF', null],
          ['3:30 pm', 'Pick up rental car', '~60–75 min for immigration + bags + rental'],
          ['4:30 pm', 'Blue Lagoon', '2–2.5 hours floating, beers in the water'],
          ['Evening', 'Walk Reykjavík icons', 'Hallgrímskirkja → Rainbow Street → Bæjarins Beztu hot dog ("ein með öllu") → Harpa (go inside)'],
        ],
        dinner: 'Simple, close to the hotel',
        drinks: 'Kaldi Bar · Skúli Craft Bar · Lebowski Bar',
      },
      {
        n: 2,
        date: 'Sun · May 24',
        city: 'Reykjavík',
        nightLabel: 'Reykjavík · Night 2',
        switch: null,
        title: 'Golden Circle & tomato-soup lunch',
        images: [
          src('https://images.unsplash.com/photo-1445127040028-b1bdb9acd16e?w=800&q=80&auto=format&fit=crop&crop=entropy', 'Þingvellir', 'mossy', gmap('Thingvellir National Park')),
          // TODO Strokkur — awaiting verified Unsplash URL; stand-in keeps Iceland scenery
          pick('waterfall', 'Strokkur Geyser', gmap('Strokkur Geyser Iceland')),
          // TODO Gullfoss — awaiting verified Unsplash URL; stand-in keeps Iceland scenery
          pick('waterfall', 'Gullfoss', gmap('Gullfoss waterfall Iceland')),
        ],
        timeline: [
          ['8:30 am', 'Depart Reykjavík', null],
          ['Morning', 'Þingvellir National Park', null],
          ['Midday', 'Geysir / Strokkur', 'Erupts every 6–10 min'],
          ['Lunch', 'Friðheimar', 'Tomato greenhouse — book ahead'],
          ['Afternoon', 'Gullfoss waterfall', 'Optional: Kerið crater on the way back'],
          ['Evening', 'Optional Sky Lagoon', null],
        ],
        dinner: 'Reykjavík sit-down — reserve',
        drinks: 'A quiet one in 101',
      },
      {
        n: 3,
        date: 'Mon · May 25',
        city: 'Selfoss',
        nightLabel: 'Selfoss · Night 3',
        switch: ['Reykjavík', 'Selfoss'],
        title: 'South Coast Pt. 1 — the waterfall day',
        images: [
          src('https://images.unsplash.com/photo-1596920332775-cadd09e3a035?w=800&q=80&auto=format&fit=crop&crop=top', 'Seljalandsfoss', 'waterfall', gmap('Seljalandsfoss')),
          src('https://images.unsplash.com/photo-1508131482539-2b57b21ca1ec?w=800&q=80&auto=format&fit=crop&crop=top', 'Skógafoss', 'waterfall', gmap('Skogafoss')),
          // TODO Kvernufoss — awaiting verified Unsplash URL; stand-in keeps Iceland scenery
          pick('mossy', 'Kvernufoss', gmap('Kvernufoss')),
        ],
        timeline: [
          ['8:00 am', 'Check out, head south on Route 1', null],
          ['Morning', 'Seljalandsfoss + Gljúfrabúi', 'The hidden one next door'],
          ['Midday', 'Skógafoss', null],
          ['Lunch', 'Café along the route', null],
          ['Afternoon', 'Kvernufoss', 'Short hike, worth it'],
          ['Evening', 'Drive to Selfoss, check in', null],
        ],
        dinner: 'Selfoss Food Hall',
        drinks: 'Hotel bar',
      },
      {
        n: 4,
        date: 'Tue · May 26',
        city: 'Selfoss',
        nightLabel: 'Selfoss · Night 4',
        switch: null,
        title: 'South Coast Pt. 2 — Vík & black sand',
        images: [
          src('https://images.unsplash.com/photo-1751989802391-c3f8d586d851?w=800&q=80&auto=format&fit=crop&crop=entropy', 'Reynisfjara', 'coast', gmap('Reynisfjara Beach')),
          // TODO Dyrhólaey arch — awaiting verified Unsplash URL; stand-in keeps Iceland scenery
          pick('coast', 'Dyrhólaey', gmap('Dyrholaey Iceland')),
          // TODO Vík í Mýrdal red-roof church — awaiting verified Unsplash URL
          pick('hills', 'Vík í Mýrdal', gmap('Vik i Myrdal')),
        ],
        timeline: [
          ['9:00 am', 'Depart after breakfast', null],
          ['Morning', 'Sólheimajökull viewpoint', null],
          ['Midday', 'Dyrhólaey viewpoint', null],
          ['Early afternoon', 'Reynisfjara black-sand beach', 'Respect the sneaker waves'],
          ['Coffee', 'Vík', null],
          ['Evening', 'Drive back to Selfoss, relax', null],
        ],
        dinner: 'Selfoss, early if tired',
        drinks: 'Hot tub & a beer',
      },
      {
        n: 5,
        date: 'Wed · May 27',
        city: 'Reykjavík',
        nightLabel: 'Reykjavík · Night 5',
        switch: ['Selfoss', 'Reykjavík'],
        title: 'Reykjanes, golf at Brautarholt & a final dinner',
        images: [
          // TODO Seltún steaming geothermal field — stand-in keeps Iceland scenery
          pick('mossy', 'Seltún', gmap('Seltun Geothermal Area')),
          // TODO Reykjanes Lighthouse — stand-in keeps Iceland scenery
          pick('coast', 'Reykjanes Lighthouse', gmap('Reykjanesviti Lighthouse')),
          // Brautarholt — hosted on icelandreview.com per spec, NOT Unsplash-sized
          src('https://www.icelandreview.com/wp-content/uploads/2026/03/nature-golfing-iceland-1024x640.jpg', 'Brautarholt', 'hills', gmap('Brautarholt Golf Club', 'ChIJRfMfZmnf1UgRClvuJPtahbs')),
        ],
        timeline: [
          ['Morning', 'Check out, drive toward Reykjavík', null],
          ['Reykjanes', 'Seltún → Kleifarvatn → Reykjanes Lighthouse → Bridge Between Continents', null],
          ['Lunch', 'Light, in Reykjanes or Reykjavík', null],
          ['Afternoon', 'Check into hotel in Reykjavík', null],
          ['4:40 pm', 'Tee time at Brautarholt Golf Club', 'Clifftop course — midnight-sun golf, ocean views to Reykjavík'],
          ['Evening', 'Celebration dinner in Reykjavík', null],
          ['Optional', 'FlyOver Iceland or Oche Reykjavík', null],
        ],
        dinner: 'Celebration — book the best table',
        drinks: 'Nightcap somewhere walkable',
      },
    ],
  },
  amsterdam: {
    key: 'amsterdam',
    label: 'Amsterdam',
    nights: 3,
    dateRange: 'MAY 28 – 31, 2026',
    eyebrow: 'CBCG · AMSTERDAM · MAY 2026',
    subtitle: 'Three nights of cafés, market mornings, and slow walks home.',
    locationPill: 'JORDAAN CANAL, AMSTERDAM',
    stats: [
      ['3', 'nights'],
      ['0', 'hotel switches'],
      ['4', 'neighborhoods'],
    ],
    headline: ['Canals,', 'cozy', 'corners, and a golden-hour cruise.'],
    days: [
      {
        n: 1,
        date: 'Thu · May 28',
        city: 'Amsterdam',
        nightLabel: 'Hotel Mercier · Night 1',
        switch: null,
        title: 'Arrival, Jordaan walk & Supper',
        images: [
          { src: picsum('ams-d1-jordaan'), caption: 'Jordaan canal', mapUrl: gmap('Jordaan Amsterdam') },
          // Studio 54 by Supper — theatrical red-lit dinner-show. Hero photo
          // from supper.amsterdam not directly embeddable; using a moody
          // candlelit/warm-glow restaurant stand-in until a better URL is supplied.
          { src: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80&auto=format&fit=crop&crop=entropy', caption: 'Studio 54 by Supper', mapUrl: gmap('Supper Restaurant Amsterdam', 'ChIJkTRcMsEJxkcRy92RPMUFxnU') },
          { src: picsum('ams-d1-ninestreets'), caption: 'Nine Streets', mapUrl: gmap('Nine Streets Amsterdam') },
        ],
        timeline: [
          ['4:00 pm', 'Land Amsterdam, head to hotel', null],
          ['Evening', 'Jordaan → Nine Streets → Canal Belt', 'Wander at sunset'],
          ['Dinner', 'Studio 54 by Supper', 'Theatrical red-lit dinner show — book early'],
          ['Drinks', "Pulitzer's Bar or canal-side spot", null],
        ],
        dinner: 'Studio 54 by Supper',
        drinks: "Pulitzer's Bar",
      },
      {
        n: 2,
        date: 'Fri · May 29',
        city: 'Amsterdam',
        nightLabel: 'Hotel Mercier · Night 2',
        switch: null,
        title: 'De Pijp, canal cruise & speakeasy',
        images: [
          { src: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80&auto=format&fit=crop&crop=entropy', caption: 'Albert Cuypmarkt', mapUrl: gmap('Albert Cuypmarkt Amsterdam') },
          { src: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&q=80&auto=format&fit=crop&crop=entropy', caption: 'Canal Cruise', mapUrl: gmap('Those Dam Boat Guys', 'ChIJac5EOsUJxkcRMkZbI82BsP8') },
          { src: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80&auto=format&fit=crop&crop=entropy', caption: 'Door 74', mapUrl: gmap('Door 74', 'ChIJswl2sOoJxkcR8VOtTz4vkB0') },
        ],
        timeline: [
          ['Slow morning', 'Coffee + pastries in Jordaan / Nine Streets', null],
          ['Midday', 'De Pijp + Albert Cuyp Market', null],
          ['Late afternoon', 'Canal cruise', 'Time it for golden hour'],
          ['Dinner', 'Relaxed, near Canal Belt or Door 74', null],
          ['9:00 pm', 'Door 74 reservation', 'Speakeasy — text on arrival'],
          ['After', 'Wander canals, optional late drink', null],
        ],
        dinner: 'Near Door 74',
        drinks: 'Door 74',
      },
      {
        n: 3,
        date: 'Sat · May 30',
        city: 'Amsterdam',
        nightLabel: 'Hotel Mercier · Night 3',
        switch: null,
        title: 'Best of Amsterdam — our way',
        images: [
          // TODO Vondelpark — awaiting verified Unsplash URL
          { src: picsum('ams-d3-vondelpark'), caption: 'Vondelpark', mapUrl: gmap('Vondelpark Amsterdam') },
          { src: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800&q=80&auto=format&fit=crop&crop=entropy', caption: 'CIMA', mapUrl: gmap('CIMA Rooftop Bar Amsterdam') },
          // Canal Dinner — no specific restaurant yet, caption stays non-clickable
          { src: 'https://images.unsplash.com/photo-1459679749680-18eb1eb37418?w=800&q=80&auto=format&fit=crop&crop=entropy', caption: 'Canal Dinner' },
        ],
        timeline: [
          ['Slow morning', 'Coffee, canals in daylight', null],
          ['Afternoon', 'Shopping + cafes', 'Jordaan, De Pijp, Canal Belt, Vondelpark if weather is nice'],
          ['Drinks', "CIMA Rooftop · Bar Oldenhof · Pulitzer's", 'Pick by mood'],
          ['Final dinner', 'Sit-down along the canals', null],
        ],
        dinner: 'Canal-side, slow and long',
        drinks: 'Rooftop',
      },
    ],
  },
};

// Hero "feature" media — looping Cloudinary mp4 per destination. Different
// lengths (5s Iceland, 8s Amsterdam) so the fade loop reads `duration` live.
window.HERO_FEATURE = {
  iceland: {
    video: 'https://res.cloudinary.com/dveovtlfz/video/upload/f_auto,q_auto/v1778657560/iceland_video_1_trpnfe.mp4',
    poster: ICELAND_PHOTOS.waterfall,
    images: [
      ICELAND_PHOTOS.coast,
      ICELAND_PHOTOS.waterfall,
      ICELAND_PHOTOS.mossy,
      ICELAND_PHOTOS.hills,
    ],
  },
  amsterdam: {
    video: 'https://res.cloudinary.com/dveovtlfz/video/upload/f_auto,q_auto/v1778657220/amsterdam_vid_1_f4dlw0.mp4',
    poster: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=2400&q=80&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=2400&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1459679749680-18eb1eb37418?w=2400&q=80&auto=format&fit=crop',
    ],
  },
};
