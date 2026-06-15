'use client';

import React from 'react';
import { Building } from 'lucide-react';

type Props = {
  authorities: string[];
  du?: boolean;
};

export function AuthoritiesOverview({ authorities, du = true }: Props) {
  if (authorities.length === 0) return null;

  return (
    <section className="civic-authorities" aria-labelledby="civic-authorities-heading">
      <div className="civic-case-plan__section-head">
        <h3 id="civic-authorities-heading" className="civic-case-plan__section-title">
          Beteiligte Stellen im Überblick
        </h3>
        <p className="civic-case-plan__section-lead">
          {du
            ? 'Clara ordnet mögliche Zuständigkeiten — die Reihenfolge kann je nach Region variieren.'
            : 'Clara ordnet mögliche Zuständigkeiten — die Reihenfolge kann je nach Region variieren.'}
        </p>
      </div>
      <ul className="civic-authorities__grid">
        {authorities.map((authority) => (
          <li key={authority}>
            <div className="civic-authorities__pill">
              <Building className="h-3.5 w-3.5 shrink-0 text-[#0055A4]" aria-hidden />
              <span>{authority}</span>
            </div>
          </li>
        ))}
      </ul>
      {authorities.length > 1 ? (
        <p className="civic-authorities__orchestration-note" role="note">
          Cross-Agency: Mehrere Stellen können nacheinander relevant sein — Clara schlägt eine sinnvolle
          Reihenfolge im Behördenfahrplan vor.
        </p>
      ) : null}
    </section>
  );
}
