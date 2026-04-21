'use client';

import React from 'react';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import {
  INTRO_GLOBAL_FRAMING,
  INTRO_GLOBAL_PILL_LABEL,
  INTRO_SKIP_LABEL,
  INTRO_TOTAL_STEPS,
} from '@/data/introOverlayMarketing';

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
   * „Beispielansicht der eID — ohne echte Datenübertragung."). Wird klein und
   * dezent unter den Progress-Dots gerendert, damit sie die Meta-Ebene nicht
   * optisch zerschneidet.
   */
  metaFramingLine?: string;
};

/**
 * Einheitlicher dunkler Meta-Streifen über allen Intro-Screens (1 von 8 …
 * 8 von 8 + Opt-in-Gate). Strikt visuell identisch — nur Inhalte variieren
 * (Schritt-Label, optionales Framing, Skip/Schließen-Buttons).
 *
 * Nicht in .intro-meta-strip verschoben, weil dieses CSS-Utility nur den
 * dunklen Hintergrund + Padding beisteuert; die inhaltliche Struktur gehört
 * zur React-Ebene, damit Prop-Variationen sauber abgebildet werden.
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
      ? `Schritt ${stepNumber} von ${INTRO_TOTAL_STEPS}`
      : (stepLabel ?? '');

  return (
    <div className="intro-meta-strip flex-shrink-0">
      {/* Zeile 1: Pill links · Skip-Link + Schließen rechts. */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-white/15 px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.14em] text-white/95">
          {INTRO_GLOBAL_PILL_LABEL}
        </span>
        <div className="flex items-center gap-2.5">
          {onSkip ? (
            <button
              type="button"
              onClick={onSkip}
              className="text-[10px] font-semibold text-white/70 underline-offset-2 hover:text-white hover:underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/60"
            >
              {INTRO_SKIP_LABEL}
            </button>
          ) : null}
          {onClose ? (
            <button
              type="button"
              aria-label="Einführung schließen"
              onClick={onClose}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs leading-none text-white/90 hover:bg-white/15"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      {/* Zeile 2: globale Framing-Caps „BEISPIELANSICHTEN · DIE APP-NUTZUNG
          BEGINNT DANACH." — bewusst prominent, damit Tester auf jedem Screen
          sehen, dass hier eine Einführung läuft. */}
      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] leading-snug text-white/85">
        {INTRO_GLOBAL_FRAMING}
      </p>

      {/* Zeile 3: App-Name als dezenter Absender. Gleiche Typoklasse, nur
          leichter gedimmt — damit der Block nicht visuell zerfällt. */}
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] leading-snug text-white/55">
        {APP_DISPLAY_NAME}
      </p>

      {/* Zeile 4: Schritt X/8 links · Progress-Dots rechts. */}
      <div className="mt-1.5 flex items-center justify-between gap-3">
        {stepText ? (
          <span className="text-[10px] font-semibold tabular-nums text-white/70">
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
                  active ? 'w-5 bg-white' : done ? 'w-2 bg-white/55' : 'w-2 bg-white/25'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Zeile 5 (optional): kurze Screen-spezifische META-Zeile, damit Tester
          sofort wissen, was auf diesem Screen gezeigt wird. Dezent gehalten,
          gleicher Font wie oben, damit es keinen typografischen Bruch gibt. */}
      {metaFramingLine ? (
        <p className="mt-1.5 text-[10.5px] leading-snug text-white/65">
          <span className="font-semibold uppercase tracking-[0.1em] text-white/50">
            Meta ·{' '}
          </span>
          {metaFramingLine}
        </p>
      ) : null}
    </div>
  );
}
