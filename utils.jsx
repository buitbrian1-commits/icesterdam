/* global React */
const { useState, useEffect, useRef, useMemo } = React;

// --- Icons (inline SVG, stroke=currentColor) ---------------------------------
const Icon = {
  Arrow: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14"/><path d="m6 13 6 6 6-6"/></svg>,
  ArrowRight: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>,
  Utensils: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 2v7a3 3 0 0 0 3 3v10"/><path d="M6 2v10"/><path d="M9 2v7a3 3 0 0 1-3 3"/><path d="M14 2c-1 0-3 1-3 5s2 5 3 5v10"/><path d="M17 12c1.2 0 4-1 4-5 0-3-2-5-4-5"/></svg>,
  Wine: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 22h8"/><path d="M12 15v7"/><path d="M7 2h10l-1 9a4 4 0 0 1-8 0Z"/></svg>,
  Star: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="m12 2 2.6 6.6L22 9.5l-5.5 4.7L18.2 22 12 18.3 5.8 22l1.7-7.8L2 9.5l7.4-.9Z"/></svg>,
  Bed: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 20v-8a2 2 0 0 1 2-2h14a4 4 0 0 1 4 4v6"/><path d="M2 16h20"/><circle cx="7" cy="13" r="2"/></svg>,
  Compass: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="m15 9-2 6-4 2 2-6Z"/></svg>,
  Menu: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>,
  Close: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>,
  Sparkle: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>,
  ChevronDown: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6 9 6 6 6-6"/></svg>,
  RotateCcw: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  // Weather icons — lucide paths, MIT-licensed
  Sun: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
  Cloud: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17.5 19a4.5 4.5 0 1 0-1.1-8.9A6 6 0 1 0 6 14.5"/><path d="M17.5 19H9a5 5 0 0 1-.5-9.97"/></svg>,
  CloudRain: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>,
  CloudSnow: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/></svg>,
  CloudDrizzle: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v1"/><path d="M8 14v1"/><path d="M16 19v1"/><path d="M16 14v1"/><path d="M12 21v1"/><path d="M12 16v1"/></svg>,
  CloudLightning: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>,
};

// --- Helpers -----------------------------------------------------------------
const useScrollY = () => {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return y;
};

const useScrollProgress = () => {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? window.scrollY / max : 0);
    };
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    window.addEventListener('resize', fn);
    return () => { window.removeEventListener('scroll', fn); window.removeEventListener('resize', fn); };
  }, []);
  return p;
};

const useReveal = () => {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }),
      { rootMargin: '-60px' }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
};

// Scroll-linked progress for an element. Returns 0 as the element enters from
// below and 1 once it has crossed the upper trigger. Drives perspective tilt
// and scale on day cards. Bails before setState when the value hasn't moved
// meaningfully — keeps off-screen cards from re-rendering on every scroll frame.
const useScrollLinked = () => {
  const ref = useRef(null);
  const last = useRef(0);
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const enter = vh;
      const settle = vh * 0.25;
      const raw = (enter - r.top) / (enter - settle);
      const v = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      if (Math.abs(v - last.current) > 0.005) {
        last.current = v;
        setP(v);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return [ref, p];
};

// --- Trip-date / today helpers ----------------------------------------------
// Each destKey -> ordered ISO dates for its day cards. Anchored to the
// destination's local timezone so "today" matches the calendar at the trip
// location, not at the user's home.
const TRIP_DATES = {
  iceland:   ['2026-05-23', '2026-05-24', '2026-05-25', '2026-05-26', '2026-05-27'],
  amsterdam: ['2026-05-28', '2026-05-29', '2026-05-30'],
};
const TRIP_TZ = { iceland: 'Atlantic/Reykjavik', amsterdam: 'Europe/Amsterdam' };
const TRIP_START = '2026-05-23';
const TRIP_END   = '2026-05-31'; // includes return-travel day

const dayDate = (destKey, n) => TRIP_DATES[destKey]?.[n - 1];

// YYYY-MM-DD in a given IANA timezone using Intl.DateTimeFormat.
const ymdInTz = (tz) => {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return fmt.format(new Date());
};

// Whole days from a -> b (both 'YYYY-MM-DD'); midday UTC anchor avoids DST drift.
const daysBetween = (a, b) => {
  const da = new Date(a + 'T12:00:00Z');
  const db = new Date(b + 'T12:00:00Z');
  return Math.round((db - da) / 86400000);
};

// Trip status used for the global takeoff/home pill and TODAY auto-focus.
const tripStatus = () => {
  // Check each destination in its own tz to find a matching day card.
  for (const dest of ['iceland', 'amsterdam']) {
    const today = ymdInTz(TRIP_TZ[dest]);
    const idx = TRIP_DATES[dest].indexOf(today);
    if (idx >= 0) return { state: 'during', destKey: dest, dayN: idx + 1 };
  }
  const today = ymdInTz('Atlantic/Reykjavik');
  if (today < TRIP_START) return { state: 'before', days: daysBetween(today, TRIP_START) };
  if (today > TRIP_END)   return { state: 'after',  days: daysBetween(TRIP_END, today) };
  // Inside trip window but no card matches (e.g. travel day 5-31)
  return { state: 'after', days: 0 };
};

// Back-compat: kept for existing callers (dayStatus etc.)
const tripDayOf = () => {
  const s = tripStatus();
  if (s.state === 'before') return { label: `${s.days}d until takeoff`, idx: 0 };
  if (s.state === 'after')  return { label: 'Trip complete', idx: 9 };
  const offset = s.destKey === 'iceland' ? 0 : 5;
  return { label: `Day ${offset + s.dayN} of 9`, idx: offset + s.dayN };
};

// Map a day's "current" status by trip-day index
const dayStatus = (destKey, dayN) => {
  const td = tripDayOf().idx;
  const offset = destKey === 'iceland' ? 0 : 5;
  const tripIdx = offset + dayN; // 1..9
  if (tripIdx < td) return 'past';
  if (tripIdx === td) return 'today';
  return 'future';
};

// --- Weather (Open-Meteo) ---------------------------------------------------
// Three queries: Reykjavík + Selfoss for Iceland days, Amsterdam for AMS days.
// Cached in localStorage with a 6h TTL.
const WEATHER_CACHE_KEY = 'wx-cache-v2-f';
const WEATHER_TTL_MS = 6 * 60 * 60 * 1000;
const WEATHER_LEAD_DAYS = 14; // Open-Meteo only forecasts ~14d out

const WEATHER_QUERIES = [
  { id: 'rkv', lat: 64.1466, lon: -21.9426, tz: 'Atlantic/Reykjavik', start: '2026-05-23', end: '2026-05-27' },
  { id: 'sel', lat: 63.9347, lon: -20.9956, tz: 'Atlantic/Reykjavik', start: '2026-05-25', end: '2026-05-26' },
  { id: 'ams', lat: 52.3676, lon: 4.9041,   tz: 'Europe/Amsterdam', start: '2026-05-28', end: '2026-05-30' },
];

// (destKey, dayN) -> { id, date }
const WEATHER_LOOKUP = {
  iceland: {
    1: { id: 'rkv', date: '2026-05-23' },
    2: { id: 'rkv', date: '2026-05-24' },
    3: { id: 'sel', date: '2026-05-25' },
    4: { id: 'sel', date: '2026-05-26' },
    5: { id: 'rkv', date: '2026-05-27' },
  },
  amsterdam: {
    1: { id: 'ams', date: '2026-05-28' },
    2: { id: 'ams', date: '2026-05-29' },
    3: { id: 'ams', date: '2026-05-30' },
  },
};

// Weathercode -> Icon name. Per Open-Meteo WMO codes.
const weatherIconFor = (code) => {
  if (code == null) return null;
  if (code === 0) return 'Sun';
  if (code <= 3 || code === 45 || code === 48) return 'Cloud';
  if (code >= 51 && code <= 67) return 'CloudRain';
  if (code >= 71 && code <= 77) return 'CloudSnow';
  if (code >= 80 && code <= 82) return 'CloudDrizzle';
  if (code >= 95) return 'CloudLightning';
  return 'Cloud';
};

// One fetch for all three locations, cached in localStorage. Returns:
//   { forecast, loading, outOfRange }
// `outOfRange` is true when today is >14d before the trip — caller can show
// the "Forecast available May 9" placeholder. `forecast` is keyed by query id
// then by ISO date.
const useWeather = () => {
  const [state, setState] = useState({ forecast: null, loading: true, outOfRange: false });

  useEffect(() => {
    let cancelled = false;

    // Out-of-range gate: today > 14d before trip start
    const today = ymdInTz('Atlantic/Reykjavik');
    if (daysBetween(today, TRIP_START) > WEATHER_LEAD_DAYS) {
      setState({ forecast: null, loading: false, outOfRange: true });
      return;
    }

    // Cache hit?
    try {
      const cached = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.fetchedAt < WEATHER_TTL_MS) {
        setState({ forecast: cached.data, loading: false, outOfRange: false });
        return;
      }
    } catch {}

    // Fetch all three locations in parallel; partial failures degrade silently.
    Promise.all(WEATHER_QUERIES.map((q) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${q.lat}&longitude=${q.lon}` +
        `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
        `&temperature_unit=fahrenheit` +
        `&timezone=${encodeURIComponent(q.tz)}` +
        `&start_date=${q.start}&end_date=${q.end}`;
      return fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => ({ id: q.id, json }))
        .catch(() => ({ id: q.id, json: null }));
    })).then((results) => {
      if (cancelled) return;
      const data = {};
      for (const { id, json } of results) {
        if (!json || !json.daily) continue;
        const { time, temperature_2m_max, temperature_2m_min, weathercode } = json.daily;
        data[id] = {};
        for (let i = 0; i < time.length; i++) {
          data[id][time[i]] = {
            tmax: Math.round(temperature_2m_max[i]),
            tmin: Math.round(temperature_2m_min[i]),
            code: weathercode[i],
          };
        }
      }
      const ok = Object.keys(data).length > 0;
      setState({ forecast: ok ? data : null, loading: false, outOfRange: false });
      if (ok) {
        try { localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ data, fetchedAt: Date.now() })); } catch {}
      }
    });

    return () => { cancelled = true; };
  }, []);

  // Look up forecast for a destination + day number.
  const getFor = (destKey, dayN) => {
    if (!state.forecast) return null;
    const lk = WEATHER_LOOKUP[destKey] && WEATHER_LOOKUP[destKey][dayN];
    if (!lk) return null;
    const bucket = state.forecast[lk.id];
    return (bucket && bucket[lk.date]) || null;
  };

  return { getFor, loading: state.loading, outOfRange: state.outOfRange };
};

Object.assign(window, {
  Icon, useScrollY, useScrollProgress, useReveal,
  tripDayOf, dayStatus, tripStatus, dayDate,
  useWeather, weatherIconFor,
  TRIP_DATES, TRIP_TZ, TRIP_START, TRIP_END,
});
