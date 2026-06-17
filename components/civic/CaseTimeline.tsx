'use client';

import React from 'react';

type Props = {
  steps: string[];
};

export function CaseTimeline({ steps }: Props) {
  return (
    <ol className="civic-step-cards" aria-label="Nächste Schritte">
      {steps.map((step, i) => (
        <li key={`${i}-${step}`} className="civic-step-cards__item">
          <span className="civic-step-cards__number" aria-hidden>
            {i + 1}
          </span>
          <div className="civic-step-cards__body">
            <p className="civic-step-cards__title">{step}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
