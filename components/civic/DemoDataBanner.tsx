'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { CLARA_DEMO_VISIBILITY_BANNER } from '@/lib/claraCaseGuidance';

type Props = {
  className?: string;
};

/** Visible demo/mock status — calm, readable, not alarmist. */
export function DemoDataBanner({ className = '' }: Props) {
  return (
    <div
      role="status"
      className={
        'flex items-start gap-2 rounded-lg border border-amber-200/90 bg-amber-50/90 px-3 py-2 ' +
        className
      }
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-hidden />
      <p className="text-[11px] font-semibold leading-snug text-amber-950">{CLARA_DEMO_VISIBILITY_BANNER}</p>
    </div>
  );
}
