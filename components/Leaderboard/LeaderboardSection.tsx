'use client';

import React from 'react';
import { AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const LEVEL_LABELS: Record<string, string> = {
  bund: 'Bund',
  land: 'Land',
  kreis: 'Kreis',
  kommune: 'Kommune',
};

const POINTS_EXPLANATION = [
  { action: 'Abstimmung (Vorlage)', points: 'Je nach Ebene (50–500)' },
  { action: 'Wahl (Stimmzettel)', points: '200 pro Wahlgang' },
];

const LeaderboardSection: React.FC = () => {
  const { state, dispatch } = useApp();

  const toggleConsent = () => {
    dispatch({
      type: 'SET_CONSENT_PARTICIPATION_TRACKING',
      payload: !state.consentParticipationTracking,
    });
  };

  const total =
    state.participationByLevel.bund +
    state.participationByLevel.land +
    state.participationByLevel.kreis +
    state.participationByLevel.kommune;

  if (!state.consentParticipationTracking) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-[var(--eu,#003399)]" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Beteiligungsnachweis
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Sie können Ihre demokratische Beteiligung in dieser App nachvollziehen lassen.
                Dabei wird lokal in Ihrem Browser gespeichert, wie viele Abstimmungen und
                Wahlgänge Sie durchgeführt haben und welche Punkte daraus resultieren.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Datenschutzhinweis
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                Alle Daten werden ausschließlich lokal in Ihrem Browser gespeichert.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                Es erfolgt keine Übermittlung an Server oder Dritte.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                Sie können die Erfassung jederzeit widerrufen. Ihre Daten werden dann gelöscht.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                In der Produktionsversion würde die Erfassung über den eID-Provider datenschutzkonform erfolgen.
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={toggleConsent}
            className="mt-5 w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--eu,#003399)' }}
          >
            Einwilligen und Beteiligung erfassen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Beteiligungsindex */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div
          className="flex items-center gap-3 rounded-t-2xl px-5 py-4 text-white"
          style={{ background: 'var(--eu,#003399)' }}
        >
          <Info className="h-5 w-5" />
          <h2 className="text-base font-semibold">Beteiligungsindex</h2>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 px-2 py-4">
              <div className="text-2xl font-bold tabular-nums text-slate-900">
                {state.participationPoints.toLocaleString('de-DE')}
              </div>
              <div className="mt-1 text-[11px] font-medium text-slate-500">Punkte</div>
            </div>
            <div className="rounded-xl bg-slate-50 px-2 py-4">
              <div className="text-2xl font-bold tabular-nums text-slate-900">
                {state.participationVoteCount}
              </div>
              <div className="mt-1 text-[11px] font-medium text-slate-500">Abstimmungen</div>
            </div>
            <div className="rounded-xl bg-slate-50 px-2 py-4">
              <div className="text-2xl font-bold tabular-nums text-slate-900">
                {state.participationElectionCount}
              </div>
              <div className="mt-1 text-[11px] font-medium text-slate-500">Wahlgänge</div>
            </div>
          </div>
        </div>
      </div>

      {/* Aufschlüsselung nach Verwaltungsebene */}
      {total > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            Teilnahme nach Verwaltungsebene
          </h3>
          <div className="space-y-3">
            {(['bund', 'land', 'kreis', 'kommune'] as const).map((level) => {
              const count = state.participationByLevel[level];
              if (count === 0) return null;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={level}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{LEVEL_LABELS[level]}</span>
                    <span className="tabular-nums text-slate-500">
                      {count} {count === 1 ? 'Teilnahme' : 'Teilnahmen'}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        background: 'var(--eu,#003399)',
                        opacity: level === 'bund' ? 1 : level === 'land' ? 0.8 : level === 'kreis' ? 0.6 : 0.45,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Punktevergabe – Transparenz */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-800">So werden Punkte vergeben</h3>
        </div>
        <div className="space-y-2">
          {POINTS_EXPLANATION.map((row) => (
            <div key={row.action} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{row.action}</span>
              <span className="font-medium text-slate-800">{row.points}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
          Die Punktevergabe dient ausschließlich der Nachvollziehbarkeit Ihrer Beteiligung.
          Es handelt sich um eine Demo-Funktion. In der Produktionsversion erfolgt die
          Verifizierung über den eID-Provider.
        </p>
      </div>

      {/* Einwilligung widerrufen */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
          <div className="flex-1">
            <p className="text-sm text-slate-700">
              Beteiligungserfassung ist <strong>aktiv</strong>. Ihre Daten werden ausschließlich lokal gespeichert.
            </p>
            <button
              type="button"
              onClick={toggleConsent}
              className="mt-2 text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-800"
            >
              Einwilligung widerrufen und Daten löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardSection;
