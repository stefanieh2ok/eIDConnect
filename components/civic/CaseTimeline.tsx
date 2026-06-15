'use client';

import React from 'react';

type Props = {
  steps: string[];
};

export function CaseTimeline({ steps }: Props) {
  return (
    <ol className="relative space-y-0 border-l-2 border-sky-200/80 pl-4">
      {steps.map((step, i) => (
        <li key={step} className="relative pb-3 last:pb-0">
          <span
            className="absolute -left-[calc(0.5rem+5px)] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#003366] text-[9px] font-bold text-white"
            aria-hidden
          >
            {i + 1}
          </span>
          <p className="text-[11px] font-medium leading-snug text-[#1A2B45]">{step}</p>
        </li>
      ))}
    </ol>
  );
}
