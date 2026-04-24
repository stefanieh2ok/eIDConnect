'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { persistAndSyncDemoAddress } from '@/lib/demo-address-persist';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import { IphoneFrame } from '@/components/ui/IphoneFrame';
import {
  INTRO_EID_CARD_BODY_DU,
  INTRO_EID_CARD_BODY_SIE,
  INTRO_EID_CARD_PRESENTATION_HINT,
  INTRO_EID_CARD_TITLE,
  INTRO_EID_CTA,
  INTRO_EID_FRAMING_SHORT,
} from '@/data/introOverlayMarketing';
import type { PreLoginPhase } from '@/lib/introPreLoginPhase';
import { introEidLoginSpokenParts } from '@/lib/introSpokenTts';
import IntroMetaStrip from '@/components/Intro/IntroMetaStrip';
import { useIntroSpeakApi } from '@/components/Intro/IntroOverlay';

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
  /** eID-TTS erst, wenn Anrede + Einstiegs-Folie durch (sonst schweigt Folie 4 oder spricht zu früh). */
  preLoginPhase?: PreLoginPhase;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ renderFrame = true, preLoginPhase = 'ok' }) => {
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

  const introSpeak = useIntroSpeakApi();
  useEffect(() => {
    if (state.anrede == null || !introSpeak) return;
    if (preLoginPhase !== 'ok') {
      return;
    }
    if (!introSpeak.readAloud) {
      introSpeak.stopIntroSpeech();
      return;
    }
    if (typeof document !== 'undefined' && document.querySelector('[role="dialog"][aria-label="Anrede wählen"]')) {
      return;
    }
    if (
      typeof document !== 'undefined' &&
      document.querySelector('[role="dialog"][aria-label="Einstieg Einführung"]')
    ) {
      return;
    }
    const parts = introEidLoginSpokenParts(du);
    const t = window.setTimeout(() => {
      introSpeak.speakIntroParts(parts, 'eid-demo-login');
    }, 450);
    return () => {
      window.clearTimeout(t);
      introSpeak.stopIntroSpeech();
    };
  }, [state.anrede, introSpeak, introSpeak?.readAloud, du, preLoginPhase]);

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
      className="intro-dark-body mx-1 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.85rem] sm:mx-2 relative"
      style={{
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }}
      onPointerDown={() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        try {
          void window.speechSynthesis.getVoices();
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        } catch {
          // ignore
        }
      }}
    >
          {/* --- Meta-Ebene: Einführungs-Pill + Schritt 2/8 + Kurzzeile ---
              Einheitlicher dunkler Streifen über allen 8 Einführungs-Screens.
              Auf Step 2 (eID) kommt die knappe Sicherheits-/Vertrauens-Zeile
              in gleichem Font direkt unter die Pill-Zeile. */}
          <IntroMetaStrip
            stepNumber={2}
            metaFramingLine={INTRO_EID_FRAMING_SHORT}
            onSkip={() => window.dispatchEvent(new Event('eidconnect:skip-intro-all'))}
            onClose={() => window.dispatchEvent(new Event('eidconnect:skip-intro-all'))}
          />

          <div className="flex-shrink-0 px-6 pt-4 pb-3 text-center">
            <h1 className="text-2xl font-extrabold leading-none tracking-tight text-white">
              {APP_DISPLAY_NAME}
            </h1>
            <p className="mt-1.5 text-[11px] tracking-wide text-white/65">
              Informieren · Mitreden · Mitgestalten
            </p>
          </div>

          <div
            id="login-main-scroll"
            className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:pb-8"
            style={{ overscrollBehavior: 'contain' }}
          >
            <div className="space-y-4">
              <div
                className="rounded-2xl px-4 py-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <h2 className="text-base font-bold text-white">
                  {INTRO_EID_CARD_TITLE}
                </h2>
                <p className="mt-1.5 text-[11px] leading-relaxed text-white/85 [text-wrap:pretty]">
                  {du ? INTRO_EID_CARD_BODY_DU : INTRO_EID_CARD_BODY_SIE}
                </p>
                <p className="mt-2.5 text-[10.5px] leading-relaxed text-white/70 [text-wrap:pretty]">
                  {INTRO_EID_CARD_PRESENTATION_HINT}
                </p>
                <button
                  type="button"
                  onClick={handleEidDemoClick}
                  onAnimationEnd={onOnboardingSpotlightAnimationEnd}
                  className={`btn-gov-primary mt-3 ${onboardingSpotlight === 'eid' ? 'onboarding-heartbeat' : ''}`}
                >
                  {INTRO_EID_CTA}
                </button>
                <p className="mt-2 text-[10px] text-white/60">
                  <span className="font-semibold text-white/80">Sitzung:</span> Hauptstraße 1, 66459 Kirkel
                  {demoWahlkreis ? <span> · {demoWahlkreis}</span> : null}
                </p>
              </div>
            </div>
          </div>

          <div
            className="flex-shrink-0 space-y-2 px-5 pt-3 intro-action-bar-pad"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.10)' }}
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
