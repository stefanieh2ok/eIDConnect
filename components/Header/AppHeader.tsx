'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/context/AppContext';
import { EbeneLevel, Location, Section } from '@/types';
import { CalendarDays, ChevronLeft, ListChecks, Settings } from 'lucide-react';
import PolitikBarometerPanel from '@/components/Intro/PolitikBarometerPanel';
import { normalizePlz, parseLegacyDemoAddress, suggestCityFromPlz } from '@/data/plzDemoLookup';
import {
  BUNDESLAENDER_OPTIONS,
  ERWERBSSTATUS_OPTIONS,
  KINDER_ALTERSGRUPPEN,
  NUTZUNGSROLLE_OPTIONS,
  SPRACHE_OPTIONS,
  VORSCHAU_PERSPEKTIVE_OPTIONS,
  WOHNSITUATION_OPTIONS,
} from '@/data/fuerMichProfileOptions';
import type { ChildAgeBand } from '@/types/fuerMich';
import ProductIdentityHeader from '@/components/ui/ProductIdentityHeader';
import { persistAndSyncDemoAddress } from '@/lib/demo-address-persist';

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
  fuermich:    ['bund', 'land', 'kreis', 'kommune'],
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
  // „Zurück zur App“: Das Settings-Overlay nur schließen – die zuletzt aktive
  // Section bleibt im Hintergrund erhalten, daher kein erzwungenes SET_ACTIVE_SECTION.
  const closeSettingsToApp = () => {
    setShowSettings(false);
  };

  const profile = state.buergerProfil;
  const updateProfile = (patch: Partial<typeof profile>) =>
    dispatch({ type: 'UPDATE_BUERGER_PROFIL', payload: patch });
  const toggleChildBand = (band: ChildAgeBand) => {
    const has = profile.kinderAltersgruppen.includes(band);
    updateProfile({
      kinderAltersgruppen: has
        ? profile.kinderAltersgruppen.filter((b) => b !== band)
        : [...profile.kinderAltersgruppen, band],
    });
  };

  // „Zum Profil“ aus dem Wegweiser öffnet die Einstellungen und springt zu den Stammdaten.
  useEffect(() => {
    const onOpenSettings = (e: Event) => {
      setShowSettings(true);
      const detail = (e as CustomEvent).detail as { scrollTo?: string } | undefined;
      if (detail?.scrollTo) {
        window.setTimeout(() => {
          document
            .getElementById(detail.scrollTo as string)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    };
    window.addEventListener('app:open-settings', onOpenSettings as EventListener);
    return () => window.removeEventListener('app:open-settings', onOpenSettings as EventListener);
  }, []);

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
              className="settings-shell-modal w-full max-w-[390px] max-h-[74dvh] overflow-hidden rounded-2xl border border-[#D6E0EE] bg-[#F7F9FC] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 mb-0 flex items-center justify-between border-b border-[#D6E0EE] bg-white px-4 py-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#003366]">Einstellungen</h3>
                  <p className="mt-0.5 text-[10px] font-semibold text-[#5f6b7a]">
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

                <div className="max-h-[calc(74dvh-112px)] overflow-y-auto space-y-3.5 px-4 py-3">
                {/* 1. Zurück zur App */}
                <button
                  type="button"
                  onClick={closeSettingsToApp}
                  className="app-shell-action-pill inline-flex w-full items-center justify-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-[#003366]"
                >
                  <ChevronLeft size={14} aria-hidden />
                  Zurück zur App
                </button>

                {/* 2. Mein Profil */}
                <section className="settings-shell-section">
                  <p className="text-[13px] font-bold text-[#003366]">Mein Profil</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">
                    {t(
                      'Alle Angaben sind freiwillig und helfen nur, Inhalte besser einzuordnen.',
                      'Alle Angaben sind freiwillig und helfen nur, Inhalte besser einzuordnen.',
                    )}
                  </p>
                </section>

                {/* 3. Anrede */}
                <section className="settings-shell-section">
                  <p className="text-[13px] font-bold text-[#003366]">Anrede</p>
                  <p className="mt-1 text-[11px] text-neutral-700">Kann jederzeit geändert werden.</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'SET_ANREDE', payload: 'sie' })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        state.anrede === 'sie'
                          ? 'border border-emerald-300 bg-emerald-50 text-[#1A2B45] shadow-sm'
                          : 'border border-neutral-200 bg-white text-neutral-700'
                      }`}
                    >
                      Sie
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'SET_ANREDE', payload: 'du' })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        state.anrede === 'du'
                          ? 'border border-emerald-300 bg-emerald-50 text-[#1A2B45] shadow-sm'
                          : 'border border-neutral-200 bg-white text-neutral-700'
                      }`}
                    >
                      Du
                    </button>
                  </div>
                </section>

                {/* 4. Sprache */}
                <section id="settings-stammdaten" className="settings-shell-section" style={{ scrollMarginTop: '8px' }}>
                  <p className="text-[13px] font-bold text-[#003366]">Sprache</p>
                  <p className="mt-1 text-[11px] text-neutral-700">
                    {t('Bevorzugte Sprache (optional).', 'Bevorzugte Sprache (optional).')}
                  </p>
                  <select
                    value={profile.sprache}
                    onChange={(e) => updateProfile({ sprache: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800"
                    aria-label="Sprache"
                  >
                    <option value="">Keine Angabe</option>
                    {SPRACHE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </section>

                {/* 5. Nutzungsrolle */}
                <section className="settings-shell-section">
                  <p className="text-[13px] font-bold text-[#003366]">Nutzungsrolle</p>
                  <p className="mt-1 text-[11px] text-neutral-700">
                    {t('Wofür nutzt du die App?', 'Wofür nutzen Sie die App?')}
                  </p>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {NUTZUNGSROLLE_OPTIONS.map((o) => {
                      const active = profile.nutzungsrolle === o.value;
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => updateProfile({ nutzungsrolle: active ? '' : o.value })}
                          aria-pressed={active}
                          className={`rounded-lg border px-3 py-2 text-left text-[11px] font-semibold ${
                            active
                              ? 'border-emerald-300 bg-emerald-50 text-[#1A2B45] shadow-sm'
                              : 'border-neutral-200 bg-white text-neutral-700'
                          }`}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* 6. Region */}
                <section className="settings-shell-section">
                  <p className="text-[13px] font-bold text-[#003366]">Region</p>
                  <p className="mt-1 text-[11px] text-neutral-700">
                    PLZ und Wohnort genügen für die regionale Orientierung (kein eID-Nachweis).
                  </p>
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={5}
                        value={demoPlz}
                        onChange={(e) => updateDemoAddressFields({ plz: e.target.value })}
                        placeholder="PLZ"
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800 placeholder:text-neutral-400"
                        aria-label="Postleitzahl"
                      />
                      <input
                        type="text"
                        value={demoCity}
                        onChange={(e) => updateDemoAddressFields({ city: e.target.value })}
                        placeholder="Wohnort"
                        className="col-span-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800 placeholder:text-neutral-400"
                        aria-label="Wohnort"
                      />
                    </div>
                    <select
                      value={profile.bundesland}
                      onChange={(e) => updateProfile({ bundesland: e.target.value })}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800"
                      aria-label="Bundesland"
                    >
                      <option value="">Bundesland (optional)</option>
                      {BUNDESLAENDER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                        Abgeleitete Demo-Zuständigkeit
                      </div>
                      <div className="mt-0.5 text-[12px] font-semibold text-[#1A2B45]">
                        {demoZustaendigkeit || 'Wird aus PLZ und Ort abgeleitet.'}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 8. Haushalt */}
                <section className="settings-shell-section">
                  <p className="text-[13px] font-bold text-[#003366]">Haushalt</p>
                  <p className="mt-1 text-[11px] text-neutral-700">Kinder im Haushalt (optional, ohne Detailangaben).</p>
                  <div className="mt-2 flex gap-2">
                    {(['ja', 'nein'] as const).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() =>
                          updateProfile({
                            kinderVorhanden: val,
                            kinderAltersgruppen: val === 'nein' ? [] : profile.kinderAltersgruppen,
                          })
                        }
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          profile.kinderVorhanden === val
                            ? 'border border-emerald-300 bg-emerald-50 text-[#1A2B45] shadow-sm'
                            : 'border border-neutral-200 bg-white text-neutral-700'
                        }`}
                      >
                        {val === 'ja' ? 'Kinder vorhanden' : 'keine Kinder'}
                      </button>
                    ))}
                  </div>
                  {profile.kinderVorhanden === 'ja' ? (
                    <div className="mt-2">
                      <p className="text-[10.5px] font-semibold text-neutral-700">Altersgruppen</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {KINDER_ALTERSGRUPPEN.map((o) => {
                          const active = profile.kinderAltersgruppen.includes(o.value);
                          return (
                            <button
                              key={o.value}
                              type="button"
                              onClick={() => toggleChildBand(o.value)}
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                active
                                  ? 'border-emerald-300 bg-emerald-50 text-[#1A2B45] shadow-sm'
                                  : 'border-neutral-200 bg-white text-neutral-700'
                              }`}
                            >
                              {o.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </section>

                {/* 9. Wohnen */}
                <section className="settings-shell-section">
                  <p className="text-[13px] font-bold text-[#003366]">Wohnen</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {WOHNSITUATION_OPTIONS.map((o) => {
                      const active = profile.wohnsituation === o.value;
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => updateProfile({ wohnsituation: active ? '' : o.value })}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                            active
                              ? 'border-emerald-300 bg-emerald-50 text-[#1A2B45] shadow-sm'
                              : 'border-neutral-200 bg-white text-neutral-700'
                          }`}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* 10. Arbeit & Bildung */}
                <section className="settings-shell-section">
                  <p className="text-[13px] font-bold text-[#003366]">Arbeit & Bildung</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ERWERBSSTATUS_OPTIONS.map((o) => {
                      const active = profile.erwerbsstatus === o.value;
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => updateProfile({ erwerbsstatus: active ? '' : o.value })}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                            active
                              ? 'border-emerald-300 bg-emerald-50 text-[#1A2B45] shadow-sm'
                              : 'border-neutral-200 bg-white text-neutral-700'
                          }`}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* 11. Mobilität */}
                <section className="settings-shell-section">
                  <p className="text-[13px] font-bold text-[#003366]">Mobilität</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-neutral-700">
                    {t(
                      'Themen wie Führerschein, Online-Ausweis und Kfz findest du im Wegweiser unter „Mobilität & Führerschein“. Keine Anspruchsprüfung.',
                      'Themen wie Führerschein, Online-Ausweis und Kfz finden Sie im Wegweiser unter „Mobilität & Führerschein“. Keine Anspruchsprüfung.',
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'fuermich' });
                      setShowSettings(false);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#003366] bg-white px-3 py-2 text-[11px] font-semibold text-[#003366] hover:bg-neutral-50"
                  >
                    Zum Wegweiser
                  </button>
                </section>

                {/* 10. Interessen & Relevanz */}
                <section className="settings-shell-section">
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

                <section className="settings-shell-section">
                  <p className="text-[13px] font-bold text-[#003366]">Prämien</p>
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

                <section className="settings-shell-section text-[11px] leading-relaxed text-neutral-700">
                  <p className="font-semibold text-[#003366]">Teilnahme & Wohnort</p>
                  <p className="mt-1">
                    Teilnahme nur mit digitalem Personalausweis (eID). Der Wohnort kann nicht frei überschrieben werden;
                    Änderungen erst nach offizieller Ummeldung und erneuter Prüfung.
                  </p>
                </section>

                {/* 11. Datenschutz / Angaben löschen */}
                <section className="settings-shell-section">
                  <p className="text-[13px] font-bold text-[#003366]">Datenschutz</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-neutral-700">
                    {t(
                      'Deine Angaben werden nur für diese Sitzung im Browser gehalten und nicht gespeichert. Du kannst sie jederzeit löschen.',
                      'Ihre Angaben werden nur für diese Sitzung im Browser gehalten und nicht gespeichert. Sie können sie jederzeit löschen.',
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({ type: 'RESET_BUERGER_PROFIL' });
                      setDemoStreet('');
                      setDemoPlz('');
                      setDemoCity('');
                      setDemoZustaendigkeit('');
                      showSettingsHint('Angaben gelöscht.', 'Angaben gelöscht.');
                    }}
                    className="mt-2 w-full rounded-lg border border-neutral-300 bg-white py-1.5 text-[10.5px] font-semibold text-neutral-800 hover:bg-neutral-50"
                  >
                    Angaben löschen
                  </button>
                </section>

                {/* 12. Demo & Audit / Vorschau-Einstellungen */}
                <section className="settings-shell-section">
                  <p className="text-[13px] font-bold text-[#003366]">Demo &amp; Audit</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">
                    {t(
                      'Hier siehst du, welche Funktionen in dieser Vorschau aktiv, simuliert oder noch offen sind.',
                      'Hier sehen Sie, welche Funktionen in dieser Vorschau aktiv, simuliert oder noch offen sind.',
                    )}
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer list-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-[#003366] hover:bg-neutral-50">
                      {t('Vorschau-Perspektive einstellen', 'Vorschau-Perspektive einstellen')}
                    </summary>
                    <div className="mt-2">
                      <p className="text-[11px] font-semibold text-neutral-800">
                        {t('Aus welcher Perspektive testest du?', 'Aus welcher Perspektive testen Sie?')}
                      </p>
                      <div className="mt-2 flex flex-col gap-1.5">
                        {VORSCHAU_PERSPEKTIVE_OPTIONS.map((o) => {
                          const active = profile.altersgruppe === o.value;
                          return (
                            <button
                              key={o.value}
                              type="button"
                              onClick={() => updateProfile({ altersgruppe: active ? '' : o.value })}
                              aria-pressed={active}
                              className={`rounded-lg border px-3 py-2 text-left text-[11px] font-semibold ${
                                active
                                  ? 'border-emerald-300 bg-emerald-50 text-[#1A2B45] shadow-sm'
                                  : 'border-neutral-200 bg-white text-neutral-700'
                              }`}
                            >
                              {o.label}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-[10px] leading-relaxed text-neutral-500">
                        Nur für die Vorschau. Im Produktivbetrieb würde die Alterslogik aus einem
                        verifizierten Identitätskontext abgeleitet.
                      </p>
                    </div>
                  </details>
                </section>

                {/* 13. Einführung erneut anzeigen */}
                <section className="settings-shell-section">
                  <p className="text-[13px] font-bold text-[#003366]">Einführung</p>
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

              <div className="border-t border-[#D6E0EE] bg-white px-4 py-3">
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

              <div className="border-t border-[#D6E0EE] bg-[#F7F9FC] px-4 py-3">
                <button
                  type="button"
                  onClick={closeSettingsToApp}
                  className="app-shell-action-pill w-full py-2.5 text-sm font-semibold text-[#003366]"
                >
                  Zurück zur App
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
      className="app-shell-header sticky top-0 z-50"
      style={{
        paddingTop: 'max(0.55rem, env(safe-area-inset-top, 0.55rem))',
      }}
    >
      {/* ── Row 1: Brand + Aktionen ── */}
      <div className="flex items-center justify-between gap-2 px-2 pb-1.5 pt-0.5 sm:px-3">
        <div className="min-w-0 flex-1 pr-1 sm:pr-2">
          <ProductIdentityHeader className="max-w-full shrink-0" />
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'kalender' })}
            className={`app-shell-utility-btn ${
              state.activeSection === 'kalender' ? 'app-shell-utility-btn--active' : ''
            }`}
            aria-label="Kalender öffnen"
            aria-current={state.activeSection === 'kalender' ? 'page' : undefined}
            title="Kalender"
          >
            <CalendarDays size={17} aria-hidden />
          </button>
          <button
            type="button"
            id="tour-rewards-btn"
            onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'leaderboard' })}
            className={`app-shell-utility-btn px-2 ${
              state.activeSection === 'leaderboard' ? 'app-shell-utility-btn--active' : ''
            }`}
            aria-label="Prämien öffnen"
            aria-current={state.activeSection === 'leaderboard' ? 'page' : undefined}
          >
            <ListChecks className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="app-shell-utility-btn__label">Prämien</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="app-shell-utility-btn"
            aria-label="Einstellungen öffnen"
          >
            <Settings size={17} />
          </button>
        </div>
      </div>

      {settingsModal}
    </header>
  );
};

export default AppHeader;
