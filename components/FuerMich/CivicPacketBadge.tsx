'use client';

import React from 'react';
import { statusPillClass, type CivicStatusTone } from '@/lib/civicStatus';
import { CIVIC_DEMO_NOTICE } from '@/lib/civicCompliance';
import type { CivicPacketSummary } from '@/lib/civicPacketSummary';

type Props = {
  summary: CivicPacketSummary;
  className?: string;
};

function BadgePill({ label, tone = 'neutral' }: { label: string; tone?: CivicStatusTone }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[9px] font-semibold ${statusPillClass(tone)}`}>
      {label}
    </span>
  );
}

/** Kompakte Behördenpaket-Badges für Ergebnislisten (nur gemappte Services). */
export default function CivicPacketBadge({ summary, className = '' }: Props) {
  return (
    <div
      className={`civic-packet-badge mt-2 rounded-lg border border-[#C5D9F0] bg-[#F8FBFF] px-2.5 py-2 ${className}`}
      aria-label="Behördenpaket-Zusammenfassung"
    >
      <p className="text-[9px] font-semibold uppercase tracking-wide text-[#6B7A99]">Behördenpaket</p>
      <div className="mt-1 flex flex-wrap gap-1">
        <BadgePill label={`Zuständig: ${summary.authorityName}`} />
        <BadgePill label={`Ort: ${summary.location}`} />
        <BadgePill label={`${summary.documentCount} Unterlagen`} />
        <BadgePill label={`${summary.filledCount} vorausgefüllt`} tone="mint" />
        <BadgePill label={`${summary.missingCount} offen`} tone="amber" />
        {summary.sourceVerified ? <BadgePill label="Quelle geprüft" tone="mint" /> : null}
        <BadgePill label={CIVIC_DEMO_NOTICE} tone="amber" />
      </div>
    </div>
  );
}
