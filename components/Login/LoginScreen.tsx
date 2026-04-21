'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { persistAndSyncDemoAddress } from '@/lib/demo-address-persist';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import { IphoneFrame } from '@/components/ui/IphoneFrame';
import {
  INTRO_EID_FRAMING_SHORT,
  INTRO_GLOBAL_PILL_LABEL,
  INTRO_TOTAL_STEPS,
} from '@/data/introOverlayMarketing';

const KIRKEL_STREET = 'Hauptstraße 1';
const KIRKEL_PLZ = '66459';
const KIRKEL_CITY = 'Kirkel';

const PRODUCT_INTRO_DONE_KEY = 'eidconnect_product_intro_done_v4';

const loginNavBackClass =
  'inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center rounded-xl border border-neutral-800 bg-black px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-900 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';
const loginNavNextClass =
  'btn-gov-primary btn-gov-primary--flex min-h-[44px] min-w-0 flex-1 text-sm font-bold';

/**
 * Login-Screen = Einführungs-Schritt 2 von 8 (eID · Beispiel).
 *
 * Das frühere „Politik-Barometer" (Schritt 2 des alten LoginScreen-Flows) ist
 * jetzt Bestandteil des Walkthroughs (Schritt 8 von 8), damit die Tester zuerst
 * die App-Bereiche kennenlernen und sich erst am Ende für Themen entscheiden.
 */
type LoginScreenProps = {
  /**
   * Wenn die App bereits im iPhone-Rahmen läuft (Demo „device"-Variante),
   * dann darf LoginScreen keinen zweiten IphoneFrame rendern.
   */
  renderFrame?: boolean;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ renderFrame = true }) => {
  const { state, dispatch } = useApp();

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
    if (state.residenceLocation === 'kirkel') return;
    persistDemoFields(KIRKEL_STREET, KIRKEL_PLZ, KIRKEL_CITY);
  }, [state.residenceLocation, persistDemoFields]);

  const applyEidKirkelDemo = () => {
    persistDemoFields(KIRKEL_STREET, KIRKEL_PLZ, KIRKEL_CITY);
  };

  const handleEidDemoClick = () => {
    cancelOnboardingSpotlight();
    // eID-Daten setzen und direkt einloggen; das frühere Politik-Barometer-
    // Zwischenformular liegt jetzt als letzter Walkthrough-Schritt.
    try {
      applyEidKirkelDemo();
    } catch {
      /* noop */
    }
    dispatch({ type: 'SET_LOGGED_IN', payload: true });
  };

  type OnboardingSpotlight = 'off' | 'eid' | 'weiter';
  const [onboardingSpotlight, setOnboardingSpotlight] = useState<OnboardingSpotlight>('off');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOnboardingSpotlight('off');
      return;
    }
    setOnboardingSpotlight('eid');
  }, []);

  const cancelOnboardingSpotlight = useCallback(() => {
    setOnboardingSpotlight('off');
  }, []);

  const onOnboardingSpotlightAnimationEnd = useCallback((e: React.AnimationEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    const name = e.animationName || '';
    if (!name.includes('eid-filter-heartbeat')) return;
    setOnboardingSpotlight((prev) => {
      if (prev === 'eid') return 'weiter';
      if (prev === 'weiter') return 'off';
      return prev;
    });
  }, []);

  const handleProceedToApp = () => {
    try {
      applyEidKirkelDemo();
    } catch {
      /* noop */
    }
    dispatch({ type: 'SET_LOGGED_IN', payload: true });
  };

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
          {/* --- Meta-Ebene: Einführungs-Pill + Schritt 2/8 + Kurzzeile ---
              Einheitlicher dunkler Streifen über allen 8 Einführungs-Screens.
              Auf Step 2 (eID) kommt die knappe Sicherheits-/Vertrauens-Zeile
              in gleichem Font direkt unter die Pill-Zeile. */}
          <div className="intro-meta-strip flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center rounded-full bg-white/15 px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.14em] text-white/95">
                {INTRO_GLOBAL_PILL_LABEL}
              </span>
              <span className="text-[10px] font-semibold tabular-nums text-white/70">
                Schritt 2 von {INTRO_TOTAL_STEPS}
              </span>
            </div>
            <p className="mt-1 text-[10.5px] leading-snug text-white/65">
              {INTRO_EID_FRAMING_SHORT}
            </p>
          </div>

          <div className="flex-shrink-0 px-6 pt-4 pb-3 text-center">
            <h1 className="text-2xl font-extrabold leading-none tracking-tight" style={{ color: 'var(--gov-primary)' }}>
              {APP_DISPLAY_NAME}
            </h1>
            <p className="mt-1.5 text-[11px] tracking-wide" style={{ color: 'var(--gov-muted)' }}>
              Informieren · Mitreden · Mitgestalten
            </p>
          </div>

          <div
            className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 pb-2"
            style={{ overscrollBehavior: 'contain' }}
          >
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
                  onClick={handleEidDemoClick}
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
          </div>

          <div
            className="flex-shrink-0 space-y-2 px-5 pt-3 intro-action-bar-pad"
            style={{ borderTop: '1px solid var(--gov-border)' }}
          >
            <div className="flex gap-2">
              <button type="button" onClick={reopenProductIntro} className={loginNavBackClass}>
                Zurück
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelOnboardingSpotlight();
                  handleProceedToApp();
                }}
                onAnimationEnd={onOnboardingSpotlightAnimationEnd}
                className={`${loginNavNextClass}${onboardingSpotlight === 'weiter' ? ' onboarding-heartbeat' : ''}`}
              >
                Weiter
              </button>
            </div>
          </div>
    </div>
  );

  return (
    // iOS Safari: `intro-safe-overlay` (100dvh) verhindert, dass der
    // „Weiter"-Button der eID-Demo hinter der Safari-URL-Leiste verschwindet.
    <div className={renderFrame ? 'intro-safe-overlay z-[80]' : 'relative z-[80] h-full w-full min-w-0'}>
      {renderFrame ? (
        <IphoneFrame>
          <div className="relative z-0 flex min-h-0 h-full w-full flex-col">{content}</div>
        </IphoneFrame>
      ) : (
        <div className="h-full w-full min-w-0 flex flex-col">{content}</div>
      )}
    </div>
  );
};

export default LoginScreen;
