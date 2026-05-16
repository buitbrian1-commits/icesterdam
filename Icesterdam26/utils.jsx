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
// and scale on day cards.
const useScrollLinked = () => {
  const ref = useRef(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when card's top is at viewport bottom, 1 when card's top is ~25% from top.
      const enter = vh;
      const settle = vh * 0.25;
      const raw = (enter - r.top) / (enter - settle);
      setP(Math.max(0, Math.min(1, raw)));
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

// Compute "Day X of 9" relative to today
const tripDayOf = () => {
  const start = new Date('2026-05-23T00:00:00');
  const end = new Date('2026-05-31T23:59:59');
  const now = new Date();
  if (now < start) {
    const days = Math.ceil((start - now) / 86400000);
    return { label: `${days}d until takeoff`, idx: 0 };
  }
  if (now > end) return { label: 'Trip complete', idx: 9 };
  const idx = Math.floor((now - start) / 86400000) + 1;
  return { label: `Day ${idx} of 9`, idx };
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

Object.assign(window, { Icon, useScrollY, useScrollProgress, useReveal, tripDayOf, dayStatus });
