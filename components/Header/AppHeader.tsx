'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Location } from '@/types';

/** Fallback, wenn noch keine PLZ/Ort eingegeben (ältere Sessions). */
const LEGACY_REGION_LEVELS: { value: Location; title: string; subtitle: string }[] = [
  { value: 'bundesweit', title: 'Deutschland', subtitle: 'Bund' },
  { value: 'saarland', title: 'Saarland', subtitle: 'Land' },
  { value: 'saarpfalz', title: 'Saarpfalz', subtitle: 'Kreis' },
  { value: 'kirkel', title: 'Kirkel', subtitle: 'Kommune' },
];

/**
 * Ein einziger fixierter Kopfbereich: Marke, Bereiche, Region, Einstellungen.
 * Keine zweite Navigationsleiste unten auf dem Bildschirm.
 */
const AppHeader: React.FC = () => {
  const { state, dispatch } = useApp();
  const buildRef =
    process.env.NEXT_PUBLIC_BUILD_ID ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
    process.env.NEXT_PUBLIC_COMMIT_SHA?.slice(0, 7) ||
    'local';

  const isKommuneScope =
    state.regionResolution != null
      ? state.activeAdministrativeScope === 'kommune'
      : state.activeLocation === 'kirkel' || state.activeLocation === 'saarpfalz';

  const goMelden = () => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'melden' });
  const goAbstimmen = () => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'live' });
    dispatch({ type: 'SET_ACTIVE_ABSTIMMUNG_TAB', payload: 'aktuell' });
  };
  const goErgebnisse = () => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'live' });
    dispatch({ type: 'SET_ACTIVE_ABSTIMMUNG_TAB', payload: 'ergebnisse' });
  };
  const goWahlen = () => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'wahlen' });
  const goKalender = () => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'kalender' });
  const goPunkte = () => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'leaderboard' });
  const goNews = () => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'news' });

  const abActive = state.activeSection === 'live' && state.activeAbstimmungTab === 'aktuell';
  const ergActive = state.activeSection === 'live' && state.activeAbstimmungTab === 'ergebnisse';

  const pill = (active: boolean) =>
    `flex-shrink-0 rounded-lg px-2.5 py-2 text-[11px] font-semibold whitespace-nowrap transition-colors sm:text-xs ${
      active ? 'bg-blue-900 text-white shadow-sm' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
    }`;

  const regionPill = (active: boolean) =>
    `flex-1 min-w-0 rounded-lg px-1 py-2 text-center transition-colors ${
      active ? 'bg-white text-[var(--eu,#003399)] shadow-sm' : 'text-white hover:bg-white/15'
    }`;

  return (
    <header
      className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm"
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
      }}
    >
      {/* Zeile 1: Marke + Kennzahlen + Einstellungen */}
      <div
        className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-white"
        style={{ background: 'var(--eu,#003399)' }}
      >
        <h1 className="text-base font-semibold tracking-tight sm:text-lg">
          {process.env.NEXT_PUBLIC_APP_NAME || 'eIDConnect'}
        </h1>
        <div className="flex items-center gap-2">
          {state.consentParticipationTracking && (
            <>
              <div className="hidden rounded-lg bg-white/10 px-2 py-1 text-center text-[10px] leading-tight sm:block sm:text-xs">
                <div className="font-semibold tabular-nums">
                  {state.participationPoints.toLocaleString('de-DE')}
                </div>
                <div className="opacity-90">Punkte</div>
              </div>
              <div className="rounded-lg bg-white/10 px-2 py-1 text-center text-[10px] leading-tight sm:text-xs">
                <div className="font-semibold tabular-nums">
                  {state.participationVoteCount + state.participationElectionCount}
                </div>
                <div className="opacity-90">Teilnahmen</div>
              </div>
            </>
          )}
          <button
            type="button"
            id="tour-settings-btn"
            onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'leaderboard' })}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 hover:bg-white/25"
            aria-label="Einstellungen"
          >
            <Settings className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Zeile 2: Hauptnavigation (Tour-Ziel behält id tour-footer für bestehende Tour) */}
      <nav
        id="tour-footer"
        className="flex gap-1 overflow-x-auto border-b border-slate-100 bg-white px-2 py-2"
        aria-label="Hauptnavigation"
        style={{ maxWidth: '430px', margin: '0 auto' }}
      >
        {isKommuneScope && (
          <button id="tour-melden-btn" type="button" onClick={goMelden} className={pill(state.activeSection === 'melden')}>
            Melden
          </button>
        )}
        <button id="tour-voting-btn" type="button" onClick={goAbstimmen} className={pill(abActive)}>
          Abstimmen
        </button>
        <button type="button" onClick={goWahlen} className={pill(state.activeSection === 'wahlen')}>
          Wahlen
        </button>
        <button type="button" onClick={goKalender} className={pill(state.activeSection === 'kalender')}>
          Kalender
        </button>
        <button type="button" onClick={goErgebnisse} className={pill(ergActive)}>
          Ergebnisse
        </button>
        <button id="tour-rewards-btn" type="button" onClick={goPunkte} className={pill(state.activeSection === 'leaderboard')}>
          Punkte
        </button>
        <button type="button" onClick={goNews} className={pill(state.activeSection === 'news')}>
          News
        </button>
      </nav>

      {/* Zeile 3: Verwaltungsebenen – aus PLZ/Ort oder Demo-Fallback */}
      <div
        className="flex gap-1 px-2 py-2"
        style={{ background: 'var(--eu,#003399)' }}
      >
        {state.regionResolution ? (
          <>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_ADMINISTRATIVE_SCOPE', payload: 'bund' })}
              className={regionPill(state.activeAdministrativeScope === 'bund')}
            >
              <div className="truncate text-[10px] font-semibold leading-tight sm:text-xs">
                {state.regionResolution.bundLabel}
              </div>
              <div className="truncate text-[9px] opacity-90 sm:text-[10px]">Bund</div>
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_ADMINISTRATIVE_SCOPE', payload: 'land' })}
              className={regionPill(state.activeAdministrativeScope === 'land')}
            >
              <div className="truncate text-[10px] font-semibold leading-tight sm:text-xs">
                {state.regionResolution.landLabel}
              </div>
              <div className="truncate text-[9px] opacity-90 sm:text-[10px]">Land</div>
            </button>
            {state.regionResolution.kreisLabel ? (
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_ACTIVE_ADMINISTRATIVE_SCOPE', payload: 'kreis' })}
                className={regionPill(state.activeAdministrativeScope === 'kreis')}
              >
                <div className="truncate text-[10px] font-semibold leading-tight sm:text-xs">
                  {state.regionResolution.kreisLabel}
                </div>
                <div className="truncate text-[9px] opacity-90 sm:text-[10px]">Kreis</div>
              </button>
            ) : null}
            {state.regionResolution.kommuneLabel ? (
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_ACTIVE_ADMINISTRATIVE_SCOPE', payload: 'kommune' })}
                className={regionPill(state.activeAdministrativeScope === 'kommune')}
              >
                <div className="truncate text-[10px] font-semibold leading-tight sm:text-xs">
                  {state.regionResolution.kommuneLabel}
                </div>
                <div className="truncate text-[9px] opacity-90 sm:text-[10px]">Kommune</div>
              </button>
            ) : null}
          </>
        ) : (
          LEGACY_REGION_LEVELS.map(({ value, title, subtitle }) => (
            <button
              key={value}
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_LOCATION', payload: value })}
              className={regionPill(state.activeLocation === value)}
            >
              <div className="truncate text-[10px] font-semibold leading-tight sm:text-xs">{title}</div>
              <div className="truncate text-[9px] opacity-90 sm:text-[10px]">{subtitle}</div>
            </button>
          ))
        )}
      </div>

      <p className="border-t border-white/10 bg-[var(--eu,#003399)] px-2 py-1.5 text-center text-[10px] text-white/85">
        {state.regionResolution
          ? `PLZ ${state.regionResolution.plz} · ${state.regionResolution.city}`
          : 'Mitreden · Mitentscheiden · Mitgestalten'}
      </p>
      <p className="bg-[var(--eu,#003399)] px-2 pb-1.5 text-center text-[9px] text-white/65">
        Build: {buildRef}
      </p>
    </header>
  );
};

export default AppHeader;
