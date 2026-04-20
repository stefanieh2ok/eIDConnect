'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/context/AppContext';
import { EbeneLevel, Location, Section } from '@/types';
import { Award, Settings } from 'lucide-react';
import { normalizePlz, parseLegacyDemoAddress, suggestCityFromPlz } from '@/data/plzDemoLookup';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import { persistAndSyncDemoAddress } from '@/lib/demo-address-persist';

// ─── Section Nav Config ────────────────────────────────────────────────────

const NAV_ITEMS: {
  section: Section;
  label: string;
  kommuneOnly?: boolean;
}[] = [
  { section: 'live',        label: 'Abstimmen' },
  { section: 'wahlen',      label: 'Wahlen' },
  { section: 'kalender',    label: 'Kalender' },
  { section: 'meldungen',   label: 'Meldungen', kommuneOnly: true },
];

const LEVEL_CONFIG: Record<EbeneLevel, { label: string; sublabel: string; location: Location }> = {
  bund:    { label: 'Bund',    sublabel: 'Deutschland', location: 'bundesweit' },
  land:    { label: 'Land',    sublabel: 'Saarland',    location: 'saarland' },
  kreis:   { label: 'Kreis',   sublabel: 'Saarpfalz',   location: 'saarpfalz' },
  kommune: { label: 'Kommune', sublabel: 'Kirkel',      location: 'kirkel' },
};

// Section-spezifische erlaubte Ebenen (wird zusätzlich mit „Wohnort“-Pfad geschnitten)
const SECTION_LEVELS: Record<Section, EbeneLevel[]> = {
  live:        ['bund', 'land', 'kreis', 'kommune'],
  leaderboard: ['bund', 'land', 'kreis', 'kommune'],
  wahlen:      ['bund', 'land', 'kreis', 'kommune'],
  news:        [],
  kalender:    ['bund', 'land', 'kreis', 'kommune'],
  // Regel: Meldungen nur Kommune
  meldungen:   ['kommune'],
};

const LOCATION_TO_LEVEL: Record<Location, EbeneLevel> = {
  bundesweit:  'bund',
  deutschland: 'bund',
  saarland:    'land',
  saarpfalz:   'kreis',
  kirkel:      'kommune',
  // Städte / kreisfreie Städte
  frankfurt: 'kommune',
  mannheim: 'kommune',
  heidelberg: 'kommune',
  weinheim: 'kommune',
  viernheim: 'kommune',
  neustadt: 'kommune',
  bremen: 'kommune',
  berlin: 'kommune',
  // Bayern / München
  bayern: 'land',
  muenchen: 'kreis',
};

/**
 * „Wohnort“-Pfad (Primärlogik): welche Ebenen existieren überhaupt für den Nutzer.
 * In der Demo leiten wir es aus der aktuellen Location ab.
 * Regel: Kreis nur, wenn er für den Wohnort existiert.
 */
function residencePathForLocation(loc: Location): EbeneLevel[] {
  const level = LOCATION_TO_LEVEL[loc] ?? 'bund';
  switch (level) {
    case 'kommune':
      return ['bund', 'land', 'kreis', 'kommune'];
    case 'kreis':
      return ['bund', 'land', 'kreis'];
    case 'land':
      return ['bund', 'land'];
    case 'bund':
    default:
      return ['bund'];
  }
}

// Hinweis: Filter-Logik gehört nicht in die Navigation.

// ─── Component ─────────────────────────────────────────────────────────────

const AppHeader: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [demoStreet, setDemoStreet] = useState('');
  const [demoPlz, setDemoPlz] = useState('');
  const [demoCity, setDemoCity] = useState('');
  const [demoZustaendigkeit, setDemoZustaendigkeit] = useState('');
  const residencePath = useMemo(() => residencePathForLocation(state.residenceLocation), [state.residenceLocation]);
  const overlayRoot = typeof document !== 'undefined' ? document.getElementById('app-overlay-root') : null;

  const settingsDialogRef = useRef<HTMLDivElement | null>(null);
  const closeSettingsBtnRef = useRef<HTMLButtonElement | null>(null);
  const isFormal = state.anrede === 'sie';
  const t = (du: string, sie: string) => (isFormal ? sie : du);

  useEffect(() => {
    if (!showSettings) return;
    const tmr = window.setTimeout(() => closeSettingsBtnRef.current?.focus(), 0);
    return () => window.clearTimeout(tmr);
  }, [showSettings]);

  useEffect(() => {
    if (!showSettings) return;
    try {
      let street = localStorage.getItem('eidconnect_demo_street') || '';
      let plz = localStorage.getItem('eidconnect_demo_plz') || '';
      let city = localStorage.getItem('eidconnect_demo_city') || '';
      if (!street && !plz && !city) {
        const raw = localStorage.getItem('eidconnect_demo_address') || '';
        const p = parseLegacyDemoAddress(raw);
        street = p.street;
        plz = p.plz;
        city = p.city;
      }
      setDemoStreet(street);
      setDemoPlz(plz);
      setDemoCity(city);
      const hasData =
        street.trim().length > 0 || normalizePlz(plz).length === 5 || city.trim().length > 0;
      if (hasData) {
        const { county } = persistAndSyncDemoAddress((a) => dispatch(a as any), street, plz, city);
        setDemoZustaendigkeit(county);
      } else {
        setDemoZustaendigkeit('');
      }
    } catch {}
  }, [showSettings, dispatch]);

  useEffect(() => {
    if (!showSettings) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSettings(false);
        return;
      }

      if (e.key !== 'Tab') return;
      const root = settingsDialogRef.current;
      if (!root) return;

      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'),
      ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showSettings]);

  const scrollToSecurityFaq = () => {
    setShowSettings(false);
    window.setTimeout(() => {
      const el = document.getElementById('security-faq');
      const details = el?.querySelector('details') as HTMLDetailsElement | null;
      if (details) details.open = true;
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const openIntro = () => {
    setShowSettings(false);
    window.setTimeout(() => {
      try {
        localStorage.removeItem('eidconnect_product_intro_done_v1');
        localStorage.removeItem('eidconnect_product_intro_done_v2');
        localStorage.removeItem('eidconnect_product_intro_done_v3');
        localStorage.removeItem('eidconnect_product_intro_done_v4');
      } catch {}
      window.dispatchEvent(new Event('eidconnect:open-intro'));
    }, 60);
  };

  const updateDemoAddressFields = (patch: Partial<{ street: string; plz: string; city: string }>) => {
    let street = patch.street ?? demoStreet;
    let plz = patch.plz !== undefined ? normalizePlz(patch.plz) : demoPlz;
    let city = patch.city ?? demoCity;
    if (patch.plz !== undefined && plz.length === 5) {
      const sug = suggestCityFromPlz(plz);
      if (sug) city = sug;
    }
    setDemoStreet(street);
    setDemoPlz(plz);
    setDemoCity(city);
    const { county } = persistAndSyncDemoAddress((a) => dispatch(a as any), street, plz, city);
    setDemoZustaendigkeit(county);
  };

  const settingsModal =
    showSettings && overlayRoot
      ? createPortal(
          <div
            className="pointer-events-auto absolute inset-0 z-[120] flex items-end justify-center bg-black/40 p-2"
            role="dialog"
            aria-modal="true"
            onClick={() => setShowSettings(false)}
          >
            <div
              ref={settingsDialogRef}
              className="w-full max-w-[390px] max-h-[74dvh] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 mb-0 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-neutral-900">Einstellungen</h3>
                  <p className="mt-0.5 text-[10px] font-semibold text-neutral-500">
                    {t('Demo-Einstellungen (kein Produktivkonto)', 'Demo-Einstellungen (kein Produktivkonto)')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                  aria-label="Einstellungen schließen"
                  ref={closeSettingsBtnRef}
                >
                  x
                </button>
              </div>

              <div className="max-h-[calc(74dvh-112px)] overflow-y-auto space-y-3 px-4 py-3">
                <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold text-neutral-900">Anrede</p>
                  <p className="mt-1 text-[11px] text-neutral-700">Kann jederzeit geändert werden.</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'SET_ANREDE', payload: 'sie' })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        state.anrede === 'sie'
                          ? 'bg-[#003366] text-white'
                          : 'border border-neutral-300 bg-white text-neutral-700'
                      }`}
                    >
                      Sie
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'SET_ANREDE', payload: 'du' })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        state.anrede === 'du'
                          ? 'bg-[#003366] text-white'
                          : 'border border-neutral-300 bg-white text-neutral-700'
                      }`}
                    >
                      Du
                    </button>
                  </div>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold text-neutral-900">Clara-Personalisierung</p>
                  <label className="mt-2 flex items-start gap-2 text-[11px] leading-relaxed text-neutral-800">
                    <input
                      type="checkbox"
                      checked={state.consentClaraPersonalization}
                      onChange={(e) =>
                        dispatch({
                          type: 'SET_CONSENT_CLARA_PERSONALIZATION',
                          payload: e.target.checked,
                        })
                      }
                      className="mt-0.5 h-4 w-4 rounded"
                      style={{ accentColor: '#0055A4' }}
                    />
                    Einwilligung zur Nutzung von Politik-Schwerpunkten für relevantere Clara-Analysen.
                  </label>
                  <p className="mt-2 text-[11px] leading-relaxed text-neutral-600">
                    {t(
                      'Wenn aktiviert, nutzt Clara deine gewählten Themen, um Inhalte relevanter zu strukturieren. Clara bleibt dabei strikt neutral und gibt keine Wahlempfehlung.',
                      'Wenn aktiviert, nutzt Clara Ihre gewählten Themen, um Inhalte relevanter zu strukturieren. Clara bleibt dabei strikt neutral und gibt keine Wahlempfehlung.',
                    )}
                  </p>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold text-neutral-900">Punkte & Prämien</p>
                  <label className="mt-2 flex items-start gap-2 text-[11px] leading-relaxed text-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.consentPraemien}
                      onChange={(e) =>
                        dispatch({ type: 'SET_CONSENT_PRAEMIEN', payload: e.target.checked })
                      }
                      className="mt-0.5 h-4 w-4 rounded"
                      style={{ accentColor: '#0055A4' }}
                    />
                    Ich möchte am freiwilligen Punkte- und Prämienprogramm teilnehmen.
                  </label>
                  <p className="mt-2 text-[11px] leading-relaxed text-neutral-600">
                    Prämien und Einlöseangebote werden erst nach Ihrer Zustimmung sichtbar.
                  </p>
                  <p className="mt-2 text-[10px] leading-relaxed text-neutral-500">
                    Ihre Einwilligung können Sie jederzeit in den Einstellungen widerrufen.
                  </p>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-[11px] leading-relaxed text-neutral-800">
                  <p className="font-semibold text-neutral-900">Teilnahme & Wohnort</p>
                  <p className="mt-1">
                    Teilnahme nur mit digitalem Personalausweis (eID). Der Wohnort kann nicht frei überschrieben werden;
                    Änderungen erst nach offizieller Ummeldung und erneuter Prüfung.
                  </p>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold text-neutral-900">Testzugang (Demo)</p>
                  <p className="mt-1 text-[11px] text-neutral-700">
                    Straße, PLZ und Wohnort – Zuständigkeit und Demo-Inhalte werden daraus abgeleitet (kein eID-Nachweis).
                  </p>
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={demoStreet}
                      onChange={(e) => updateDemoAddressFields({ street: e.target.value })}
                      placeholder="Straße und Hausnummer"
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800 placeholder:text-neutral-400"
                      aria-label="Straße (Demo)"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={5}
                        value={demoPlz}
                        onChange={(e) => updateDemoAddressFields({ plz: e.target.value })}
                        placeholder="PLZ"
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800 placeholder:text-neutral-400"
                        aria-label="Postleitzahl (Demo)"
                      />
                      <input
                        type="text"
                        value={demoCity}
                        onChange={(e) => updateDemoAddressFields({ city: e.target.value })}
                        placeholder="Wohnort"
                        className="col-span-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800 placeholder:text-neutral-400"
                        aria-label="Wohnort (Demo)"
                      />
                    </div>
                    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2">
                      <div className="text-[11px] font-semibold text-neutral-800">Zustaendigkeit</div>
                      <div className="mt-0.5 text-[11px] text-neutral-600">
                        {demoZustaendigkeit || 'Wird aus PLZ und Ort abgeleitet.'}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold text-neutral-900">Einführung</p>
                  <p className="mt-1 text-[11px] text-neutral-700">
                    Zeigt die Einführung in vier Schritten erneut an.
                  </p>
                  <button
                    type="button"
                    onClick={openIntro}
                    className="mt-2 w-full rounded-lg border border-neutral-300 bg-white py-2 text-[11px] font-semibold text-neutral-800 hover:bg-neutral-100"
                  >
                    Einführung anzeigen
                  </button>
                </section>
              </div>

              <div className="px-4 py-3 bg-white">
                <div className="flex gap-3">
                  <a
                    href="/legal/demo-nda"
                    className="text-[11px] font-semibold text-[#003366] hover:underline"
                    onClick={() => setShowSettings(false)}
                  >
                    Datenschutz/NDA
                  </a>
                  <a
                    href="#security-faq"
                    className="text-[11px] font-semibold text-[#003366] hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSecurityFaq();
                    }}
                  >
                    FAQ Sicherheit & Zugang
                  </a>
                </div>
              </div>

              <div className="border-t border-neutral-200 bg-white px-4 py-3">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>,
          overlayRoot
        )
      : null;

  return (
    <header
      id="tour-footer"
      className="sticky top-0 z-50"
      style={{
        // PersoApp-ähnlich: helles Glas statt Voll-Blau
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(214,224,238,0.9)',
        paddingTop: 'max(0.6rem, env(safe-area-inset-top, 0.6rem))',
      }}
    >
      {/* ── Row 1: Brand + Punkte ── */}
      <div className="flex items-center justify-between px-4 pt-1 pb-2">
        <div>
          <div className="text-sm font-bold text-[#003366] tracking-wide leading-none">
            {APP_DISPLAY_NAME}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="tour-rewards-btn"
            onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'leaderboard' })}
            className="flex items-center gap-1.5 rounded-full px-3 py-1 border border-neutral-200 bg-white/70 hover:bg-white transition-colors"
            aria-label="Punkte & Prämien öffnen"
          >
            <Award className="h-3.5 w-3.5 text-[#0055A4] shrink-0" aria-hidden />
            <span className="text-xs font-bold text-neutral-900 tabular-nums">
              {state.participationPoints.toLocaleString('de-DE')}
            </span>
            <span className="text-[9px] text-neutral-500">Punkte</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white/75 text-neutral-700 shadow-sm backdrop-blur hover:bg-white"
            aria-label="Einstellungen öffnen"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* ── Row 2: Section Navigation ──
          Senior-UI: eigener Kontrast-Streifen statt „Pillen auf Glas“ — aktiver Tab invertiert (hell auf dunkel),
          inaktiv dezent hell; so wirkt die Menüzeile nicht mehr unter dem Seiteninhalt „weg“. */}
      <div
        className="border-t border-white/10 px-2 pb-2 pt-1.5"
        style={{
          background: 'linear-gradient(180deg, #002855 0%, #003366 55%, #002f5c 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex flex-wrap items-stretch justify-center gap-1 sm:justify-start">
          {NAV_ITEMS.map((item) => {
            const isActive = state.activeSection === item.section;
            const showItem = !item.kommuneOnly || residencePath.includes('kommune');
            if (!showItem) return null;
            return (
              <button
                key={item.section}
                id={
                  item.section === 'live'
                    ? 'tour-voting-btn'
                    : item.section === 'meldungen'
                      ? 'tour-melden-btn'
                      : undefined
                }
                onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: item.section })}
                className={`min-h-[40px] flex flex-1 basis-0 items-center justify-center gap-1 rounded-full px-2 py-2 text-[11px] whitespace-nowrap transition-all sm:min-h-0 sm:flex-none sm:px-3 ${
                  isActive
                    ? 'bg-white font-extrabold text-[#003366] shadow-md ring-1 ring-white/80'
                    : 'font-semibold text-white/85 hover:bg-white/12 hover:text-white active:bg-white/18'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {settingsModal}
    </header>
  );
};

export default AppHeader;
