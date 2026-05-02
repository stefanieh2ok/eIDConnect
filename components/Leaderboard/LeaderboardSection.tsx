'use client';

import React, { useMemo } from 'react';
import { CheckCircle, Clock, Info, ListChecks } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionLevelFilterIcon, selectionLabelForSection } from '@/components/Filter/SectionLevelFilterIcon';
import { DEMO_LOCATION_LABEL } from '@/lib/locationLabels';
import { regionalPraemienForCity } from '@/data/demoVoting2026';
import { getLocalBenefitState } from '@/lib/localBenefits';

type StatusRow = {
  label: string;
  value: number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
};

type LeaderboardSectionProps = {
  embeddedInWalkthrough?: boolean;
  onWalkthroughConsentActivate?: () => void;
};

const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({
  embeddedInWalkthrough = false,
  onWalkthroughConsentActivate,
}) => {
  const { state, dispatch } = useApp();
  const du = state.anrede === 'du';

  const submitted = Math.max(0, state.participationVoteCount + state.participationElectionCount);
  const inReview = submitted > 0 ? Math.max(1, Math.floor(submitted * 0.35)) : 0;
  const confirmed = submitted > 0 ? Math.max(0, submitted - inReview) : 0;
  const completed = state.participationElectionCount;
  const cityName = DEMO_LOCATION_LABEL[state.activeLocation] ?? 'Kommune';
  const benefits = useMemo(() => regionalPraemienForCity(cityName).slice(0, 4), [cityName]);

  const rows = useMemo<StatusRow[]>(
    () => [
      {
        label: 'Eingereicht',
        value: submitted,
        hint: du ? 'Von dir ausgelöste Vorgänge' : 'Von Ihnen ausgelöste Vorgänge',
        icon: ListChecks,
      },
      {
        label: 'In Prüfung',
        value: inReview,
        hint: 'Status: fachliche Sichtung ausstehend',
        icon: Clock,
      },
      {
        label: 'Verfügbar',
        value: confirmed,
        hint: 'Eingang dokumentiert',
        icon: CheckCircle,
      },
      {
        label: 'Eingelöst',
        value: completed,
        hint: 'Vorgang abgeschlossen',
        icon: CheckCircle,
      },
    ],
    [completed, confirmed, du, inReview, submitted],
  );

  if (embeddedInWalkthrough) {
    const walkthroughBenefits = [
      'Naturfreibad Kirkel – Saison-Eintritt reduziert',
      'Deutsche Bahn – Ticketzuschuss Regional',
      'Kino Saarpfalz – Gutschein 2 Personen',
      'Regionales Museum – Familienkarte',
    ];
    return (
      <div className="space-y-2.5">
        <p className="text-[10px] leading-snug text-neutral-600">
          Prämien sind freiwillig. Du entscheidest selbst, ob du sie nutzen möchtest.
        </p>
        <div className="rounded-xl border border-neutral-200 bg-[#F7F9FC] px-3 py-2">
          <label className="flex items-start gap-2 text-[11px] text-neutral-800">
            <input
              type="checkbox"
              checked={state.consentLocalBenefits}
              onChange={(e) => {
                dispatch({ type: 'SET_CONSENT_LOCAL_BENEFITS', payload: e.target.checked });
                if (e.target.checked) onWalkthroughConsentActivate?.();
              }}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#003366]"
              aria-label="Prämien anzeigen, wenn verfügbar"
            />
            <span>Prämien anzeigen, wenn verfügbar</span>
          </label>
        </div>
        <div className="space-y-1.5">
          {walkthroughBenefits.map((label) => (
            <div key={label} className="rounded-xl border border-neutral-200 bg-white px-3 py-2">
              <p className="text-[11px] font-semibold leading-snug text-neutral-900">{label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-neutral-200 bg-[#F8FAFD] px-3 py-2">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-neutral-700">
            <span className="rounded-full border border-neutral-300 bg-white px-2 py-0.5">
              Punktestand: {state.participationPoints}
            </span>
            <span className="rounded-full border border-neutral-300 bg-white px-2 py-0.5">Eingelöst: 0</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="card-content py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="t-meta">
            {selectionLabelForSection('leaderboard', state.activeLocation, state.residenceLocation)}
          </div>
          <SectionLevelFilterIcon section="leaderboard" />
        </div>
        <div className="flex items-start gap-2 text-[11px] text-neutral-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0055A4]" aria-hidden />
          <p className="t-body-sm">
            {du
              ? 'Hier siehst du freiwillige Prämien, wenn sie für abgeschlossene Beteiligungen oder Rückmeldungen verfügbar sind.'
              : 'Hier sehen Sie freiwillige Prämien, wenn sie für abgeschlossene Beteiligungen oder Rückmeldungen verfügbar sind.'}
          </p>
        </div>

        <div className="mt-3 rounded-xl border border-neutral-200 bg-[#F7F9FC] px-3 py-2">
          <label className="flex items-start gap-2 text-[11px] text-neutral-800">
            <input
              type="checkbox"
              checked={state.consentLocalBenefits}
              onChange={(e) =>
                dispatch({ type: 'SET_CONSENT_LOCAL_BENEFITS', payload: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#003366]"
              aria-label="Prämien anzeigen"
            />
            <span>
              Ich möchte Prämien sehen, wenn sie für abgeschlossene Beteiligungen oder Rückmeldungen verfügbar sind.
            </span>
          </label>
          <p className="mt-1.5 text-[10px] text-neutral-600">
            {du
              ? 'Diese Funktion ist freiwillig und kann jederzeit deaktiviert werden. Deine konkrete Entscheidung wird dafür nicht ausgewertet.'
              : 'Diese Funktion ist freiwillig und kann jederzeit deaktiviert werden. Ihre konkrete Entscheidung wird dafür nicht ausgewertet.'}
          </p>
        </div>
      </div>

      <div className="card-content">
        <div className="space-y-2">
          <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-neutral-900">Beteiligung abgeschlossen</p>
              <span className="rounded-full border border-neutral-300 bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
                {completed > 0 ? 'Ja' : 'Noch offen'}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-neutral-600">
              {du
                ? 'Sobald mindestens eine Beteiligung abgeschlossen ist, können Prämien verfügbar werden.'
                : 'Sobald mindestens eine Beteiligung abgeschlossen ist, können Prämien verfügbar werden.'}
            </p>
          </div>
          {benefits.map((b, idx) => {
            const localBenefit = getLocalBenefitState({
              consentLocalBenefits: state.consentLocalBenefits,
              completedParticipationCount: completed,
              benefitIndex: idx,
            });
            return (
              <div key={b.id} className="rounded-xl border border-neutral-200 bg-white px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-neutral-900">{b.name}</p>
                    <p className="mt-0.5 text-[10px] text-neutral-600">{b.description}</p>
                  </div>
                  <span className="rounded-full border border-neutral-300 bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
                    {localBenefit.consentRequired
                      ? 'Einwilligung erforderlich'
                      : localBenefit.status === 'disabled'
                        ? 'Beteiligung abgeschlossen'
                      : localBenefit.status === 'available'
                        ? 'Prämie verfügbar'
                        : 'Eingelöst / abgeschlossen'}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-neutral-600">
                  {du
                    ? 'Dieser Vorteil ist verfügbar, weil eine Beteiligung abgeschlossen wurde. Deine konkrete Abstimmungsentscheidung spielt dabei keine Rolle.'
                    : 'Dieser Vorteil ist verfügbar, weil eine Beteiligung abgeschlossen wurde. Die konkrete Abstimmungsentscheidung spielt dabei keine Rolle.'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="flex items-start gap-2 rounded-xl border border-neutral-200 bg-[#F7F9FC] px-2.5 py-1.5"
            >
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0055A4]" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-neutral-900">{row.label}</p>
                  <span className="rounded-full border border-neutral-300 bg-white px-1.5 py-0.5 text-[10px] font-bold text-neutral-900">
                    {row.value.toLocaleString('de-DE')}
                  </span>
                </div>
                <p className="mt-0.5 text-[9.5px] text-neutral-600">{row.hint}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed border-[#BFD9FF] bg-[#F0F6FF] px-3 py-2 text-[10px] text-[#003366]">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <p>Hinweis · Statusansicht zur Nachvollziehbarkeit, keine rechtlich wirksame Bearbeitung.</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardSection;
