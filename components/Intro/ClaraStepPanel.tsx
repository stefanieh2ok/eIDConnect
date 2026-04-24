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
}: Props) {
  const [open, setOpen] = useState(defaultExpanded);
  const id = useId();
  const fullId = `${id}-clara-long`;

  return (
    <div className="shrink-0 space-y-1.5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 sm:p-3">
      <p className="text-[9px] font-extrabold uppercase tracking-wider text-sky-200/70">Clara</p>
      {showTopicTitle ? (
        <h3 className="text-[13px] font-bold leading-snug text-white">{label}</h3>
      ) : null}
      <p className="text-[11px] leading-relaxed text-white/[0.92] [text-wrap:pretty]">{short}</p>
      {long && long !== short ? (
        <div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.05] py-1.5 text-[10.5px] font-medium text-sky-100/90 transition hover:bg-white/10"
            aria-expanded={open}
            aria-controls={fullId}
          >
            {open ? (
              <>
                Weniger anzeigen
                <ChevronUp className="h-3.5 w-3.5" aria-hidden />
              </>
            ) : (
              <>
                Mehr anzeigen
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
                  ' text-[11px] leading-relaxed text-white/[0.8] [text-wrap:pretty]'
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
