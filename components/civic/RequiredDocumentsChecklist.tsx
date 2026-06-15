'use client';

import React, { useState } from 'react';
import type { DocumentReadinessItem } from '@/lib/govdata/serviceTypes';

type Props = {
  items: DocumentReadinessItem[];
  du?: boolean;
};

const READINESS_LABEL = {
  likely: 'wahrscheinlich erforderlich',
  possible: 'eventuell erforderlich',
  regional: 'abhängig von Kommune/Bundesland',
} as const;

export function RequiredDocumentsChecklist({ items, du = true }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (items.length === 0) {
    return (
      <p className="text-[11px] text-slate-500">
        {du
          ? 'Noch keine konkreten Unterlagen erkannt — nach Stellenauswahl ergänzen.'
          : 'Noch keine konkreten Unterlagen erkannt — nach Stellenauswahl ergänzen.'}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2">
          <input
            type="checkbox"
            id={item.id}
            checked={checked[item.id] ?? false}
            onChange={(e) => setChecked((p) => ({ ...p, [item.id]: e.target.checked }))}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#003366]"
          />
          <label htmlFor={item.id} className="min-w-0 flex-1 cursor-pointer">
            <span className="block text-[11px] font-semibold text-[#1A2B45]">{item.label}</span>
            <span className="mt-0.5 block text-[9px] font-medium text-slate-500">
              {READINESS_LABEL[item.readiness]}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
