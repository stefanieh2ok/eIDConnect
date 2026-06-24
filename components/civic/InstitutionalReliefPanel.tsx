'use client';

import React from 'react';
import { CheckCircle, ListChecks, MessageCircle } from 'lucide-react';

type Props = {
  du?: boolean;
};

const BENEFITS = [
  {
    icon: MessageCircle,
    title: 'Nichts vergessen',
    hint: 'Schritte, Unterlagen und Fristen im Blick.',
  },
  {
    icon: ListChecks,
    title: 'Richtig starten',
    hint: 'Passende offizielle Einstiege statt Such-Chaos.',
  },
  {
    icon: CheckCircle,
    title: 'Besser vorbereitet',
    hint: 'Weniger Rückfragen, klarere Übergabe.',
  },
] as const;

export function InstitutionalReliefPanel({ du = true }: Props) {
  return (
    <section className="institutional-relief" aria-labelledby="institutional-relief-heading">
      <h3 id="institutional-relief-heading" className="institutional-relief__title">
        Was du davon hast
      </h3>
      <p className="institutional-relief__copy">
        {du
          ? 'Clara sortiert deine Situation, Unterlagen und offizielle Einstiege — ohne Antragstellung durch Clara.'
          : 'Clara sortiert Ihre Situation, Unterlagen und offizielle Einstiege — ohne Antragstellung durch Clara.'}
      </p>
      <ul className="institutional-relief__grid">
        {BENEFITS.map(({ icon: Icon, title, hint }) => (
          <li key={title} className="institutional-relief__card">
            <Icon className="institutional-relief__icon" aria-hidden />
            <span className="institutional-relief__card-title">{title}</span>
            <span className="institutional-relief__card-hint">{hint}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
