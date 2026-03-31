'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Award } from 'lucide-react';
import OriginalStimmzettel from '@/components/Voting/OriginalStimmzettel';
import VotingCard from '@/components/Voting/VotingCard';
import VotingControls from '@/components/Voting/VotingControls';
import { VOTING_DATA } from '@/data/constants';
import { INTRO_OVERLAY_HEADLINE, INTRO_OVERLAY_STEPS } from '@/data/introOverlayMarketing';
import { INTRO_SCREENSHOTS } from '@/data/introScreenshots';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import type { Location, VotingCard as VotingCardModel } from '@/types';

type Props = {
  du: boolean;
  /** Wohnort aus der App; steuert Beispielkarten (Abstimmen, Meldungen, Gemeinderat). */
  residenceLocation: Location;
  onClose: () => void;
  onFinish: () => void;
};

const INTRO_KOMMUNE_VOTE_KEYS = new Set<string>([
  'kirkel',
  'viernheim',
  'frankfurt',
  'mannheim',
  'heidelberg',
  'weinheim',
  'neustadt',
  'bremen',
  'berlin',
  'muenchen',
]);

function introCommuneVoteKey(loc: Location): string {
  if (INTRO_KOMMUNE_VOTE_KEYS.has(loc)) return loc;
  return 'kirkel';
}

const COMMUNE_DISPLAY: Record<string, string> = {
  kirkel: 'Kirkel',
  viernheim: 'Viernheim',
  frankfurt: 'Frankfurt am Main',
  mannheim: 'Mannheim',
  heidelberg: 'Heidelberg',
  weinheim: 'Weinheim',
  neustadt: 'Neustadt an der Weinstraße',
  bremen: 'Bremen',
  berlin: 'Berlin',
  muenchen: 'München',
};

const noopVote = () => {};
const noopKi = () => {};
const noopDrag = () => {};

/** PNG unter public/intro/ optional; sonst eingebaute Vorschau (siehe data/introScreenshots.ts). */
function IntroScreenshotOrPreview({
  src,
  alt,
  children,
  useScreenshot = true,
}: {
  src: string;
  alt: string;
  children: React.ReactNode;
  useScreenshot?: boolean;
}) {
  const [showShot, setShowShot] = useState(false);
  const effectiveShowShot = useScreenshot && showShot;
  return (
    <div className="relative w-full shrink-0 overflow-hidden rounded-xl">
      <div className={effectiveShowShot ? 'hidden' : 'block'}>{children}</div>
      <img
        src={src}
        alt={alt}
        className={
          effectiveShowShot
            ? 'mx-auto w-full rounded-xl border border-white/35 shadow-xl'
            : 'pointer-events-none absolute h-0 w-0 opacity-0'
        }
        loading="eager"
        decoding="async"
        onLoad={() => setShowShot(true)}
        onError={() => setShowShot(false)}
      />
    </div>
  );
}

function BallotScroll({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="intro-ballot-scroll max-h-[min(56vh,24rem)] overflow-y-auto overflow-x-hidden rounded-xl border border-white/30 bg-white shadow-md"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="p-2 text-gray-900">{children}</div>
    </div>
  );
}

/** Gleiche Abstimmungskarte wie in der App inkl. Daumen-Buttons; Pro/Contra standardmäßig eingeklappt. */
function IntroAbstimmenPreview({ card }: { card: VotingCardModel }) {
  return (
    <div className="relative w-full min-w-0 max-w-full">
      <div
        className="absolute inset-x-2 -bottom-1 top-2 -z-10 rounded-2xl bg-neutral-100 shadow-sm"
        aria-hidden
      />
      <div
        className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
        style={{ boxShadow: '0 8px 28px rgba(0,40,100,0.12)' }}
      >
        <div className="p-1.5">
          <VotingCard
            card={card}
            canVote
            dragOffset={0}
            isDragging={false}
            onDragStart={noopDrag}
            onDragMove={noopDrag}
            onDragEnd={noopDrag}
            onVote={noopVote}
          />
          <VotingControls canVote onVote={noopVote} />
        </div>
      </div>
    </div>
  );
}

function IntroKalenderPreview() {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  return (
    <div className="rounded-xl border border-neutral-200 bg-white text-left shadow-md">
      <div
        className="flex items-center justify-between rounded-t-xl px-3 py-2.5 text-white"
        style={{ background: 'linear-gradient(135deg, #002855 0%, #0055A4 100%)' }}
      >
        <span className="text-[12px] font-bold">Kalender</span>
        <span className="text-[10px] opacity-90">März 2026</span>
      </div>
      <div className="p-2">
        <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] font-semibold text-neutral-500">
          {days.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-0.5 text-[9px] text-neutral-400">
          {Array.from({ length: 28 }, (_, i) => (
            <span
              key={i}
              className={`flex h-6 items-center justify-center rounded ${
                i === 10 || i === 18 ? 'bg-[#E8F0FB] font-semibold text-[#003366]' : ''
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
        <div className="mt-2 space-y-1 border-t border-neutral-100 pt-2">
          <p className="text-[9px] font-semibold text-[#1A2B45]">Auszug</p>
          <div className="rounded-lg border border-[#BFD9FF] bg-[#F7FAFF] px-2 py-1.5 text-[9px] text-[#003366]">
            Kommunalwahl · 15.03.
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-[9px] text-neutral-700">
            Abstimmung · Frist 22.03.
          </div>
        </div>
      </div>
    </div>
  );
}

function MeldungIntroPreview({ communeName }: { communeName: string }) {
  const ortsteil =
    communeName === 'Kirkel' ? 'Kirkel-Altstadt' : communeName === 'Viernheim' ? 'Stadtteil Zentrum' : `Ort ${communeName}`;
  const fullReportText = `Spielplatz Bürgerpark ${ortsteil}: Auffällig viele Ratten an der Sandkiste und im Gebüsch – bitte Prüfung durch die Gemeinde und ggf. Hygienemaßnahmen.`;

  const [typed, setTyped] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setTyped(fullReportText);
      setTypingDone(true);
      return;
    }
    setTyped('');
    setTypingDone(false);
    let i = 0;
    const stepMs = 26;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(fullReportText.slice(0, i));
      if (i >= fullReportText.length) {
        setTypingDone(true);
        window.clearInterval(id);
      }
    }, stepMs);
    return () => window.clearInterval(id);
  }, [fullReportText]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white text-left shadow-md">
      <div
        className="rounded-t-xl p-4 text-white"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #0055A4 100%)' }}
      >
        <div className="text-sm font-bold">Meldungen an {communeName}</div>
        <div className="text-[10px] opacity-90">Auswahl: Kommune</div>
      </div>
      <div className="p-3 space-y-2">
        <p className="text-[11px] font-semibold text-[#1A2B45]">Thema: Spielplatz</p>
        <div className="flex items-center gap-2">
          <span className="rounded border border-[#BFD9FF] bg-[#E8F0FB] px-2 py-1 text-[10px] font-bold text-[#0055A4]">
            P
          </span>
          <span className="text-xs font-semibold text-neutral-800">Spielplatz</span>
        </div>
        <div
          className="min-h-[4.5rem] rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] leading-relaxed text-neutral-800"
          aria-live="polite"
        >
          <span>{typed}</span>
          {!typingDone ? (
            <span
              className="intro-typewriter-caret ml-0.5 inline-block h-[1.05em] w-0.5 align-[-0.15em] bg-[#1A2B45]"
              aria-hidden
            />
          ) : null}
        </div>
        <p className="text-[10px] text-neutral-500">
          Schäden und Hygienefragen sind mit Fotos und Ortsangabe erfassbar und werden strukturiert übermittelt.
        </p>
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 text-[10px] text-blue-900">
          Foto-Upload: 2 Bilder angehängt
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[10px] text-emerald-900">
          Status: In Bearbeitung – zuständige Stelle informiert
        </div>
      </div>
    </div>
  );
}

function PraemienIntroPreview() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white text-left shadow-md">
      <div
        className="rounded-t-xl p-3 text-white"
        style={{ background: 'linear-gradient(135deg, #003366 0%, #0055A4 100%)' }}
      >
        <div className="flex items-center gap-1.5 text-sm font-bold">
          <Award className="h-4 w-4" aria-hidden />
          Punkte & Prämien
        </div>
        <div className="text-[10px] opacity-90">Teilnahme freiwillig</div>
      </div>
      <div className="space-y-2 p-3">
        <label className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-[10px] text-neutral-800">
          <input type="checkbox" className="mt-0.5" />
          Ich möchte am freiwilligen Punkte- und Prämienprogramm teilnehmen.
        </label>
        <p className="text-[10px] text-neutral-600">
          Prämien und Einlöseangebote werden erst nach Ihrer Zustimmung sichtbar.
        </p>
        <div className="rounded-lg border border-neutral-200 bg-neutral-100 px-2.5 py-2 text-[10px] text-neutral-500">
          Prämienkarte (gesperrte Vorschau)
        </div>
        <button
          type="button"
          disabled
          className="w-full rounded-lg border border-neutral-300 bg-neutral-200 py-2 text-[10px] font-semibold text-neutral-500"
        >
          Einlösen (gesperrt)
        </button>
      </div>
    </div>
  );
}

export default function DemoIntroWalkthrough({ du: _du, residenceLocation, onClose, onFinish }: Props) {
  const communeKey = introCommuneVoteKey(residenceLocation);
  const communeName = COMMUNE_DISPLAY[communeKey] ?? communeKey;
  const previewCard = VOTING_DATA[communeKey]?.cards?.[0] ?? VOTING_DATA.kirkel.cards[0];
  const steps = INTRO_OVERLAY_STEPS;

  const [idx, setIdx] = useState(0);
  const step = steps[idx];
  const isLast = idx >= steps.length - 1;
  const previewMaxHeight = step.id === 'praemien' ? 'min(64vh, 500px)' : 'min(58vh, 420px)';

  const preview = useMemo(() => {
    switch (step.id) {
      case 'abstimmen':
        return (
          <IntroScreenshotOrPreview
            src={INTRO_SCREENSHOTS.beteiligung}
            alt="Bereich Abstimmen"
            useScreenshot={false}
          >
            <IntroAbstimmenPreview card={previewCard} />
          </IntroScreenshotOrPreview>
        );
      case 'wahlen':
        return (
          <IntroScreenshotOrPreview src={INTRO_SCREENSHOTS.wahlen} alt="Bereich Wahlen – Stimmzettel" useScreenshot={false}>
            <BallotScroll>
              <OriginalStimmzettel
                level="bund"
                wahlkreis="Saarbrücken"
                canVote
                introMode
                onVote={noopVote}
                onKIAnalysis={noopKi}
              />
            </BallotScroll>
          </IntroScreenshotOrPreview>
        );
      case 'kalender':
        return (
          <IntroScreenshotOrPreview src={INTRO_SCREENSHOTS.kalender} alt="Bereich Kalender">
            <IntroKalenderPreview />
          </IntroScreenshotOrPreview>
        );
      case 'meldungen':
        return (
          <IntroScreenshotOrPreview src={INTRO_SCREENSHOTS.meldungen} alt="Bereich Meldungen" useScreenshot={false}>
            <MeldungIntroPreview communeName={communeName} />
          </IntroScreenshotOrPreview>
        );
      case 'praemien':
        return <PraemienIntroPreview />;
      default:
        return null;
    }
  }, [step.id, previewCard, communeName]);

  return (
    <div
      className="relative z-10 flex min-h-0 h-full w-full max-w-[100%] min-w-0 flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(165deg, rgba(15,23,42,0.97) 0%, rgba(30,41,59,0.94) 45%, rgba(15,23,42,0.98) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* Kopfzeile: Marke + eine klare Hauptzeile auf allen Folien */}
      <div className="flex flex-shrink-0 items-start justify-between gap-3 px-3 pb-2 pt-3 sm:px-4">
        <div className="min-w-0 pr-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50">{APP_DISPLAY_NAME}</p>
          <h2 className="mt-2 text-[16px] font-extrabold leading-[1.2] tracking-tight text-white sm:text-[17px]">
            {INTRO_OVERLAY_HEADLINE}
          </h2>
        </div>
        <button
          type="button"
          aria-label="Einführung schließen"
          onClick={onClose}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base leading-none text-white/90 hover:bg-white/15"
        >
          ×
        </button>
      </div>

      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-white/[0.07] px-3 pb-3 sm:px-4">
        <div className="text-[10px] font-semibold tabular-nums text-white/70">
          Schritt {idx + 1} von {steps.length}
        </div>
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={`h-1 rounded-full transition-[width,opacity] duration-200 ${
                i === idx ? 'w-5 bg-white' : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Inhalt: Abschnitt, Fließtext, Vorschau */}
      <div className="hide-scrollbar min-h-0 flex-1 touch-pan-y overflow-y-auto overflow-x-hidden overscroll-contain px-3 pb-3 sm:px-4">
        <div className="space-y-3">
          <p className="text-[12px] font-bold leading-snug text-white/95">{step.title}</p>
          <div className="space-y-2.5">
            {step.body
              .split(/\n\n+/)
              .map((block) => block.trim())
              .filter(Boolean)
              .map((para, i) => (
                <p
                  key={i}
                  className="text-[11px] leading-[1.5] text-white/[0.88] [text-wrap:pretty]"
                >
                  {para}
                </p>
              ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-neutral-200/95 bg-white p-2.5 shadow-sm">
          <div
            className="flex-shrink-0 overflow-x-hidden overflow-y-auto overscroll-contain"
            style={{ maxHeight: previewMaxHeight }}
          >
            {preview}
          </div>
        </div>

      </div>

      <div className="flex flex-shrink-0 gap-2 border-t border-white/10 bg-[rgba(12,18,32,0.96)] px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2.5 sm:px-4">
        <button
          type="button"
          onClick={() => {
            if (idx === 0) onClose();
            else setIdx((p) => Math.max(0, p - 1));
          }}
          className="inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center rounded-xl border border-black/80 bg-black px-3 text-[11px] font-semibold text-white shadow-sm transition hover:bg-neutral-900 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
        >
          Zurück
        </button>
        <button
          type="button"
          onClick={() => (isLast ? onFinish() : setIdx((p) => Math.min(steps.length - 1, p + 1)))}
          className="btn-gov-primary btn-gov-primary--flex min-h-[44px] min-w-0 flex-1 text-[11px] font-extrabold"
        >
          {isLast ? 'Einführung abschließen' : 'Weiter'}
        </button>
      </div>
    </div>
  );
}
