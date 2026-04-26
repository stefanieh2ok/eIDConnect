'use client';

import React, { useId, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type Props = {
  /** z. B. thematische Überschrift ohne Schritt-Nummer */
  label: string;
  short: string;
  long: string;
  defaultExpanded?: boolean;
  /** Wenn false: kein zweites Thema unter „Clara“ (Überschrift steht z. B. schon im Screen-Header). */
  showTopicTitle?: boolean;
  /** `light`: Panel auf weißem Intro-Hintergrund (Kontrast wie App-Inhalt). */
  surface?: 'dark' | 'light';
  /** Bei geschlossenem Zustand keine Textvorschau anzeigen (nur Überschrift + Toggle). */
  hideShortWhenCollapsed?: boolean;
  /** Blendet Toggle-Text aus und zeigt nur den Pfeil. */
  iconOnlyToggle?: boolean;
};

/**
 * Standard: knapper Clara-Text; optional ausklappbar mit sanfter Grid-Animation.
 */
export function ClaraStepPanel({
  label,
  short,
  long,
  defaultExpanded = false,
  showTopicTitle = true,
  surface = 'dark',
  hideShortWhenCollapsed = false,
  iconOnlyToggle = false,
}: Props) {
  const [open, setOpen] = useState(defaultExpanded);
  const id = useId();
  const fullId = `${id}-clara-long`;
  const onLight = surface === 'light';

  return (
    <div
      className={
        'shrink-0 space-y-1.5 rounded-xl border p-2.5 sm:p-3 ' +
        (onLight
          ? 'border-slate-200/90 bg-[#F0F6FF]'
          : 'border-white/10 bg-white/[0.04]')
      }
    >
      <p
        className={
          'text-[9px] font-extrabold uppercase tracking-wider ' +
          (onLight ? 'text-[#0055A4]' : 'text-sky-200/70')
        }
      >
        Clara
      </p>
      {showTopicTitle ? (
        <h3
          className={
            'text-[13px] font-bold leading-snug ' + (onLight ? 'text-[#1A2B45]' : 'text-white')
          }
        >
          {label}
        </h3>
      ) : null}
      {(!hideShortWhenCollapsed || open) && (
        <p
          className={
            'whitespace-pre-line text-[11px] leading-relaxed [text-wrap:pretty] ' +
            (onLight ? 'text-neutral-800' : 'text-white/[0.92]')
          }
        >
          {short}
        </p>
      )}
      {long && long !== short ? (
        <div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={
              'inline-flex w-full items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[10.5px] font-medium transition ' +
              (onLight
                ? 'border-slate-200 bg-white text-[#003366] hover:bg-slate-50'
                : 'border-white/15 bg-white/[0.05] text-sky-100/90 hover:bg-white/10')
            }
            aria-expanded={open}
            aria-controls={fullId}
            aria-label={open ? 'Details einklappen' : 'Details ausklappen'}
          >
            {open ? (
              <>
                {!iconOnlyToggle ? 'Weniger anzeigen' : null}
                <ChevronUp className="h-3.5 w-3.5" aria-hidden />
              </>
            ) : (
              <>
                {!iconOnlyToggle ? 'Mehr anzeigen' : null}
                <ChevronDown className="h-3.5 w-3.5" aria-hidden />
              </>
            )}
          </button>
          <div
            id={fullId}
            className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
              open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <p
                className={
                  (open ? 'pt-1.5' : 'pt-0') +
                  ' text-[11px] leading-relaxed [text-wrap:pretty] ' +
                  (onLight ? 'text-neutral-700' : 'text-white/[0.8]')
                }
              >
                {long}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
