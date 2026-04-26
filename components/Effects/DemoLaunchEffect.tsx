'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { APP_DISPLAY_NAME, APP_TAGLINE } from '@/lib/branding';

type DemoLaunchEffectProps = {
  /** Overlay sichtbar */
  open: boolean;
  /** Nach Ablauf oder Skip: Overlay schließen, Fokus setzen */
  onComplete: () => void;
  /** Volle Demo-Animation (ca. 1,9 s); bei reduced motion kürzerer sanfter Fade */
  durationMs?: number;
};

function usePrefersReducedMotion(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
}

const SPARKLE_COUNT = 20;

export function DemoLaunchEffect({ open, onComplete, durationMs = 1960 }: DemoLaunchEffectProps) {
  const reduced = usePrefersReducedMotion();
  const effectiveDuration = reduced ? 720 : durationMs;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const end = useCallback(() => {
    onCompleteRef.current();
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(end, effectiveDuration);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.clearTimeout(t);
        end();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, effectiveDuration, end]);

  const sparkles = useMemo(
    () =>
      Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
        left: `${8 + ((i * 47) % 84)}%`,
        top: `${58 + ((i * 19) % 28)}%`,
        delayMs: (i % 7) * 45,
        hue: i % 3 === 0 ? 'cyan' : i % 3 === 1 ? 'violet' : 'emerald',
      })),
    [],
  );

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-[900] flex flex-col items-center justify-center overflow-hidden rounded-b-[1.75rem]"
      role="dialog"
      aria-modal="true"
      aria-label="Demo-Start"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 100%, rgba(56, 189, 248, 0.12) 0%, transparent 45%), radial-gradient(90% 60% at 50% 0%, rgba(167, 139, 250, 0.1) 0%, transparent 42%), linear-gradient(180deg, rgba(2, 12, 35, 0.94) 0%, rgba(15, 23, 42, 0.97) 55%, rgba(2, 6, 23, 0.98) 100%)',
      }}
    >
      <button
        type="button"
        className="absolute right-3 top-3 rounded-lg px-2 py-1 text-[10px] font-medium text-white/70 underline-offset-2 hover:text-white hover:underline"
        onClick={end}
      >
        Überspringen
      </button>

      <div
        className={`pointer-events-none relative z-10 flex max-w-[min(20rem,88vw)] flex-col items-center px-6 text-center ${
          reduced ? 'opacity-0 animate-fade-in' : ''
        }`}
      >
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{APP_DISPLAY_NAME}</h2>
        <p className="mt-1.5 text-sm leading-snug text-slate-200/95">{APP_TAGLINE}</p>
        <p className="mt-3 text-[11px] text-slate-400">Demo wird gestartet …</p>
      </div>

      {!reduced ? (
        <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden>
          {sparkles.map((s, i) => (
            <span
              key={i}
              className={
                'absolute h-1 w-1 animate-demo-launch-sparkle rounded-full ' +
                (s.hue === 'cyan'
                  ? 'bg-cyan-300/90 shadow-[0_0_10px_rgba(103,232,249,0.55)]'
                  : s.hue === 'violet'
                    ? 'bg-violet-300/85 shadow-[0_0_10px_rgba(196,181,253,0.5)]'
                    : 'bg-emerald-300/80 shadow-[0_0_8px_rgba(110,231,183,0.45)]')
              }
              style={{
                left: s.left,
                top: s.top,
                animationDelay: `${s.delayMs}ms`,
              }}
            />
          ))}
          <div
            className="absolute left-1/2 top-[42%] h-40 w-[min(90%,22rem)] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(125, 211, 252, 0.35) 0%, transparent 70%)',
            }}
          />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#020617]/90 to-transparent" aria-hidden />
    </div>
  );
}
