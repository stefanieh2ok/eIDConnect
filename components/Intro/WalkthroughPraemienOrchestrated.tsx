'use client';

import React, { useCallback, useState } from 'react';

type Phase = 'card' | 'qr' | 'closing';

type Props = {
  du: boolean;
  /** Nach Abschluss der interaktiven Sequenz (inkl. Kurz-Hinweis). */
  onFlowComplete: () => void;
};

/** Dezorative Mini-QR (kein Payload), GovTech-neutral. */
function WalkthroughQrMini({ seed }: { seed: string }) {
  const n = 15;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % 1_000_000;
  const cells = new Array<boolean>(n * n).fill(false);
  const paintFinder = (br: number, bc: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const i = (br + r) * n + (bc + c);
        if (i < 0 || i >= cells.length) continue;
        const outer = r === 0 || c === 0 || r === 6 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        cells[i] = outer || inner;
      }
    }
  };
  paintFinder(0, 0);
  paintFinder(0, n - 7);
  paintFinder(n - 7, 0);
  for (let i = 0; i < cells.length; i++) {
    if (cells[i]) continue;
    const row = Math.floor(i / n);
    const col = i % n;
    if (row < 7 && col < 7) continue;
    if (row < 7 && col >= n - 7) continue;
    if (row >= n - 7 && col < 7) continue;
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    cells[i] = h % 3 === 0;
  }
  return (
    <div
      className="mx-auto mt-2 grid aspect-square max-w-[200px] gap-px border border-neutral-300/90 bg-neutral-300 p-px shadow-inner"
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {cells.map((on, i) => (
        <div key={i} className={`aspect-square min-h-0 ${on ? 'bg-[#0f172a]' : 'bg-white'}`} />
      ))}
    </div>
  );
}

/**
 * Geführte Prämien-Demo: Karte → Auswahl → QR/Wallet – ohne Leaderboard-Auto-Timer.
 */
export default function WalkthroughPraemienOrchestrated({ du, onFlowComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('card');

  const finish = useCallback(() => {
    onFlowComplete();
  }, [onFlowComplete]);

  if (phase === 'card') {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-start px-2 pb-2 pt-1 sm:px-3">
        <div className="intro-wt-showcase-hero w-full max-w-[min(100%,22rem)] rounded-2xl border border-slate-200/95 bg-gradient-to-b from-white to-slate-50/90 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <p className="text-center text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-500">Beispielprämie</p>
          <div className="mt-2 overflow-hidden rounded-xl border border-cyan-100/80">
            <img
              src="/praemien/naturfreibad-kirkel.jpg"
              alt=""
              className="h-[min(28vw,7.5rem)] w-full object-cover object-center sm:h-32"
            />
          </div>
          <h3 className="mt-2.5 text-center text-[15px] font-bold leading-snug text-[#0f172a]">Naturfreibad Kirkel</h3>
          <p className="mt-1 text-center text-[10px] font-semibold text-slate-600">Lokaler Vorteil · freiwillig · nur mit Einwilligung</p>
          <p className="mt-2 text-center text-[11px] leading-snug text-neutral-700">
            {du
              ? 'Einmaliger Eintritt als Beispielprämie für aktive Beteiligung.'
              : 'Einmaliger Eintritt als Beispielprämie für aktive Beteiligung.'}
          </p>
          <button
            type="button"
            onClick={() => setPhase('qr')}
            className="btn-primary t-button mt-3 w-full min-h-[44px] rounded-xl px-3 text-[13px] font-bold shadow-[0_4px_14px_rgba(0,61,128,0.22)] transition active:scale-[0.99]"
          >
            Prämie auswählen
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'qr') {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className="intro-wt-sheet-backdrop absolute inset-0 z-[1] bg-black/45 backdrop-blur-[2px]"
          aria-hidden
        />
        <div className="relative z-[2] flex min-h-0 flex-1 flex-col items-center justify-end pb-1 pt-4 sm:justify-center sm:pb-4">
          <div className="intro-wt-sheet-panel--cinema w-full max-w-[min(100%,22rem)] rounded-2xl border border-neutral-200 bg-white px-3 pb-3 pt-3 shadow-2xl sm:max-h-[min(78dvh,32rem)] sm:overflow-y-auto">
            <p className="text-center text-[15px] font-bold text-[#0f172a]">Dein QR-Code ist bereit</p>
            <p className="mt-1 text-center text-[11px] leading-snug text-neutral-600">
              {du
                ? 'Du kannst ihn beim Partner vorzeigen oder als Wallet-Pass speichern.'
                : 'Sie können ihn beim Partner vorzeigen oder als Wallet-Pass speichern.'}
            </p>
            <div className="intro-wt-qr-reveal">
              <WalkthroughQrMini seed="naturfreibad-kirkel-walkthrough" />
            </div>
            <p className="mt-2 text-center font-mono text-[11px] font-semibold text-neutral-800">HC-KIRKEL-2026-4821</p>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setPhase('closing')}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#003D80] px-3 text-[13px] font-bold text-white shadow-md transition hover:bg-[#00366f] active:scale-[0.99]"
              >
                Zum Wallet hinzufügen
              </button>
              <button
                type="button"
                onClick={() => setPhase('closing')}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-[12px] font-semibold text-neutral-800 transition hover:bg-neutral-50 active:scale-[0.99]"
              >
                Später ansehen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-3 py-4">
      <p className="max-w-[22rem] text-center text-[12px] leading-relaxed text-neutral-700">
        {du
          ? 'Das ist nur ein Beispiel. In einer echten Umsetzung würden Prämien lokal, freiwillig und datenschutzkonform angebunden.'
          : 'Das ist nur ein Beispiel. In einer echten Umsetzung würden Prämien lokal, freiwillig und datenschutzkonform angebunden.'}
      </p>
      <button
        type="button"
        onClick={finish}
        className="btn-primary t-button mt-4 min-h-[44px] w-full max-w-[22rem] rounded-xl px-3 text-[13px] font-bold"
      >
        Verstanden
      </button>
    </div>
  );
}
