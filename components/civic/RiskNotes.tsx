'use client';

import React from 'react';
import { Info } from 'lucide-react';
import type { CasePlanRisk } from '@/lib/govdata/serviceTypes';

type Props = {
  risks: CasePlanRisk[];
  du?: boolean;
};

export function RiskNotes({ risks, du = true }: Props) {
  if (risks.length === 0) return null;
  return (
    <ul className="space-y-2">
      {risks.map((r) => (
        <li
          key={r.id}
          className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/70 px-2.5 py-2 text-[10.5px] leading-snug text-amber-950"
        >
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
          <span>{r.text}</span>
        </li>
      ))}
    </ul>
  );
}
