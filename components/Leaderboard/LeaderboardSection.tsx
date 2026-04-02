'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { regionalPraemienForCity } from '@/data/demoVoting2026';
import { SectionLevelFilterIcon, selectionLabelForSection } from '@/components/Filter/SectionLevelFilterIcon';
import { DEMO_LOCATION_LABEL } from '@/lib/locationLabels';

const PRAEMIEN_INTRO_DONE_KEY = 'eidconnect_praemien_intro_done_v1';

const LeaderboardSection: React.FC = () => {
  const { state, dispatch } = useApp();
  const [redeemedIds, setRedeemedIds] = useState<Record<string, boolean>>({});
  const [showPraemienIntro, setShowPraemienIntro] = useState(false);

  useEffect(() => {
    if (state.consentPraemien) {
      setShowPraemienIntro(false);
      return;
    }
    try {
      const raw = localStorage.getItem(PRAEMIEN_INTRO_DONE_KEY);
      if (raw === 'true') return;
      setShowPraemienIntro(true);
    } catch {
      setShowPraemienIntro(true);
    }
  }, [state.consentPraemien]);

  const cityName = useMemo(() => {
    return DEMO_LOCATION_LABEL[state.activeLocation] ?? 'Kommune';
  }, [state.activeLocation]);

  const praemien = useMemo(() => regionalPraemienForCity(cityName), [cityName]);

  return (
    <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Punkte sammeln und Prämien erhalten</h2>
              <div className="mt-0.5 text-[11px] text-neutral-500">
                {selectionLabelForSection('leaderboard', state.activeLocation, state.residenceLocation)}
              </div>
            </div>
            <SectionLevelFilterIcon section="leaderboard" />
      </div>
      {/* Lokale Prämien */}
      <div className="bg-white/70 rounded-2xl p-5 shadow-sm border border-neutral-200 backdrop-blur">
        <h3 className="text-base font-bold text-gray-900 mb-2">Lokale Prämien</h3>
        <p className="text-sm text-gray-600 mb-3">
          {state.consentPraemien
            ? 'Ihre Teilnahme ist aktiv.'
            : 'Prämien und Einlöseangebote sind ohne Zustimmung gesperrt.'}
        </p>

        <label className="flex items-start gap-3 text-sm text-gray-800 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.consentPraemien}
            onChange={(e) => dispatch({ type: 'SET_CONSENT_PRAEMIEN', payload: e.target.checked })}
            className="mt-1"
          />
          <span>Ich möchte am freiwilligen Punkte- und Prämienprogramm teilnehmen.</span>
        </label>
        <p className="text-[11px] leading-relaxed text-neutral-600 mb-3">
          Prämien und Einlöseangebote werden erst nach Ihrer Zustimmung sichtbar.
        </p>

        <div className="flex items-center justify-between text-sm text-gray-700 mb-3 rounded-xl border border-neutral-200 bg-[#F7F9FC] px-3 py-2">
          <span className="font-medium">Deine Punkte</span>
          <span className="font-bold text-gray-900 tabular-nums">
            {state.participationPoints.toLocaleString('de-DE')} Punkte
          </span>
        </div>

        <div className="space-y-3">
          {praemien.map((p) => {
            const canRedeem = state.consentPraemien && state.participationPoints >= p.points;
            const isRedeemed = Boolean(redeemedIds[p.id]);
            return (
              <div key={p.id} className="bg-white/60 rounded-xl border border-neutral-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{p.name}</div>
                    {state.consentPraemien ? (
                      <div className="text-xs text-gray-600 mt-1">
                        {p.description} · {p.points.toLocaleString('de-DE')} Punkte
                      </div>
                    ) : (
                      <div className="text-[11px] text-neutral-500 mt-1">
                        Gesperrt. Verfügbar nach Ihrer Zustimmung.
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!canRedeem || isRedeemed}
                    onClick={() => {
                      if (!canRedeem) return;
                      setRedeemedIds((prev) => ({ ...prev, [p.id]: true }));
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition border ${
                      canRedeem && !isRedeemed
                        ? 'bg-[#003d80] text-white border-[#003d80] hover:opacity-90'
                        : 'bg-white/40 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {isRedeemed ? 'Eingelöst ✓' : canRedeem ? 'Einlösen' : 'Einlösen (gesperrt)'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showPraemienIntro && !state.consentPraemien && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
            }}
            onClick={() => {
              try {
                localStorage.setItem(PRAEMIEN_INTRO_DONE_KEY, 'true');
              } catch {}
              setShowPraemienIntro(false);
            }}
          />
          <div
            className="relative w-[min(92vw,360px)] rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden sm:w-[min(92vw,420px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Schließen"
              className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full border border-neutral-200 bg-white/90 text-neutral-700 flex items-center justify-center"
              onClick={() => {
                try {
                  localStorage.setItem(PRAEMIEN_INTRO_DONE_KEY, 'true');
                } catch {}
                setShowPraemienIntro(false);
              }}
            >
              ×
            </button>

            <div className="px-5 pt-5 pb-3">
              <div className="text-xs font-semibold text-neutral-500">eID DEMO CONNECT</div>
              <h2 className="text-lg font-bold text-gray-900 mt-1">eID Demo Connect im Überblick</h2>
              <div className="mt-2 text-sm font-semibold text-[#003366]">
                Punkte sammeln und Prämien erhalten
              </div>
              <div className="mt-3 space-y-2 text-sm text-gray-700 leading-relaxed">
                <p>
                  Die Teilnahme am Prämienprogramm ist freiwillig und wird erst nach Ihrer ausdrücklichen Zustimmung aktiviert.
                </p>
                <p>Punkte für aktive Beteiligung werden nur im dafür erforderlichen Umfang verarbeitet.</p>
                <p>Prämien und Einlöseangebote werden erst angezeigt, wenn Sie dem Programm ausdrücklich zustimmen.</p>
              </div>
              <p className="mt-3 text-[11px] text-neutral-600 leading-relaxed">
                Ihre Einwilligung können Sie jederzeit in den Einstellungen widerrufen.
              </p>
            </div>

            <div className="px-5 pb-5 pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem(PRAEMIEN_INTRO_DONE_KEY, 'true');
                  } catch {}
                  setShowPraemienIntro(false);
                }}
                className="flex-1 min-h-[44px] rounded-xl border border-neutral-900 bg-black text-white text-sm font-semibold"
              >
                Später
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem(PRAEMIEN_INTRO_DONE_KEY, 'true');
                  } catch {}
                  dispatch({ type: 'SET_CONSENT_PRAEMIEN', payload: true });
                  setShowPraemienIntro(false);
                }}
                className="flex-1 min-h-[44px] rounded-xl border border-[#004a99] text-sm font-bold text-white shadow-md"
                style={{
                  background:
                    'linear-gradient(135deg, var(--gov-primary, #003366) 0%, var(--gov-primary-mid, #0055a4) 100%)',
                }}
              >
                Teilnahme aktivieren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardSection;
