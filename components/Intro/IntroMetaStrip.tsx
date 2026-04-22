'use client';

import React from 'react';
import {
  INTRO_GLOBAL_FRAMING,
  INTRO_GLOBAL_PILL_LABEL,
  INTRO_SKIP_LABEL,
  INTRO_TOTAL_STEPS,
} from '@/data/introOverlayMarketing';
import { IntroReadAloudToggle } from '@/components/Intro/IntroOverlay';

type Props = {
  /**
   * Aktuelle Schritt-Nummer (1–INTRO_TOTAL_STEPS). `null`, wenn der Meta-
   * Streifen zu einem Branch-Point / Zwischenschritt gehört (z. B. Opt-in-
   * Gate). In dem Fall wird `stepLabel` gezeigt statt „Schritt X von 8".
   */
  stepNumber: number | null;
  /** Alternativ-Label, wenn kein stepNumber gesetzt ist (z. B. „Auswahl"). */
  stepLabel?: string;
  /** „Einführung überspringen"-Link rechts oben (nur anzeigen, wenn Handler). */
  onSkip?: () => void;
  /** × -Schließknopf rechts oben (nur anzeigen, wenn Handler). */
  onClose?: () => void;
  /**
   * Optionaler „META · …"-Satz: Screen-spezifische Framing-Zeile (z. B.
   * „So funktioniert später der Einstieg per eID — hier nur als Beispiel,
   * ohne echte Datenübertragung."). Wird als letzte Zeile des Meta-Streifens
   * gerendert, damit der Tester sofort weiss, was auf dem Screen gezeigt wird.
   */
  metaFramingLine?: string;
};

/**
 * Heller Meta-Streifen oberhalb aller Intro-Screens (Schritt 1 … 8 + Opt-in).
 * Der Streifen selbst ist hell/weiss, darunter folgt der dunkle Intro-Body.
 * Der Kontrast signalisiert: die Meta-Informationen (Pill, Schritt-Zaehler,
 * Framing-Text) sind vom eigentlichen Intro-Content strikt getrennt.
 */
export default function IntroMetaStrip({
  stepNumber,
  stepLabel,
  onSkip,
  onClose,
  metaFramingLine,
}: Props) {
  const stepText =
    stepNumber != null
      ? `SCHRITT ${stepNumber} VON ${INTRO_TOTAL_STEPS}`
      : (stepLabel ?? '');

  return (
    <div className="intro-meta-strip flex-shrink-0">
      {/* Zeile 1: Pill + inline-Framing-Satz links, Skip/Schliessen rechts.
          Der Framing-Satz steht bewusst in normaler Satzschreibweise (nicht in
          ALL CAPS), damit er lesbar bleibt und nicht optisch "schreit". */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span
            className="inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.14em] text-white"
            style={{ background: 'var(--gov-primary, #003366)' }}
          >
            {INTRO_GLOBAL_PILL_LABEL}
          </span>
          <p className="min-w-0 flex-1 text-[11px] leading-snug text-[#0F172A]">
            {INTRO_GLOBAL_FRAMING}
          </p>
        </div>
        {(onSkip || onClose) ? (
          <div className="flex flex-shrink-0 items-center gap-2">
            {onSkip ? (
              <button
                type="button"
                onClick={onSkip}
                className="text-[10px] font-semibold text-[#1E293B]/70 underline-offset-2 hover:text-[#0F172A] hover:underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#003366]"
              >
                {INTRO_SKIP_LABEL}
              </button>
            ) : null}
            {onClose ? (
              <button
                type="button"
                aria-label="Einführung schließen"
                onClick={onClose}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[#0F172A]/15 bg-white text-xs leading-none text-[#0F172A] hover:bg-[#0F172A]/5"
              >
                ×
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Zeile 2: Schritt-Zaehler + Progress-Dots. */}
      <div className="mt-1.5 flex items-center justify-between gap-3">
        {stepText ? (
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] tabular-nums text-[#1E293B]/80">
            {stepText}
          </span>
        ) : (
          <span aria-hidden className="text-[10px]">
            &nbsp;
          </span>
        )}
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: INTRO_TOTAL_STEPS }, (_, i) => {
            const active = stepNumber != null && i === stepNumber - 1;
            const done = stepNumber != null && i < stepNumber - 1;
            return (
              <span
                key={i}
                className={`h-1 rounded-full transition-[width,opacity] duration-200 ${
                  active
                    ? 'w-5 bg-[#003366]'
                    : done
                      ? 'w-2 bg-[#003366]/55'
                      : 'w-2 bg-[#0F172A]/20'
                }`}
              />
            );
          })}
        </div>
      </div>

      <IntroReadAloudToggle />

      {/* Zeile 3 (optional): „META · …"-Satz fuer die Screen-spezifische
          Framing-Zeile. Gleicher Font wie die Zeilen darueber, damit kein
          typografischer Bruch entsteht. */}
      {metaFramingLine ? (
        <p className="mt-1.5 text-[11px] leading-snug text-[#1E293B]/85">
          <span className="font-bold uppercase tracking-[0.12em] text-[#003366]">
            META ·{' '}
          </span>
          {metaFramingLine}
        </p>
      ) : null}
    </div>
  );
}
