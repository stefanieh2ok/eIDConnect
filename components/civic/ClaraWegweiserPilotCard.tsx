'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

type Props = {
  du?: boolean;
};

export function ClaraWegweiserPilotCard({ du = true }: Props) {
  const { dispatch } = useApp();

  return (
    <section
      className="clara-wegweiser-pilot-card"
      aria-labelledby="clara-wegweiser-pilot-heading"
      data-testid="clara-wegweiser-pilot-card"
    >
      <div className="clara-wegweiser-pilot-card__header">
        <span className="clara-wegweiser-pilot-card__badge">Pilotmodul</span>
        <p className="clara-wegweiser-pilot-card__label">Clara Wegweiser</p>
      </div>
      <h2 id="clara-wegweiser-pilot-heading" className="clara-wegweiser-pilot-card__title">
        {du
          ? 'Clara hilft, aus einer Lebenslage einen vorbereitenden Behördenfahrplan zu erstellen.'
          : 'Clara hilft, aus einer Lebenslage einen vorbereitenden Behördenfahrplan zu erstellen.'}
      </h2>
      <p className="clara-wegweiser-pilot-card__micro">
        {du
          ? 'Optionales Assistenzmodul. Antragstellung erfolgt weiterhin über die zuständige offizielle Stelle.'
          : 'Optionales Assistenzmodul. Antragstellung erfolgt weiterhin über die zuständige offizielle Stelle.'}
      </p>
      <button
        type="button"
        className="clara-wegweiser-pilot-card__cta"
        onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', payload: 'fuermich' })}
      >
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
        Behördenweg vorbereiten
      </button>
    </section>
  );
}

export default ClaraWegweiserPilotCard;
