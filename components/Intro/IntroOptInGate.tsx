'use client';

import React, { useEffect, useRef } from 'react';
import {
  INTRO_CLARA_WELCOME_LINES_DU,
  INTRO_CLARA_WELCOME_LINES_SIE,
  introClaraWelcomePlain,
  INTRO_OPT_IN_HINT_DU,
  INTRO_OPT_IN_HINT_SIE,
  INTRO_OPT_IN_LEAD_DU,
  INTRO_OPT_IN_LEAD_SIE,
  INTRO_OPT_IN_SKIP_LABEL_DU,
  INTRO_OPT_IN_SKIP_LABEL_SIE,
  INTRO_OPT_IN_START_LABEL,
  INTRO_OPT_IN_START_SUBLABEL,
  INTRO_OPT_IN_TITLE_DU,
  INTRO_OPT_IN_TITLE_SIE,
  INTRO_OPT_IN_TOPICS,
} from '@/data/introOverlayMarketing';
import IntroMetaStrip from '@/components/Intro/IntroMetaStrip';
import { useOptionalIntroOverlay } from '@/components/Intro/IntroOverlay';

type Props = {
  du: boolean;
  /** Nutzer möchte den Walkthrough (Schritte 3–8) sehen. */
  onStart: () => void;
  /** Nutzer springt direkt in die App und verwirft die Einführung. */
  onSkip: () => void;
};

/**
 * Opt-in-Gate zwischen Login (Schritt 2) und Walkthrough (Schritte 3–8).
 *
 * Ziel: Der Tester entscheidet selbst, ob er den Walkthrough durchläuft oder
 * direkt in die App springt. Damit wird der State „Einführung vs. echte
 * Nutzung" nicht implizit aus Pill-Labels erschlossen, sondern explizit
 * kommuniziert.
 *
 * Design: identische Card-Struktur wie AnredeGate (heller Dialog, dunkler
 * Meta-Streifen oben mit Pill). Keine Zähler (dies ist kein eigener Schritt,
 * sondern ein Wechsel-Point).
 */
export default function IntroOptInGate({ du, onStart, onSkip }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Fokus beim Öffnen auf den primären Button legen.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const el = dialogRef.current?.querySelector<HTMLButtonElement>('button[data-primary="true"]');
      el?.focus({ preventScroll: true });
    }, 40);
    return () => window.clearTimeout(t);
  }, []);

  const title = du ? INTRO_OPT_IN_TITLE_DU : INTRO_OPT_IN_TITLE_SIE;
  const lead = du ? INTRO_OPT_IN_LEAD_DU : INTRO_OPT_IN_LEAD_SIE;
  const skipLabel = du ? INTRO_OPT_IN_SKIP_LABEL_DU : INTRO_OPT_IN_SKIP_LABEL_SIE;
  const hint = du ? INTRO_OPT_IN_HINT_DU : INTRO_OPT_IN_HINT_SIE;

  const intro = useOptionalIntroOverlay();
  useEffect(() => {
    if (!intro) return;
    if (!intro.readAloud) {
      intro.stopIntroSpeech();
      return;
    }
    intro.speakIntro(`${introClaraWelcomePlain(du)} ${title} ${lead} ${hint}`);
    return () => intro.stopIntroSpeech();
  }, [intro, intro?.readAloud, title, lead, hint]);

  return (
    <div
      className="absolute inset-0 z-[600] flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background: 'rgba(8, 16, 34, 0.62)',
          backdropFilter: 'blur(8px) saturate(140%)',
          WebkitBackdropFilter: 'blur(8px) saturate(140%)',
        }}
      />

      <div
        ref={dialogRef}
        className="intro-dark-body relative w-full max-w-[360px] overflow-y-auto overscroll-contain rounded-3xl sm:max-w-[400px] anredegate-sheet"
        style={{
          maxHeight: 'calc(100dvh - 1.5rem)',
          boxShadow:
            '0 28px 80px rgba(0, 20, 60, 0.45), 0 6px 18px rgba(0, 20, 60, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.06) inset',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Einheitlicher Dark-Meta-Streifen — kein Schritt-Zähler, da Opt-in-
            Gate zwischen Schritt 2 und 3 liegt. Skip/× nutzen die Gate-eigenen
            Handler („Direkt zur App" = Skip/× verwerfen den Walkthrough). */}
        <IntroMetaStrip
          stepNumber={null}
          stepLabel="Auswahl"
          onSkip={onSkip}
          onClose={onSkip}
        />

        <div className="px-5 pt-4 pb-3 sm:px-6">
          <div
            className="mb-4 rounded-2xl border border-violet-400/30 bg-gradient-to-b from-violet-950/50 to-slate-900/40 px-3.5 py-3 sm:px-4"
            aria-label="Clara: Begrüßung"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-200/90">Clara</p>
            <div className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-white/90 sm:text-[12.5px]">
              {(du ? INTRO_CLARA_WELCOME_LINES_DU : INTRO_CLARA_WELCOME_LINES_SIE).map((line) => (
                <p key={line} className="[text-wrap:pretty]">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <h2 className="text-base font-black leading-snug text-white sm:text-lg">{title}</h2>
          <p className="mt-1.5 text-[12px] leading-snug text-white/75 sm:text-[12.5px]">{lead}</p>

          <ul
            className="mt-3 flex flex-wrap gap-1.5"
            aria-label={du ? 'Themen, die die Einführung zeigt' : 'Themen, die die Einführung zeigt'}
          >
            {INTRO_OPT_IN_TOPICS.map((topic) => (
              <li
                key={topic}
                className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2 py-[3px] text-[10.5px] font-medium text-white/85"
              >
                {topic}
              </li>
            ))}
          </ul>
        </div>

        <div className="px-5 pb-5 pt-1 sm:px-6">
          <button
            type="button"
            data-primary="true"
            onClick={onStart}
            className="btn-gov-primary w-full"
          >
            <span className="flex flex-col items-center leading-tight">
              <span>{INTRO_OPT_IN_START_LABEL}</span>
              <span className="mt-0.5 text-[10.5px] font-medium tracking-normal text-white/85">
                {INTRO_OPT_IN_START_SUBLABEL}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            {skipLabel}
          </button>

          <p className="mt-3 text-center text-[10.5px] leading-snug text-white/55">{hint}</p>
        </div>
      </div>
    </div>
  );
}
