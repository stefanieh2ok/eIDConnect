'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { THEME_NAMES } from '@/data/constants';
import type { UserPreferences } from '@/types';

/**
 * Politikbarometer – Auswahl der Themen, auf die die App später mit
 * Hinweisen auf passende Abstimmungen und Kalender-Terminen reagiert.
 *
 * Wording bewusst NICHT in Richtung „Interessen" oder „Profiling", sondern
 * als Themenwahl für relevante Hinweise und Termine – entsprechend den
 * UX-Vorgaben für State-Clarity im Einführungs-Flow.
 *
 * Diese Komponente wird sowohl im ehemaligen LoginScreen-Pfad als auch im
 * letzten Walkthrough-Schritt (Einführung · Schritt 8/8) eingebunden.
 */
type Props = {
  du: boolean;
  /**
   * Kompakt-Variante für den Walkthrough (kleinere Paddings/Font) — sonst
   * verhält sich das Panel wie bisher im LoginScreen.
   */
  variant?: 'default' | 'compact';
};

export default function PolitikBarometerPanel({ du, variant = 'default' }: Props) {
  const { state, dispatch } = useApp();
  const compact = variant === 'compact';

  const handlePreferenceChange = (key: keyof UserPreferences, value: number) => {
    dispatch({ type: 'SET_PREFERENCES', payload: { [key]: value } });
  };

  const applyPreset = (preset: Partial<UserPreferences>) => {
    dispatch({ type: 'SET_PREFERENCES', payload: preset });
  };

  const sliderTrackStyle = (value: number) =>
    ({
      background: `linear-gradient(to right, #0c2d5c 0%, #0c4a8c ${value}%, #c5d4e8 ${value}%, #e2e8f0 100%)`,
      accentColor: '#0c2d5c',
    }) as const;

  return (
    <div
      className={`rounded-2xl ${compact ? 'px-3 py-2.5' : 'px-4 py-3'}`}
      style={{
        background: 'var(--gov-surface)',
        border: '1px solid var(--gov-border)',
        boxShadow: '0 1px 4px rgba(0,51,102,0.06)',
      }}
    >
      <h2
        className={`mb-1 font-bold ${compact ? 'text-[13px]' : 'text-base'}`}
        style={{ color: 'var(--gov-heading)' }}
      >
        Politikbarometer
      </h2>
      <p
        className={`leading-relaxed ${compact ? 'text-[10.5px]' : 'text-[11px]'}`}
        style={{ color: 'var(--gov-muted)' }}
      >
        {du
          ? 'Optional: Lege fest, welche Themen Dir wichtig sind. Die App weist Dich später auf passende Abstimmungen hin und nimmt relevante Termine in Deinen Kalender auf.'
          : 'Optional: Legen Sie fest, welche Themen Ihnen wichtig sind. Die App weist Sie später auf passende Abstimmungen hin und nimmt relevante Termine in Ihren Kalender auf.'}
      </p>

      <label
        className="relative mt-3 flex cursor-pointer items-start gap-3 rounded-xl border bg-white px-3 py-2.5"
        style={{ borderColor: 'var(--gov-border)' }}
      >
        <input
          type="checkbox"
          checked={state.consentClaraPersonalization}
          onChange={(e) =>
            dispatch({
              type: 'SET_CONSENT_CLARA_PERSONALIZATION',
              payload: e.target.checked,
            })
          }
          className="mt-0.5 h-4 w-4 flex-shrink-0 rounded"
          style={{ accentColor: 'var(--gov-btn)' }}
        />
        <span
          className={`leading-snug ${compact ? 'text-[10.5px]' : 'text-[11px]'}`}
          style={{ color: 'var(--gov-body)' }}
        >
          {du
            ? 'Einwilligung: Clara, die neutrale KI-Agentin, darf die von Dir priorisierten Themen nutzen, um Dich auf relevante Abstimmungen und Termine hinzuweisen.'
            : 'Einwilligung: Clara, die neutrale KI-Agentin, darf die von Ihnen priorisierten Themen nutzen, um Sie auf relevante Abstimmungen und Termine hinzuweisen.'}
        </span>
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {(
          [
            {
              id: 'neutral',
              label: 'Neutral',
              values: { umwelt: 50, finanzen: 50, bildung: 50, digital: 50, soziales: 50, sicherheit: 50 },
            },
            {
              id: 'klima',
              label: 'Klima',
              values: { umwelt: 80, finanzen: 45, bildung: 55, digital: 50, soziales: 55, sicherheit: 45 },
            },
            {
              id: 'wirtschaft',
              label: 'Wirtschaft',
              values: { umwelt: 45, finanzen: 80, bildung: 55, digital: 60, soziales: 45, sicherheit: 55 },
            },
            {
              id: 'sicherheit',
              label: 'Sicherheit',
              values: { umwelt: 45, finanzen: 55, bildung: 50, digital: 55, soziales: 45, sicherheit: 80 },
            },
          ] as const
        ).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p.values)}
            disabled={!state.consentClaraPersonalization}
            className="rounded-full border px-3 py-1 text-[11px] font-semibold transition"
            style={{
              borderColor: 'var(--gov-border)',
              background: state.consentClaraPersonalization ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.60)',
              color: 'var(--gov-heading)',
              opacity: state.consentClaraPersonalization ? 1 : 0.55,
              cursor: state.consentClaraPersonalization ? 'pointer' : 'not-allowed',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={`${compact ? 'mt-3 space-y-2.5' : 'mt-4 space-y-3.5'}`}>
        {Object.entries(THEME_NAMES).map(([key, name]) => (
          <div key={key}>
            <div className="mb-1.5 flex justify-between">
              <span className="text-[11px] font-medium" style={{ color: 'var(--gov-heading)' }}>
                {name}
              </span>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--gov-heading)' }}>
                {state.preferences[key as keyof UserPreferences]}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={state.preferences[key as keyof UserPreferences]}
              onChange={(e) => handlePreferenceChange(key as keyof UserPreferences, Number(e.target.value))}
              disabled={!state.consentClaraPersonalization}
              aria-label={`${name} Priorität`}
              className={`politik-barometer-range w-full max-w-full rounded-full ${compact ? 'h-2.5' : 'h-3'}`}
              style={{
                ...sliderTrackStyle(state.preferences[key as keyof UserPreferences]),
                opacity: state.consentClaraPersonalization ? 1 : 0.55,
                cursor: state.consentClaraPersonalization ? 'pointer' : 'not-allowed',
              }}
            />
          </div>
        ))}
      </div>
      {!state.consentClaraPersonalization && (
        <p className="mt-3 text-[10px] leading-snug" style={{ color: 'var(--gov-muted)' }}>
          Hinweis: Die Schieberegler werden erst aktiv, wenn die Einwilligung oben gesetzt ist.
        </p>
      )}
    </div>
  );
}
