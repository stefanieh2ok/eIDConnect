'use client';

import { useEffect, useState } from 'react';
import { ThumbsDown, ThumbsUp, Minus } from 'lucide-react';

type ThumbPhase = 'down' | 'abstain' | 'up';

const PHASE_MS = 1000;

type IntroSwipePreviewProps = {
  /** Volle Höhe zwischen Header und Fuß nutzen (Intro embedded in PhoneStage). */
  fillLayout?: boolean;
};

/**
 * Tinder-/Abstimmungs-Vorschau fürs Intro: Animation Daumen runter → Enthalten → Daumen hoch (Schleife).
 */
export function IntroSwipePreview({ fillLayout = false }: IntroSwipePreviewProps) {
  const [phase, setPhase] = useState<ThumbPhase>('down');

  useEffect(() => {
    const order: ThumbPhase[] = ['down', 'abstain', 'up'];
    let idx = 0;
    const id = window.setInterval(() => {
      idx = (idx + 1) % order.length;
      setPhase(order[idx]);
    }, PHASE_MS);
    return () => window.clearInterval(id);
  }, []);

  const ringActive = 'scale-105 ring-2 ring-[#0066cc]/60 bg-blue-50 shadow';
  const ringIdle = 'scale-100 ring-0 bg-white shadow-sm';

  const thumbs = (
    <div
      className="flex shrink-0 items-end justify-center gap-3 px-1 pt-0.5"
      aria-live="polite"
      aria-label="Abstimmungsreihenfolge: zuerst Dagegen, dann Enthalten, dann Dafür"
    >
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[8px] font-medium uppercase text-gray-500">Dagegen</span>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-900 transition-all duration-500 ease-out ${
            phase === 'down' ? ringActive : ringIdle
          }`}
        >
          <ThumbsDown
            className={`h-4 w-4 text-blue-900 transition-transform duration-500 ${
              phase === 'down' ? '-translate-y-0.5 -rotate-6' : ''
            }`}
            aria-hidden
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-0.5 pb-0.5">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-400 transition-all duration-500 ease-out ${
            phase === 'abstain' ? ringActive : ringIdle
          }`}
        >
          <Minus
            className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-500 ${
              phase === 'abstain' ? 'scale-110' : ''
            }`}
            aria-hidden
          />
        </div>
        <span className="text-[8px] font-medium uppercase text-gray-500">Enthalten</span>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[8px] font-medium uppercase text-gray-500">Dafür</span>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-900 transition-all duration-500 ease-out ${
            phase === 'up' ? ringActive : ringIdle
          }`}
        >
          <ThumbsUp
            className={`h-4 w-4 text-blue-900 transition-transform duration-500 ${
              phase === 'up' ? '-translate-y-0.5 rotate-6' : ''
            }`}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );

  const cardBlock = (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
      <div className="flex h-12 items-center justify-center bg-gradient-to-r from-slate-600 to-slate-800 text-[1.65rem] leading-none">
        🏛️
      </div>
      <div className="px-2.5 py-2">
        <p className="text-[12px] font-bold leading-tight text-gray-900">Aktuelle Abstimmung (Beispiel)</p>
        <p className="mt-0.5 text-[10px] leading-snug text-gray-600">
          Wischen oder tippen: zuerst <strong className="text-gray-800">Dagegen</strong>, dann{' '}
          <strong className="text-gray-800">Enthalten</strong>, dann <strong className="text-gray-800">Dafür</strong>.
        </p>
        <div className="mt-1.5 flex h-1.5 gap-px overflow-hidden rounded-full bg-gray-100">
          <span
            className={`flex-1 rounded-l-full transition-colors duration-500 ${
              phase === 'down' ? 'bg-red-600' : 'bg-red-400/35'
            }`}
          />
          <span
            className={`flex-1 transition-colors duration-500 ${
              phase === 'abstain' ? 'bg-gray-600' : 'bg-gray-300/60'
            }`}
          />
          <span
            className={`flex-1 rounded-r-full transition-colors duration-500 ${
              phase === 'up' ? 'bg-green-600' : 'bg-green-400/40'
            }`}
          />
        </div>
      </div>
    </div>
  );

  if (!fillLayout) {
    return (
      <div className="mx-auto w-full max-w-[min(100%,340px)] shrink-0">
        {cardBlock}
        <div className="mt-2.5">{thumbs}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-2">
      <div className="shrink-0">{cardBlock}</div>

      <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 px-2 py-1.5">
        <p className="text-center text-[10px] leading-snug text-slate-600">
          Unter der Karte folgen in der App Clara, Punkte und weitere Inhalte.
        </p>
      </div>

      <div className="shrink-0 rounded-xl border border-slate-200 bg-white/95 px-2 pb-1 pt-1.5 shadow-sm">
        {thumbs}
      </div>
    </div>
  );
}
