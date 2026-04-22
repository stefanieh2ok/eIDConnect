'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { INTRO_ANREDE_LEADIN_DU, INTRO_ANREDE_LEADIN_SIE } from '@/data/introOverlayMarketing';
import { introAnredeGateSpoken } from '@/lib/introSpokenTts';
import IntroMetaStrip from '@/components/Intro/IntroMetaStrip';
import { useOptionalIntroOverlay } from '@/components/Intro/IntroOverlay';
import type { Anrede } from '@/types';

type Props = {
  /** Optional: als Vollbild-Overlay (default) oder inline. */
  variant?: 'overlay' | 'inline';
  /** Positionierung: im iPhone-Frame (absolute) vs. Seiten-Overlay (fixed). */
  position?: 'fixed' | 'absolute';
};

export function AnredeGate({ variant = 'overlay', position = 'fixed' }: Props) {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Anrede | null>(null);

  // Pro Demo-Session (Browser-Tab) genau einmal bestätigen, auch wenn lokal schon eine Anrede gespeichert ist.
  const SESSION_KEY = 'eidconnect_anrede_confirmed_session_v1';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const confirmed = sessionStorage.getItem(SESSION_KEY) === 'true';
      const shouldOpen = !confirmed;
      setOpen(shouldOpen);
      setPending(state.anrede ?? null);
    } catch {
      // Wenn sessionStorage nicht verfügbar ist: sicherheitshalber anzeigen, solange keine Anrede gesetzt ist.
      setOpen(state.anrede == null);
      setPending(state.anrede ?? null);
    }
  }, [state.anrede]);

  const shellClass = useMemo(() => {
    if (variant === 'inline') return 'w-full';
    // iOS Safari: Bei `position: fixed` die Höhe explizit an `100dvh` binden,
    // damit die Auswahlbuttons + „Weiter" nicht unter der URL-Leiste verschwinden.
    // Bei `absolute` (im iPhone-Frame/Device-Mockup) genügt `inset: 0`.
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
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {}
    setOpen(false);
  }, [pending]);

  // Fokus in den Dialog ziehen, ESC schließt nichts destruktiv – Nutzer muss aktiv wählen.
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    // Beim Öffnen: Hintergrund-Scroll sperren, damit nichts durchscheint oder ruckelt.
    // Wichtig: Nur wenn die Gate wirklich global (fixed) liegt. Bei `absolute`
    // (Device-Mockup im AppStage auf Desktop) würde ein body-Overflow-Lock die
    // vertikale Scrollleiste togglen – Viewport wird ~15 px breiter → AppStage
    // rechnet den Desktop-Scale neu → sichtbares „Springen" des iPhone-Rahmens.
    const shouldLockBody = position === 'fixed';
    const prevOverflow =
      shouldLockBody && typeof document !== 'undefined' ? document.body.style.overflow : '';
    if (shouldLockBody && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    // Fokus auf den ersten interaktiven Knopf im Dialog legen.
    const t = window.setTimeout(() => {
      const el = dialogRef.current?.querySelector<HTMLButtonElement>('button[aria-pressed], button[type="button"]');
      el?.focus({ preventScroll: true });
    }, 40);
    return () => {
      window.clearTimeout(t);
      if (shouldLockBody && typeof document !== 'undefined') {
        document.body.style.overflow = prevOverflow;
      }
    };
  }, [open, position]);

  const duMode = pending === 'du';
  const leadIn = duMode ? INTRO_ANREDE_LEADIN_DU : INTRO_ANREDE_LEADIN_SIE;
  const intro = useOptionalIntroOverlay();

  useEffect(() => {
    if (!open || !intro) return;
    if (!intro.readAloud) {
      intro.stopIntroSpeech();
      return;
    }
    intro.speakIntro(introAnredeGateSpoken(duMode));
    return () => intro.stopIntroSpeech();
  }, [open, intro, intro?.readAloud, duMode]);

  if (!open) return null;

  return (
    <div
      className={shellClass}
      role="dialog"
      aria-modal="true"
      aria-label="Anrede wählen"
    >
      {variant === 'overlay' ? (
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            // Backdrop: dunkler Scrim + iOS-artiger Blur/Saturate.
            // Damit sind Inhalte dahinter weder lesbar noch identifizierbar.
            background: 'rgba(8, 16, 34, 0.62)',
            backdropFilter: 'blur(8px) saturate(140%)',
            WebkitBackdropFilter: 'blur(8px) saturate(140%)',
          }}
        />
      ) : null}

      <div
        ref={dialogRef}
        className="intro-dark-body hide-scrollbar relative w-full max-w-[360px] overflow-y-auto overscroll-contain rounded-3xl sm:max-w-[400px] anredegate-sheet"
        style={{
          maxHeight: 'calc(100dvh - 1.5rem)',
          boxShadow:
            '0 28px 80px rgba(0, 20, 60, 0.45), 0 6px 18px rgba(0, 20, 60, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.06) inset',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Einheitlicher Dark-Meta-Streifen (siehe <IntroMetaStrip>).
            Skip/× feuern das globale eidconnect:skip-intro-all-Event, das
            BuergerApp zentral abarbeitet (Default-Anrede, Login, Flag). */}
        <IntroMetaStrip
          stepNumber={1}
          onSkip={() => window.dispatchEvent(new Event('eidconnect:skip-intro-all'))}
          onClose={() => window.dispatchEvent(new Event('eidconnect:skip-intro-all'))}
        />

        <div className="px-4 pt-3 pb-3 border-b border-white/10 sm:px-5 sm:pt-4 sm:pb-4">
          <h2 className="text-base font-black leading-snug text-white sm:text-lg">Wie möchten Sie angesprochen werden?</h2>
          <p className="mt-1.5 text-[11px] leading-snug text-white/70 sm:text-[12px]">
            Bitte wählen Sie einmalig <span className="font-semibold text-white/90">Sie</span> oder{' '}
            <span className="font-semibold text-white/90">Du</span>. Das Intro und alle Hinweise passen sich an.
          </p>
          <p className="mt-2 text-[11px] leading-snug text-white/80 sm:text-[12px]">{leadIn}</p>
        </div>

        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {(['sie', 'du'] as const).map((a) => {
              const active = pending === a;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => pick(a)}
                  className="relative btn-gov-choice overflow-hidden py-5 sm:py-6"
                  aria-pressed={active}
                >
                  {active ? (
                    <span
                      className="absolute right-2.5 top-2.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black text-white"
                      style={{ background: 'var(--gov-primary, #003366)' }}
                      aria-hidden
                    >
                      ✓
                    </span>
                  ) : null}
                  <span className="btn-gov-choice__label mb-1 text-xl font-extrabold sm:text-2xl">
                    {a === 'sie' ? 'Sie' : 'Du'}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {a === 'sie' ? 'Förmlich' : 'Persönlich'}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={pending == null}
            onClick={confirm}
            className="btn-gov-primary mt-3 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  );
}

