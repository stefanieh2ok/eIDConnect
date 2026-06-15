'use client';

import React from 'react';

type WalkthroughCoachmarkProps = {
  text: string;
  position?: 'top' | 'bottom' | 'center';
  pulse?: boolean;
  className?: string;
};

/** Ein aktives Highlight/Coachmark pro Szene — ruhig, nicht alarmistisch. */
export function WalkthroughCoachmark({
  text,
  position = 'bottom',
  pulse = false,
  className = '',
}: WalkthroughCoachmarkProps) {
  const posClass =
    position === 'top'
      ? 'top-2'
      : position === 'center'
        ? 'top-1/2 -translate-y-1/2'
        : 'bottom-2';

  return (
    <div
      className={`pointer-events-none absolute left-1/2 z-[6] w-[calc(100%-1rem)] max-w-[18rem] -translate-x-1/2 ${posClass} ${className}`.trim()}
      role="note"
      aria-live="polite"
    >
      <div
        className={
          'wt-coachmark rounded-xl border border-sky-200/90 bg-white/95 px-3 py-2 text-center text-[10px] font-semibold leading-snug text-[#003366] shadow-[0_8px_24px_rgba(0,51,102,0.12)] backdrop-blur-sm ' +
          (pulse ? 'wt-coachmark--pulse' : '')
        }
      >
        {text}
      </div>
    </div>
  );
}
