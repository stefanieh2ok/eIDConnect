'use client';

import React from 'react';
import { Info, ExternalLink } from 'lucide-react';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import {
  CLARA_CASE_DISCLAIMER,
  CLARA_DEMO_DATA_NOTICE,
  CLARA_OFFICIAL_SOURCE_NOTICE,
} from '@/lib/claraCaseGuidance';
import { DemoDataBanner } from '@/components/civic/DemoDataBanner';
import { AuthoritiesOverview } from '@/components/civic/AuthoritiesOverview';
import { OfficialServiceCard } from '@/components/civic/OfficialServiceCard';
import { RequiredDocumentsChecklist } from '@/components/civic/RequiredDocumentsChecklist';
import { CaseTimeline } from '@/components/civic/CaseTimeline';
import { RiskNotes } from '@/components/civic/RiskNotes';
import {
  DEMO_LINK_LABEL,
  EXTERNAL_HANDOVER_MICROCOPY,
  EXTERNAL_HANDOVER_NOTICE,
  externalLinkButtonLabel,
  isVerifiedOfficialLink,
} from '@/lib/govdata/externalLinkGate';

type Props = {
  plan: CivicCasePlanResult;
  du?: boolean;
  onExportPdf?: () => void;
};

function SectionHead({
  title,
  lead,
  id,
}: {
  title: string;
  lead?: string;
  id?: string;
}) {
  return (
    <div className="civic-case-plan__section-head">
      <h3 id={id} className="civic-case-plan__section-title">
        {title}
      </h3>
      {lead ? <p className="civic-case-plan__section-lead">{lead}</p> : null}
    </div>
  );
}

export function CivicCasePlan({ plan, du = true, onExportPdf }: Props) {
  const handleExport = () => {
    if (onExportPdf) {
      onExportPdf();
      return;
    }
    if (typeof window !== 'undefined') {
      window.alert(
        'PDF-Export ist in dieser Demo noch nicht angebunden. Der Behördenfahrplan bleibt in der App sichtbar.',
      );
    }
  };

  return (
    <div className="civic-case-plan" role="region" aria-label={du ? 'Behördenfahrplan' : 'Behördenfahrplan'}>
      {plan.isDemoData ? <DemoDataBanner className="civic-case-plan__demo-banner" /> : null}

      {/* A. Lage verstanden */}
      <section className="civic-case-plan__section civic-case-plan__section--summary" aria-labelledby="plan-summary">
        <SectionHead
          id="plan-summary"
          title={du ? 'Lage verstanden' : 'Lage verstanden'}
          lead={du ? 'Kurzfassung deiner Situation — ohne Anspruchsprüfung.' : 'Kurzfassung Ihrer Situation — ohne Anspruchsprüfung.'}
        />
        <p className="civic-case-plan__summary-text">{plan.situationSummary}</p>
        {plan.isDemoData ? (
          <p className="civic-case-plan__demo-inline">{CLARA_DEMO_DATA_NOTICE}</p>
        ) : null}
      </section>

      {/* B. Betroffene Themen */}
      {plan.topics.length > 0 ? (
        <section className="civic-case-plan__section" aria-labelledby="plan-topics">
          <SectionHead id="plan-topics" title="Betroffene Themen" />
          <div className="civic-case-plan__topic-pills">
            {plan.topics.map((t) => (
              <span key={t} className="civic-case-plan__topic-pill">
                {t}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* C. Beteiligte Stellen */}
      <AuthoritiesOverview authorities={plan.touchedAuthorities} du={du} />

      {/* Follow-up questions */}
      {plan.followUpQuestions.length > 0 ? (
        <section className="civic-case-plan__section civic-case-plan__section--followup" aria-labelledby="plan-followup">
          <SectionHead
            id="plan-followup"
            title={du ? 'Clara würde noch kurz nachfragen' : 'Clara würde noch kurz nachfragen'}
          />
          <ul className="civic-case-plan__followup-list">
            {plan.followUpQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* D. Mögliche offizielle Leistungen */}
      <section className="civic-case-plan__section" aria-labelledby="plan-services">
        <SectionHead
          id="plan-services"
          title="Mögliche offizielle Leistungen"
          lead="Clara ordnet Orientierung — keine Anspruchsprüfung, keine Einreichung."
        />
        <div className="civic-case-plan__service-list">
          {plan.services.map((s) => (
            <OfficialServiceCard key={s.serviceId} service={s} du={du} />
          ))}
        </div>
      </section>

      {/* E. Unterlagen-Check */}
      <section className="civic-case-plan__section" aria-labelledby="plan-documents">
        <SectionHead id="plan-documents" title="Unterlagen-Check" />
        <RequiredDocumentsChecklist items={plan.documents} du={du} />
      </section>

      {/* F. Sinnvolle Reihenfolge */}
      <section className="civic-case-plan__section" aria-labelledby="plan-sequence">
        <SectionHead id="plan-sequence" title="Sinnvolle Reihenfolge" />
        <CaseTimeline steps={plan.sequenceSteps} />
      </section>

      {/* G. Risiken */}
      <section className="civic-case-plan__section" aria-labelledby="plan-risks">
        <SectionHead id="plan-risks" title="Risiken & typische Fehler" />
        <RiskNotes risks={plan.risks} du={du} />
      </section>

      {/* H. Offizielle Übergabe */}
      {plan.handoverLinks.length > 0 ? (
        <section className="civic-case-plan__section civic-case-plan__section--handover" aria-labelledby="plan-handover">
          <SectionHead
            id="plan-handover"
            title="Offizielle Übergabe"
            lead={`${CLARA_OFFICIAL_SOURCE_NOTICE} ${EXTERNAL_HANDOVER_NOTICE}`}
          />
          <p className="civic-case-plan__handover-micro">{EXTERNAL_HANDOVER_MICROCOPY}</p>
          <ul className="civic-case-plan__handover-list">
            {plan.handoverLinks.map((link) => {
              const verified = link.linkStatus ? isVerifiedOfficialLink(link.linkStatus) : false;
              const buttonLabel = link.linkStatus
                ? externalLinkButtonLabel(link.linkStatus, du, 'handover')
                : 'Offizielle Stelle öffnen';
              return (
                <li key={link.id}>
                  {link.url ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        'civic-case-plan__handover-link' +
                        (verified ? '' : ' civic-case-plan__handover-link--demo')
                      }
                    >
                      <span className="min-w-0 flex-1">
                        <span className="civic-case-plan__handover-title">{link.title}</span>
                        <span className="civic-case-plan__handover-label">{link.label}</span>
                        {!verified ? (
                          <span className="civic-case-plan__handover-demo">{DEMO_LINK_LABEL}</span>
                        ) : null}
                        <span className="civic-case-plan__handover-action">{buttonLabel}</span>
                      </span>
                      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                    </a>
                  ) : (
                    <div className="civic-case-plan__handover-static">
                      <span className="civic-case-plan__handover-title">{link.title}</span>
                      <span className="civic-case-plan__handover-label">{link.label}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* I. Hinweise / Disclaimer */}
      <section
        className="civic-case-plan__section civic-case-plan__section--disclaimer"
        aria-labelledby="plan-disclaimer"
      >
        <SectionHead id="plan-disclaimer" title="Hinweise" />
        <div className="civic-case-plan__disclaimer-box">
          <Info className="h-4 w-4 shrink-0 text-[#0055A4]" aria-hidden />
          <p>{CLARA_CASE_DISCLAIMER}</p>
        </div>
      </section>

      <button type="button" onClick={handleExport} className="civic-case-plan__export-btn">
        {du ? 'Behördenfahrplan als PDF exportieren' : 'Behördenfahrplan als PDF exportieren'}
      </button>
    </div>
  );
}
