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
import { useClaraVoice } from '@/hooks/useClaraVoice';
import { ClaraStepPanel } from '@/components/Intro/ClaraStepPanel';
import IntroMetaStrip from '@/components/Intro/IntroMetaStrip';
import { useOptionalIntroOverlay } from '@/components/Intro/IntroOverlay';
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
  const intro = useOptionalIntroOverlay();
  const { speakParts, stopSpeaking } = useClaraVoice();
  const anredeWelcomeRef = useRef(false);
  const lastReadAloud = useRef<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPending(state.anrede ?? null);
    }
  }, [isOpen, state.anrede]);

  const shellClass = useMemo(() => {
    if (variant === 'inline') return 'w-full';
    const base =
      position === 'fixed'
        ? 'intro-safe-overlay z-[600] flex items-center justify-center p-3 sm:p-4'
        : 'absolute inset-0 z-[600] flex items-center justify-center p-3 sm:p-4';
    return base;
  }, [variant, position]);

  const pick = useCallback(
    (a: Anrede) => {
      setPending(a);
      if (state.anrede !== a) dispatch({ type: 'SET_ANREDE', payload: a });
    },
    [dispatch, state.anrede],
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
      anredeWelcomeRef.current = false;
    }
    lastReadAloud.current = Boolean(intro?.readAloud);
  }, [isOpen, intro?.readAloud]);

  /** Begrüßung + Ablauf: gleiche Klar-Stimme wie im Clara-Dock; nur wenn „Vorlesen“ in der Leiste an ist. */
  useEffect(() => {
    if (!isOpen) {
      anredeWelcomeRef.current = false;
      return;
    }
    if (!intro?.readAloud) {
      stopSpeaking();
      return;
    }
    if (anredeWelcomeRef.current) return;
    const t = window.setTimeout(() => {
      anredeWelcomeRef.current = true;
      const choice = pending ?? state.anrede ?? null;
      speakParts(introAnredeGateSpokenParts(choice));
    }, 500);
    return () => {
      window.clearTimeout(t);
    };
  }, [isOpen, intro?.readAloud, pending, state.anrede, speakParts, stopSpeaking]);

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

  if (!isOpen) return null;

  const titleAnrede =
    pending == null ? INTRO_ANREDE_UI_TITLE_SIE : duMode ? INTRO_ANREDE_UI_TITLE_DU : INTRO_ANREDE_UI_TITLE_SIE;
  const shortAnrede =
    pending == null ? INTRO_ANREDE_SHORT_SIE : duMode ? INTRO_ANREDE_SHORT_DU : INTRO_ANREDE_SHORT_SIE;

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
        className="intro-dark-body hide-scrollbar relative w-full max-w-[360px] overflow-y-auto overscroll-contain rounded-3xl sm:max-w-[400px] anredegate-sheet"
        style={{
          maxHeight: 'calc(100dvh - 1.5rem)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          WebkitOverflowScrolling: 'touch',
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
        <IntroMetaStrip
          stepNumber={null}
          onSkip={() => window.dispatchEvent(new Event('eidconnect:skip-intro-all'))}
          onClose={() => window.dispatchEvent(new Event('eidconnect:skip-intro-all'))}
        />

        <div className="border-b border-white/10 px-4 pb-3 pt-3 sm:px-5 sm:pt-4 sm:pb-4">
          <ClaraStepPanel
            label={titleAnrede}
            short={shortAnrede}
            long=""
            showTopicTitle
          />
        </div>

        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-white/85" id="anrede-choice-label">
              Ansprache wählen
            </p>
            <div
              className="grid grid-cols-2 gap-2"
              role="group"
              aria-labelledby="anrede-choice-label"
            >
              <button
                type="button"
                onClick={() => pick('sie')}
                className={
                  'min-h-[48px] rounded-xl border-2 bg-transparent px-2.5 text-center text-[12px] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300/60 ' +
                  (pending === 'sie'
                    ? 'border-sky-300 text-white'
                    : 'border-sky-500/50 text-white/90 hover:border-sky-400/70')
                }
              >
                Sie
                <span className="mt-0.5 block text-[10px] font-semibold text-white/60">förmlich</span>
              </button>
              <button
                type="button"
                onClick={() => pick('du')}
                className={
                  'min-h-[48px] rounded-xl border-2 bg-transparent px-2.5 text-center text-[12px] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300/60 ' +
                  (pending === 'du'
                    ? 'border-sky-300 text-white'
                    : 'border-sky-500/50 text-white/90 hover:border-sky-400/70')
                }
              >
                Du
                <span className="mt-0.5 block text-[10px] font-semibold text-white/60">persönlich</span>
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
  );
}
