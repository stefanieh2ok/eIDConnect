'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { persistAndSyncDemoAddress } from '@/lib/demo-address-persist';
import { IphoneFrame } from '@/components/ui/IphoneFrame';
import {
  INTRO_ACCESS_CONFIRMED_BODY,
  INTRO_ACCESS_CONFIRMED_LEVELS,
  INTRO_ACCESS_CONFIRMED_TITLE,
  INTRO_DEMO_MODE_BODY,
  INTRO_DEMO_MODE_CTA,
  INTRO_DEMO_MODE_TITLE,
  INTRO_EID_CARD_BODY_DU,
  INTRO_EID_CARD_BODY_SIE,
  INTRO_EID_CARD_STATUS,
  INTRO_EID_CARD_TITLE,
  INTRO_EID_CTA,
  INTRO_EID_FRAMING_SHORT,
  INTRO_ACCESS_CLARA_PANEL_HINT_DU,
  INTRO_ACCESS_CLARA_PANEL_HINT_SIE,
  INTRO_ACCESS_CLARA_PANEL_SHORT_DU,
  INTRO_ACCESS_CLARA_PANEL_SHORT_SIE,
  INTRO_TRUST_HINT_DU,
  INTRO_TRUST_HINT_SIE,
  INTRO_WALLET_BADGE,
  INTRO_WALLET_CARD_BODY,
  INTRO_WALLET_CARD_TITLE,
  INTRO_WALLET_CTA,
  INTRO_WALLET_INFO_HINT,
  INTRO_WALLET_INFO_TEXT,
  INTRO_WALLET_KONZEPTION_LABEL,
  INTRO_WALLET_PROCESS_STEPS,
} from '@/data/introOverlayMarketing';
import { writeWantsWalkthrough, type PreLoginPhase } from '@/lib/introPreLoginPhase';
import { introEidLoginSpokenParts } from '@/lib/introSpokenTts';
import { ListChecks, Settings } from 'lucide-react';
import { ClaraStepPanel } from '@/components/Intro/ClaraStepPanel';
import IntroMetaStrip from '@/components/Intro/IntroMetaStrip';
import { useIntroSpeakApi } from '@/components/Intro/IntroOverlay';
import ProductIdentityHeader from '@/components/ui/ProductIdentityHeader';

const KIRKEL_STREET = 'Hauptstraße 1';
const KIRKEL_PLZ = '66459';
const KIRKEL_CITY = 'Kirkel';

const PRODUCT_INTRO_DONE_KEY = 'eidconnect_product_intro_done_v4';

const loginNavBackClass =
  'inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';
const loginNavNextClass =
  'inline-flex min-h-[46px] w-full min-w-0 items-center justify-center rounded-xl bg-[#003D80] px-3 text-sm font-bold tracking-[0.01em] text-white shadow-[0_4px_14px_rgba(0,61,128,0.28)] transition hover:bg-[#00366f] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400';

const accessPathCardClass =
  'rounded-xl border border-neutral-200 bg-[#F8FAFD] px-2.5 py-2.5 shadow-sm sm:px-3 sm:py-3';

const accessPathTitleClass = 'text-[13px] font-bold leading-snug tracking-tight text-[#1A2B45] sm:text-[14px]';

const accessPathBodyClass =
  'mt-0.5 text-[10.5px] leading-snug text-neutral-800 [text-wrap:pretty] sm:mt-1 sm:text-[11px] sm:leading-relaxed';

const accessPathHintClass =
  'mt-1 text-[10px] leading-snug text-neutral-600 [text-wrap:pretty] sm:mt-1.5 sm:text-[10.5px] sm:leading-relaxed';

/**
 * Login-Screen = Einführungs-Schritt 2 von 8 (eID · Beispiel).
 *
 * Das frühere „Politik-Barometer" (Schritt 2 des alten LoginScreen-Flows) ist
 * jetzt Bestandteil des Walkthroughs (Schritt 8 von 8), damit die Tester zuerst
 * die App-Bereiche kennenlernen und sich erst am Ende für Themen entscheiden.
 */
type LoginScreenProps = {
  renderFrame?: boolean;
  preLoginPhase?: PreLoginPhase;
  onBackToEntry?: () => void;
};

const LoginScreen: React.FC<LoginScreenProps> = ({
  renderFrame = true,
  preLoginPhase = 'ok',
  onBackToEntry,
}) => {
  const { state, dispatch } = useApp();
  const du = state.anrede === 'du';
  const [demoWahlkreis, setDemoWahlkreis] = useState<string>('');
  const [walletInfoOpen, setWalletInfoOpen] = useState(false);
  /** EU-Wallet: Fließtext + Prozesszeile standard eingeklappt — weniger Scroll auf kleinen Screens. */
  const [walletKonzeptOpen, setWalletKonzeptOpen] = useState(false);
  const [confirmedAccessMethod, setConfirmedAccessMethod] = useState<'eid' | 'demo' | null>('eid');
  type OnboardingSpotlight = 'off' | 'eid' | 'weiter';
  const [onboardingSpotlight] = useState<OnboardingSpotlight>('off');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const [scrollMaxPx, setScrollMaxPx] = useState(0);

  const reopenProductIntro = useCallback(() => {
    try {
      localStorage.removeItem(PRODUCT_INTRO_DONE_KEY);
    } catch {}
    window.dispatchEvent(new Event('eidconnect:open-intro'));
  }, []);

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
    if (preLoginPhase !== 'ok') return;
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
    }, 120);
    return () => {
      window.clearTimeout(t);
      introSpeak.stopIntroSpeech();
    };
  }, [state.anrede, introSpeak, introSpeak?.readAloud, du, preLoginPhase]);

  const cancelOnboardingSpotlight = useCallback(() => {}, []);
  const onOnboardingSpotlightAnimationEnd = useCallback(() => {}, []);

  const applyEidKirkelDemo = () => {
    persistDemoFields(KIRKEL_STREET, KIRKEL_PLZ, KIRKEL_CITY);
  };

  const handleEidDemoClick = () => {
    cancelOnboardingSpotlight();
    try {
      applyEidKirkelDemo();
    } catch {
      /* noop */
    }
    dispatch({ type: 'SET_LOGIN_AUTH_METHOD', payload: 'eid' });
    setConfirmedAccessMethod('eid');
  };

  const handleProceedToApp = () => {
    try {
      applyEidKirkelDemo();
    } catch {
      /* noop */
    }
    try {
      writeWantsWalkthrough(true);
    } catch {
      /* noop */
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('eidconnect:open-intro'));
    }
    dispatch({
      type: 'SET_LOGIN_AUTH_METHOD',
      payload: confirmedAccessMethod === 'demo' ? 'address' : 'eid',
    });
    dispatch({ type: 'SET_LOGGED_IN', payload: true });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const recompute = () => {
      const max = Math.max(0, el.scrollHeight - el.clientHeight);
      setScrollMaxPx(max);
      const pct = max > 0 ? Math.round((el.scrollTop / max) * 100) : 0;
      setScrollPct(Math.min(100, Math.max(0, pct)));
    };
    recompute();
    window.addEventListener('resize', recompute, { passive: true });
    return () => window.removeEventListener('resize', recompute as any);
  }, []);

  const claraAccessLongPlain = useMemo(() => introEidLoginSpokenParts(du).join(' '), [du]);
  const claraAccessShortPlain = useMemo(() => {
    const main = du ? INTRO_ACCESS_CLARA_PANEL_SHORT_DU : INTRO_ACCESS_CLARA_PANEL_SHORT_SIE;
    const hint = du ? INTRO_ACCESS_CLARA_PANEL_HINT_DU : INTRO_ACCESS_CLARA_PANEL_HINT_SIE;
    return `${main}\n\n${hint}`;
  }, [du]);

  const handleDemoModeClick = () => {
    cancelOnboardingSpotlight();
    try {
      applyEidKirkelDemo();
    } catch {
      /* noop */
    }
    dispatch({ type: 'SET_LOGIN_AUTH_METHOD', payload: 'address' });
    setConfirmedAccessMethod('demo');
  };

  const content = (
    <div className="clara-prelogin-shell-pad--tight intro-device-chrome-shell intro-dark-body relative mx-1 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.85rem] p-[3px] sm:mx-2 sm:p-1">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.65rem] border border-neutral-200/95 bg-white">
        <IntroMetaStrip
          surface="light"
          stepNumber={2}
          showClaraVoice
          metaFramingLine={INTRO_EID_FRAMING_SHORT}
          onSkip={() => window.dispatchEvent(new Event('eidconnect:skip-intro-all'))}
          onClose={() => window.dispatchEvent(new Event('eidconnect:skip-intro-all'))}
        />

        <div className="flex-shrink-0 border-b border-neutral-100 px-4 pb-2 pt-2 sm:px-5 sm:pb-2.5 sm:pt-2.5">
          <ProductIdentityHeader className="text-left" />
          <div
            className="mt-2.5 flex items-stretch justify-center gap-0 rounded-lg border border-[#D6E0EE] bg-[#F8FAFD] px-1 py-1.5 sm:mt-3"
            aria-label="Zugangsperspektiven: eID und EU Digital Identity Wallet"
          >
            <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-center">
              <span className="text-[11px] font-bold tracking-tight text-[#003366]">eID</span>
              <span className="text-[8px] font-medium leading-tight text-neutral-600">Online-Ausweis</span>
            </div>
            <div className="w-px shrink-0 self-stretch bg-[#D6E0EE]" aria-hidden />
            <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-center">
              <span className="text-[11px] font-bold tracking-tight text-[#003366]">EU Wallet</span>
              <span className="text-[8px] font-medium leading-tight text-neutral-600">Digitale Identität</span>
            </div>
          </div>
        </div>

        <div
          id="login-main-scroll"
          ref={scrollRef}
          className="scrollbar-hide relative min-h-0 flex-1 overflow-y-auto px-4 pb-3 sm:px-5 sm:pb-4"
          style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          onScroll={() => {
            const el = scrollRef.current;
            if (!el) return;
            const max = Math.max(0, el.scrollHeight - el.clientHeight);
            setScrollMaxPx(max);
            const pct = max > 0 ? Math.round((el.scrollTop / max) * 100) : 0;
            setScrollPct(Math.min(100, Math.max(0, pct)));
          }}
        >
          {scrollMaxPx > 60 ? (
            <div className="intro-login-scroll-slider pointer-events-auto sticky top-2 z-[5] ml-auto mr-0.5 w-4">
              <input
                type="range"
                min={0}
                max={100}
                value={scrollPct}
                aria-label="Scroll"
                className="intro-vertical-slider w-4"
                onChange={(e) => {
                  const pct = Number(e.target.value);
                  setScrollPct(pct);
                  const el = scrollRef.current;
                  if (!el) return;
                  const max = Math.max(0, el.scrollHeight - el.clientHeight);
                  el.scrollTop = (pct / 100) * max;
                }}
              />
            </div>
          ) : null}
          <div className="space-y-2.5 sm:space-y-3">
            <ClaraStepPanel
              surface="light"
              label="Sicherer Bürgerzugang"
              short={claraAccessShortPlain}
              long={claraAccessLongPlain}
              showTopicTitle
              hideShortWhenCollapsed
            />
            <div className={`${accessPathCardClass} intro-login-heartbeat`}>
              <div className="flex items-start justify-between gap-2">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#003366] text-[10px] font-bold text-white"
                  aria-hidden
                >
                  1
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className={accessPathTitleClass}>{INTRO_EID_CARD_TITLE}</h2>
                  <p className="mt-1 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-800">
                    Künftig · {INTRO_EID_CARD_STATUS}
                  </p>
                  <p className={accessPathBodyClass}>{du ? INTRO_EID_CARD_BODY_DU : INTRO_EID_CARD_BODY_SIE}</p>
                  <p className={accessPathHintClass}>
                    {du ? 'Konzeptionelle Einordnung: Der Zugang kann künftig über eID erfolgen.' : 'Konzeptionelle Einordnung: Der Zugang kann künftig über eID erfolgen.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleEidDemoClick}
                onAnimationEnd={onOnboardingSpotlightAnimationEnd}
                className="mt-2 inline-flex min-h-[34px] w-full items-center justify-center rounded-lg border border-[#CFE0F7] bg-white px-3 text-[11px] font-semibold text-[#1F4F8A] transition hover:bg-[#F4F8FE] sm:mt-2.5"
              >
                Künftig per eID anmelden (Perspektive)
              </button>
            </div>

            <div className={`${accessPathCardClass} intro-login-heartbeat`}>
              <div className="flex items-start justify-between gap-2">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#003366]/40 bg-white text-[10px] font-bold text-[#003366]"
                  aria-hidden
                >
                  2
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start gap-2.5">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center gap-0.5 rounded-lg border border-slate-200 bg-white px-1 shadow-sm"
                      aria-hidden
                    >
                      <Settings className="h-[1.125rem] w-[1.125rem] text-[#003366]" strokeWidth={2} />
                      <ListChecks className="h-[1.125rem] w-[1.125rem] text-[#0055A4]" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <h2 className={accessPathTitleClass}>{INTRO_WALLET_CARD_TITLE}</h2>
                      <p className="mt-0.5 text-[9px] font-medium text-neutral-500">{INTRO_WALLET_KONZEPTION_LABEL}</p>
                    </div>
                  </div>
                  <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="inline-flex max-w-full rounded-full bg-[#E8F0FB] px-2 py-0.5 text-[9px] font-semibold leading-tight text-[#003366]">
                      {INTRO_WALLET_BADGE}
                    </span>
                  </div>
                  <p
                    className={`${accessPathBodyClass} ${walletKonzeptOpen ? '' : 'line-clamp-3'}`}
                  >
                    {INTRO_WALLET_CARD_BODY}
                  </p>
                  <button
                    type="button"
                    onClick={() => setWalletKonzeptOpen((o) => !o)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200/90 bg-white py-1.5 text-center text-[10px] font-semibold text-[#003366] transition hover:bg-slate-50"
                    aria-expanded={walletKonzeptOpen}
                    aria-controls="login-eu-wallet-konzept-ablauf"
                  >
                    {walletKonzeptOpen ? 'Konzept & Ablauf ausblenden' : 'Konzept & Ablauf anzeigen'}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWalletInfoOpen((p) => !p)}
                className="mt-2 inline-flex min-h-[34px] w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-[#1F4F8A] transition hover:bg-slate-50 sm:mt-2.5"
                aria-expanded={walletInfoOpen}
                aria-controls="login-eu-wallet-info"
              >
                Mehr zur Wallet-Perspektive
              </button>
              {walletInfoOpen ? (
                <div
                  id="login-eu-wallet-info"
                  className="mt-2 rounded-lg border border-[#BFD9FF] bg-[#F0F6FF] px-2.5 py-2 text-[10px] leading-relaxed text-[#1A2B45] sm:text-[10.5px]"
                  role="region"
                  aria-label="EU Digital Identity Wallet — Information"
                >
                  <p className="whitespace-pre-line">{INTRO_WALLET_INFO_TEXT}</p>
                  <p className="mt-1.5 text-[9.5px] font-semibold text-[#003366] sm:text-[10px]">
                    {INTRO_WALLET_INFO_HINT}
                  </p>
                </div>
              ) : null}
              {walletKonzeptOpen ? (
                <div
                  id="login-eu-wallet-konzept-ablauf"
                  className="mt-2.5 border-t border-neutral-200/80 pt-2"
                >
                  <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-neutral-500">
                    Perspektivischer Ablauf
                  </p>
                  <ol className="flex flex-wrap gap-1.5" role="list">
                    {INTRO_WALLET_PROCESS_STEPS.map((label, i) => (
                      <li
                        key={label}
                        className="inline-flex items-center gap-1 rounded-md border border-neutral-200/90 bg-white/90 px-1.5 py-1 text-[9px] font-medium leading-tight text-neutral-700"
                      >
                        <span className="tabular-nums text-[8px] font-bold text-[#003366]">{i + 1}</span>
                        {label}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>

            <div className={accessPathCardClass}>
              <div className="flex items-start justify-between gap-2">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-[10px] font-bold text-neutral-600"
                  aria-hidden
                >
                  3
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className={accessPathTitleClass}>{INTRO_DEMO_MODE_TITLE}</h2>
                  <p className={accessPathBodyClass}>{INTRO_DEMO_MODE_BODY}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  // Step 3 is completed by the “Weiter” action; keep it logically inside this card.
                  handleDemoModeClick();
                  handleProceedToApp();
                }}
                className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#003D80] px-3 text-[12px] font-bold tracking-[0.01em] text-white shadow-[0_4px_14px_rgba(0,61,128,0.28)] transition hover:bg-[#00366f] active:scale-[0.99]"
              >
                Weiter
              </button>
            </div>

            <div className="rounded-xl border border-dashed border-neutral-300/90 bg-white/80 px-2.5 py-2 text-[10px] leading-snug text-neutral-700 sm:px-3 sm:py-2.5 sm:text-[10.5px] sm:leading-relaxed">
              {du ? INTRO_TRUST_HINT_DU : INTRO_TRUST_HINT_SIE}
            </div>

            {confirmedAccessMethod ? (
              <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-2.5 py-2 shadow-sm ring-1 ring-emerald-600/10 sm:px-3 sm:py-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-800/90">Status</p>
                <h3 className="mt-0.5 text-[13px] font-bold leading-snug text-emerald-950 sm:text-sm">
                  {INTRO_ACCESS_CONFIRMED_TITLE}
                </h3>
                <p className="mt-1 text-[10px] font-semibold leading-snug text-emerald-900 sm:text-[10.5px]">
                  {INTRO_ACCESS_CONFIRMED_LEVELS}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-emerald-900/95 sm:text-[10.5px]">
                  {INTRO_ACCESS_CONFIRMED_BODY}
                </p>
                <p className="mt-1.5 border-t border-emerald-200/80 pt-1.5 text-[9.5px] text-emerald-800/95 sm:text-[10px]">
                  <span className="font-semibold text-emerald-950">Sitzung:</span> Hauptstraße 1, 66459 Kirkel
                  {demoWahlkreis ? <span> · {demoWahlkreis}</span> : null}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex-shrink-0 space-y-2 border-t border-neutral-200 bg-[#F7F9FC] px-4 pt-2.5 intro-action-bar-pad sm:px-5 sm:pt-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => (onBackToEntry ? onBackToEntry() : reopenProductIntro())}
              className={loginNavBackClass}
            >
              Zurück
            </button>
            <div className="flex-1 rounded-xl bg-[#EAF2FF] p-1">
              <button
                type="button"
                onClick={() => {
                  cancelOnboardingSpotlight();
                  if (!confirmedAccessMethod) return;
                  handleProceedToApp();
                }}
                onAnimationEnd={onOnboardingSpotlightAnimationEnd}
                disabled={!confirmedAccessMethod}
                className={`${loginNavNextClass}${confirmedAccessMethod ? '' : ' opacity-60 cursor-not-allowed'}`}
              >
                Weiter
              </button>
            </div>
          </div>
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
