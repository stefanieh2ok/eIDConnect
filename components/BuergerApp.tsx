'use client';

import React, { useState, useLayoutEffect, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import LoginScreen from '@/components/Login/LoginScreen';
import AppHeader from '@/components/Header/AppHeader';
import LiveSection from '@/components/Live/LiveSection';
import LeaderboardSection from '@/components/Leaderboard/LeaderboardSection';
import ElectionsSection from '@/components/Elections/ElectionsSection';
import CalendarSection from '@/components/Calendar/CalendarSection';
import MeldungenSection from '@/components/Meldungen/MeldungenSection';
import StimmzettelModal from '@/components/Modals/StimmzettelModal';
import IntroOverlay from '@/components/Intro/IntroOverlay';
import DemoIntroWalkthrough from '@/components/Intro/DemoIntroWalkthrough';
import DemoExpectationBanner from '@/components/DemoExpectationBanner';
import { AnredeGate } from '@/components/Intro/AnredeGate';
import { IntroEntryBranch } from '@/components/Intro/IntroEntryBranch';
import {
  type PreLoginPhase,
  readPreLoginPhase,
  writePreLoginPhase,
  readWantsWalkthrough,
  writeWantsWalkthrough,
  clearIntroSessionKeys,
} from '@/lib/introPreLoginPhase';
import ClaraDock from '@/components/Clara/ClaraDock';
import {
  CLARA_DOCK_EXTRA_BOTTOM_ANREDE_ENTRY,
  CLARA_DOCK_EXTRA_BOTTOM_EID,
} from '@/lib/claraDockSpacing';
import { resetViewportScroll } from '@/lib/resetViewportScroll';
import type { EbeneLevel, Location, Section } from '@/types';
import { activeLocationForLevel, levelForResidenceLocation } from '@/lib/activeLocationForLevel';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import { DemoLaunchEffect } from '@/components/Effects/DemoLaunchEffect';
import {
  isDemoLaunchEffectEnabled,
  DEMO_LAUNCH_SESSION_STORAGE_KEY,
} from '@/lib/demoLaunchEffectConfig';
import { playDemoLaunchAudio } from '@/lib/playDemoLaunchAudio';

// Produkteinführung (4 Screens) vor Login/Onboarding — eigenes Flag, nicht mit eID/Anrede vermischen.
const PRODUCT_INTRO_DONE_KEY = 'eidconnect_product_intro_done_v4';
type BuergerAppProps = { variant?: 'fullscreen' | 'device' };

export default function BuergerApp({ variant = 'fullscreen' }: BuergerAppProps) {
  const { state, dispatch } = useApp();
  /**
   * Produkt-Intro: zuerst, danach erst eID-Onboarding (LoginScreen).
   *
   * Start IMMER mit `true`, damit Server-HTML und Client-Hydration deckungsgleich sind
   * (sonst Hydration-Mismatch: Server rendert Intro, Client rendert LoginScreen, wenn
   * das Flag schon im localStorage steht).
   *
   * Die korrekte Entscheidung treffen wir in einem `useLayoutEffect` weiter unten –
   * das läuft synchron vor dem Paint, also ohne sichtbares Aufflackern.
   */
  // Einführungs-Flow (State Clarity): Anrede (Schritt 1) → eID/LoginScreen
  // (Schritt 2) → Walkthrough (Schritte 3–8, inkl. Politikbarometer als
  // letztem Schritt) → App. Der Walkthrough läuft jetzt ausschließlich POST-
  // Login und zeigt dort die sechs Vorschau-Screens inkl. finaler Themenwahl.
  //
  // `postLoginIntroOpen` startet IMMER `true`, damit Server-HTML und Client-
  // Hydration deckungsgleich bleiben. Die eigentliche Entscheidung fällt in
  // einem useLayoutEffect weiter unten anhand des PRODUCT_INTRO_DONE_KEY.
  const [postLoginIntroOpen, setPostLoginIntroOpen] = useState(true);
  const [preLogin, setPreLogin] = useState<PreLoginPhase>(() =>
    typeof window !== 'undefined' ? readPreLoginPhase() : 'anrede',
  );
  /** Walkthrough-Schritt für Clara-Kontext (Pille + Chat). */
  const [walkthroughStep, setWalkthroughStep] = useState<{ id: string; label: string } | null>(null);
  /** Optionaler Demo-/Pitch-Launch (nur bei User-Klick + NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT). */
  const [demoLaunchOpen, setDemoLaunchOpen] = useState(false);
  const isDevice = variant === 'device';

  const finishDemoLaunch = useCallback(() => {
    setDemoLaunchOpen(false);
    if (typeof window === 'undefined') return;
    requestAnimationFrame(() => {
      const el = document.getElementById('main-scroll');
      if (!el) return;
      try {
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      } catch {
        /* ignore */
      }
    });
  }, []);

  /** Nur aus echten Click-Handlern (Walkthrough fertig / „Direkt zur App“). */
  const tryStartDemoLaunchFromUserGesture = useCallback(() => {
    if (!isDemoLaunchEffectEnabled()) return;
    if (typeof window === 'undefined') return;
    try {
      if (window.sessionStorage.getItem(DEMO_LAUNCH_SESSION_STORAGE_KEY)) return;
      window.sessionStorage.setItem(DEMO_LAUNCH_SESSION_STORAGE_KEY, '1');
    } catch {
      return;
    }
    playDemoLaunchAudio();
    setDemoLaunchOpen(true);
  }, []);

  const SECTION_LEVELS: Record<Section, EbeneLevel[]> = {
    live: ['bund', 'land', 'kreis', 'kommune'],
    leaderboard: ['bund', 'land', 'kreis', 'kommune'],
    wahlen: ['bund', 'land', 'kreis', 'kommune'],
    news: [],
    kalender: ['bund', 'land', 'kreis', 'kommune'],
    meldungen: ['kommune'],
  };
  const residencePathForLocation = (loc: Location): EbeneLevel[] => {
    const level = levelForResidenceLocation(loc);
    if (level === 'kommune') return ['bund', 'land', 'kreis', 'kommune'];
    if (level === 'kreis') return ['bund', 'land', 'kreis'];
    if (level === 'land') return ['bund', 'land'];
    return ['bund'];
  };
  const defaultLevelForSection = (residencePath: EbeneLevel[], section: Section): EbeneLevel => {
    const allowed = SECTION_LEVELS[section] ?? [];
    const candidates = residencePath.filter((l) => allowed.includes(l));
    return candidates.length > 0 ? candidates[candidates.length - 1] : 'bund';
  };

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV === 'test' && localStorage.getItem(PRODUCT_INTRO_DONE_KEY) && !state.isLoggedIn) {
      dispatch({ type: 'SET_LOGGED_IN', payload: true });
    }
  }, [dispatch, state.isLoggedIn]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    setPreLogin(readPreLoginPhase());
  }, []);

  /** NDA / Vor-Seite / Phasenwechsel: kein ererbter Fenster- oder Innen-Scroll → Layout-Sprung vermeiden. */
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (state.isLoggedIn) return;
    const reset = () => {
      resetViewportScroll();
      const inner = document.getElementById('login-main-scroll');
      if (inner) inner.scrollTop = 0;
    };
    reset();
    const r = requestAnimationFrame(reset);
    return () => cancelAnimationFrame(r);
  }, [preLogin, state.isLoggedIn]);

  /** ?resetIntro=1 in der URL: Intro-Flags löschen und Walkthrough sofort anzeigen (ohne DevTools). */
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get('resetIntro');
      if (raw !== '1' && raw !== 'true' && raw !== '') return;

      localStorage.removeItem('eidconnect_product_intro_done_v1');
      localStorage.removeItem('eidconnect_product_intro_done_v2');
      localStorage.removeItem('eidconnect_product_intro_done_v3');
      localStorage.removeItem(PRODUCT_INTRO_DONE_KEY);

      setPostLoginIntroOpen(true);

      params.delete('resetIntro');
      const q = params.toString();
      const next = `${window.location.pathname}${q ? `?${q}` : ''}${window.location.hash}`;
      window.history.replaceState(null, '', next);
    } catch {
      // ignore
    }
  }, []);

  // Walkthrough nur dann sichtbar, wenn er noch nicht abgeschlossen ist.
  // `useLayoutEffect` läuft synchron vor dem Paint, daher kein sichtbares
  // Aufflackern und trotzdem kein Hydration-Mismatch.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const done = localStorage.getItem(PRODUCT_INTRO_DONE_KEY) === 'true';
      setPostLoginIntroOpen(!done);
    } catch {
      setPostLoginIntroOpen(true);
    }
  }, []);

  // Walkthrough erneut öffnen (z. B. aus Einstellungen): Flag löschen, Overlay
  // einblenden.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOpen = () => {
      try {
        localStorage.removeItem(PRODUCT_INTRO_DONE_KEY);
      } catch {}
      setPostLoginIntroOpen(true);
    };
    window.addEventListener('eidconnect:open-intro', onOpen as any);
    return () => window.removeEventListener('eidconnect:open-intro', onOpen as any);
  }, []);

  /** Tab-Titel immer setzen (auch vor Login) — sonst bleibt auf dem Handy oft ein alter Name aus Cache/PWA stehen. */
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = APP_DISPLAY_NAME;
  }, [state.isLoggedIn]);

  // Globaler Skip: „Einführung überspringen" / × aus AnredeGate oder
  // LoginScreen. Sie laufen vor dem Login, haben also selbst keinen Zugriff auf
  // das Intro-Flag. Wir fangen das hier zentral ein und beenden den kompletten
  // Einführungs-Flow: Default-Anrede setzen, einloggen, Flag speichern.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onSkipAll = () => {
      try {
        localStorage.setItem(PRODUCT_INTRO_DONE_KEY, 'true');
      } catch {}
      try {
        writePreLoginPhase('ok');
        writeWantsWalkthrough(false);
      } catch {
        // ignore
      }
      if (state.anrede == null) {
        dispatch({ type: 'SET_ANREDE', payload: 'sie' });
      }
      if (!state.isLoggedIn) {
        dispatch({ type: 'SET_LOGGED_IN', payload: true });
      }
      setPostLoginIntroOpen(false);
    };
    window.addEventListener('eidconnect:skip-intro-all', onSkipAll as any);
    return () =>
      window.removeEventListener('eidconnect:skip-intro-all', onSkipAll as any);
  }, [dispatch, state.anrede, state.isLoggedIn]);

  // Default-Filter (passendste Ebene zum Wohnort) bei Section-Wechsel
  useEffect(() => {
    const residencePath = residencePathForLocation(state.residenceLocation);
    const allowed = SECTION_LEVELS[state.activeSection] ?? [];
    let levels = residencePath.filter((l) => allowed.includes(l));
    if (state.activeSection === 'meldungen') levels = ['kommune'];
    if (levels.length === 0) levels = ['bund'];
    const desired = defaultLevelForSection(residencePath, state.activeSection);
    const nextLevel = levels.includes(desired) ? desired : levels[levels.length - 1];
    const nextLocation = activeLocationForLevel(state.residenceLocation, nextLevel);
    // Nur umschalten, wenn currentLevel nicht mehr erlaubt ist
    const currentLevel = levelForResidenceLocation(state.activeLocation);
    if (!levels.includes(currentLevel) && state.activeLocation !== nextLocation) {
      dispatch({ type: 'SET_ACTIVE_LOCATION', payload: nextLocation });
    }
  }, [state.activeSection, state.residenceLocation, state.activeLocation, dispatch]);

  const finishProductIntro = () => {
    tryStartDemoLaunchFromUserGesture();
    try {
      localStorage.setItem(PRODUCT_INTRO_DONE_KEY, 'true');
    } catch {}
    setPostLoginIntroOpen(false);
  };

  /** Erster Walkthrough-Schritt: zurück zur eID-Demo (ohne Intro als „erledigt“ zu markieren). */
  const backFromWalkthroughFirstStep = () => {
    try {
      writePreLoginPhase('ok');
      writeWantsWalkthrough(true);
    } catch {
      // ignore
    }
    setPreLogin('ok');
    setPostLoginIntroOpen(true);
    dispatch({ type: 'SET_LOGGED_IN', payload: false });
  };

  const walkthroughChrome =
    state.isLoggedIn &&
    postLoginIntroOpen &&
    state.anrede != null &&
    readWantsWalkthrough();

  useEffect(() => {
    if (!walkthroughChrome) setWalkthroughStep(null);
  }, [walkthroughChrome]);

  // Wichtig (iOS Safari): im Non-Device-Modus `intro-safe-overlay` verwenden –
  // das bindet die Höhe an `100dvh`, damit der Walkthrough-Footer nicht hinter
  // der Safari-URL-Leiste verschwindet („Weiter"-Button sichtbar halten).
  const introOverlayShell =
    isDevice
      ? 'pointer-events-auto absolute inset-0 z-[500] min-h-0 h-full w-full min-w-0 overflow-hidden'
      : 'pointer-events-auto intro-safe-overlay z-[500]';

  const renderSection = () => {
    switch (state.activeSection) {
      case 'live':        return <LiveSection />;
      case 'leaderboard': return <LeaderboardSection />;
      case 'wahlen':      return <ElectionsSection />;
      case 'kalender':
        return (
          <CalendarSection
            priorities={state.consentClaraPersonalization ? state.preferences : undefined}
          />
        );
      case 'meldungen':   return <MeldungenSection />;
      default:            return <LiveSection />;
    }
  };

  // Ein <IntroOverlay> für die gesamte App: Schritte 1–2 (vor Login) und 3–8 (Walkthrough)
  // teilen sich Claras Stimme (Erklären der Intro-Folien, kein separater Modus-Wechsel).
  const onAnredeDone = () => {
    try {
      writePreLoginPhase('entry');
    } catch {
      // ignore
    }
    setPreLogin('entry');
  };

  const onEntryStart = () => {
    try {
      writeWantsWalkthrough(true);
      writePreLoginPhase('ok');
    } catch {
      // ignore
    }
    setPreLogin('ok');
  };

  const onEntryDirect = () => {
    try {
      writeWantsWalkthrough(false);
      writePreLoginPhase('ok');
      localStorage.setItem(PRODUCT_INTRO_DONE_KEY, 'true');
    } catch {
      // ignore
    }
    if (state.anrede == null) {
      dispatch({ type: 'SET_ANREDE', payload: 'sie' });
    }
    dispatch({ type: 'SET_LOGGED_IN', payload: true });
    setPostLoginIntroOpen(false);
    setPreLogin('ok');
    tryStartDemoLaunchFromUserGesture();
  };

  return (
    <IntroOverlay>
      <div className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
        {!state.isLoggedIn ? (
          <div
            className={`relative z-[650] flex flex-col h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden ${
              isDevice ? '' : 'min-h-[100dvh]'
            }`}
          >
            <AnredeGate
              isOpen={preLogin === 'anrede'}
              onComplete={onAnredeDone}
              position={isDevice ? 'absolute' : 'fixed'}
            />
            <IntroEntryBranch
              open={preLogin === 'entry' && state.anrede != null}
              du={state.anrede === 'du'}
              onStart={onEntryStart}
              onDirectToApp={onEntryDirect}
              position={isDevice ? 'absolute' : 'fixed'}
            />
            <LoginScreen
              renderFrame={!isDevice}
              preLoginPhase={preLogin}
              onBackToEntry={() => setPreLogin('entry')}
            />
          </div>
        ) : (
          <>
            {/* Wichtig: gleiche Flex-/Size-Klassen wie in den nicht-eingeloggten Zweigen (s.o.),
                sonst ändert sich beim Login das Wrapper-Verhältnis und der gescalte iPhone-Frame
                „springt" sichtbar. Nur Farbe/app-body wird hinzugefügt. */}
            <div
              className={`relative flex flex-col app-body bg-[#F7F9FC] h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden ${
                walkthroughChrome ? 'z-[650]' : ''
              } ${isDevice ? '' : 'min-h-[100dvh]'}`}
            >
              <div id="app-overlay-root" className="pointer-events-none absolute inset-0 z-[120]" />
              {postLoginIntroOpen && state.anrede != null && readWantsWalkthrough() ? (
                <div className={introOverlayShell}>
                  <DemoIntroWalkthrough
                    du={state.anrede === 'du'}
                    residenceLocation={state.residenceLocation}
                    onClose={finishProductIntro}
                    onFinish={finishProductIntro}
                    onBackFromFirstStep={backFromWalkthroughFirstStep}
                    onWalkthroughStepChange={setWalkthroughStep}
                  />
                </div>
              ) : null}
              <AppHeader />

              <main
                id="main-scroll"
                tabIndex={-1}
                className="scrollbar-hide flex-1 min-h-0 overflow-y-auto scroll-smooth outline-none"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <DemoExpectationBanner />
                <div className="px-3 pt-3 pb-clara-dock-safe">
                  {renderSection()}
                  <SecurityFaqFooter />
                </div>
              </main>

              <ScrollToTopButton />
              <StimmzettelModal />
              {demoLaunchOpen ? (
                <DemoLaunchEffect open={demoLaunchOpen} onComplete={finishDemoLaunch} />
              ) : null}
            </div>
          </>
        )}
        <ClaraDock
          toolbarZClassName={
            !state.isLoggedIn || walkthroughChrome ? 'z-[620]' : 'z-[80]'
          }
          compactMicOnlyMode={state.isLoggedIn ? walkthroughChrome : undefined}
          suppressCompactMic={!state.isLoggedIn || walkthroughChrome}
          walkthroughActive={walkthroughChrome}
          walkthroughStep={walkthroughChrome ? walkthroughStep : null}
          extraBottomOffset={
            !state.isLoggedIn
              ? preLogin === 'anrede' || preLogin === 'entry'
                ? CLARA_DOCK_EXTRA_BOTTOM_ANREDE_ENTRY
                : CLARA_DOCK_EXTRA_BOTTOM_EID
              : '0px'
          }
          overlayPosition={walkthroughChrome && !isDevice ? 'fixed' : 'absolute'}
          preLoginVoicePhase={
            !state.isLoggedIn
              ? preLogin === 'anrede'
                ? 'anrede'
                : preLogin === 'entry'
                  ? 'entry'
                  : 'eid'
              : null
          }
          onAnredeVoiceChoice={(choice) => dispatch({ type: 'SET_ANREDE', payload: choice })}
          onIntroEntryVoiceChoice={(c) => (c === 'start' ? onEntryStart() : onEntryDirect())}
        />
      </div>
    </IntroOverlay>
  );
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const el = document.getElementById('main-scroll');
    if (!el) return;
    const onScroll = () => setVisible(el.scrollTop > 220);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;
  return (
    <button
      onClick={() =>
        document.getElementById('main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })
      }
      className="absolute z-[45] w-9 h-9 rounded-full text-white shadow-lg flex items-center justify-center"
      style={{
        bottom: 'var(--clara-dock-scroll-top-btn-bottom)',
        right: '0.75rem',
        background: 'linear-gradient(135deg, #003366 0%, #0055A4 100%)',
      }}
      aria-label="Nach oben"
    >
      ↑
    </button>
  );
}

function SecurityFaqFooter() {
  const faqs = [
    {
      q: 'Wie sicher ist die Übertragung meiner Daten?',
      a: 'Die Übertragung erfolgt geschützt über HTTPS/TLS. Zugriff auf sensible Endpunkte wird serverseitig geprüft.',
    },
    {
      q: 'Wie funktionieren Token und Zugangslinks?',
      a: 'Zugangslinks enthalten einen Token. Der Token wird serverseitig validiert (z. B. aktiv, nicht abgelaufen, nicht widerrufen), bevor Zugang gewährt wird.',
    },
    {
      q: 'Was wird gespeichert und was nicht?',
      a: 'Es werden nur notwendige Demo-/Sicherheitsdaten verarbeitet (z. B. Status, Zeitpunkte, technische Metadaten). Inhalte für KI-Training sind ausgeschlossen.',
    },
    {
      q: 'Kann ich meinen Wohnort in der App einfach ändern?',
      a: 'Nein. Ein Wohnortwechsel wird erst nach offizieller Ummeldung wirksam. Die App übernimmt den Wohnort nicht per freier manueller Überschreibung.',
    },
    {
      q: 'Ist für die Teilnahme ein digitaler Personalausweis nötig?',
      a: 'Ja. Für die Teilnahme ist ein digitaler Personalausweis (eID) erforderlich, damit Berechtigung und Zuständigkeit sicher geprüft werden können.',
    },
  ];

  return (
    <section
      id="security-faq"
      className="mt-5 rounded-2xl border border-neutral-200 bg-white/80 p-3 backdrop-blur"
      aria-label="Sicherheits-FAQ"
    >
      <details className="group" aria-label="FAQ ein- oder ausklappen">
        <summary className="cursor-pointer list-none">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-600">
              FAQ Sicherheit & Zugang
            </h3>
            <span className="text-[11px] font-semibold text-neutral-500">klicken</span>
          </div>
        </summary>

        <div className="mt-2 space-y-2">
          {faqs.map((item) => (
            <details key={item.q} className="rounded-xl border border-neutral-200 bg-white px-3 py-2">
              <summary className="cursor-pointer list-none text-[11px] font-semibold text-neutral-800">
                {item.q}
              </summary>
              <p className="mt-2 text-[11px] leading-relaxed text-neutral-600">{item.a}</p>
            </details>
          ))}
        </div>
      </details>
    </section>
  );
}
