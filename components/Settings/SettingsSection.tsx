'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CivicAppPage } from '@/components/shell/CivicAppPage';
import { ModuleScreenHeader } from '@/components/shell/ModuleScreenHeader';
import { CIVIC_SETTINGS_SCREEN_TITLE } from '@/lib/civicScreenTitles';
import { CivicDemoStatusPanel } from '@/components/shell/CivicDemoStatusPanel';
import {
  CIVIC_DEMO_STAMMDATEN_HINT,
  CIVIC_DEMO_STAMMDATEN_LABEL,
  CIVIC_DEMO_STAMMDATEN_PERSON,
} from '@/lib/civicCompliance';
import PolitikBarometerPanel from '@/components/Intro/PolitikBarometerPanel';
import {
  BUNDESLAENDER_OPTIONS,
  NUTZUNGSROLLE_OPTIONS,
  SPRACHE_OPTIONS,
  VORSCHAU_PERSPEKTIVE_OPTIONS,
} from '@/data/fuerMichProfileOptions';
import { normalizePlz, parseLegacyDemoAddress, suggestCityFromPlz } from '@/data/plzDemoLookup';
import { persistAndSyncDemoAddress } from '@/lib/demo-address-persist';
import type { Section } from '@/types';

const SETTINGS_RETURN_KEY = 'civic_settings_return_section';

export function rememberSettingsReturnSection(section: Section) {
  try {
    sessionStorage.setItem(SETTINGS_RETURN_KEY, section);
  } catch {
    /* ignore */
  }
}

function restoreSettingsReturnSection(): Section {
  try {
    const raw = sessionStorage.getItem(SETTINGS_RETURN_KEY);
    if (raw && raw !== 'settings') return raw as Section;
  } catch {
    /* ignore */
  }
  return 'fuermich';
}

export default function SettingsSection() {
  const { state, dispatch } = useApp();
  const isFormal = state.anrede === 'sie';
  const t = (du: string, sie: string) => (isFormal ? sie : du);
  const profile = state.buergerProfil;
  const [demoPlz, setDemoPlz] = useState('');
  const [demoCity, setDemoCity] = useState('');
  const [demoZustaendigkeit, setDemoZustaendigkeit] = useState('');

  const updateProfile = (patch: Partial<typeof profile>) =>
    dispatch({ type: 'UPDATE_BUERGER_PROFIL', payload: patch });

  const goBack = () => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: restoreSettingsReturnSection() });
    requestAnimationFrame(() => {
      document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'auto' });
    });
  }, []);

  useEffect(() => {
    try {
      let plz = localStorage.getItem('eidconnect_demo_plz') || '';
      let city = localStorage.getItem('eidconnect_demo_city') || '';
      if (!plz && !city) {
        const raw = localStorage.getItem('eidconnect_demo_address') || '';
        const p = parseLegacyDemoAddress(raw);
        plz = p.plz;
        city = p.city;
      }
      setDemoPlz(plz);
      setDemoCity(city);
      const hasData = normalizePlz(plz).length === 5 || city.trim().length > 0;
      if (hasData) {
        const { county } = persistAndSyncDemoAddress((a) => dispatch(a as never), '', plz, city);
        setDemoZustaendigkeit(county);
      }
    } catch {
      /* ignore */
    }
  }, [dispatch]);

  const updateDemoAddressFields = (patch: Partial<{ plz: string; city: string }>) => {
    let plz = patch.plz !== undefined ? normalizePlz(patch.plz) : demoPlz;
    let city = patch.city ?? demoCity;
    if (patch.plz !== undefined && plz.length === 5) {
      const sug = suggestCityFromPlz(plz);
      if (sug) city = sug;
    }
    setDemoPlz(plz);
    setDemoCity(city);
    const { county } = persistAndSyncDemoAddress((a) => dispatch(a as never), '', plz, city);
    setDemoZustaendigkeit(county);
  };

  return (
    <CivicAppPage id="settings-screen" className="pb-28">
      <ModuleScreenHeader title={CIVIC_SETTINGS_SCREEN_TITLE} id="settings-screen-title" />

      <button
        type="button"
        onClick={goBack}
        className="civic-settings-back mb-3 inline-flex w-full items-center justify-center gap-1.5"
      >
        <ChevronLeft size={14} aria-hidden />
        Zurück zur App
      </button>

      <div className="civic-settings-scroll space-y-3.5">
        <section className="settings-shell-section" id="settings-profil">
          <p className="text-[13px] font-bold text-[#003366]">Profil &amp; Haushalt</p>
          <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">
            {t(
              'Freiwillige Angaben zur besseren Einordnung von Inhalten.',
              'Freiwillige Angaben zur besseren Einordnung von Inhalten.',
            )}
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
          <div className="mt-3 grid grid-cols-3 gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={demoPlz}
              onChange={(e) => updateDemoAddressFields({ plz: e.target.value })}
              placeholder="PLZ"
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800"
              aria-label="Postleitzahl"
            />
            <input
              type="text"
              value={demoCity}
              onChange={(e) => updateDemoAddressFields({ city: e.target.value })}
              placeholder="Wohnort"
              className="col-span-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800"
              aria-label="Wohnort"
            />
          </div>
          <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-[11px] text-[#1A2B45]">
            {demoZustaendigkeit || 'Zuständigkeit wird aus PLZ und Ort abgeleitet.'}
          </div>
        </section>

        <section className="settings-shell-section" id="settings-datenschutz">
          <p className="text-[13px] font-bold text-[#003366]">Datenschutz &amp; Transparenz</p>
          <PolitikBarometerPanel
            du={!isFormal}
            variant="compact"
            density="tight"
            editableWithoutConsent
            headingTitle="Interessen & Relevanz"
            leadDu="Themen für Kalender-Hervorhebungen — keine politische Empfehlung."
            leadSie="Themen für Kalender-Hervorhebungen — keine politische Empfehlung."
          />
          <div className="mt-2 flex flex-wrap gap-3">
            <a href="/legal/demo-nda" className="text-[11px] font-semibold text-[#003366] hover:underline">
              Datenschutz/NDA
            </a>
          </div>
        </section>

        <section className="settings-shell-section" id="settings-barrierefreiheit">
          <p className="text-[13px] font-bold text-[#003366]">Barrierefreiheit</p>
          <div className="mt-2 flex gap-2">
            {(['sie', 'du'] as const).map((anrede) => (
              <button
                key={anrede}
                type="button"
                onClick={() => dispatch({ type: 'SET_ANREDE', payload: anrede })}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  state.anrede === anrede
                    ? 'border border-emerald-300 bg-emerald-50 text-[#1A2B45] shadow-sm'
                    : 'border border-neutral-200 bg-white text-neutral-700'
                }`}
              >
                {anrede === 'sie' ? 'Sie' : 'Du'}
              </button>
            ))}
          </div>
          <select
            value={profile.sprache}
            onChange={(e) => updateProfile({ sprache: e.target.value })}
            className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-neutral-800"
            aria-label="Sprache"
          >
            <option value="">Sprache (optional)</option>
            {SPRACHE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </section>

        <section className="settings-shell-section" id="settings-sicherheit">
          <p className="text-[13px] font-bold text-[#003366]">Sicherheit &amp; Zugang</p>
          <p className="mt-1 text-[11px] text-neutral-600">
            {t(
              'Teilnahme nur mit digitalem Personalausweis (eID). Wohnortänderungen erst nach offizieller Ummeldung.',
              'Teilnahme nur mit digitalem Personalausweis (eID). Wohnortänderungen erst nach offizieller Ummeldung.',
            )}
          </p>
          <button
            type="button"
            className="mt-2 text-[11px] font-semibold text-[#003366] hover:underline"
            onClick={() => {
              goBack();
              window.setTimeout(() => {
                document.getElementById('security-faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 200);
            }}
          >
            FAQ Sicherheit &amp; Zugang
          </button>
        </section>

        <section className="settings-shell-section" id="settings-demo">
          <p className="text-[13px] font-bold text-[#003366]">Demo &amp; Systemstatus</p>
          <section id="settings-demo-stammdaten" className="mt-2">
            <p className="text-[12px] font-semibold text-[#1A2B45]">{CIVIC_DEMO_STAMMDATEN_LABEL}</p>
            <p className="mt-0.5 text-[11px] text-neutral-600">{CIVIC_DEMO_STAMMDATEN_PERSON}</p>
            <p className="mt-0.5 text-[10px] text-neutral-500">{CIVIC_DEMO_STAMMDATEN_HINT}</p>
            <label className="mt-2 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2.5">
              <span className="text-[11px] font-semibold text-[#1A2B45]">Demo-Stammdaten verwenden</span>
              <input
                type="checkbox"
                checked={state.useDemoStammdaten}
                onChange={(e) =>
                  dispatch({ type: 'SET_USE_DEMO_STAMMDATEN', payload: e.target.checked })
                }
                className="h-4 w-4 shrink-0 accent-[#003366]"
                aria-label="Demo-Stammdaten verwenden"
              />
            </label>
          </section>
          <CivicDemoStatusPanel />
          <details className="mt-2">
            <summary className="cursor-pointer list-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-[#003366] hover:bg-neutral-50">
              {t('Vorschau-Perspektive einstellen', 'Vorschau-Perspektive einstellen')}
            </summary>
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
          </details>
        </section>
      </div>
    </CivicAppPage>
  );
}
