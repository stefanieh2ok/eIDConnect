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
import { useOptionalIntroOverlay } from '@/components/Intro/IntroOverlay';
import type { Anrede } from '@/types';

const INTRO_AUDIO_SESSION_KEY = 'eidconnect_intro_audio_v1';

function isFinePointerDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );
}

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
  const intro = useOptionalIntroOverlay();
  const { speakParts, stopSpeaking } = useClaraVoiceContext();
  const hasUnlockedSpeechRef = useRef(false);
  const hasSpokenIntroRef = useRef(false);
  const hasSelectedSalutationRef = useRef(false);
  const lastSpokenSalutationRef = useRef<Anrede | null>(null);
  const lastReadAloud = useRef<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPending(state.anrede ?? null);
    }
  }, [isOpen, state.anrede]);

  useEffect(() => {
    if (!isOpen || !intro) return;
    // Auf dem Anrede-Screen soll Clara zuverlässig hörbar starten.
    if (!intro.readAloud) {
      intro.setReadAloud(true);
    }
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(INTRO_AUDIO_SESSION_KEY, '1');
      }
    } catch {
      // ignore
    }
  }, [isOpen, intro]);

  useEffect(() => {
    if (!isOpen) {
      hasSpokenIntroRef.current = false;
      hasSelectedSalutationRef.current = false;
      hasUnlockedSpeechRef.current = false;
      lastSpokenSalutationRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!intro?.readAloud) {
      stopSpeaking();
    }
  }, [isOpen, intro?.readAloud, stopSpeaking]);

  const shellClass = useMemo(() => {
    if (variant === 'inline') return 'w-full';
    const base =
      position === 'fixed'
        ? 'intro-safe-overlay z-[600] flex items-center justify-center p-3 sm:p-4'
        : 'absolute inset-0 z-[600] flex items-center justify-center p-3 sm:p-4';
    return base;
  }, [variant, position]);

  const unlockSpeechOnGesture = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    try {
      void synth.getVoices();
      if (synth.paused) synth.resume();
    } catch {
      // ignore
    }
    if (hasUnlockedSpeechRef.current) return;
    try {
      const prime = new SpeechSynthesisUtterance('\u200B');
      prime.volume = 0;
      prime.rate = 1;
      prime.pitch = 1;
      synth.speak(prime);
      synth.cancel();
      hasUnlockedSpeechRef.current = true;
    } catch {
      // ignore
    }
  }, []);

  const speakGateFromUserGesture = useCallback(
    (choice: 'du' | 'sie' | null) => {
      if (!intro?.readAloud) return;
      unlockSpeechOnGesture();
      stopSpeaking();
      speakParts(introAnredeGateSpokenParts(choice));
      hasSpokenIntroRef.current = true;
      if (choice === 'du' || choice === 'sie') {
        hasSelectedSalutationRef.current = true;
      }
    },
    [intro?.readAloud, speakParts, stopSpeaking, unlockSpeechOnGesture],
  );

  const maybeStartNeutralIntroFromGesture = useCallback(() => {
    if (!intro?.readAloud) return;
    if (hasSelectedSalutationRef.current) return;
    if (hasSpokenIntroRef.current) return;
    speakGateFromUserGesture(null);
  }, [intro?.readAloud, speakGateFromUserGesture]);

  const speakSalutationPickFromGesture = useCallback(
    (a: Anrede) => {
      hasSelectedSalutationRef.current = true;
      if (lastSpokenSalutationRef.current === a && hasSelectedSalutationRef.current) {
        return;
      }
      speakGateFromUserGesture(a);
      lastSpokenSalutationRef.current = a;
    },
    [speakGateFromUserGesture],
  );

  const pick = useCallback(
    (a: Anrede) => {
      hasSelectedSalutationRef.current = true;
      stopSpeaking();
      setPending(a);
      if (state.anrede !== a) dispatch({ type: 'SET_ANREDE', payload: a });
    },
    [dispatch, state.anrede, stopSpeaking],
  );

  const confirm = useCallback(() => {
    if (pending == null) return;
    onComplete();
  }, [pending, onComplete]);

  const duMode = pending === 'du';

  useEffect(() => {
    if (!isOpen) {
      lastReadAloud.current = null;
      return;
    }
    if (lastReadAloud.current === false && intro?.readAloud) {
      hasSpokenIntroRef.current = false;
      hasSelectedSalutationRef.current = false;
      lastSpokenSalutationRef.current = null;
    }
    lastReadAloud.current = Boolean(intro?.readAloud);
  }, [isOpen, intro?.readAloud]);

  /**
   * Desktop (Maus / feiner Pointer): `speechSynthesis` darf hier zuverlässig ohne vorherigen Tap starten.
   * Touch-Geräte (iOS): weiterhin nur über echte Pointer-/Touch-Gesten (s. `onPointerDownCapture`), sonst Stille.
   */
  useEffect(() => {
    if (!isOpen || !intro?.readAloud) return;
    if (!isFinePointerDevice()) return;
    if (hasSpokenIntroRef.current || hasSelectedSalutationRef.current) return;

    const id = window.setTimeout(() => {
      if (!intro?.readAloud) return;
      if (hasSpokenIntroRef.current || hasSelectedSalutationRef.current) return;
      speakGateFromUserGesture(null);
    }, 450);

    return () => window.clearTimeout(id);
  }, [isOpen, intro?.readAloud, speakGateFromUserGesture]);

  /**
   * Safari/Desktop-Fallback: falls Autostart geblockt wird, sprechen wir beim ersten
   * realen User-Input (Maus/Keyboard/Touch) sofort den neutralen Einstieg.
   */
  useEffect(() => {
    if (!isOpen || !intro?.readAloud) return;
    if (hasSpokenIntroRef.current || hasSelectedSalutationRef.current) return;

    const startOnFirstInput = () => {
      if (!intro?.readAloud) return;
      if (hasSpokenIntroRef.current || hasSelectedSalutationRef.current) return;
      speakGateFromUserGesture(null);
    };

    window.addEventListener('pointerdown', startOnFirstInput, { passive: true, once: true });
    window.addEventListener('keydown', startOnFirstInput, { once: true });
    window.addEventListener('mousemove', startOnFirstInput, { passive: true, once: true });

    return () => {
      window.removeEventListener('pointerdown', startOnFirstInput);
      window.removeEventListener('keydown', startOnFirstInput);
      window.removeEventListener('mousemove', startOnFirstInput);
    };
  }, [isOpen, intro?.readAloud, speakGateFromUserGesture]);

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
      if (!intro?.readAloud) return;
      maybeStartNeutralIntroFromGesture();
    },
    [intro?.readAloud, maybeStartNeutralIntroFromGesture, speakSalutationPickFromGesture],
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
            unlockSpeechOnGesture();
            handleGestureTarget(e.target as HTMLElement);
          }}
          onTouchStartCapture={(e) => {
            unlockSpeechOnGesture();
            handleGestureTarget(e.target as HTMLElement);
          }}
        >
          <IntroMetaStrip
            surface="light"
            stepNumber={null}
            showClaraVoice
            onSkip={() => window.dispatchEvent(new Event('eidconnect:skip-intro-all'))}
            onClose={() => window.dispatchEvent(new Event('eidconnect:skip-intro-all'))}
          />

          <div className="border-b border-neutral-200 px-4 pb-3 pt-3 sm:px-5 sm:pt-4 sm:pb-4">
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
              className="btn-gov-primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              Weiter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
