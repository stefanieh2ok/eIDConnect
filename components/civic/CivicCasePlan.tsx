'use client';

import React from 'react';
import { Info } from 'lucide-react';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import {
  CLARA_CASE_DISCLAIMER,
  CLARA_DEMO_DATA_NOTICE,
  CLARA_OFFICIAL_SOURCE_NOTICE,
} from '@/lib/claraCaseGuidance';
import { OfficialServiceCard } from '@/components/civic/OfficialServiceCard';
import { RequiredDocumentsChecklist } from '@/components/civic/RequiredDocumentsChecklist';
import { CaseTimeline } from '@/components/civic/CaseTimeline';
import { RiskNotes } from '@/components/civic/RiskNotes';
import { ExternalLink } from 'lucide-react';

type Props = {
  plan: CivicCasePlanResult;
  du?: boolean;
  onExportPdf?: () => void;
};

export function CivicCasePlan({ plan, du = true, onExportPdf }: Props) {
  const handleExport = () => {
    if (onExportPdf) {
      onExportPdf();
      return;
    }
    if (typeof window !== 'undefined') {
      window.alert(
        du
          ? 'PDF-Export ist in dieser Demo noch nicht angebunden. Der Behördenfahrplan bleibt in der App sichtbar.'
          : 'PDF-Export ist in dieser Demo noch nicht angebunden. Der Behördenfahrplan bleibt in der App sichtbar.',
      );
    }
  };

  return (
    <div className="civic-case-plan space-y-4" role="region" aria-label={du ? 'Behördenfahrplan' : 'Behördenfahrplan'}>
      {/* 1. Situation Summary */}
      <section className="rounded-xl border border-sky-200/80 bg-gradient-to-br from-sky-50/80 to-white p-3">
        <h3 className="text-[13px] font-bold text-[#003366]">
          {du ? 'Deine Lage verstanden' : 'Ihre Lage verstanden'}
        </h3>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[#1A2B45]">{plan.situationSummary}</p>
        {plan.isDemoData ? (
          <p className="mt-2 text-[9px] font-semibold leading-snug text-amber-800">
            {CLARA_DEMO_DATA_NOTICE}
          </p>
        ) : null}
      </section>

      {/* 2. Topic Map + Cross-Agency */}
      {plan.topics.length > 0 ? (
        <section>
          <h3 className="text-[12px] font-bold text-[#003366]">{du ? 'Themenübersicht' : 'Themenübersicht'}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {plan.topics.map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-[#003366] shadow-sm"
              >
                {t}
              </span>
            ))}
          </div>
          {plan.touchedAuthorities.length > 1 ? (
            <p className="mt-2 text-[10px] leading-snug text-slate-600">
              {du ? 'Mehrere Stellen könnten betroffen sein:' : 'Mehrere Stellen könnten betroffen sein:'}{' '}
              {plan.touchedAuthorities.join(' · ')}
            </p>
          ) : null}
        </section>
      ) : null}

      {/* Follow-up questions */}
      {plan.followUpQuestions.length > 0 ? (
        <section className="rounded-lg border border-violet-100 bg-violet-50/50 px-3 py-2">
          <h3 className="text-[11px] font-bold text-violet-900">
            {du ? 'Clara würde noch kurz nachfragen' : 'Clara würde noch kurz nachfragen'}
          </h3>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[10.5px] text-violet-950">
            {plan.followUpQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 3. Relevant Official Services */}
      <section>
        <h3 className="text-[12px] font-bold text-[#003366]">
          {du ? 'Möglicherweise relevante offizielle Wege' : 'Möglicherweise relevante offizielle Wege'}
        </h3>
        <p className="mt-0.5 text-[10px] text-slate-500">
          {du
            ? 'Clara ordnet Orientierung — keine Anspruchsprüfung.'
            : 'Clara ordnet Orientierung — keine Anspruchsprüfung.'}
        </p>
        <div className="mt-2 space-y-2">
          {plan.services.map((s) => (
            <OfficialServiceCard key={s.serviceId} service={s} du={du} />
          ))}
        </div>
      </section>

      {/* 4. Documents */}
      <section>
        <h3 className="text-[12px] font-bold text-[#003366]">
          {du ? 'Unterlagencheck' : 'Unterlagencheck'}
        </h3>
        <RequiredDocumentsChecklist items={plan.documents} du={du} />
      </section>

      {/* 5. Sequence */}
      <section>
        <h3 className="text-[12px] font-bold text-[#003366]">
          {du ? 'Empfohlene Reihenfolge' : 'Empfohlene Reihenfolge'}
        </h3>
        <div className="mt-2">
          <CaseTimeline steps={plan.sequenceSteps} />
        </div>
      </section>

      {/* 6. Risks */}
      <section>
        <h3 className="text-[12px] font-bold text-[#003366]">
          {du ? 'Risiken & typische Fehler' : 'Risiken & typische Fehler'}
        </h3>
        <div className="mt-2">
          <RiskNotes risks={plan.risks} du={du} />
        </div>
      </section>

      {/* 7. Official Handover */}
      {plan.handoverLinks.length > 0 ? (
        <section>
          <h3 className="text-[12px] font-bold text-[#003366]">
            {du ? 'Übergabe an offizielle Systeme' : 'Übergabe an offizielle Systeme'}
          </h3>
          <p className="mt-0.5 text-[10px] font-medium text-slate-600">{CLARA_OFFICIAL_SOURCE_NOTICE}</p>
          <ul className="mt-2 space-y-1.5">
            {plan.handoverLinks.map((link) => (
              <li key={link.id}>
                {link.url ? (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[36px] w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-[#003366] hover:bg-sky-50"
                  >
                    <span>
                      {link.title}
                      <span className="mt-0.5 block font-normal text-slate-500">{link.label}</span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  </a>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[10px] text-slate-700">
                    <span className="font-semibold">{link.title}</span>
                    <span className="mt-0.5 block text-slate-500">{link.label}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 8. Disclaimer */}
      <section className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0055A4]" aria-hidden />
        <p className="text-[10px] leading-relaxed text-slate-700">{CLARA_CASE_DISCLAIMER}</p>
      </section>

      {/* 9. Export */}
      <button
        type="button"
        onClick={handleExport}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#003366]/25 bg-white px-3 text-[12px] font-semibold text-[#003366] transition hover:bg-[#FBFDFF]"
      >
        {du ? 'Behördenfahrplan als PDF exportieren' : 'Behördenfahrplan als PDF exportieren'}
      </button>
    </div>
  );
}
