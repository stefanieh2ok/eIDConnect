'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/context/AppContext';
import { EbeneLevel, Location, Section } from '@/types';
import { ListChecks, Settings } from 'lucide-react';
import PolitikBarometerPanel from '@/components/Intro/PolitikBarometerPanel';
import { normalizePlz, parseLegacyDemoAddress, suggestCityFromPlz } from '@/data/plzDemoLookup';
import ProductIdentityHeader from '@/components/ui/ProductIdentityHeader';
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
  const [interessenSavedHint, setInteressenSavedHint] = useState(false);
  const [settingsActionHint, setSettingsActionHint] = useState<string | null>(null);
  const residencePath = useMemo(() => residencePathForLocation(state.residenceLocation), [state.residenceLocation]);
  const overlayRoot = typeof document !== 'undefined' ? document.getElementById('app-overlay-root') : null;

  const settingsDialogRef = useRef<HTMLDivElement | null>(null);
  const closeSettingsBtnRef = useRef<HTMLButtonElement | null>(null);
  const isFormal = state.anrede === 'sie';
  const t = (du: string, sie: string) => (isFormal ? sie : du);
  const showSettingsHint = (msgDu: string, msgSie: string) => {
    setSettingsActionHint(t(msgDu, msgSie));
    window.setTimeout(() => setSettingsActionHint(null), 2500);
  };
  const closeSettingsToApp = () => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'live' });
    setShowSettings(false);
  };

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
                    {t('Vorschau-Einstellungen (kein Produktivkonto)', 'Vorschau-Einstellungen (kein Produktivkonto)')}
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

                <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-2.5">
                  <PolitikBarometerPanel
                    du={!isFormal}
                    variant="compact"
                    density="tight"
                    editableWithoutConsent
                    headingTitle="Interessen & Relevanz"
                    leadDu="Wähle Themen aus, zu denen Termine und Beteiligungsmöglichkeiten im Kalender hervorgehoben werden sollen."
                    leadSie="Wählen Sie Themen aus, zu denen Termine und Beteiligungsmöglichkeiten im Kalender hervorgehoben werden sollen."
                  />
                  <p className="mt-1.5 px-0.5 text-[9.5px] leading-snug text-neutral-600">
                    {t(
                      'Diese Auswahl dient nur dazu, passende Kalendertermine hervorzuheben. Sie ist keine politische Empfehlung und wird nicht aus deinem Verhalten abgeleitet.',
                      'Diese Auswahl dient nur dazu, passende Kalendertermine hervorzuheben. Sie ist keine politische Empfehlung und wird nicht aus Ihrem Verhalten abgeleitet.',
                    )}
                  </p>
                  {interessenSavedHint ? (
                    <p className="mt-2 text-[10px] font-semibold text-emerald-800" role="status">
                      {t('Einstellungen für diese Sitzung übernommen.', 'Einstellungen für diese Sitzung übernommen.')}
                    </p>
                  ) : null}
                  {settingsActionHint ? (
                    <p className="mt-2 text-[10px] font-semibold text-[#003366]" role="status">
                      {settingsActionHint}
                    </p>
                  ) : null}
                  <div className="mt-1.5 flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setInteressenSavedHint(true);
                        showSettingsHint(
                          'Auswahl gespeichert. Du kannst direkt in die App.',
                          'Auswahl gespeichert. Sie können direkt in die App.',
                        );
                        window.setTimeout(() => setInteressenSavedHint(false), 2500);
                      }}
                      className="w-full rounded-lg border border-[#003366] bg-[#003366] py-1.5 text-[10.5px] font-semibold text-white hover:opacity-95"
                    >
                      Auswahl speichern
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({
                          type: 'SET_PREFERENCES',
                          payload: {
                            umwelt: 50,
                            finanzen: 50,
                            bildung: 50,
                            digital: 50,
                            soziales: 50,
                            sicherheit: 50,
                          },
                        });
                        showSettingsHint('Auswahl zurückgesetzt.', 'Auswahl zurückgesetzt.');
                      }}
                      className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 text-[10.5px] font-semibold text-neutral-800 hover:bg-neutral-50"
                    >
                      Auswahl zurücksetzen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: 'SET_CONSENT_CLARA_PERSONALIZATION', payload: false });
                        showSettingsHint('Hervorhebungen wurden deaktiviert.', 'Hervorhebungen wurden deaktiviert.');
                      }}
                      className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 text-[10.5px] font-semibold text-neutral-800 hover:bg-neutral-50"
                    >
                      Hervorhebungen deaktivieren
                    </button>
                  </div>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold text-neutral-900">Prämien</p>
                  <p className="mt-1 text-[11px] text-neutral-700">
                    {t(
                      'Aktiviere Prämien, wenn nach abgeschlossenen Beteiligungen oder Rückmeldungen passende Angebote verfügbar sind.',
                      'Aktivieren Sie Prämien, wenn nach abgeschlossenen Beteiligungen oder Rückmeldungen passende Angebote verfügbar sind.',
                    )}
                  </p>
                  <label className="mt-2 flex items-start gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-[11px] text-neutral-800">
                    <input
                      type="checkbox"
                      checked={state.consentLocalBenefits}
                      onChange={(e) => {
                        dispatch({ type: 'SET_CONSENT_LOCAL_BENEFITS', payload: e.target.checked });
                        showSettingsHint(
                          e.target.checked ? 'Prämien aktiviert.' : 'Prämien deaktiviert.',
                          e.target.checked ? 'Prämien aktiviert.' : 'Prämien deaktiviert.',
                        );
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#003366]"
                    />
                    <span>Prämien anzeigen</span>
                  </label>
                  <p className="mt-1.5 text-[10px] text-neutral-600">
                    {t(
                      'Deine konkrete Abstimmungsentscheidung wird dafür nicht ausgewertet.',
                      'Die konkrete Abstimmungsentscheidung wird dafür nicht ausgewertet.',
                    )}
                  </p>
                  <p className="mt-1 text-[10px] text-neutral-600">
                    Diese Funktion ist freiwillig und kann jederzeit deaktiviert werden.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({ type: 'SET_CONSENT_LOCAL_BENEFITS', payload: false });
                      showSettingsHint('Prämien deaktiviert.', 'Prämien deaktiviert.');
                    }}
                    className="mt-2 w-full rounded-lg border border-neutral-300 bg-white py-1.5 text-[10.5px] font-semibold text-neutral-800 hover:bg-neutral-50"
                  >
                    Prämien deaktivieren
                  </button>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-[11px] leading-relaxed text-neutral-800">
                  <p className="font-semibold text-neutral-900">Teilnahme & Wohnort</p>
                  <p className="mt-1">
                    Teilnahme nur mit digitalem Personalausweis (eID). Der Wohnort kann nicht frei überschrieben werden;
                    Änderungen erst nach offizieller Ummeldung und erneuter Prüfung.
                  </p>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold text-neutral-900">Testzugang (Vorschau)</p>
                  <p className="mt-1 text-[11px] text-neutral-700">
                    Straße, PLZ und Wohnort – Zuständigkeit und Vorschau-Inhalte werden daraus abgeleitet (kein eID-Nachweis).
                  </p>
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={demoStreet}
                      onChange={(e) => updateDemoAddressFields({ street: e.target.value })}
                      placeholder="Straße und Hausnummer"
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800 placeholder:text-neutral-400"
                      aria-label="Straße (Vorschau)"
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
                        aria-label="Postleitzahl (Vorschau)"
                      />
                      <input
                        type="text"
                        value={demoCity}
                        onChange={(e) => updateDemoAddressFields({ city: e.target.value })}
                        placeholder="Wohnort"
                        className="col-span-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800 placeholder:text-neutral-400"
                        aria-label="Wohnort (Vorschau)"
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
                  onClick={closeSettingsToApp}
                  className="w-full rounded-lg border border-[#003366] bg-[#003366] py-2 text-sm font-semibold text-white hover:opacity-95"
                >
                  Zur App
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
      {/* ── Row 1: Brand + Aktionen ──
          Gleiche horizontale Ränder wie die blaue Tab-Zeile, damit das Wordmark über „Abstimmen“ wirkt. */}
      <div className="flex items-center justify-between gap-2 px-0.5 pb-2 pt-1 sm:px-2">
        <div className="min-w-0 flex-1 pr-1 sm:pr-2">
          <ProductIdentityHeader className="max-w-full shrink-0" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            id="tour-rewards-btn"
            onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'leaderboard' })}
            className="btn-pill flex min-h-[44px] items-center gap-1.5 border border-neutral-200 bg-white/70 px-3 py-1 hover:bg-white transition-colors"
            aria-label="Prämien öffnen"
          >
            <ListChecks className="h-3.5 w-3.5 text-[#0055A4] shrink-0" aria-hidden />
            <span className="t-badge text-neutral-900">Prämien</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="btn-icon inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-neutral-200 bg-white/75 text-neutral-700 shadow-sm backdrop-blur hover:bg-white"
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
        className="border-t border-white/10 px-0.5 pb-1.5 pt-1.5 sm:px-2"
        style={{
          background: 'linear-gradient(180deg, #002855 0%, #003366 55%, #002f5c 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="min-h-[44px] overflow-hidden">
          <div className="grid min-h-[44px] w-full min-w-0 grid-cols-4 items-stretch gap-px sm:gap-1">
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
                className={`flex h-[36px] min-w-0 items-center justify-center rounded-full px-0.5 py-1.5 text-[9.5px] font-semibold leading-none tracking-tight whitespace-nowrap transition-all min-[360px]:text-[10.5px] sm:px-3 sm:text-[12px] ${
                  isActive
                    ? 'bg-white !font-bold text-[#003366] shadow-md ring-1 ring-white/80'
                    : 'text-white/85 hover:bg-white/12 hover:text-white active:bg-white/18'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          </div>
        </div>
      </div>

      {settingsModal}
    </header>
  );
};

export default AppHeader;
