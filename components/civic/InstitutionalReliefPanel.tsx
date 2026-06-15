'use client';

import React from 'react';
import { Building, CheckCircle, MessageCircle, ChevronRight } from 'lucide-react';

type Props = {
  du?: boolean;
};

const METRICS = [
  { icon: MessageCircle, label: 'weniger Rückfragen', hint: 'kann reduzieren' },
  { icon: CheckCircle, label: 'weniger unvollständige Anträge', hint: 'unterstützt' },
  { icon: ChevronRight, label: 'bessere Weiterleitung in offizielle Systeme', hint: 'zielt darauf ab' },
  { icon: Building, label: 'niedrigere Beratungslast', hint: 'macht messbar' },
] as const;

export function InstitutionalReliefPanel({ du = true }: Props) {
  return (
    <section
      className="rounded-xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-white p-3"
      aria-labelledby="institutional-relief-heading"
    >
      <h3 id="institutional-relief-heading" className="text-[12px] font-bold text-[#003366]">
        {du ? 'Warum das Behörden entlastet' : 'Warum das Behörden entlastet'}
      </h3>
      <p className="mt-1 text-[10.5px] leading-relaxed text-[#5f6b7a]">
        {du
          ? 'Clara hilft Bürgern und Unternehmen vor dem offiziellen Antrag. Für Behörden bedeutet das: besser vorbereitete Fälle, weniger Rückfragen und weniger unvollständige Unterlagen.'
          : 'Clara hilft Bürgern und Unternehmen vor dem offiziellen Antrag. Für Behörden bedeutet das: besser vorbereitete Fälle, weniger Rückfragen und weniger unvollständige Unterlagen.'}
      </p>
      <ul className="mt-2.5 grid grid-cols-2 gap-2">
        {METRICS.map(({ icon: Icon, label, hint }) => (
          <li
            key={label}
            className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-white px-2 py-2"
          >
            <Icon className="h-3.5 w-3.5 text-[#0055A4]" aria-hidden />
            <span className="text-[10px] font-semibold leading-tight text-[#1A2B45]">{label}</span>
            <span className="text-[8.5px] font-medium text-slate-500">{hint}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
