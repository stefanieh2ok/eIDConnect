'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IntroSwipePreview } from '@/components/IntroSwipePreview';

type TopHighlightsSlideProps = {
  onClose: () => void;
  /**
   * Innerhalb der PhoneStage-Column: kein Fullscreen-Overlay, kein zweites 430px-Card-Nesting.
   */
  embedded?: boolean;
};

/**
 * Marketing-Intro (EL16): Nutzen für Tester, keine internen UI-/Dev-Hinweise.
 */
const USP_BLOCKS: { title: string; text: string }[] = [
  {
    title: 'Alles an einem Ort',
    text: 'Sie sehen Themen von Bund bis Kommune. Sie müssen nicht mehrere Seiten oder Apps wechseln, um informiert zu sein und mitzumachen.',
  },
  {
    title: 'Abstimmen ohne Rätselraten',
    text: 'Sie geben schnell zu erkennen: dafür, dagegen oder Enthalten. So wird Ihre Meinung sichtbar – ohne lange Formulare.',
  },
  {
    title: 'Wahlen übersichtlich',
    text: 'Listen, Kandidaten und Stimmzettel sind so aufgebaut, dass Sie sich orientieren können – passend zu Ihrer Ebene und Region.',
  },
  {
    title: 'Clara erklärt, ohne zu wählen',
    text: 'Die KI-Assistentin beantwortet Fragen und fasst zusammen – neutral. Sie sagt Ihnen nicht, wen Sie wählen sollen.',
  },
  {
    title: 'Termine, die zu Ihnen passen',
    text: 'Kalender und Themen-Schwerpunkte helfen, das Wichtige zuerst zu sehen – nicht nur das lauteste Thema.',
  },
  {
    title: 'Punkte für Engagement',
    text: 'Wer mitmacht, sammelt Punkte. Prämien sind eine kleine Dankeschön-Idee – freiwillig und nachvollziehbar.',
  },
];

export function TopHighlightsSlide({ onClose, embedded = false }: TopHighlightsSlideProps) {
  useEffect(() => {
    if (embedded) return;
    // Prevent background scroll while overlay is open (mobile Safari friendly).
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [embedded]);

  const card = (
    <div
      className={
        embedded
          ? 'flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white'
          : 'flex h-full min-h-0 w-full flex-1 flex-col'
      }
      onClick={embedded ? undefined : (e) => e.stopPropagation()}
    >
        <div
          className={`flex flex-shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-5 ${
            embedded ? 'pb-1.5 pt-2.5' : 'pb-3 pt-5'
          }`}
        >
          <h2
            id="highlights-title"
            className={`min-w-0 flex-1 font-bold leading-tight text-gray-900 ${
              embedded ? 'text-base' : 'text-xl'
            }`}
          >
            eID Demo Connect – was Sie hier testen
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div
          className={
            embedded
              ? 'flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-1.5'
              : 'min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4'
          }
        >
          {embedded ? (
            /*
              PhoneStage: äußere Column ist hoch. Ohne diesen Aufbau wächst die Mitte per flex-1,
              der Inhalt bleibt oben → großer Leerraum vor „Weiter“. Spacer oben, Inhalt + Footer dicht unten.
            */
            <>
              <div className="min-h-0 flex-1" aria-hidden />
              <div className="max-h-[min(52dvh,420px)] shrink-0 overflow-y-auto overscroll-contain">
                <p className="text-center text-[11px] leading-tight text-gray-700">
                  Abstimmungsvorschau mit vollständiger Tinder-Karte.
                </p>
                <div className="py-1">
                  <IntroSwipePreview />
                </div>
                <p className="text-center text-[10px] leading-snug text-gray-500">
                  Nach „Weiter“: Wahlen, Clara, Kalender in der App.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-gray-800">
                In dieser <strong>Demonstrationsumgebung</strong> können Sie die Oberfläche und typische Abläufe
                kennenlernen – <strong>verständlich</strong> und ohne Fachjargon. Das sind die wichtigsten Punkte:
              </p>

              <ul className="m-0 list-none space-y-4 p-0">
                {USP_BLOCKS.map((h, i) => (
                  <li key={i} className="border-l-[3px] border-blue-700 pl-3">
                    <p className="text-sm font-semibold text-gray-900">{h.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-700">{h.text}</p>
                  </li>
                ))}
              </ul>

              <p className="pt-1 text-xs text-gray-500">Demonstrationsumgebung</p>
            </>
          )}
        </div>

        <div
          className={`flex-shrink-0 border-t border-gray-100 px-5 ${embedded ? 'py-2' : 'py-4'}`}
          style={{ paddingBottom: embedded ? 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' : 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--gov-btn, #0066cc)' }}
          >
            Weiter
          </button>
        </div>
      </div>
  );

  if (embedded) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="highlights-title"
      >
        {card}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-stretch justify-center bg-slate-900/80 sm:items-center sm:p-4"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0)',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        paddingLeft: 'env(safe-area-inset-left, 0)',
        paddingRight: 'env(safe-area-inset-right, 0)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="highlights-title"
    >
      <div
        className="flex h-full min-h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-white shadow-2xl sm:my-auto sm:min-h-0 sm:max-h-[min(100dvh-2rem,852px)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {card}
      </div>
    </div>
  );
}
