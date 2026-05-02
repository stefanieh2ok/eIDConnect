'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { CheckCircle } from 'lucide-react';
import { getDemoLaunchStyle } from '@/lib/demoLaunchEffectConfig';

type DemoLaunchEffectProps = {
  /** Overlay sichtbar */
  open: boolean;
  /** Nach Ablauf oder Skip: Overlay schließen, Fokus setzen */
  onComplete: () => void;
  /** Optionaler Ortskontext, z. B. "Kirkel · Saarland · Bund" */
  locationLine?: string;
  /** Gesamtdauer */
  durationMs?: number;
};

function usePrefersReducedMotion(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
}

const STATUS_LINES = ['Bürgerzugang bestätigt', 'Vorschaudaten geladen'] as const;

/** Kurzer, einmaliger Reveal-Burst nur im App-Übergang (nicht Walkthrough / nicht Zugangsscreen). */
const DEMO_LAUNCH_CONFETTI_SPOKES = 20;

const DEMO_LAUNCH_CONFETTI_DOTS: readonly {
  left: string;
  top: string;
  delayMs: number;
  dx: string;
  dy: string;
  background: string;
}[] = [
  { left: '44%', top: '32%', delayMs: 90, dx: '12px', dy: '-36px', background: 'rgba(224, 242, 254, 0.88)' },
  { left: '53%', top: '34%', delayMs: 130, dx: '-16px', dy: '-40px', background: 'rgba(196, 181, 253, 0.55)' },
  { left: '48%', top: '30%', delayMs: 160, dx: '8px', dy: '-48px', background: 'rgba(224, 242, 254, 0.72)' },
  { left: '56%', top: '38%', delayMs: 110, dx: '-20px', dy: '-32px', background: 'rgba(165, 243, 252, 0.65)' },
  { left: '42%', top: '40%', delayMs: 180, dx: '18px', dy: '-28px', background: 'rgba(237, 233, 254, 0.7)' },
  { left: '50%', top: '42%', delayMs: 140, dx: '-10px', dy: '-44px', background: 'rgba(224, 242, 254, 0.78)' },
];

export function DemoLaunchEffect({
  open,
  onComplete,
  locationLine,
  durationMs = 3300,
}: DemoLaunchEffectProps) {
  const reduced = usePrefersReducedMotion();
  const style = getDemoLaunchStyle();
  const effectiveDuration = reduced ? Math.min(durationMs, 900) : durationMs;
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

  const timings = useMemo(
    () => ({
      fadeIn: reduced ? 220 : 420,
      sealIn: reduced ? 0 : 620,
      statusStart: reduced ? 0 : 960,
      lineStep: reduced ? 0 : 520,
      openingStart: reduced ? 0 : Math.max(2350, effectiveDuration - 900),
    }),
    [effectiveDuration, reduced],
  );

  if (!open) return null;

  // Solange kein separater Classic-Renderer mehr aktiv genutzt wird,
  // fällt "classic" bewusst auf den verlässlichen Identity-Seal zurück.
  if (style !== 'identity-seal' && style !== 'classic') return null;

  return (
    <div
      className="absolute inset-0 z-[900] flex flex-col items-center justify-center overflow-hidden rounded-b-[1.75rem] demo-launch-identity"
      role="dialog"
      aria-modal="true"
      aria-label="App-Übergang"
      style={{
        animationDuration: `${timings.fadeIn}ms`,
      }}
    >
      {!reduced ? (
        <div className="demo-launch-confetti-layer" aria-hidden>
          <div className="demo-launch-confetti-burst">
            {Array.from({ length: DEMO_LAUNCH_CONFETTI_SPOKES }, (_, i) => {
              const deg = (360 / DEMO_LAUNCH_CONFETTI_SPOKES) * i;
              const violet = i % 5 === 0;
              return (
                <div
                  key={`spoke-${i}`}
                  className={`demo-launch-confetti-spoke${violet ? ' demo-launch-confetti-spoke--violet' : ''}`}
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <span
                    className="demo-launch-confetti-ray"
                    style={{ animationDelay: `${i * 38}ms` }}
                  />
                </div>
              );
            })}
          </div>
          {DEMO_LAUNCH_CONFETTI_DOTS.map((d, i) => (
            <span
              key={`dot-${i}`}
              className="demo-launch-confetti-dot"
              style={
                {
                  left: d.left,
                  top: d.top,
                  animationDelay: `${d.delayMs}ms`,
                  background: d.background,
                  '--dx': d.dx,
                  '--dy': d.dy,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ) : null}
      <button
        type="button"
        className="absolute right-3 top-3 rounded-lg px-2 py-1 text-[10px] font-medium text-white/55 hover:text-white/75"
        onClick={end}
      >
        Überspringen
      </button>

      <div className="pointer-events-none relative z-10 flex w-full max-w-[min(21.5rem,92vw)] flex-col items-center px-5 text-center">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-cyan-100/95">HookAI Civic</p>

        {!reduced ? (
          <div
            className="relative mt-5 h-[112px] w-[112px] demo-seal-rise"
            style={{ animationDuration: `${timings.sealIn}ms` }}
            aria-hidden
          >
            <div className="absolute inset-0 rounded-full border border-cyan-200/70 bg-[radial-gradient(circle_at_30%_30%,rgba(196,181,253,0.25),transparent_55%),radial-gradient(circle_at_70%_72%,rgba(103,232,249,0.24),transparent_58%)]" />
            <div className="absolute inset-[9px] rounded-full border border-white/45 bg-[rgba(11,22,44,0.58)] backdrop-blur-sm" />
            <div className="absolute inset-[-1px] rounded-full border border-cyan-200/60 demo-seal-ring-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full border border-white/35 px-3 py-1 text-[10px] font-semibold text-white/90">
                Identity Seal
              </span>
            </div>
          </div>
        ) : null}

        <p className="mt-5 text-[14px] font-semibold text-white/95">HookAI Civic wird geöffnet</p>
        <p className="mt-1.5 text-[10px] leading-relaxed text-slate-300/85">
          Keine produktive Abstimmung. Keine rechtswirksame Stimmabgabe.
        </p>

        <div className="mt-5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 text-left backdrop-blur-sm" aria-live="polite">
          {STATUS_LINES.map((line, idx) => (
            <div
              key={line}
              className={`${reduced ? '' : 'demo-status-line'} flex items-center gap-2 text-[11px] leading-6 text-slate-100/95`}
              style={reduced ? undefined : { animationDelay: `${timings.statusStart + idx * timings.lineStep}ms` }}
            >
              <CheckCircle className="h-3.5 w-3.5 text-cyan-200/90" aria-hidden />
              <span>{line}</span>
            </div>
          ))}
        </div>

        {locationLine ? (
          <p
            className={`${reduced ? '' : 'demo-status-line'} mt-2 text-[10px] text-slate-300/85`}
            style={reduced ? undefined : { animationDelay: `${timings.statusStart + STATUS_LINES.length * timings.lineStep}ms` }}
          >
            {locationLine}
          </p>
        ) : null}

        {!reduced ? (
          <p
            className="demo-status-line mt-2.5 text-[11px] font-medium text-white/85"
            style={{ animationDelay: `${timings.statusStart + (STATUS_LINES.length + 1) * timings.lineStep}ms` }}
          >
            App wird geöffnet
          </p>
        ) : null}
      </div>

        {!reduced ? (
          <>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#020617]/95 via-[#020617]/50 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] demo-launch-panel-left"
            style={{ animationDelay: `${timings.openingStart}ms` }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] demo-launch-panel-right"
            style={{ animationDelay: `${timings.openingStart}ms` }}
            aria-hidden
          />
        </>
      ) : null}
    </div>
  );
}
