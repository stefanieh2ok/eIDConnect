'use client';

import React from 'react';
import { CheckCircle, ListChecks, MessageCircle } from 'lucide-react';

type Props = {
  du?: boolean;
};

const BENEFITS = [
  {
    icon: MessageCircle,
    title: 'Weniger Rückfragen',
    hint: 'Klarere Ausgangslage vor dem Antrag',
  },
  {
    icon: ListChecks,
    title: 'Bessere Unterlagen',
    hint: 'Checkliste und Readiness vor der Stelle',
  },
  {
    icon: CheckCircle,
    title: 'Klarere Übergabe',
    hint: 'Externe offizielle Wege statt Einreichung durch Clara',
  },
] as const;

export function InstitutionalReliefPanel({ du = true }: Props) {
  return (
    <section className="institutional-relief" aria-labelledby="institutional-relief-heading">
      <h3 id="institutional-relief-heading" className="institutional-relief__title">
        Warum das Behörden entlastet
      </h3>
      <p className="institutional-relief__copy">
        {du
          ? 'Clara hilft Menschen, ihre Lage und Unterlagen vor dem offiziellen Antrag zu sortieren. Das kann Rückfragen reduzieren, Termine vorbereiten und unvollständige Anträge vermeiden.'
          : 'Clara hilft Menschen, ihre Lage und Unterlagen vor dem offiziellen Antrag zu sortieren. Das kann Rückfragen reduzieren, Termine vorbereiten und unvollständige Anträge vermeiden.'}
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
