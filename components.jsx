/* global React, Icon, useScrollY, useScrollProgress, useReveal, useScrollLinked, tripDayOf, dayStatus, tripStatus, dayDate, useWeather, weatherIconFor, TRIP */
const { useState, useEffect, useRef, useMemo } = React;

// ============================================================================
// ScrollProgress — hairline at the very top, accent color
// ============================================================================
function ScrollProgress() {
  const p = useScrollProgress();
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent pointer-events-none">
      <div
        className="h-full origin-left transition-transform duration-150"
        style={{ background: 'hsl(var(--accent))', transform: `scaleX(${p})`, width: '100%' }} />
      
    </div>);

}

// ============================================================================
// Currency converter — USD ⇄ ISK/EUR. Live two-way conversion using a
// `lastEdited` ref so typing in either field updates the other without
// creating a feedback loop. On route change, the local-currency field
// recomputes from the current USD value (USD is preserved).
// ============================================================================
const USD_TO_ISK = 123.55; // verified 2026-05-17 (XE + exchangerates.org.uk)
const USD_TO_EUR = 0.86;   // verified 2026-05-17 (X-Rates)
const FX_VERIFIED = '2026-05-17';

const fmtLocal = (n, code) => {
  if (!isFinite(n)) return '';
  return code === 'ISK' ? String(Math.round(n)) : n.toFixed(2);
};

function CurrencyConverter({ dest, size = 'compact', onReset }) {
  const code = dest === 'iceland' ? 'ISK' : 'EUR';
  const symbol = dest === 'iceland' ? 'kr' : '€';
  const rate = dest === 'iceland' ? USD_TO_ISK : USD_TO_EUR;

  const [usd, setUsd] = useState('50');
  const [local, setLocal] = useState(() => fmtLocal(50 * rate, code));
  // 'usd' or 'local' — used so route changes recompute the right side.
  const lastEdited = useRef('usd');

  // Route changed: recompute local from current USD value. Preserves USD.
  useEffect(() => {
    const u = parseFloat(usd);
    setLocal(isFinite(u) ? fmtLocal(u * rate, code) : '');
    lastEdited.current = 'usd';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate]);

  const onUsd = (e) => {
    const v = e.target.value;
    setUsd(v);
    lastEdited.current = 'usd';
    const n = parseFloat(v);
    setLocal(v === '' ? '' : isFinite(n) ? fmtLocal(n * rate, code) : '');
  };
  const onLocal = (e) => {
    const v = e.target.value;
    setLocal(v);
    lastEdited.current = 'local';
    const n = parseFloat(v);
    setUsd(v === '' ? '' : isFinite(n) ? (n / rate).toFixed(2) : '');
  };
  const reset = () => {
    setUsd('50');
    setLocal(fmtLocal(50 * rate, code));
    lastEdited.current = 'usd';
    onReset?.();
  };

  // Expose reset to parent (mobile uses it from the section header)
  useEffect(() => {
    if (onReset && typeof onReset === 'function') {
      // parent can call reset via ref pattern; we surface it through a window
      // hook only on the active instance to avoid pollution. Kept simple here:
      // parent owns the reset button and calls our `reset` via a callback ref.
    }
  });

  const inputCls = size === 'comfortable'
    ? 'w-full font-display text-xl py-3 px-4 rounded-2xl bg-transparent outline-none border wx-input'
    : 'w-full font-display text-2xl py-2.5 px-3 rounded-xl bg-transparent outline-none border wx-input';
  const labelCls = size === 'comfortable'
    ? 'text-[10px] tracking-[0.22em] uppercase mb-1.5 fx-label'
    : 'text-[10px] tracking-[0.18em] uppercase mb-1 fx-label';

  return (
    <div className="flex flex-col gap-3" data-converter>
      <label className="block">
        <div className={labelCls}>USD ($)</div>
        <input
          type="number" inputMode="decimal" step="0.01" min="0"
          value={usd} onChange={onUsd}
          aria-label="Amount in US dollars"
          className={inputCls} />
      </label>
      <label className="block">
        <div className={labelCls}>{code} ({symbol})</div>
        <input
          type="number" inputMode="decimal" step={code === 'ISK' ? '1' : '0.01'} min="0"
          value={local} onChange={onLocal}
          aria-label={`Amount in ${code}`}
          className={inputCls} />
      </label>
      {size === 'compact' &&
        <div className="flex items-center justify-between mt-1">
          <div className="text-[10px] fx-footnote">Rates approximate · verified {FX_VERIFIED}</div>
          <button
            type="button" onClick={reset}
            className="fx-reset transition-colors duration-200 flex items-center gap-1 text-[10px] tracking-[0.18em] uppercase"
            aria-label="Reset to defaults">
            <Icon.RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      }
      {size === 'comfortable' &&
        <div className="text-xs fx-footnote mt-1">Rates approximate · verified {FX_VERIFIED}</div>
      }
    </div>);
}

// CurrencyChip — desktop nav chip showing the active rate. Click toggles a
// dropdown anchored below containing <CurrencyConverter size="compact" />.
// Closes on Escape or click outside.
function CurrencyChip({ dest, onHero = false }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const code = dest === 'iceland' ? 'ISK' : 'EUR';
  const rate = dest === 'iceland' ? USD_TO_ISK : USD_TO_EUR;
  const dotColor = dest === 'iceland' ? 'hsl(var(--accent))' : 'hsl(var(--accent-2))';
  const label = dest === 'iceland'
    ? `$1 ≈ ${USD_TO_ISK} ${code}`
    : `$1 ≈ €${USD_TO_EUR}`;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog" aria-expanded={open}
        className="liquid-glass rounded-full px-3 py-1.5 text-xs flex items-center gap-2 fx-chip"
        style={open ? { boxShadow: '0 0 0 1px hsl(var(--accent) / 0.45) inset, inset 0 1px 1px hsl(var(--fg) / 0.10)' } : null}>
        <span style={{ width: 6, height: 6, borderRadius: 9999, background: dotColor, display: 'inline-block' }} />
        <span>{label}</span>
        <Icon.ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open &&
        <div
          role="dialog" aria-label="Currency converter"
          className={`absolute right-0 top-[calc(100%+8px)] liquid-glass rounded-2xl p-4 w-[280px] z-50 fx-dropdown ${onHero ? 'fx-dropdown--hero' : ''}`}
        >
          <div className="text-[10px] tracking-[0.22em] uppercase mb-3 fx-header">Currency converter</div>
          <CurrencyConverter dest={dest} size="compact" />
        </div>
      }
    </div>);
}

// ============================================================================
// WeatherPill — small liquid-glass pill: "12° / 5° ☁" with a lucide icon.
// Renders a faint shimmer while the fetch is in flight; renders nothing on
// error or when no forecast row exists for this day. Open-Meteo returns
// Celsius by default.
// ============================================================================
function WeatherPill({ data, loading, outOfRange }) {
  if (loading) {
    return (
      <span
        className="liquid-glass rounded-full px-2.5 py-1 text-[10px] tracking-wide flex items-center gap-1.5 wx-shimmer"
        aria-hidden="true"
        style={{ minWidth: 72, height: 24 }} />);
  }
  if (outOfRange) {
    return (
      <span className="liquid-glass rounded-full px-2.5 py-1 text-[10px] tracking-wide opacity-75">
        Forecast available May 9
      </span>);
  }
  if (!data) return null;
  const iconName = weatherIconFor(data.code);
  const IconComp = iconName ? Icon[iconName] : null;
  return (
    <span
      className="liquid-glass rounded-full px-2.5 py-1 text-[10px] tracking-wide flex items-center gap-1.5"
      title={`High ${data.tmax}°F · Low ${data.tmin}°F`}>
      <span>{data.tmax}° / {data.tmin}°</span>
      {IconComp && <IconComp className="w-3 h-3 opacity-80" />}
    </span>);
}

// ============================================================================
// TodayBadge — accent-colored pill, only shown on the day card whose date
// matches "now" in the trip's local timezone.
// ============================================================================
function TodayBadge() {
  return (
    <span
      className="liquid-glass rounded-full px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase flex items-center gap-1.5"
      style={{
        borderColor: 'hsl(var(--accent) / 0.55)',
        boxShadow: '0 0 0 1px hsl(var(--accent) / 0.35) inset',
        color: 'hsl(var(--accent))',
      }}>
      <span style={{ width: 6, height: 6, borderRadius: 9999, background: 'hsl(var(--accent))', display: 'inline-block' }} />
      Today
    </span>);
}

// ============================================================================
// TripStatusPill — global takeoff/home pill rendered above the Hero headline.
// Before trip: "Xd until takeoff". During trip: "Day X of 9". After trip:
// "X days since you got home".
// ============================================================================
function TripStatusPill({ compact }) {
  const [s, setS] = useState(() => tripStatus());
  // Re-check on visibility regain so the pill stays accurate if the tab
  // sits open across midnight.
  useEffect(() => {
    const onVis = () => { if (!document.hidden) setS(tripStatus()); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);
  let label;
  if (s.state === 'before') {
    label = `${s.days}d until takeoff`;
  } else if (s.state === 'after') {
    label = `${s.days} days since you got home`;
  } else {
    const offset = s.destKey === 'iceland' ? 0 : 5;
    label = `Day ${offset + s.dayN} of 9`;
  }
  const cls = compact
    ? 'liquid-glass rounded-full px-3 py-1.5 text-xs tracking-[0.18em] uppercase'
    : 'liquid-glass rounded-full px-3 py-1.5 text-[11px] tracking-[0.18em] uppercase reveal reveal-d1';
  return <span className={cls} style={compact ? null : { color: 'rgba(255,255,255,0.92)' }}>{label}</span>;
}

// ============================================================================
// Nav — persistent toggle pill; gains glass on scroll
// ============================================================================
function Nav({ dest, setDest, goToDay }) {
  const y = useScrollY();
  const scrolled = y > 60;
  const [sheet, setSheet] = useState(false);
  const data = TRIP[dest];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'py-2.5' : 'py-4'}`}>
        
        <div className={`mx-auto max-w-6xl px-4 md:px-6 transition-all duration-500`}>
          <div className={`flex items-center justify-between gap-3 rounded-full px-3 py-2 transition-all duration-500 ${scrolled ? 'liquid-glass' : ''}`}>
            {/* Left mark */}
            <div className="flex items-center gap-3 min-w-0">
              <Mark />
              <div className="hidden sm:block text-[10px] md:text-[11px] tracking-[0.22em] uppercase opacity-70">
                {data.dateRange}
              </div>
            </div>

            {/* Center toggle */}
            <div className="liquid-glass rounded-full p-1 flex relative">
              {['iceland', 'amsterdam'].map((k) => {
                const active = dest === k;
                return (
                  <button
                    key={k}
                    onClick={() => setDest(k)}
                    className={`relative z-10 px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-medium transition-colors duration-500 ${active ? 'text-[hsl(var(--bg))]' : 'opacity-80 hover:opacity-100'}`}
                    style={{ minWidth: 96 }}>
                    
                    {active &&
                    <span
                      className="absolute inset-0 rounded-full -z-0 transition-all duration-500"
                      style={{ background: 'hsl(var(--fg))' }} />

                    }
                    <span className="relative z-10 capitalize">{k}</span>
                  </button>);

              })}
            </div>

            {/* Right cluster — currency chip + countdown (desktop only), then hamburger */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden md:flex items-center gap-2">
                <CurrencyChip dest={dest} onHero={!scrolled} />
              </div>
              <button
                onClick={() => setSheet(true)}
                className="liquid-glass rounded-full w-10 h-10 md:w-11 md:h-11 flex items-center justify-center shrink-0"
                title="Jump to a day" aria-label="Open day navigator">
                <Icon.Menu className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Day navigator sheet */}
      {sheet &&
      <DayNavigatorSheet
        dest={dest}
        onClose={() => setSheet(false)}
        goToDay={(d, n) => { setSheet(false); goToDay(d, n); }} />
      }
    </>);

}

// Hamburger menu — on mobile starts with the currency converter, then the
// itinerary jump-links for the active route. The currency-converter section
// is hidden on md+ (the desktop nav has its own chip+dropdown for that).
function DayNavigatorSheet({ dest, onClose, goToDay }) {
  const data = TRIP[dest];
  // Reset handler wired into the section header — drives the comfortable
  // CurrencyConverter via a key bump so it re-mounts with defaults.
  const [converterKey, setConverterKey] = useState(0);
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'hsl(var(--bg) / 0.7)', backdropFilter: 'blur(10px)' }} />
      <div className="relative liquid-glass rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[92vh] overflow-y-auto overscroll-contain menu-sheet" onClick={(e) => e.stopPropagation()} style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="text-[10px] tracking-[0.24em] uppercase opacity-60">{data.label}</div>
            <div className="font-display text-3xl md:text-4xl mt-1">Plan & <em style={{ color: 'hsl(var(--accent))', fontStyle: 'italic' }}>spend.</em></div>
          </div>
          <button onClick={onClose} className="liquid-glass rounded-full w-9 h-9 flex items-center justify-center shrink-0" aria-label="Close">
            <Icon.Close className="w-4 h-4" />
          </button>
        </div>

        {/* Currency converter — mobile only; desktop uses the nav chip */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] tracking-[0.22em] uppercase opacity-60">Currency converter</div>
            <button
              type="button"
              onClick={() => setConverterKey((k) => k + 1)}
              aria-label="Reset converter"
              className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase opacity-70 hover:opacity-100 transition-opacity">
              <Icon.RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
          <CurrencyConverter key={converterKey} dest={dest} size="comfortable" />
          <div className="my-6 border-t" style={{ borderColor: 'hsl(var(--fg) / 0.12)' }} />
        </div>

        {/* Itinerary — active route only */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10px] tracking-[0.22em] uppercase opacity-60">Itinerary</div>
            <div className="text-[10px] tracking-[0.18em] uppercase opacity-50">{data.dateRange}</div>
          </div>
          <ul className="flex flex-col gap-1.5">
            {data.days.map((d) =>
              <li key={d.n}>
                <button
                  onClick={(e) => { e.currentTarget.blur(); goToDay(dest, d.n); }}
                  className="day-link-btn group w-full text-left flex items-center gap-3 px-3 py-3 rounded-2xl">
                  <div className="font-display text-sm leading-none w-14 shrink-0 tracking-tight" style={{ color: 'hsl(var(--accent))' }}>
                    Day <em style={{ fontStyle: 'italic' }}>{String(d.n).padStart(2, '0')}</em>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base truncate">{d.title}</div>
                  </div>
                  <Icon.ArrowRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-90 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>);

}

// CBCG wordmark — fun italic monogram for the 4-friend crew.
function Mark() {
  const letters = ['C', 'B', 'C', 'G'];
  const colors = [
  'hsl(var(--accent))',
  'hsl(var(--fg))',
  'hsl(var(--accent-2))',
  'hsl(var(--fg))'];

  const rots = [-7, 5, -5, 6];
  return (
    <a href="#" className="font-display select-none flex items-baseline cbcg-mark shrink-0 leading-none" title="CBCG — the crew" style={{ fontSize: '1.9rem', letterSpacing: '0.01em' }}>
      {letters.map((c, i) =>
      <span
        key={i}
        className="inline-block italic cbcg-letter"
        style={{
          color: colors[i],
          transform: `rotate(${rots[i]}deg) translateY(${i % 2 ? '-1px' : '1px'})`,
          fontWeight: 500,
          transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
          textShadow: '0 1px 2px hsl(var(--bg) / 0.4)'
        }}>
        
          {c}
        </span>
      )}
    </a>);

}

// ============================================================================
// HeroVideo — looping Cloudinary mp4 with manual rAF-driven intro/outro fade.
// Reads videoRef.current.duration live so a 5s and 8s clip both work seamlessly.
// Cross-destination switching crossfades the wrapper opacity over 600ms.
// ============================================================================
function HeroVideo({ src, active }) {
  const ref = useRef(null);
  const [innerOpacity, setInnerOpacity] = useState(0);

  // Manual fade loop using rAF reading actual `duration`
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let raf;
    const FADE = 0.5;
    const tick = () => {
      const dur = v.duration;
      const t = v.currentTime;
      let o = 1;
      if (!isNaN(dur) && dur > 0) {
        if (t < FADE) o = Math.max(0, t / FADE);else
        if (t > dur - FADE) o = Math.max(0, (dur - t) / FADE);
      } else {
        o = 0;
      }
      setInnerOpacity(o);
      raf = requestAnimationFrame(tick);
    };
    const onEnded = () => {
      setInnerOpacity(0);
      setTimeout(() => {
        try {v.currentTime = 0;v.play().catch(() => {});} catch (e) {}
      }, 100);
    };
    v.addEventListener('ended', onEnded);
    raf = requestAnimationFrame(tick);
    return () => {cancelAnimationFrame(raf);v.removeEventListener('ended', onEnded);};
  }, [src]);

  // Pause inactive video to save resources
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) v.play().catch(() => {});else
    v.pause();
  }, [active]);

  return (
    <div className="absolute inset-0" style={{ opacity: active ? 1 : 0, transition: 'opacity 600ms ease-out' }}>
      <video
        ref={ref}
        src={src}
        autoPlay muted playsInline preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: innerOpacity, transition: 'opacity 60ms linear' }} />
      
    </div>);

}

// ============================================================================
// HeroMedia — wraps both destination videos + a still-poster fallback for users
// with prefers-reduced-motion or saveData on.
// ============================================================================
function HeroMedia({ dest }) {
  const ice = window.HERO_FEATURE.iceland;
  const ams = window.HERO_FEATURE.amsterdam;
  const media = window.HERO_FEATURE[dest];
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const conn = navigator.connection;
    const update = () => setReduced(mq.matches || conn && conn.saveData);
    update();
    mq.addEventListener?.('change', update);
    conn?.addEventListener?.('change', update);
    return () => {
      mq.removeEventListener?.('change', update);
      conn?.removeEventListener?.('change', update);
    };
  }, []);

  if (reduced) {
    return (
      <img
        key={`poster-${dest}`}
        src={media.poster}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.95 }} />);


  }

  return (
    <>
      <HeroVideo src={ice.video} active={dest === 'iceland'} />
      <HeroVideo src={ams.video} active={dest === 'amsterdam'} />
    </>);

}

// ============================================================================
// MeshBackground — video carousel + theme-aware overlay + bottom vignette
// ============================================================================
function MeshBackground({ dest }) {
  const ice = dest === 'iceland';

  // Spec-specified overlays. Different gradient strength per dest because the
  // Iceland clip is naturally dark and Amsterdam is warm/bright.
  const overlayDesktop = ice ?
  'linear-gradient(90deg, rgba(8,18,28,0.78) 0%, rgba(8,18,28,0.55) 28%, rgba(8,18,28,0.2) 55%, transparent 75%)' :
  'linear-gradient(90deg, rgba(20,12,8,0.88) 0%, rgba(20,12,8,0.68) 32%, rgba(20,12,8,0.3) 60%, transparent 80%)';
  // Mobile flips to top→bottom so text in lower half stays readable
  const overlayMobile = 'linear-gradient(180deg, transparent 0%, rgba(20,12,8,0.35) 40%, rgba(20,12,8,0.85) 80%)';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0" style={{ background: 'hsl(var(--bg))' }} />

      <HeroMedia dest={dest} />

      {/* Theme-aware overlay — desktop = side gradient, mobile = bottom gradient */}
      <div className="absolute inset-0 hero-overlay-desktop" style={{ background: overlayDesktop }} />
      <div className="absolute inset-0 hero-overlay-mobile" style={{ background: overlayMobile }} />

      {/* Bottom vignette — fades smoothly into next section */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 60%, hsl(var(--bg) / 0.6) 100%)' }} />

      {/* Fine grain for texture */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22/></filter><rect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.55%22/></svg>")' }} />
    </div>);

}

// ============================================================================
// Hero — left-aligned editorial layout over looping video
// ============================================================================
function Hero({ data, dest }) {
  const accent = dest === 'iceland' ? 'hsl(var(--accent))' : 'hsl(var(--accent-2))';
  const feature = window.HERO_FEATURE[dest];

  return (
    <section
      className="relative min-h-[92vh] flex items-center md:items-center justify-start overflow-hidden hero-section"
      data-screen-label="01 Hero">
      <MeshBackground dest={dest} />

      {/* Content column — desktop centers vertically; mobile bottom-aligns */}
      <div className="relative z-10 w-full mx-auto max-w-7xl px-6 md:px-10 flex flex-col items-start text-left hero-content">
        {/* Headline */}
        <h1 className="font-display tracking-[-0.03em] leading-[0.95] text-5xl md:text-7xl lg:text-8xl reveal reveal-d1"
        style={{ color: 'white', maxWidth: '20ch' }}>
          {data.headline[0]}{' '}
          <em style={{ color: accent, fontStyle: 'italic' }}>{data.headline[1]}</em>{' '}
          {data.headline[2]}
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-xl mt-6 max-w-xl reveal reveal-d2" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {data.subtitle}
        </p>
      </div>

      {/* Scroll indicator — bottom-right */}
      <div className="absolute bottom-6 right-6 z-10 hidden md:block">
        <div className="liquid-glass rounded-full w-10 h-10 flex items-center justify-center bob">
          <Icon.Arrow className="w-4 h-4" />
        </div>
      </div>
    </section>);

}

// ============================================================================
// TripOverview — timeline ribbon + 3-col highlights
// ============================================================================
function TripOverview({ data, dest }) {
  return (
    <section className="relative py-20 md:py-28 px-6" data-screen-label="02 Overview">
      <div className="mx-auto max-w-5xl">
        <SectionTitle eyebrow="Overview" wordIndex={1}>The <em>shape</em> of the trip</SectionTitle>

        {/* Ribbon */}
        <div className="mt-12 md:mt-16 -mx-6 px-6 overflow-x-auto no-scrollbar">
          <div className="min-w-max md:min-w-0 flex items-center gap-0 md:justify-between relative">
            {data.days.map((d, i) => {
              const status = dayStatus(dest, d.n);
              return (
                <React.Fragment key={d.n}>
                  <RibbonNode day={d} status={status} />
                  {i < data.days.length - 1 &&
                  <div className="flex-1 min-w-[60px] md:min-w-0 mx-2 h-px self-center" style={{ background: 'linear-gradient(90deg, hsl(var(--fg) / 0.3), hsl(var(--fg) / 0.08))' }} />
                  }
                </React.Fragment>);

            })}
          </div>
        </div>

        {/* Highlights */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-5 mt-14 md:mt-20">
          <HighlightCard icon={<Icon.Bed className="w-4 h-4" />} title="Where we sleep">
            <ul className="space-y-2">
              {data.overview.sleep.map(([place, nights], i) =>
              <li key={i} className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-xl">{place}</span>
                  <span className="text-xs opacity-60 tracking-wide">{nights}</span>
                </li>
              )}
            </ul>
          </HighlightCard>
          <HighlightCard icon={<Icon.Star className="w-4 h-4" />} title="Don't miss">
            <ul className="space-y-2">
              {data.overview.dontMiss.map((t, i) =>
              <li key={i} className="flex items-center gap-2.5">
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ background: 'hsl(var(--accent))' }} />
                  <span>{t}</span>
                </li>
              )}
            </ul>
          </HighlightCard>
          <HighlightCard icon={<Icon.Compass className="w-4 h-4" />} title="Getting around">
            <p className="leading-relaxed opacity-80">{data.overview.moving}</p>
          </HighlightCard>
        </div>
      </div>
    </section>);

}

function RibbonNode({ day, status }) {
  const [hover, setHover] = useState(false);
  const solid = status === 'past' || status === 'today';
  const today = status === 'today';
  return (
    <div className="relative flex flex-col items-center text-center shrink-0 w-[88px] md:w-auto"
    onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="text-[10px] tracking-[0.18em] uppercase opacity-60 mb-2">Day {String(day.n).padStart(2, '0')}</div>
      <div className={`relative rounded-full transition-all duration-300 ${today ? 'pulse-ring' : ''}`}
      style={{
        width: today ? 18 : 14,
        height: today ? 18 : 14,
        background: solid ? 'hsl(var(--accent))' : 'transparent',
        border: `1.5px solid ${solid ? 'hsl(var(--accent))' : 'hsl(var(--fg) / 0.35)'}`
      }} />
      <div className="text-[11px] mt-2 opacity-80 max-w-[88px] truncate">{day.city}</div>
      {/* Tooltip */}
      {hover &&
      <div className="absolute top-full mt-3 z-20 liquid-glass rounded-xl px-3 py-2 text-[11px] whitespace-normal w-[160px] left-1/2 -translate-x-1/2">
          <div className="font-medium leading-tight">{day.title}</div>
          <div className="opacity-60 mt-1 text-[10px] tracking-wide">{day.date}</div>
        </div>
      }
    </div>);

}

function HighlightCard({ icon, title, children }) {
  const [ref, seen] = useReveal();
  return (
    <div ref={ref} className={`liquid-glass rounded-3xl p-6 md:p-7 ${seen ? 'reveal-in' : 'reveal-out'}`}>
      <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase opacity-70 mb-4">
        <span className="opacity-80">{icon}</span>
        {title}
      </div>
      <div className="text-base md:text-lg">{children}</div>
    </div>);

}

// ============================================================================
// SectionTitle — italic accent word
// ============================================================================
function SectionTitle({ eyebrow, wordIndex = 0, children }) {
  return (
    <div>
      {eyebrow && <div className="text-[10px] md:text-xs tracking-[0.24em] uppercase opacity-60">{eyebrow}</div>}
      <h2 className="font-display tracking-[-0.02em] leading-[1.0] mt-3" style={{ fontSize: 'clamp(2rem, 5.5vw, 4rem)' }}>
        {children}
      </h2>
    </div>);

}

// ============================================================================
// DayCards
// ============================================================================
function DayCards({ data, dest }) {
  const wx = useWeather();
  return (
    <section className="relative py-16 md:py-24 px-4 md:px-6 overflow-hidden" data-screen-label="03 Days">
      {/* Aurora ribbons backdrop — theme-aware (see CSS) */}
      <div className="aurora-wrap" aria-hidden="true">
        <div className="aurora-mask" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <SectionTitle eyebrow="Day by day">The <em>plan.</em></SectionTitle>
        <div className="mt-10 md:mt-16 flex flex-col gap-6 md:gap-8">
          {data.days.map((d) => <DayCard key={d.n} day={d} dest={dest} wx={wx} />)}
        </div>
      </div>
    </section>);

}

function DayCard({ day, dest, wx }) {
  const [scrollRef, p] = useScrollLinked();
  const [seenRef, seen] = useReveal();
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const [open, setOpen] = useState(!isMobile);

  // Set both refs on the wrapper
  const setRefs = (el) => {
    scrollRef.current = el;
    seenRef.current = el;
  };

  // Scroll-linked perspective transform. As the card scrolls into the upper
  // half of the viewport, it rotates from a backward tilt to flat and scales
  // up from 95% → 100%. Reduced on mobile to avoid feeling glitchy.
  const rotateX = (1 - p) * (isMobile ? 8 : 18);
  const scale = 0.94 + p * 0.06;
  const translateY = (1 - p) * 24;

  return (
    <div
      ref={setRefs}
      id={`${dest}-day-${day.n}`}
      className="day-card-scroll"
      style={{ perspective: '1200px' }}
    >
      <article
        className={`liquid-glass rounded-[28px] p-6 md:p-10 day-card ${seen ? 'reveal-in' : 'reveal-out'}`}
        style={{
          transform: `rotateX(${rotateX}deg) scale(${scale}) translateY(${translateY}px)`,
          transformOrigin: 'center top',
          transition: 'opacity 0.6s ease-out',
          willChange: p > 0 && p < 1 ? 'transform' : 'auto',
        }}>
      
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className={`font-display leading-none ${seen ? 'wiggle-once' : ''}`} style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          <span className="opacity-70">Day</span>{' '}
          <em style={{ color: 'hsl(var(--accent))', fontStyle: 'italic' }}>{String(day.n).padStart(2, '0')}</em>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {dayStatus(dest, day.n) === 'today' && <TodayBadge />}
          {wx && <WeatherPill data={wx.getFor(dest, day.n)} loading={wx.loading} outOfRange={wx.outOfRange} />}
          {day.switch ?
          <>
              <NightPill>{day.switch[0]}</NightPill>
              <Icon.ArrowRight className="w-3.5 h-3.5 opacity-60" />
              <NightPill accent>{day.switch[1]}</NightPill>
            </> :

          <NightPill>{day.nightLabel}</NightPill>
          }
        </div>
      </div>

      {/* Date + headline */}
      <div className="mt-2 text-[11px] tracking-[0.2em] uppercase opacity-60">{day.date}</div>
      <h3 className="font-display mt-3 leading-[1.05]" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}>
        {day.title}
      </h3>

      {/* Image row */}
      <div className="mt-6 -mx-6 md:mx-0 px-6 md:px-0 flex md:grid md:grid-cols-3 gap-3 md:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar">
        {day.images.map((im, i) =>
        <ImgThumb key={i} im={im} />
        )}
      </div>

      {/* Expand toggle on mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden mt-5 w-full liquid-glass rounded-full py-2.5 text-xs tracking-[0.2em] uppercase opacity-80">
        
        {open ? 'Hide details' : 'Show details'}
      </button>

      {/* Timeline */}
      <div className={`grid transition-[grid-template-rows,opacity,margin-top] duration-500 ${open ? 'grid-rows-[1fr] opacity-100 mt-6 md:mt-8' : 'grid-rows-[0fr] opacity-0 md:grid-rows-[1fr] md:opacity-100 md:mt-8'}`}>
        <div className="overflow-hidden">
          <Timeline events={day.timeline} />

          {/* Card footer chips */}
          <div className="mt-6 md:mt-8 flex flex-wrap gap-2">
            <FootChip icon={<Icon.Utensils className="w-3.5 h-3.5" />} label="Dinner">{day.dinner}</FootChip>
            <FootChip icon={<Icon.Wine className="w-3.5 h-3.5" />} label="Drinks">{day.drinks}</FootChip>
          </div>
        </div>
      </div>
      </article>
    </div>);

}

function NightPill({ children, accent }) {
  return (
    <span
      className="liquid-glass rounded-full px-3 py-1.5 text-[11px] md:text-xs tracking-wide"
      style={accent ? { borderColor: 'hsl(var(--accent) / 0.55)', boxShadow: '0 0 0 1px hsl(var(--accent) / 0.35) inset' } : null}>
      
      {children}
    </span>);

}

function ImgThumb({ im }) {
  const [errored, setErrored] = useState(false);
  const triedFallback = useRef(false);

  // Wikimedia Special:FilePath returns 200 HTML for missing files (no onError fires).
  // So we ALSO check naturalWidth on load and degrade if zero.
  const fail = (el) => {
    if (!triedFallback.current && im.fallback && el.src !== im.fallback) {
      triedFallback.current = true;
      el.src = im.fallback;
    } else {
      setErrored(true);
    }
  };
  const onLoad = (e) => {
    if (e.currentTarget.naturalWidth === 0) fail(e.currentTarget);
  };
  const onErr = (e) => fail(e.currentTarget);

  return (
    <figure className="relative shrink-0 w-[78%] md:w-auto md:aspect-[4/5] aspect-[4/5] rounded-2xl overflow-hidden snap-start group thumb" style={{ background: 'hsl(var(--fg) / 0.05)' }}>
      {!errored &&
      <img src={im.src} alt={im.caption} loading="lazy" decoding="async" width="640" height="800" onError={onErr} onLoad={onLoad}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
      }
      {errored &&
      <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
          <div className="font-display italic" style={{ color: 'hsl(var(--fg) / 0.6)', fontSize: '1.1rem', lineHeight: 1.2 }}>{im.caption}</div>
        </div>
      }
      {/* Always-visible caption strip at bottom. When the image has a mapUrl,
          the pill becomes an external link to Google Maps (opens in new tab,
          deep-links into the Maps app on mobile). */}
      {im.mapUrl ?
      <a
        href={im.mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute left-2 right-2 bottom-2 rounded-full px-3 py-1 text-[10px] text-center caption-link image-caption-chip"
        title={`Open ${im.caption} in Google Maps`}>
        {im.caption}
      </a> :
      <figcaption className="absolute left-2 right-2 bottom-2 rounded-full px-3 py-1 text-[10px] text-center image-caption-chip">
        {im.caption}
      </figcaption>
      }
    </figure>);

}

function Timeline({ events }) {
  return (
    <ol className="relative pl-5 md:pl-6">
      <span className="absolute left-1 top-1 bottom-1 w-px" style={{ background: 'hsl(var(--fg) / 0.2)' }} />
      {events.map(([time, title, note], i) =>
      <TimelineRow key={i} time={time} title={title} note={note} />
      )}
    </ol>);

}

function TimelineRow({ time, title, note }) {
  const [ref, seen] = useReveal();
  return (
    <li ref={ref} className="relative pb-5 last:pb-0">
      <span
        className={`absolute -left-[15px] md:-left-[19px] top-2 w-2 h-2 rounded-full ${seen ? 'dot-pulse' : ''}`}
        style={{ background: 'hsl(var(--accent))', boxShadow: '0 0 0 3px hsl(var(--bg))' }} />
      
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] tracking-wide whitespace-nowrap">{time}</span>
        <span className="font-medium">{title}</span>
      </div>
      {note && <div className="mt-1.5 text-sm opacity-65 max-w-prose leading-relaxed">{note}</div>}
    </li>);

}

function FootChip({ icon, label, children }) {
  return (
    <div className="liquid-glass rounded-full px-3.5 py-2 flex items-center gap-2.5 text-xs">
      <span style={{ color: 'hsl(var(--accent))' }}>{icon}</span>
      <span className="opacity-60 uppercase tracking-[0.16em] text-[10px]">{label}</span>
      <span className="opacity-90">{children}</span>
    </div>);

}

// ============================================================================
// Footer
// ============================================================================
function Footer({ dest, setDest }) {
  const other = dest === 'iceland' ? 'amsterdam' : 'iceland';
  const flip = dest === 'iceland' ? '🧊 → 🌷' : '🌷 → 🧊';
  return (
    <footer className="relative px-6 py-20 md:py-28" data-screen-label="04 Footer">
      <div className="mx-auto max-w-4xl text-center">
        <div className="text-[10px] tracking-[0.24em] uppercase opacity-60">Next up</div>
        <button
          onClick={() => setDest(other)}
          className="group mt-4 inline-flex items-center gap-4 font-display leading-none"
          style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>
          
          <span><em style={{ color: 'hsl(var(--accent))', fontStyle: 'italic' }}>{other === 'iceland' ? 'Iceland' : 'Amsterdam'}</em></span>
          <span className="liquid-glass rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-2">
            <Icon.ArrowRight className="w-5 h-5" />
          </span>
        </button>
      </div>
    </footer>);

}

Object.assign(window, {
  ScrollProgress, Nav, Hero, TripOverview, DayCards, Footer, MeshBackground
});