'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
    // Direkt im Anschluss das Produkt-Intro öffnen (damit es nicht „verschwindet“).
    try {
      window.dispatchEvent(new Event('eidconnect:open-intro'));
    } catch {}
  }, [pending]);

  if (!open) return null;

  return (
    <div className={shellClass} role="dialog" aria-modal="true" aria-label="Anrede wählen">
      {variant === 'overlay' ? (
        <div className="absolute inset-0 bg-black/45" aria-hidden />
      ) : null}

      <div
        className="relative w-full max-w-[360px] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl sm:max-w-[400px]"
        style={{ boxShadow: '0 22px 70px rgba(0,40,100,0.26)' }}
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
                  className={`relative btn-gov-choice overflow-hidden py-5 sm:py-6 ${
                    active ? 'ring-2 ring-white ring-offset-2 ring-offset-white/90 scale-[1.02]' : ''
                  }`}
                  aria-pressed={active}
                >
                  {active ? (
                    <span className="absolute right-2.5 top-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#003366] text-sm font-black shadow-sm">
                      ✓
                    </span>
                  ) : null}
                  <span className="mb-1 text-xl font-extrabold text-white sm:text-2xl">{a === 'sie' ? 'Sie' : 'Du'}</span>
                  <span className="text-xs text-white/85">{a === 'sie' ? 'Förmlich' : 'Persönlich'}</span>
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

