'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { APP_DISPLAY_NAME } from '@/lib/branding';
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
    const base = `${position} inset-0 z-[600] flex items-center justify-center p-3 sm:p-4`;
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
    const prevOverflow = typeof document !== 'undefined' ? document.body.style.overflow : '';
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
    // Fokus auf den ersten interaktiven Knopf im Dialog legen.
    const t = window.setTimeout(() => {
      const el = dialogRef.current?.querySelector<HTMLButtonElement>('button[aria-pressed], button[type="button"]');
      el?.focus({ preventScroll: true });
    }, 40);
    return () => {
      window.clearTimeout(t);
      if (typeof document !== 'undefined') document.body.style.overflow = prevOverflow;
    };
  }, [open]);

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
        className="relative w-full max-w-[360px] overflow-hidden rounded-3xl bg-white sm:max-w-[400px] anredegate-sheet"
        style={{
          boxShadow:
            '0 28px 80px rgba(0, 20, 60, 0.38), 0 6px 18px rgba(0, 20, 60, 0.18), 0 0 0 1px rgba(10, 25, 60, 0.06) inset',
        }}
      >
        <div className="px-4 pt-4 pb-3 border-b border-neutral-200 sm:px-5 sm:pt-5 sm:pb-4">
          <div className="text-[10px] font-extrabold tracking-wide text-[#003366] sm:text-[11px]">{APP_DISPLAY_NAME}</div>
          <h2 className="mt-1 text-base font-black text-neutral-900 sm:text-lg">Wie möchten Sie angesprochen werden?</h2>
          <p className="mt-1.5 text-[11px] leading-snug text-neutral-600 sm:text-[12px]">
            Bitte wählen Sie einmalig <span className="font-semibold text-neutral-800">Sie</span> oder{' '}
            <span className="font-semibold text-neutral-800">Du</span>. Das Intro und alle Hinweise passen sich an.
          </p>
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

