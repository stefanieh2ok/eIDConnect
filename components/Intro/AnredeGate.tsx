'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  INTRO_ANREDE_SHORT_DU,
  INTRO_ANREDE_SHORT_SIE,
  INTRO_ANREDE_UI_TITLE_DU,
  INTRO_ANREDE_UI_TITLE_SIE,
} from '@/data/introOverlayMarketing';
import { introAnredeGateSpokenParts } from '@/lib/introSpokenTts';
import { useClaraVoiceContext } from '@/components/Clara/ClaraVoiceContext';
import { ClaraStepPanel } from '@/components/Intro/ClaraStepPanel';
import IntroMetaStrip from '@/components/Intro/IntroMetaStrip';
import { useIntroIsSpeaking, useIntroSpeakApi } from '@/components/Intro/IntroOverlay';
import type { Anrede } from '@/types';

type Props = {
  /** Steuert Sichtbarkeit; kommt von der zentralen Pre-Login-Phase. */
  isOpen: boolean;
  /** Nach bestätigter Anrede (Weiter) — folgt Einstiegs-Branch. */
  onComplete: () => void;
  variant?: 'overlay' | 'inline';
  position?: 'fixed' | 'absolute';
};

export function AnredeGate({ isOpen, onComplete, variant = 'overlay', position = 'fixed' }: Props) {
  const { state, dispatch } = useApp();
  const [pending, setPending] = useState<Anrede | null>(null);
  /** Stabile Referenz — nicht `useOptionalIntroOverlay()` (merged Objekt wechselt bei jedem TTS-Tick). */
  const speakApi = useIntroSpeakApi();
  const speakApiRef = useRef(speakApi);
  speakApiRef.current = speakApi;
  const { speakParts, stopSpeaking, tryResumePendingAudioFromUserGesture } = useClaraVoiceContext();
  const hasUnlockedSpeechRef = useRef(false);
  const hasSpokenIntroRef = useRef(false);
  const hasSelectedSalutationRef = useRef(false);
  const lastSpokenSalutationRef = useRef<Anrede | null>(null);
  const lastReadAloud = useRef<boolean | null>(null);
  const isIntroSpeaking = useIntroIsSpeaking();
  const wasIntroSpeakingRef = useRef(false);
  const pendingAutoWeiterRef = useRef(false);
  const salutationSpeechHeardRef = useRef(false);
  const autoWeiterTimersRef = useRef<number[]>([]);
  const [weiterPulse, setWeiterPulse] = useState(false);
  const pendingRef = useRef<Anrede | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  pendingRef.current = pending;

  const clearAutoWeiterTimers = useCallback(() => {
    for (const id of autoWeiterTimersRef.current) window.clearTimeout(id);
    autoWeiterTimersRef.current = [];
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPending(state.anrede ?? null);
    }
  }, [isOpen, state.anrede]);

  useEffect(() => {
    if (!isOpen) {
      hasSpokenIntroRef.current = false;
      hasSelectedSalutationRef.current = false;
      hasUnlockedSpeechRef.current = false;
      lastSpokenSalutationRef.current = null;
      pendingAutoWeiterRef.current = false;
      salutationSpeechHeardRef.current = false;
      wasIntroSpeakingRef.current = false;
      setWeiterPulse(false);
      clearAutoWeiterTimers();
    }
  }, [isOpen, clearAutoWeiterTimers]);

  useEffect(() => {
    if (!isOpen) return;
    if (!speakApi?.readAloud) {
      stopSpeaking();
    }
  }, [isOpen, speakApi?.readAloud, stopSpeaking]);

  const shellClass = useMemo(() => {
    if (variant === 'inline') return 'w-full';
    const base =
      position === 'fixed'
        ? 'intro-safe-overlay z-[600] flex items-center justify-center p-3 sm:p-4'
        : 'absolute inset-0 z-[600] flex items-center justify-center p-3 sm:p-4';
    return base;
  }, [variant, position]);

  const unlockSpeechOnGesture = useCallback(() => {
    if (hasUnlockedSpeechRef.current) return;
    hasUnlockedSpeechRef.current = true;
  }, []);

  const speakGateFromUserGesture = useCallback(
    (choice: 'du' | 'sie' | null) => {
      if (!speakApiRef.current?.readAloud) return;
      unlockSpeechOnGesture();
      stopSpeaking();
      speakParts(introAnredeGateSpokenParts(choice));
      hasSpokenIntroRef.current = true;
      if (choice === 'du' || choice === 'sie') {
        hasSelectedSalutationRef.current = true;
      }
    },
    [speakParts, stopSpeaking, unlockSpeechOnGesture],
  );

  const maybeStartNeutralIntroFromGesture = useCallback(() => {
    if (!speakApiRef.current?.readAloud) return;
    if (hasSelectedSalutationRef.current) return;
    if (hasSpokenIntroRef.current) return;
    speakGateFromUserGesture(null);
  }, [speakGateFromUserGesture]);

  const speakSalutationPickFromGesture = useCallback(
    (a: Anrede) => {
      if (lastSpokenSalutationRef.current === a) {
        return;
      }
      hasSelectedSalutationRef.current = true;
      speakGateFromUserGesture(a);
      lastSpokenSalutationRef.current = a;
    },
    [speakGateFromUserGesture],
  );

  const pick = useCallback(
    (a: Anrede) => {
      setPending(a);
      if (state.anrede !== a) dispatch({ type: 'SET_ANREDE', payload: a });
    },
    [dispatch, state.anrede],
  );

  const confirm = useCallback(() => {
    if (pending == null) return;
    pendingAutoWeiterRef.current = false;
    salutationSpeechHeardRef.current = false;
    setWeiterPulse(false);
    clearAutoWeiterTimers();
    onComplete();
  }, [pending, onComplete, clearAutoWeiterTimers]);

  const duMode = pending === 'du';

  useEffect(() => {
    if (!isOpen) {
      lastReadAloud.current = null;
      return;
    }
    if (lastReadAloud.current === false && speakApi?.readAloud) {
      hasSpokenIntroRef.current = false;
      hasSelectedSalutationRef.current = false;
      lastSpokenSalutationRef.current = null;
    }
    lastReadAloud.current = Boolean(speakApi?.readAloud);
  }, [isOpen, speakApi?.readAloud]);

  /**
   * Kurzer verzögerter Start ohne zusätzlichen Tap; `speakGateFromUserGesture`
   * setzt den Guard erst beim tatsächlichen Start.
   */
  useEffect(() => {
    if (!isOpen || !speakApi?.readAloud) return;
    if (hasSpokenIntroRef.current || hasSelectedSalutationRef.current) return;

    const id = window.setTimeout(() => {
      if (!speakApiRef.current?.readAloud) return;
      if (hasSpokenIntroRef.current || hasSelectedSalutationRef.current) return;
      speakGateFromUserGesture(null);
    }, 1000);

    return () => window.clearTimeout(id);
  }, [isOpen, speakApi?.readAloud, speakGateFromUserGesture]);

  /** Nach Du/Sie: Claras Bestätigung endet → kurzer Weiter-Puls, nach ~400 ms dasselbe wie „Weiter“. */
  useEffect(() => {
    if (!isOpen) return;
    const prev = wasIntroSpeakingRef.current;
    wasIntroSpeakingRef.current = isIntroSpeaking;
    if (pendingAutoWeiterRef.current && isIntroSpeaking) {
      salutationSpeechHeardRef.current = true;
    }
    if (
      !pendingAutoWeiterRef.current ||
      !salutationSpeechHeardRef.current ||
      !prev ||
      isIntroSpeaking ||
      !speakApiRef.current?.readAloud
    ) {
      return;
    }
    salutationSpeechHeardRef.current = false;
    pendingAutoWeiterRef.current = false;
    clearAutoWeiterTimers();
    setWeiterPulse(true);
    autoWeiterTimersRef.current.push(
      window.setTimeout(() => {
        setWeiterPulse(false);
        if (pendingRef.current != null) {
          onCompleteRef.current();
        }
      }, 400),
    );
  }, [isIntroSpeaking, isOpen, speakApi?.readAloud, clearAutoWeiterTimers]);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (!isOpen) return;
    const resetPreloginScroll = () => {
      if (typeof window === 'undefined') return;
      try {
        window.scrollTo(0, 0);
      } catch {
        /* jsdom: not implemented */
      }
      try {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch {
        /* ignore */
      }
      const inner = document.getElementById('login-main-scroll');
      if (inner) inner.scrollTop = 0;
    };
    resetPreloginScroll();
    const r = requestAnimationFrame(resetPreloginScroll);
    return () => cancelAnimationFrame(r);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const shouldLockBody = position === 'fixed';
    const prevOverflow =
      shouldLockBody && typeof document !== 'undefined' ? document.body.style.overflow : '';
    if (shouldLockBody && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (shouldLockBody && typeof document !== 'undefined') {
        document.body.style.overflow = prevOverflow;
      }
    };
  }, [isOpen, position]);

  const handleGestureTarget = useCallback(
    (target: HTMLElement) => {
      if (target.closest('.intro-meta-strip')) return;
      const pickBtn = target.closest<HTMLElement>('[data-anrede-pick]');
      if (pickBtn) {
        const val = pickBtn.getAttribute('data-anrede-value');
        if (val === 'du' || val === 'sie') {
          speakSalutationPickFromGesture(val as Anrede);
        }
        return;
      }
      if (!speakApi?.readAloud) return;
      maybeStartNeutralIntroFromGesture();
    },
    [speakApi?.readAloud, maybeStartNeutralIntroFromGesture, speakSalutationPickFromGesture],
  );

  if (!isOpen) return null;

  const titleAnrede =
    pending == null ? INTRO_ANREDE_UI_TITLE_SIE : duMode ? INTRO_ANREDE_UI_TITLE_DU : INTRO_ANREDE_UI_TITLE_SIE;
  const shortAnrede =
    pending == null ? INTRO_ANREDE_SHORT_SIE : duMode ? INTRO_ANREDE_SHORT_DU : INTRO_ANREDE_SHORT_SIE;

  const anredePickBtnClass = (selected: boolean) =>
    'min-h-[48px] rounded-xl border-2 px-2.5 text-center text-[12px] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500/50 ' +
    (selected
      ? 'border-sky-600 bg-sky-50 text-[#003366]'
      : 'border-slate-300 bg-white text-[#1A2B45] hover:border-sky-400/80');

  return (
    <div
      className={shellClass}
      role="dialog"
      aria-modal="true"
      aria-label="Anrede wählen"
    >
      {variant === 'overlay' ? (
        <div
          className="absolute inset-0 bg-[#020712]"
          aria-hidden
        />
      ) : null}

      <div
        ref={dialogRef}
        className="clara-prelogin-shell-pad intro-device-chrome-shell intro-dark-body relative w-full max-w-[360px] overflow-hidden rounded-[1.85rem] p-[3px] sm:max-w-[400px] sm:p-1"
        style={{
          maxHeight: 'min(calc(100dvh - 1.5rem), 100%)',
        }}
      >
        <div
          className="hide-scrollbar flex max-h-full min-h-0 flex-col overflow-y-auto overscroll-contain rounded-[1.65rem] border border-neutral-200/95 bg-white"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onPointerDownCapture={(e) => {
            tryResumePendingAudioFromUserGesture();
            unlockSpeechOnGesture();
            handleGestureTarget(e.target as HTMLElement);
          }}
          onTouchStartCapture={(e) => {
            tryResumePendingAudioFromUserGesture();
            unlockSpeechOnGesture();
            handleGestureTarget(e.target as HTMLElement);
          }}
        >
          <IntroMetaStrip
            surface="light"
            stepNumber={null}
            showClaraVoice
            inlinePad="card"
            onSkip={() => window.dispatchEvent(new Event('eidconnect:skip-intro-all'))}
            onClose={() => window.dispatchEvent(new Event('eidconnect:skip-intro-all'))}
          />

          <div className="border-b border-neutral-200 px-4 pb-3 pt-3 sm:px-5 sm:pb-4 sm:pt-4">
            <div
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.stopPropagation();
                unlockSpeechOnGesture();
                maybeStartNeutralIntroFromGesture();
              }}
              onClick={(e) => {
                e.stopPropagation();
                unlockSpeechOnGesture();
                maybeStartNeutralIntroFromGesture();
              }}
            >
              <ClaraStepPanel
                surface="light"
                label={titleAnrede}
                short={shortAnrede}
                long=""
                showTopicTitle
              />
            </div>
          </div>

          <div className="intro-anrede-bottom-room px-4 pt-4 sm:px-5 sm:pt-5">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-[#1A2B45]" id="anrede-choice-label">
                Ansprache wählen
              </p>
              <div
                className="grid grid-cols-2 gap-2"
                role="group"
                aria-labelledby="anrede-choice-label"
              >
                <button
                  type="button"
                  data-anrede-pick
                  data-anrede-value="sie"
                  onPointerDown={() => speakSalutationPickFromGesture('sie')}
                  onTouchStart={() => speakSalutationPickFromGesture('sie')}
                  onClick={() => {
                    speakSalutationPickFromGesture('sie');
                    pick('sie');
                    if (speakApi?.readAloud) {
                      pendingAutoWeiterRef.current = true;
                      salutationSpeechHeardRef.current = false;
                      clearAutoWeiterTimers();
                      setWeiterPulse(false);
                      /** iOS: TTS oft ohne Audiostream — Weiter trotzdem nach kurzer Frist (parallel zum Puls). */
                      autoWeiterTimersRef.current.push(
                        window.setTimeout(() => {
                          if (!pendingAutoWeiterRef.current || pendingRef.current == null) return;
                          pendingAutoWeiterRef.current = false;
                          salutationSpeechHeardRef.current = false;
                          setWeiterPulse(false);
                          onCompleteRef.current();
                        }, 3400),
                      );
                    }
                  }}
                  className={anredePickBtnClass(pending === 'sie')}
                >
                  Sie
                  <span className="mt-0.5 block text-[10px] font-semibold text-neutral-600">förmlich</span>
                </button>
                <button
                  type="button"
                  data-anrede-pick
                  data-anrede-value="du"
                  onPointerDown={() => speakSalutationPickFromGesture('du')}
                  onTouchStart={() => speakSalutationPickFromGesture('du')}
                  onClick={() => {
                    speakSalutationPickFromGesture('du');
                    pick('du');
                    if (speakApi?.readAloud) {
                      pendingAutoWeiterRef.current = true;
                      salutationSpeechHeardRef.current = false;
                      clearAutoWeiterTimers();
                      setWeiterPulse(false);
                      autoWeiterTimersRef.current.push(
                        window.setTimeout(() => {
                          if (!pendingAutoWeiterRef.current || pendingRef.current == null) return;
                          pendingAutoWeiterRef.current = false;
                          salutationSpeechHeardRef.current = false;
                          setWeiterPulse(false);
                          onCompleteRef.current();
                        }, 3400),
                      );
                    }
                  }}
                  className={anredePickBtnClass(pending === 'du')}
                >
                  Du
                  <span className="mt-0.5 block text-[10px] font-semibold text-neutral-600">persönlich</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={pending == null}
              onClick={confirm}
              className={
                'btn-gov-primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50 ' +
                (weiterPulse ? 'footer-heartbeat' : '')
              }
            >
              Weiter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
