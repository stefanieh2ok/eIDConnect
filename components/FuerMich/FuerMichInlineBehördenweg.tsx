'use client';

import React from 'react';
import type { ResolverResult } from '@/lib/kirkelServiceResolver';

type FuerMichInlineBehördenwegProps = {
  du: boolean;
  resolved: ResolverResult;
  onShowFullResults: () => void;
  onClearSelection: () => void;
};

const STEPS = ['Thema prüfen', 'Unterlagen vorbereiten', 'Terminweg klären', 'Übergabe prüfen'] as const;

export default function FuerMichInlineBehördenweg({
  du,
  resolved,
  onShowFullResults,
  onClearSelection,
}: FuerMichInlineBehördenwegProps) {
  const { matchedServices, evidenceChips, offices } = resolved;
  const pathTitle = du ? 'Dein Behördenweg' : 'Ihr Behördenweg';
  const metaLine = `${matchedServices.length} Themen · ${evidenceChips.length} Unterlagen · ${offices.length} zuständige Stellen`;

  return (
    <div className="fuer-mich-inline-weg" role="region" aria-label={pathTitle}>
      <h4 className="text-[13px] font-bold text-[#003366]">{pathTitle}</h4>
      <ol className="behoerdenweg-stepper mt-1.5" aria-label={du ? 'Schritte im Behördenweg' : 'Schritte im Behördenweg'}>
        {STEPS.map((label, idx) => (
          <li key={label} className="behoerdenweg-stepper__step">
            <span className="behoerdenweg-stepper__marker" aria-hidden>
              {idx + 1}
            </span>
            <span className="behoerdenweg-stepper__label">{label}</span>
          </li>
        ))}
      </ol>
      <p className="mt-1.5 text-[10px] font-semibold text-[#003366]">{metaLine}</p>
      <div className="fuer-mich-inline-weg__actions">
        <button type="button" onClick={onShowFullResults} className="fuer-mich-inline-weg__primary">
          Behördenweg öffnen
        </button>
        <button type="button" onClick={onClearSelection} className="fuer-mich-inline-weg__secondary">
          Andere Situation wählen
        </button>
      </div>
    </div>
  );
}
