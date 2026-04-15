'use client';

import React, { useState } from 'react';
import { X, ThumbsDown, Minus, ThumbsUp } from 'lucide-react';

export const DEMO_CONNECT_OVERVIEW_STORAGE_KEY = 'eidconnect_demo_overview_v1';

type OverviewStep = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  preview: React.ReactNode;
};

function ProgressBar({ stepIndex, total }: { stepIndex: number; total: number }) {
  return (
    <div className="mt-2 flex items-center gap-1.5" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all ${i === stepIndex ? 'w-8 bg-white' : i < stepIndex ? 'w-2 bg-white/50' : 'w-2 bg-white/25'}`}
        />
      ))}
    </div>
  );
}

function PreviewVoting() {
  return (
    <div className="flex flex-col gap-1.5 text-[10px] leading-snug text-neutral-800">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-900">Bildung</span>
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-900">Frist: 30.03.2026</span>
      </div>
      <p className="text-[12px] font-bold text-neutral-900">Sanierung der Kirkel-Halle</p>
      <p className="text-neutral-600">Sanierung inkl. Energie, Barrierefreiheit, Brandschutz.</p>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <span className="w-[74%] bg-emerald-600" />
        <span className="w-[18%] bg-red-500" />
        <span className="w-[8%] bg-neutral-400" />
      </div>
      <div className="flex justify-between text-[10px] text-neutral-500">
        <span>4.820 Stimmen</span>
        <span>+250 Demo-Punkte</span>
      </div>
      <div className="rounded-lg bg-sky-50 px-2 py-1.5 text-center text-[10px] text-sky-900">
        74% Dafür · 18% Dagegen · 4.820 Stimmen
      </div>
      <div className="rounded-lg border border-slate-200 bg-white/95 px-2 pb-1 pt-1.5 shadow-sm">
        <div className="flex items-end justify-center gap-3">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[8px] font-medium uppercase text-gray-500">Dagegen</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-900 bg-white">
              <ThumbsDown className="h-3.5 w-3.5 text-blue-900" aria-hidden />
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 pb-0.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-400 bg-white">
              <Minus className="h-3 w-3 text-gray-500" aria-hidden />
            </div>
            <span className="text-[8px] font-medium uppercase text-gray-500">Enthalten</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[8px] font-medium uppercase text-gray-500">Dafür</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-900 bg-white">
              <ThumbsUp className="h-3.5 w-3.5 text-blue-900" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewCalendar() {
  return (
    <div className="space-y-1.5 text-[10px] text-neutral-800">
      <div className="flex items-center justify-between rounded-lg bg-slate-100 px-2 py-1.5 font-semibold text-slate-800">
        <span>‹</span>
        <span>März 2026</span>
        <span>›</span>
      </div>
      <p className="text-[9px] text-neutral-500">Tippen springt zur passenden Karte.</p>
      <ul className="space-y-1.5 rounded-lg border border-slate-200 bg-white p-2">
        <li className="flex justify-between gap-2 border-b border-slate-100 pb-1.5">
          <span className="text-neutral-600">12.03.</span>
          <span className="flex-1 text-neutral-900">Kommunalwahl · Kreis</span>
        </li>
        <li className="flex justify-between gap-2">
          <span className="text-neutral-600">28.03.</span>
          <span className="flex-1 text-neutral-900">Abstimmung · Beispielvorlage</span>
        </li>
      </ul>
    </div>
  );
}

function PreviewMelden() {
  return (
    <div className="space-y-1.5 text-[10px] leading-snug text-neutral-800">
      <div className="rounded-t-lg bg-[#003399] px-3 py-2 text-white">
        <div className="text-[12px] font-bold">Meldungen an Kirkel</div>
        <div className="text-[10px] opacity-90">Auswahl: Kommune</div>
      </div>
      <div className="space-y-1.5 px-1 pb-1.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-900">P</span>
          <span className="font-semibold text-neutral-900">Thema: Spielplatz</span>
        </div>
        <div className="rounded-lg bg-neutral-100 p-2 text-neutral-700">
          Hinweis: Im Bürgerpark Kirkel-Altstadt Ratten gesichtet. Bitte prüfen.
        </div>
        <p className="text-[9px] text-neutral-600">Mit Foto und Standort erfassbar.</p>
        <p className="border-t border-neutral-200 pt-1.5 text-[9px] font-medium text-neutral-800">
          Foto-Upload: 3 Bilder angehängt
        </p>
      </div>
    </div>
  );
}

function PreviewWahlen() {
  return (
    <div className="space-y-1.5 text-[10px] text-neutral-800">
      <p className="font-semibold text-neutral-900">Listen & Stimmzettel</p>
      <p className="text-neutral-600">Wahlen von Bund bis Kommune, passend zur Region.</p>
      <div className="rounded-lg border border-slate-200 bg-white p-2">
        <div className="text-[10px] font-semibold text-blue-900">Beispiel</div>
        <div className="mt-1 text-[10px] text-neutral-700">Kreistag · Kommunalwahl 2026</div>
      </div>
    </div>
  );
}

function PreviewPunkte() {
  return (
    <div className="space-y-1.5 text-[10px] text-neutral-800">
      <p className="font-semibold text-neutral-900">Punkte & Transparenz</p>
      <p className="text-neutral-600">Teilnahme freiwillig. Clara erklärt neutral ohne Wahlempfehlung.</p>
      <div className="rounded-lg bg-amber-50 p-2 text-[10px] text-amber-950">
        Demo: Punkte sind eine Orientierung, kein Echtgeld.
      </div>
    </div>
  );
}

const STEPS: OverviewStep[] = [
  {
    id: 'melden',
    kicker: '1) Meldungen',
    title: 'Meldungen',
    body: 'Mängel und Anliegen für die Kommune mit Kategorie, Ort, Text und optional Fotos erfassen.',
    preview: <PreviewMelden />,
  },
  {
    id: 'vote',
    kicker: '2) Abstimmen',
    title: 'Abstimmen',
    body: 'Sie sehen Themen mit Pro/Contra und geben Ihre Meinung ab. Clara erklärt neutral.',
    preview: <PreviewVoting />,
  },
  {
    id: 'wahlen',
    kicker: '3) Wahlen',
    title: 'Wahlen',
    body: 'Listen und Stimmzettel passend zu Bund, Land, Kreis und Kommune.',
    preview: <PreviewWahlen />,
  },
  {
    id: 'kalender',
    kicker: '4) Kalender',
    title: 'Kalender',
    body: 'Termine und Fristen aus Abstimmungen und Wahlen im Monatsüberblick.',
    preview: <PreviewCalendar />,
  },
  {
    id: 'punkte',
    kicker: '5) Punkte & Clara',
    title: 'Punkte & Clara',
    body: 'Punkte optional. Clara bleibt sachlich und gibt keine Wahlempfehlung.',
    preview: <PreviewPunkte />,
  },
];

type DemoConnectOverviewProps = {
  onComplete: () => void;
};

/**
 * Vollbild-Onboarding „eID Demo Connect im Überblick“: Vorschau-Karten nutzen den verfügbaren Viewport
 * (flex-1 min-h-0), statt in einem zu niedrigen Fenster abzuschneiden.
 */
export function DemoConnectOverview({ onComplete }: DemoConnectOverviewProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const total = STEPS.length;

  const goNext = () => {
    if (stepIndex >= total - 1) {
      onComplete();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  return (
    <div
      className="fixed inset-0 z-[135] flex h-[100dvh] max-h-[100dvh] flex-col bg-neutral-950/88 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-overview-title"
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[430px] flex-col px-4 pt-[max(0.6rem,env(safe-area-inset-top))]">
        <div className="flex shrink-0 items-start justify-between gap-2 pb-1">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">Bürgerapp</p>
            <h2 id="demo-overview-title" className="mt-1 text-[1.05rem] font-bold leading-tight text-white">
              eID Demo Connect im Überblick
            </h2>
            <p className="mt-1 text-[11px] text-white/80">
              Schritt {stepIndex + 1} von {total}
            </p>
            <ProgressBar stepIndex={stepIndex} total={total} />
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-1.5 shrink-0">
          <h3 className="text-[15px] font-bold text-white">{step.kicker}</h3>
          <p className="mt-1.5 text-[12px] leading-snug text-white/90">{step.body}</p>
        </div>

        {/* Nimmt die restliche Höhe zwischen Text und Fuß – keine innere Scrollbar in der Vorschau */}
        <div className="mt-2 flex min-h-0 flex-1 flex-col justify-start">
          <div
            className={`rounded-2xl border border-white/15 bg-white shadow-xl ${
              step.id === 'vote'
                ? 'max-h-[min(48dvh,360px)] overflow-hidden'
                : 'max-h-[min(44dvh,320px)] overflow-hidden'
            }`}
          >
            <div className="h-full overflow-hidden p-2.5 sm:p-3">{step.preview}</div>
          </div>
        </div>

        <div
          className="flex shrink-0 gap-3 pt-2"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}
        >
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0}
            className="flex-1 rounded-2xl bg-neutral-900 py-3.5 text-sm font-bold text-white shadow-sm transition-opacity disabled:opacity-40"
          >
            Zurück
          </button>
          <button
            type="button"
            onClick={goNext}
            className="flex-1 rounded-2xl py-3.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95"
            style={{ background: 'var(--gov-btn, #0066cc)' }}
          >
            {stepIndex >= total - 1 ? 'Los geht’s' : 'Weiter'}
          </button>
        </div>
      </div>
    </div>
  );
}
