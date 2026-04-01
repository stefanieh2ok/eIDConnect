'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { THEME_NAMES } from '@/data/constants';
import { persistAndSyncDemoAddress } from '@/lib/demo-address-persist';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import type { UserPreferences } from '@/types';
import { IphoneFrame } from '@/components/ui/IphoneFrame';

const KIRKEL_STREET = 'Hauptstraße 1';
const KIRKEL_PLZ = '66459';
const KIRKEL_CITY = 'Kirkel';

const PRODUCT_INTRO_DONE_KEY = 'eidconnect_product_intro_done_v4';

const loginNavBackClass =
  'inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center rounded-xl border border-neutral-800 bg-black px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-900 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';
const loginNavNextClass =
  'btn-gov-primary btn-gov-primary--flex min-h-[44px] min-w-0 flex-1 text-sm font-bold';

/**
 * Onboarding: 2 Schritte (Anrede kommt vorab über AnredeGate nach NDA)
 * 1) eID-Demo / Adresse + Clara
 * 2) Politik-Barometer (optional)
 */
type LoginStep = 1 | 2;

type LoginScreenProps = {
  /**
   * Wenn die App bereits im iPhone-Rahmen läuft (Demo „device“-Variante),
   * dann darf LoginScreen keinen zweiten iPhoneFrame rendern.
   */
  renderFrame?: boolean;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ renderFrame = true }) => {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState<LoginStep>(1);

  const reopenProductIntro = useCallback(() => {
    try {
      localStorage.removeItem(PRODUCT_INTRO_DONE_KEY);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event('eidconnect:open-intro'));
  }, []);
  const du = state.anrede === 'du';
  const [demoWahlkreis, setDemoWahlkreis] = useState<string>('');

  const persistDemoFields = useCallback(
    (street: string, plz: string, city: string) => {
      const { county } = persistAndSyncDemoAddress((a) => dispatch(a as any), street, plz, city);
      setDemoWahlkreis(county);
    },
    [dispatch],
  );

  useEffect(() => {
    if (step !== 1) return;
    if (state.residenceLocation === 'kirkel') return;
    persistDemoFields(KIRKEL_STREET, KIRKEL_PLZ, KIRKEL_CITY);
  }, [step, state.residenceLocation, persistDemoFields]);

  const applyEidKirkelDemo = () => {
    persistDemoFields(KIRKEL_STREET, KIRKEL_PLZ, KIRKEL_CITY);
  };

  /** Onboarding-Spotlight: eID → Weiter → Checkbox → Zur Demo-App */
  type OnboardingSpotlight = 'off' | 'eid' | 'weiter' | 'baro_check' | 'demo';
  const [onboardingSpotlight, setOnboardingSpotlight] = useState<OnboardingSpotlight>('off');
  const [barometerCheckHint, setBarometerCheckHint] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOnboardingSpotlight('off');
      return;
    }
    if (step === 1) setOnboardingSpotlight('eid');
    if (step === 2) setOnboardingSpotlight('baro_check');
  }, [step]);

  useEffect(() => {
    if (onboardingSpotlight !== 'baro_check') return;
    setBarometerCheckHint(true);
    const t = window.setTimeout(() => setBarometerCheckHint(false), 1100);
    return () => window.clearTimeout(t);
  }, [onboardingSpotlight]);

  const cancelOnboardingSpotlight = useCallback(() => {
    setOnboardingSpotlight('off');
    setBarometerCheckHint(false);
  }, []);

  const onOnboardingSpotlightAnimationEnd = useCallback((e: React.AnimationEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    const name = e.animationName || '';
    if (!name.includes('eid-filter-heartbeat')) return;
    setOnboardingSpotlight((prev) => {
      if (prev === 'eid') return 'weiter';
      if (prev === 'weiter') return 'off';
      if (prev === 'baro_check') return 'demo';
      if (prev === 'demo') return 'off';
      return prev;
    });
  }, []);

  const handlePreferenceChange = (key: keyof UserPreferences, value: number) => {
    dispatch({ type: 'SET_PREFERENCES', payload: { [key]: value } });
  };

  const handleProceedToApp = () => {
    dispatch({ type: 'SET_LOGGED_IN', payload: true });
  };

  const sliderTrackStyle = (value: number) =>
    ({
      background: `linear-gradient(to right, #1e40af 0%, #1e40af ${value}%, #dbe4f0 ${value}%, #dbe4f0 100%)`,
      accentColor: '#1e40af',
    }) as const;

  const content = (
    <div
      className="mx-1 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.85rem] sm:mx-2 relative"
      style={{
        background: 'rgba(255,255,255,0.86)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid var(--gov-border)',
        boxShadow: '0 16px 48px rgba(0,40,100,0.10), inset 0 1px 0 rgba(255,255,255,0.60)',
      }}
    >
          <div className="flex-shrink-0 px-6 pt-6 pb-4 text-center">
            <h1 className="text-2xl font-extrabold leading-none tracking-tight" style={{ color: 'var(--gov-primary)' }}>
              {APP_DISPLAY_NAME}
            </h1>
            <p className="mt-1.5 text-[11px] tracking-wide" style={{ color: 'var(--gov-muted)' }}>
              Informieren · Mitreden · Mitgestalten
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {([1, 2, 3] as const).map((s) => (
                <div
                  key={s}
                  className={`h-1 rounded-full transition-all duration-400 ${
                    s === step ? 'w-6' : 'w-3'
                  }`}
                  style={{
                    background: 'var(--gov-primary)',
                    opacity: s === step ? 1 : s < step ? 0.38 : 0.16,
                  }}
                />
              ))}
            </div>
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto px-5 pb-2"
            style={{ overscrollBehavior: 'contain' }}
          >
            {step === 1 && (
              <div className="space-y-4">
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.80)',
                    border: '1px solid var(--gov-border)',
                  }}
                >
                  <h2 className="text-base font-bold" style={{ color: 'var(--gov-heading)' }}>
                    Anmeldung mit eID (Demo)
                  </h2>
                  <p className="mt-1 text-[11px] leading-relaxed" style={{ color: 'var(--gov-body)' }}>
                    {du
                      ? 'MVP-Flow: eID setzt automatisch Kirkel (66459) mit Saarpfalz-Kreis. Keine manuelle Adresseingabe erforderlich.'
                      : 'MVP-Flow: eID setzt automatisch Kirkel (66459) mit Saarpfalz-Kreis. Keine manuelle Adresseingabe erforderlich.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      cancelOnboardingSpotlight();
                      applyEidKirkelDemo();
                    }}
                    onAnimationEnd={onOnboardingSpotlightAnimationEnd}
                    className={`btn-gov-primary mt-3 ${onboardingSpotlight === 'eid' ? 'onboarding-heartbeat' : ''}`}
                  >
                    eID auslesen (Demo) – Kirkel
                  </button>
                  <p className="mt-2 text-[10px]" style={{ color: 'var(--gov-muted)' }}>
                    <span className="font-semibold" style={{ color: 'var(--gov-heading)' }}>
                      Aktuell:
                    </span>{' '}
                    Hauptstraße 1, 66459 Kirkel
                    {demoWahlkreis ? <span> · Zuständigkeit: {demoWahlkreis}</span> : null}
                  </p>
                </div>

              </div>
            )}

            {step === 2 && (
              <div
                className="rounded-2xl px-4 py-3"
                style={{
                  background: 'var(--gov-surface)',
                  border: '1px solid var(--gov-border)',
                  boxShadow: '0 1px 4px rgba(0,51,102,0.06)',
                }}
              >
                <h2 className="mb-1 text-base font-bold" style={{ color: 'var(--gov-heading)' }}>
                  {du ? 'Politik-Barometer' : 'Politik-Barometer'}
                </h2>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--gov-muted)' }}>
                  {du
                    ? 'Optional: Schieberegler helfen Clara, Inhalte für dich einzuordnen. Überspringen geht mit „Zur Demo-App“.'
                    : 'Optional: Schieberegler helfen Clara, Inhalte für Sie einzuordnen. Überspringen geht mit „Zur Demo-App“.'}
                </p>

                <label
                  className={`relative mt-3 flex cursor-pointer items-start gap-3 rounded-xl border bg-white px-3 py-2.5 ${
                    onboardingSpotlight === 'baro_check' ? 'onboarding-heartbeat' : ''
                  }`}
                  style={{ borderColor: 'var(--gov-border)' }}
                  onAnimationEnd={onOnboardingSpotlightAnimationEnd}
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
                  {barometerCheckHint ? (
                    <span
                      className="absolute left-3 top-2.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600 text-[12px] font-black text-white shadow-sm"
                      aria-hidden
                    >
                      ✓
                    </span>
                  ) : null}
                  <span className="text-[11px] leading-snug" style={{ color: 'var(--gov-body)' }}>
                    {du
                      ? 'Ich erlaube Clara, der neutralen KI-Agentin, meine Politik-Schwerpunkte für personalisierte Analysen zu nutzen.'
                      : 'Einwilligung: Clara, die neutrale KI-Agentin, darf Ihre Politik-Schwerpunkte für personalisierte Analysen verwenden.'}
                  </span>
                </label>

                <div className="mt-4 space-y-3.5">
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
                        min="0"
                        max="100"
                        value={state.preferences[key as keyof UserPreferences]}
                        onChange={(e) =>
                          handlePreferenceChange(key as keyof UserPreferences, parseInt(e.target.value, 10))
                        }
                        className="slider h-1.5 w-full cursor-pointer rounded-lg"
                        style={sliderTrackStyle(state.preferences[key as keyof UserPreferences])}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            className="flex-shrink-0 space-y-2 px-5 pb-6 pt-3"
            style={{ borderTop: '1px solid var(--gov-border)' }}
          >
            {step === 1 && (
              <div className="flex gap-2">
                <button type="button" onClick={reopenProductIntro} className={loginNavBackClass}>
                  Zurück
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cancelOnboardingSpotlight();
                    setStep(2);
                  }}
                  onAnimationEnd={onOnboardingSpotlightAnimationEnd}
                  className={`${loginNavNextClass}${onboardingSpotlight === 'weiter' ? ' onboarding-heartbeat' : ''}`}
                >
                  Weiter
                </button>
              </div>
            )}
            {step === 2 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                  }}
                  className={loginNavBackClass}
                >
                  Zurück
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cancelOnboardingSpotlight();
                    handleProceedToApp();
                  }}
                  onAnimationEnd={onOnboardingSpotlightAnimationEnd}
                  className={`${loginNavNextClass}${onboardingSpotlight === 'demo' ? ' onboarding-heartbeat' : ''}`}
                >
                  Zur Demo-App
                </button>
              </div>
            )}
          </div>
    </div>
  );

  return (
    <div className={renderFrame ? 'fixed inset-0 z-[80]' : 'relative z-[80] h-full w-full min-w-0'}>
      {renderFrame ? (
        <IphoneFrame>
          <div className="relative z-0 flex min-h-0 h-full w-full flex-col">{content}</div>
        </IphoneFrame>
      ) : (
        // Im device-Kontext gibt es bereits einen iPhone-Rahmen. Nur der Content ist nötig.
        <div className="h-full w-full min-w-0 flex flex-col">{content}</div>
      )}
    </div>
  );
};

export default LoginScreen;
