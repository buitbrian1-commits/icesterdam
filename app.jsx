/* global React, ReactDOM, TRIP, ScrollProgress, Nav, Hero, TripOverview, DayCards, Footer, tripStatus */
const { useState, useEffect } = React;

function App() {
  // If today is during the trip, default the page to that destination so we
  // can scroll to "today" without first forcing a route change.
  const [dest, setDest] = useState(() => {
    const s = tripStatus();
    return s.state === 'during' ? s.destKey : 'iceland';
  });
  const [transitioning, setTransitioning] = useState(false);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.dataset.theme = dest;
  }, [dest]);

  // First-load-of-session auto-focus on today's day card. Tracked via
  // sessionStorage so route switches and re-renders don't scroll-jack.
  useEffect(() => {
    const s = tripStatus();
    if (s.state !== 'during') return;
    if (sessionStorage.getItem('todayScrolled')) return;
    sessionStorage.setItem('todayScrolled', '1');
    // Wait for DayCards to mount + reveal animations to settle.
    setTimeout(() => {
      const el = document.getElementById(`${s.destKey}-day-${s.dayN}`);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 350);
  }, []);

  // Smooth crossfade when destination changes. Accepts an optional after-callback
  // so the day-navigator can scroll after the dest swap completes.
  const handleSetDest = (next, after) => {
    if (next === dest) {
      after?.();
      return;
    }
    setTransitioning(true);
    setTimeout(() => {
      setDest(next);
      window.scrollTo({ top: 0, behavior: 'auto' });
      requestAnimationFrame(() => {
        setTransitioning(false);
        if (after) setTimeout(after, 60); // wait for day cards to mount
      });
    }, 280);
  };

  const goToDay = (targetDest, n) => {
    handleSetDest(targetDest, () => {
      const el = document.getElementById(`${targetDest}-day-${n}`);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  };

  const data = TRIP[dest];

  return (
    <div className="min-h-screen relative" style={{ background: 'hsl(var(--bg))', color: 'hsl(var(--fg))' }}>
      <ScrollProgress />
      <Nav dest={dest} setDest={handleSetDest} goToDay={goToDay} />
      <main className={`transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`} key={dest}>
        <Hero data={data} dest={dest} />
        <DayCards data={data} dest={dest} />
        <Footer dest={dest} setDest={handleSetDest} />
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
