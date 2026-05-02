'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { THEME_NAMES } from '@/data/constants';
import type { UserPreferences } from '@/types';

const DEFAULT_LEAD_DU =
  'Das Politikbarometer ist neutral und erstellt kein Meinungsprofil. Du markierst Themen, die dir wichtig sind; passende Termine werden im Kalender thematisch hervorgehoben.';

const DEFAULT_LEAD_SIE =
  'Das Politikbarometer ist neutral und erstellt kein Meinungsprofil. Sie markieren Themen, die Ihnen wichtig sind; passende Termine werden im Kalender thematisch hervorgehoben.';

const HERO_PREVIEW_INITIAL: UserPreferences = {
  umwelt: 0,
  finanzen: 0,
  bildung: 0,
  digital: 0,
  soziales: 0,
  sicherheit: 0,
};

const HERO_PREVIEW_TARGET: UserPreferences = {
  umwelt: 50,
  finanzen: 80,
  bildung: 50,
  digital: 90,
  soziales: 50,
  sicherheit: 50,
};

function scaleHeroPreviewValues(progress: number): UserPreferences {
  return {
    umwelt: Math.round(HERO_PREVIEW_TARGET.umwelt * progress),
    finanzen: Math.round(HERO_PREVIEW_TARGET.finanzen * progress),
    bildung: Math.round(HERO_PREVIEW_TARGET.bildung * progress),
    digital: Math.round(HERO_PREVIEW_TARGET.digital * progress),
    soziales: Math.round(HERO_PREVIEW_TARGET.soziales * progress),
    sicherheit: Math.round(HERO_PREVIEW_TARGET.sicherheit * progress),
  };
}

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
  /** Erlaubt Änderungen ohne aktivierte Einwilligung (z. B. in Einstellungen). */
  editableWithoutConsent?: boolean;
  /** Walkthrough: nur Schieberegler-Chips, kein Fließtext — eine Idee pro Karte. */
  heroPreview?: boolean;
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
  editableWithoutConsent = false,
  heroPreview = false,
}: Props) {
  const { state, dispatch } = useApp();
  const [heroPreviewValues, setHeroPreviewValues] = useState<UserPreferences | null>(null);
  const compact = variant === 'compact';
  const tight = density === 'tight';
  const canEditPreferences = true;
  const title = headingTitle ?? 'Politikbarometer';
  const lead = du ? (leadDu ?? DEFAULT_LEAD_DU) : (leadSie ?? DEFAULT_LEAD_SIE);
  const walkFooter = heroPreview ? undefined : du ? walkthroughFooterDu : walkthroughFooterSie;
  // Walkthrough should show the real slider set, not a reduced subset.
  const themeEntries = Object.entries(THEME_NAMES);
  const ensureConsentForPreferenceUse = () => {
    if (state.consentClaraPersonalization || editableWithoutConsent) return;
    dispatch({ type: 'SET_CONSENT_CLARA_PERSONALIZATION', payload: true });
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: number) => {
    if (heroPreview) {
      setHeroPreviewValues((prev) => ({ ...(prev ?? HERO_PREVIEW_INITIAL), [key]: value }));
      return;
    }
    ensureConsentForPreferenceUse();
    dispatch({ type: 'SET_PREFERENCES', payload: { [key]: value } });
  };

  /** Walkthrough: lokale Wertfolge, damit der erste Schritt auch beim Erst-Mount sichtbar animiert. */
  useEffect(() => {
    if (!heroPreview) {
      setHeroPreviewValues(null);
      return;
    }
    setHeroPreviewValues(HERO_PREVIEW_INITIAL);
    let tick: number | null = null;
    const start = window.setTimeout(() => {
      const startedAt = performance.now();
      const durationMs = 900;
      tick = window.setInterval(() => {
        const progress = Math.min(1, (performance.now() - startedAt) / durationMs);
        const eased = 1 - Math.pow(1 - progress, 3);
        setHeroPreviewValues(scaleHeroPreviewValues(eased));
        if (progress >= 1) {
          if (tick != null) {
            window.clearInterval(tick);
            tick = null;
          }
          setHeroPreviewValues(HERO_PREVIEW_TARGET);
        }
      }, 50);
    }, 180);
    return () => {
      window.clearTimeout(start);
      if (tick != null) {
        window.clearInterval(tick);
      }
    };
  }, [heroPreview]);

  const displayedPreferences = heroPreview && heroPreviewValues ? heroPreviewValues : state.preferences;

  const applyPreset = (preset: Partial<UserPreferences>) => {
    ensureConsentForPreferenceUse();
    dispatch({ type: 'SET_PREFERENCES', payload: preset });
  };

  const sliderTrackStyle = (value: number) =>
    ({
      background: `linear-gradient(to right, #0c4a8c 0%, #1d4ed8 ${value}%, #94a3b8 ${value}%, #e2e8f0 100%)`,
      accentColor: '#1d4ed8',
    }) as const;

  return (
    <div
      className={`rounded-2xl ${compact ? (tight ? 'px-2.5 py-2' : 'px-3 py-2.5') : 'px-4 py-3'} ${heroPreview ? 'py-2' : ''}`}
      style={{
        background: 'var(--gov-surface)',
        border: '1px solid var(--gov-border)',
        boxShadow: '0 1px 4px rgba(0,51,102,0.06)',
      }}
    >
      {!heroPreview ? (
        <>
          <h2 className={`mb-1 font-bold ${compact ? (tight ? 'text-[11px]' : 'text-[12px]') : 'text-[15px]'}`} style={{ color: 'var(--gov-heading)' }}>
            {title}
          </h2>
          <p
            className={`leading-relaxed ${compact ? (tight ? 'text-[9.5px]' : 'text-[10px]') : 'text-[10.5px]'}`}
            style={{ color: 'var(--gov-muted)' }}
          >
            {lead}
          </p>
        </>
      ) : null}

      {!heroPreview ? (
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
            disabled={!canEditPreferences}
            className={`rounded-full border font-semibold transition ${tight ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]'}`}
            style={{
              borderColor: 'var(--gov-border)',
              background: canEditPreferences ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.60)',
              color: 'var(--gov-heading)',
              opacity: canEditPreferences ? 1 : 0.55,
              cursor: canEditPreferences ? 'pointer' : 'not-allowed',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      ) : null}

      <div
        className={`${compact ? (tight ? 'mt-2.5 space-y-2' : 'mt-3 space-y-2.5') : 'mt-4 space-y-3.5'} ${
          heroPreview ? '!mt-0 space-y-2.5' : ''
        }`}
      >
        {themeEntries.map(([key, name]) => (
          <div key={key}>
            <div className={`${heroPreview ? 'mb-1' : tight ? 'mb-1' : 'mb-1.5'} flex justify-between gap-2`}>
              <span
                className={
                  heroPreview
                    ? 'min-w-0 flex-1 text-[11px] font-semibold leading-tight text-[#0f172a]'
                    : tight
                      ? 'text-[9.5px] font-medium'
                      : 'text-[10px] font-medium'
                }
                style={heroPreview ? undefined : { color: 'var(--gov-heading)' }}
              >
                {name}
              </span>
              <span
                className={
                  heroPreview
                    ? 'shrink-0 text-[11px] font-bold tabular-nums text-[#0f172a]'
                    : `${tight ? 'text-[9.5px]' : 'text-[10px]'} font-bold tabular-nums`
                }
                style={heroPreview ? undefined : { color: 'var(--gov-heading)' }}
              >
                {displayedPreferences[key as keyof UserPreferences]}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={displayedPreferences[key as keyof UserPreferences]}
              onChange={(e) => handlePreferenceChange(key as keyof UserPreferences, Number(e.target.value))}
              disabled={!canEditPreferences}
              aria-label={`${name} · Interessenschwerpunkt`}
              className={`politik-barometer-range w-full max-w-full rounded-full ${
                heroPreview ? 'h-3' : compact ? (tight ? 'h-2' : 'h-2.5') : 'h-3'
              }`}
              style={{
                ...sliderTrackStyle(displayedPreferences[key as keyof UserPreferences]),
                transition: heroPreview ? 'background 260ms ease' : undefined,
                opacity: canEditPreferences ? 1 : 0.55,
                cursor: canEditPreferences ? 'pointer' : 'not-allowed',
              }}
            />
          </div>
        ))}
      </div>
      {walkFooter ? (
        <p className={`mt-3 leading-snug ${tight ? 'text-[9.5px]' : 'text-[10px]'}`} style={{ color: 'var(--gov-muted)' }}>
          {walkFooter}
        </p>
      ) : null}
    </div>
  );
}
