'use client';

import React, { useState } from 'react';
import type { DocumentReadinessItem } from '@/lib/govdata/serviceTypes';

type Props = {
  likely: DocumentReadinessItem[];
  optional: DocumentReadinessItem[];
  du?: boolean;
};

export function WegweiserCompactDocumentChecklist({ likely, optional, du = true }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (likely.length === 0 && optional.length === 0) {
    return (
      <p className="wegweiser-doc-checklist__empty">
        {du
          ? 'Noch keine konkreten Unterlagen erkannt.'
          : 'Noch keine konkreten Unterlagen erkannt.'}
      </p>
    );
  }

  const renderGroup = (title: string, items: DocumentReadinessItem[]) => {
    if (items.length === 0) return null;
    return (
      <div className="wegweiser-doc-checklist__group">
        <p className="wegweiser-doc-checklist__group-title">{title}</p>
        <ul className="wegweiser-doc-checklist__list">
          {items.map((item) => (
            <li key={item.id} className="wegweiser-doc-checklist__item">
              <input
                type="checkbox"
                id={item.id}
                checked={checked[item.id] ?? false}
                onChange={(e) => setChecked((p) => ({ ...p, [item.id]: e.target.checked }))}
                className="wegweiser-doc-checklist__checkbox"
              />
              <label htmlFor={item.id} className="wegweiser-doc-checklist__label">
                {item.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="wegweiser-doc-checklist" data-testid="wegweiser-doc-checklist">
      {renderGroup(du ? 'Wahrscheinlich nötig' : 'Wahrscheinlich nötig', likely)}
      {renderGroup(du ? 'Optional / falls relevant' : 'Optional / falls relevant', optional)}
    </div>
  );
}
