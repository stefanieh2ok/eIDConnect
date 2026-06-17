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
      <p className="civic-case-plan__missing-source-note">
        {du
          ? 'Noch keine konkreten Unterlagen erkannt — nach Stellenauswahl ergänzen.'
          : 'Noch keine konkreten Unterlagen erkannt — nach Stellenauswahl ergänzen.'}
      </p>
    );
  }

  return (
    <ul className="civic-doc-checklist">
      {items.map((item) => (
        <li key={item.id} className="civic-doc-checklist__item">
          <input
            type="checkbox"
            id={item.id}
            checked={checked[item.id] ?? false}
            onChange={(e) => setChecked((p) => ({ ...p, [item.id]: e.target.checked }))}
            className="civic-doc-checklist__checkbox"
          />
          <label htmlFor={item.id} className="civic-doc-checklist__label">
            <span className="civic-doc-checklist__title">{item.label}</span>
            <span className="civic-doc-checklist__meta">{READINESS_LABEL[item.readiness]}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
