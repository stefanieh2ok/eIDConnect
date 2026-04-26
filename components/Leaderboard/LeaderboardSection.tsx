'use client';

import React, { useMemo } from 'react';
import { CheckCircle, Clock, Info, ListChecks } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionLevelFilterIcon, selectionLabelForSection } from '@/components/Filter/SectionLevelFilterIcon';

type StatusRow = {
  label: string;
  value: number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
};

const LeaderboardSection: React.FC = () => {
  const { state } = useApp();
  const du = state.anrede === 'du';

  const submitted = Math.max(0, state.participationVoteCount + state.participationElectionCount);
  const inReview = submitted > 0 ? Math.max(1, Math.floor(submitted * 0.35)) : 0;
  const confirmed = submitted > 0 ? Math.max(0, submitted - inReview) : 0;
  const completed = state.participationElectionCount;

  const rows = useMemo<StatusRow[]>(
    () => [
      {
        label: 'Eingereicht',
        value: submitted,
        hint: du ? 'Von dir ausgelöste Demo-Vorgänge' : 'Von Ihnen ausgelöste Demo-Vorgänge',
        icon: ListChecks,
      },
      {
        label: 'In Prüfung',
        value: inReview,
        hint: 'Demo-Status: fachliche Sichtung ausstehend',
        icon: Clock,
      },
      {
        label: 'Bestätigt',
        value: confirmed,
        hint: 'Eingang dokumentiert',
        icon: CheckCircle,
      },
      {
        label: 'Abgeschlossen',
        value: completed,
        hint: 'Vorgang in der Demo abgeschlossen',
        icon: CheckCircle,
      },
    ],
    [completed, confirmed, du, inReview, submitted],
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Beteiligungsstatus</h2>
          <div className="mt-0.5 text-[11px] text-neutral-500">
            {selectionLabelForSection('leaderboard', state.activeLocation, state.residenceLocation)}
          </div>
        </div>
        <SectionLevelFilterIcon section="leaderboard" />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white/75 p-4 shadow-sm backdrop-blur">
        <div className="flex items-start gap-2 text-[11px] text-neutral-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0055A4]" aria-hidden />
          <p>
            Dieser Bereich zeigt, welche Beiträge, Meldungen oder Beteiligungen bereits eingereicht wurden und welchen
            Status sie haben.
          </p>
        </div>
        <p className="mt-2 text-[11px] text-neutral-600">
          Fokus: Transparenz und Nachvollziehbarkeit — ohne Wettbewerb, ohne Rangplätze.
        </p>
      </div>

      <div className="space-y-2.5">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="flex items-start gap-2.5 rounded-xl border border-neutral-200 bg-[#F7F9FC] px-3 py-2"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#0055A4]" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-neutral-900">{row.label}</p>
                  <span className="rounded-full border border-neutral-300 bg-white px-2 py-0.5 text-[11px] font-bold text-neutral-900">
                    {row.value.toLocaleString('de-DE')}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-neutral-600">{row.hint}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed border-[#BFD9FF] bg-[#F0F6FF] px-3 py-2 text-[10px] text-[#003366]">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <p>Demo-Hinweis · Statusansicht zur Nachvollziehbarkeit, keine rechtlich wirksame Bearbeitung.</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardSection;
