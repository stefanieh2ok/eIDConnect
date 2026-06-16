'use client';

import React, { useCallback, useMemo } from 'react';
import { Info, ExternalLink } from 'lucide-react';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import {
  CLARA_CASE_DISCLAIMER,
  CLARA_OFFICIAL_SOURCE_NOTICE,
} from '@/lib/claraCaseGuidance';
import { AuthoritiesOverview } from '@/components/civic/AuthoritiesOverview';
import { OfficialServiceCard } from '@/components/civic/OfficialServiceCard';
import { RequiredDocumentsChecklist } from '@/components/civic/RequiredDocumentsChecklist';
import { CaseTimeline } from '@/components/civic/CaseTimeline';
import { RiskNotes } from '@/components/civic/RiskNotes';
import { CaseDocumentPacketSection } from '@/components/civic/CaseDocumentPacketSection';
import {
  resolveDocumentPacket,
  type DocumentPacketCard,
} from '@/lib/documents/documentPacketResolver';
import { downloadCasePlanTextExport } from '@/lib/documents/casePlanTextExport';
import {
  EXTERNAL_HANDOVER_MICROCOPY,
  EXTERNAL_HANDOVER_NOTICE,
  externalLinkButtonLabel,
  isVerifiedOfficialLink,
  shouldRenderExternalLink,
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

function scrollToSection(id: string) {
  if (typeof document === 'undefined') return;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function CivicCasePlan({ plan, du = true, onExportPdf }: Props) {
  const documentCards = useMemo(() => resolveDocumentPacket(plan, { du }), [plan, du]);

  const handleExport = useCallback(() => {
    if (onExportPdf) {
      onExportPdf();
      return;
    }
    downloadCasePlanTextExport(plan, du);
  }, [du, onExportPdf, plan]);

  const handleDocumentCardAction = useCallback(
    (card: DocumentPacketCard) => {
      if (card.action === 'export_plan_text') {
        handleExport();
        return;
      }
      if (card.action === 'open_nda' && card.actionUrl) {
        window.open(card.actionUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      if (card.action === 'scroll_documents') {
        scrollToSection('plan-documents');
        return;
      }
      if (card.action === 'scroll_handover') {
        scrollToSection('plan-handover');
        return;
      }
      if (card.action === 'scroll_checklist') {
        scrollToSection('plan-documents');
      }
    },
    [handleExport],
  );

  return (
    <div
      className="civic-case-plan civic-case-plan--with-dock"
      role="region"
      aria-label={du ? 'Behördenfahrplan' : 'Behördenfahrplan'}
    >
      {plan.sourceNotice ? (
        <aside className="civic-source-notice" role="note">
          <Info className="civic-source-notice__icon" aria-hidden />
          <p>{plan.sourceNotice}</p>
        </aside>
      ) : null}

      <section className="civic-case-plan__section civic-case-plan__section--summary" aria-labelledby="plan-summary">
        <SectionHead
          id="plan-summary"
          title={du ? 'Lage verstanden' : 'Lage verstanden'}
          lead={
            du
              ? 'Kurzfassung deiner Situation — ohne Anspruchsprüfung.'
              : 'Kurzfassung Ihrer Situation — ohne Anspruchsprüfung.'
          }
        />
        <p className="civic-case-plan__summary-text">{plan.situationSummary}</p>
      </section>

      {plan.topics.length > 0 ? (
        <section className="civic-case-plan__section" aria-labelledby="plan-topics">
          <SectionHead id="plan-topics" title="Beteiligte Stellen" lead="Betroffene Themen und Bereiche." />
          <div className="civic-case-plan__topic-pills">
            {plan.topics.map((t) => (
              <span key={t} className="civic-case-plan__topic-pill">
                {t}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <AuthoritiesOverview authorities={plan.touchedAuthorities} du={du} />

      {plan.followUpQuestions.length > 0 ? (
        <section
          className="civic-case-plan__section civic-case-plan__section--followup"
          aria-labelledby="plan-followup"
        >
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

      <section className="civic-case-plan__section" aria-labelledby="plan-documents">
        <SectionHead id="plan-documents" title="Unterlagen-Check" />
        <RequiredDocumentsChecklist items={plan.documents} du={du} />
      </section>

      <CaseDocumentPacketSection
        cards={documentCards}
        du={du}
        onCardAction={handleDocumentCardAction}
      />

      <section className="civic-case-plan__section" aria-labelledby="plan-sequence">
        <SectionHead id="plan-sequence" title="Nächste Schritte" lead="Sinnvolle Reihenfolge für die Vorbereitung." />
        <CaseTimeline steps={plan.sequenceSteps} />
      </section>

      <section className="civic-case-plan__section" aria-labelledby="plan-risks">
        <SectionHead id="plan-risks" title="Risiken & typische Fehler" />
        <RiskNotes risks={plan.risks} du={du} />
      </section>

      {plan.handoverLinks.length > 0 ? (
        <section
          className="civic-case-plan__section civic-case-plan__section--handover"
          aria-labelledby="plan-handover"
        >
          <SectionHead
            id="plan-handover"
            title="Offizielle Übergabe"
            lead={`${CLARA_OFFICIAL_SOURCE_NOTICE} ${EXTERNAL_HANDOVER_NOTICE}`}
          />
          <p className="civic-case-plan__handover-micro">{EXTERNAL_HANDOVER_MICROCOPY}</p>
          <ul className="civic-case-plan__handover-list">
            {plan.handoverLinks.map((link) => {
              const status = link.linkStatus ?? 'missing';
              const verified = isVerifiedOfficialLink(status);
              const showLink = Boolean(link.url) && shouldRenderExternalLink(status);
              const buttonLabel = externalLinkButtonLabel(status, du, 'handover');
              return (
                <li key={link.id}>
                  {showLink && link.url ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="civic-case-plan__handover-link"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="civic-case-plan__handover-title">{link.title}</span>
                        <span className="civic-case-plan__handover-label">{link.label}</span>
                        <span className="civic-case-plan__handover-action">{buttonLabel}</span>
                      </span>
                      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                    </a>
                  ) : (
                    <div className="civic-case-plan__handover-static">
                      <span className="civic-case-plan__handover-title">{link.title}</span>
                      <span className="civic-case-plan__handover-label">{link.label}</span>
                      {!verified ? (
                        <span className="civic-case-plan__handover-pending">{buttonLabel}</span>
                      ) : null}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section
        className="civic-case-plan__section civic-case-plan__section--disclaimer"
        aria-labelledby="plan-disclaimer"
      >
        <SectionHead id="plan-disclaimer" title="Hinweise" />
        <div className="civic-case-plan__disclaimer-box">
          <Info className="h-4 w-4 shrink-0 text-[#0055A4]" aria-hidden />
          <p>{CLARA_CASE_DISCLAIMER}</p>
        </div>
        <p className="civic-case-plan__no-submission">
          Die Antragstellung erfolgt immer über die zuständige offizielle Stelle.
        </p>
      </section>

      <div className="civic-case-plan__export-wrap">
        <button type="button" onClick={handleExport} className="civic-case-plan__export-btn">
          {du ? 'Vorbereitung herunterladen (Text)' : 'Vorbereitung herunterladen (Text)'}
        </button>
        <p className="civic-case-plan__export-note">
          {du
            ? 'Noch kein amtliches PDF — nur eine lokale Vorbereitungsdatei.'
            : 'Noch kein amtliches PDF — nur eine lokale Vorbereitungsdatei.'}
        </p>
      </div>
    </div>
  );
}
