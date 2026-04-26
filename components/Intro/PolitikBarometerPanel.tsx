'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { THEME_NAMES } from '@/data/constants';
import type { UserPreferences } from '@/types';

const DEFAULT_LEAD_DU =
  'Das Politikbarometer zeigt keine politische Bewertung und erstellt kein Meinungsprofil. Du markierst selbst Themen, die dir wichtig sind – zum Beispiel Digitalisierung, Umwelt und Energie oder Bildung. Passende Termine und Beteiligungen können im Kalender hervorgehoben werden. Das ist keine Empfehlung, sondern nur thematische Relevanz.';

const DEFAULT_LEAD_SIE =
  'Das Politikbarometer zeigt keine politische Bewertung und erstellt kein Meinungsprofil. Sie markieren selbst Themen, die Ihnen wichtig sind – zum Beispiel Digitalisierung, Umwelt und Energie oder Bildung. Passende Termine und Beteiligungen können im Kalender hervorgehoben werden. Das ist keine Empfehlung, sondern nur thematische Relevanz.';

/**
 * Politikbarometer (Themenkompass): selbst gewählte Interessenschwerpunkte für
 * thematische Kalender-Hervorhebung — keine Empfehlung, keine Ableitung aus Verhalten.
 */
type Props = {
  du: boolean;
  /**
   * Kompakt-Variante für den Walkthrough (kleinere Paddings/Font) — sonst
   * verhält sich das Panel wie bisher im LoginScreen.
   */
  variant?: 'default' | 'compact';
  /** Optional: Überschrift überschreiben (z. B. Einstellungen). */
  headingTitle?: string;
  /** Optional: erster Absatz statt Standard-Themenkompass-Text. */
  leadDu?: string;
  leadSie?: string;
  walkthroughFooterDu?: string;
  walkthroughFooterSie?: string;
  /** Extra kompakte Darstellung für enge Settings-Abschnitte. */
  density?: 'default' | 'tight';
};

export default function PolitikBarometerPanel({
  du,
  variant = 'default',
  headingTitle,
  leadDu,
  leadSie,
  walkthroughFooterDu,
  walkthroughFooterSie,
  density = 'default',
}: Props) {
  const { state, dispatch } = useApp();
  const compact = variant === 'compact';
  const tight = density === 'tight';
  const title = headingTitle ?? 'Politikbarometer';
  const lead = du ? (leadDu ?? DEFAULT_LEAD_DU) : (leadSie ?? DEFAULT_LEAD_SIE);
  const walkFooter = du ? walkthroughFooterDu : walkthroughFooterSie;

  const handlePreferenceChange = (key: keyof UserPreferences, value: number) => {
    dispatch({ type: 'SET_PREFERENCES', payload: { [key]: value } });
  };

  const applyPreset = (preset: Partial<UserPreferences>) => {
    dispatch({ type: 'SET_PREFERENCES', payload: preset });
  };

  const sliderTrackStyle = (value: number) =>
    ({
      background: `linear-gradient(to right, #0c4a8c 0%, #1d4ed8 ${value}%, #94a3b8 ${value}%, #e2e8f0 100%)`,
      accentColor: '#1d4ed8',
    }) as const;

  return (
    <div
      className={`rounded-2xl ${compact ? (tight ? 'px-2.5 py-2' : 'px-3 py-2.5') : 'px-4 py-3'}`}
      style={{
        background: 'var(--gov-surface)',
        border: '1px solid var(--gov-border)',
        boxShadow: '0 1px 4px rgba(0,51,102,0.06)',
      }}
    >
      <h2
        className={`mb-1 font-bold ${compact ? (tight ? 'text-[12px]' : 'text-[13px]') : 'text-base'}`}
        style={{ color: 'var(--gov-heading)' }}
      >
        {title}
      </h2>
      <p
        className={`leading-relaxed ${compact ? (tight ? 'text-[10px]' : 'text-[10.5px]') : 'text-[11px]'}`}
        style={{ color: 'var(--gov-muted)' }}
      >
        {lead}
      </p>

      <label
        className={`relative mt-3 flex cursor-pointer items-start rounded-xl border bg-white ${tight ? 'gap-2 px-2.5 py-2' : 'gap-3 px-3 py-2.5'}`}
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
          className={`mt-0.5 flex-shrink-0 rounded ${tight ? 'h-3.5 w-3.5' : 'h-4 w-4'}`}
          style={{ accentColor: 'var(--gov-btn)' }}
        />
        <span
          className={`leading-snug ${compact ? (tight ? 'text-[10px]' : 'text-[10.5px]') : 'text-[11px]'}`}
          style={{ color: 'var(--gov-body)' }}
        >
          {du
            ? 'Einwilligung: Meine Interessenschwerpunkte dürfen genutzt werden, um passende Kalendertermine thematisch hervorzuheben — keine politische Empfehlung und keine Ableitung aus meinem übrigen Verhalten.'
            : 'Einwilligung: Die von mir gewählten Interessenschwerpunkte dürfen genutzt werden, um passende Kalendertermine thematisch hervorzuheben — keine politische Empfehlung und keine Ableitung aus meinem übrigen Verhalten.'}
        </span>
      </label>

      <div className={`mt-3 flex flex-wrap ${tight ? 'gap-1.5' : 'gap-2'}`}>
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
            className={`rounded-full border font-semibold transition ${tight ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]'}`}
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

      <div className={`${compact ? (tight ? 'mt-2.5 space-y-2' : 'mt-3 space-y-2.5') : 'mt-4 space-y-3.5'}`}>
        {Object.entries(THEME_NAMES).map(([key, name]) => (
          <div key={key}>
            <div className={`${tight ? 'mb-1' : 'mb-1.5'} flex justify-between`}>
              <span className={tight ? 'text-[10px] font-medium' : 'text-[11px] font-medium'} style={{ color: 'var(--gov-heading)' }}>
                {name}
              </span>
              <span className={`${tight ? 'text-[10px]' : 'text-[11px]'} font-bold tabular-nums`} style={{ color: 'var(--gov-heading)' }}>
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
              aria-label={`${name} · Interessenschwerpunkt`}
              className={`politik-barometer-range w-full max-w-full rounded-full ${compact ? (tight ? 'h-2' : 'h-2.5') : 'h-3'}`}
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
        <p className={`mt-3 leading-snug ${tight ? 'text-[9.5px]' : 'text-[10px]'}`} style={{ color: 'var(--gov-muted)' }}>
          Hinweis: Die Schieberegler werden erst aktiv, wenn die Einwilligung oben gesetzt ist.
        </p>
      )}
      {walkFooter ? (
        <p className={`mt-3 leading-snug ${tight ? 'text-[9.5px]' : 'text-[10px]'}`} style={{ color: 'var(--gov-muted)' }}>
          {walkFooter}
        </p>
      ) : null}
    </div>
  );
}
