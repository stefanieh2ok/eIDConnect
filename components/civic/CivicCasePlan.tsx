'use client';

import React, { useCallback, useMemo } from 'react';
import { Info, ExternalLink } from 'lucide-react';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import {
  CLARA_CASE_DISCLAIMER,
  CLARA_OFFICIAL_SOURCE_NOTICE,
} from '@/lib/claraCaseGuidance';
import { SOURCE_NOTICE_TEMPLATE_ONLY } from '@/lib/govdata/sourceStatus';
import { AuthoritiesOverview } from '@/components/civic/AuthoritiesOverview';
import { OfficialServiceCard } from '@/components/civic/OfficialServiceCard';
import { RequiredDocumentsChecklist } from '@/components/civic/RequiredDocumentsChecklist';
import { CaseTimeline } from '@/components/civic/CaseTimeline';
import { OfficialActionCard } from '@/components/civic/OfficialActionCard';
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
  isRenderableOfficialLink,
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
  const templateDriven = Boolean(plan.journeyId);
  const showTemplateSourceNote =
    templateDriven && plan.services.length === 0 && plan.sourceNotice === SOURCE_NOTICE_TEMPLATE_ONLY;

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
      className="civic-case-plan civic-case-plan--with-dock civic-case-plan--kirkel"
      role="region"
      aria-label={du ? 'Behördenfahrplan' : 'Behördenfahrplan'}
    >
      {plan.sourceNotice ? (
        <aside className="civic-source-notice civic-source-notice--lavender" role="note">
          <Info className="civic-source-notice__icon" aria-hidden />
          <p>{plan.sourceNotice}</p>
        </aside>
      ) : null}

      <section className="civic-case-plan__section civic-case-plan__section--summary" aria-labelledby="plan-summary">
        <SectionHead
          id="plan-summary"
          title={du ? 'Lage erkannt' : 'Lage erkannt'}
          lead={
            plan.journeyTitle
              ? du
                ? `Wegweiser-Template: ${plan.journeyTitle}`
                : `Wegweiser-Template: ${plan.journeyTitle}`
              : du
                ? 'Kurzfassung deiner Situation — ohne Anspruchsprüfung.'
                : 'Kurzfassung Ihrer Situation — ohne Anspruchsprüfung.'
          }
        />
        <p className="civic-case-plan__summary-text">{plan.situationSummary}</p>
        {plan.topics.length > 0 ? (
          <div className="civic-case-plan__topic-pills civic-case-plan__topic-pills--inline">
            {plan.topics.map((t) => (
              <span key={t} className="civic-case-plan__topic-pill">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      {plan.knownContextFacts && plan.knownContextFacts.length > 0 ? (
        <section
          className="civic-case-plan__section civic-case-plan__section--known-context"
          aria-labelledby="plan-known-context"
        >
          <SectionHead
            id="plan-known-context"
            title={du ? 'Demo-Kontext / bekannte Angaben' : 'Demo-Kontext / bekannte Angaben'}
          />
          <ul className="civic-case-plan__known-context-list">
            {plan.knownContextFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          {plan.identityContextDisclaimer ? (
            <p className="civic-case-plan__known-context-disclaimer">{plan.identityContextDisclaimer}</p>
          ) : null}
        </section>
      ) : null}

      {plan.safeGuidance ? (
        <aside className="civic-case-plan__safe-guidance" role="note" data-testid="plan-safe-guidance">
          <p>{plan.safeGuidance}</p>
        </aside>
      ) : null}

      <section className="civic-case-plan__section" aria-labelledby="plan-sequence">
        <SectionHead
          id="plan-sequence"
          title={du ? 'Nächste Schritte' : 'Nächste Schritte'}
          lead={du ? 'Sinnvolle Reihenfolge für die Vorbereitung.' : 'Sinnvolle Reihenfolge für die Vorbereitung.'}
        />
        <CaseTimeline steps={plan.sequenceSteps} />
      </section>

      {plan.officialActionGroups && plan.officialActionGroups.length > 0 ? (
        <section
          className="civic-case-plan__section civic-case-plan__section--official-actions"
          aria-labelledby="plan-official-actions"
          data-testid="plan-official-actions"
        >
          <SectionHead
            id="plan-official-actions"
            title={du ? 'Offizielle Vorgänge & Formulare' : 'Offizielle Vorgänge & Formulare'}
            lead={
              du
                ? 'Kataloggestützte offizielle Vorgänge — Clara reicht nichts ein und prüft keinen Anspruch.'
                : 'Kataloggestützte offizielle Vorgänge — Clara reicht nichts ein und prüft keinen Anspruch.'
            }
          />
          {plan.officialActionGroups.map((group) => (
            <div key={group.groupTitle} className="civic-official-action-group">
              <h4 className="civic-official-action-group__title">{group.groupTitle}</h4>
              <div className="civic-official-action-group__list">
                {group.actions.map((action) => (
                  <OfficialActionCard key={action.actionId} action={action} du={du} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      <section className="civic-case-plan__section" aria-labelledby="plan-documents">
        <SectionHead
          id="plan-documents"
          title={du ? 'Benötigte Unterlagen' : 'Benötigte Unterlagen'}
        />
        <RequiredDocumentsChecklist items={plan.documents} du={du} />
      </section>

      <AuthoritiesOverview
        authorities={plan.touchedAuthorities}
        du={du}
        title={du ? 'Beteiligte Stellen' : 'Beteiligte Stellen'}
      />

      <section className="civic-case-plan__section" aria-labelledby="plan-services">
        <SectionHead
          id="plan-services"
          title={du ? 'Online weiter / Offizielle Informationen' : 'Online weiter / Offizielle Informationen'}
          lead="Clara ordnet Orientierung — keine Anspruchsprüfung, keine Einreichung."
        />
        {plan.services.length > 0 ? (
          <div className="civic-case-plan__service-list">
            {plan.services.map((s) => (
              <OfficialServiceCard key={s.serviceId} service={s} du={du} />
            ))}
          </div>
        ) : showTemplateSourceNote ? (
          <p className="civic-case-plan__missing-source-note">
            Quelle noch nicht im Katalog hinterlegt — der Fahrplan basiert auf dem Wegweiser-Template.
          </p>
        ) : null}
      </section>

      {plan.followUpQuestions.length > 0 ? (
        <section
          className="civic-case-plan__section civic-case-plan__section--followup"
          aria-labelledby="plan-followup"
        >
          <SectionHead
            id="plan-followup"
            title={du ? 'Was Clara noch wissen sollte' : 'Was Clara noch wissen sollte'}
          />
          <ul className="civic-case-plan__followup-list">
            {plan.followUpQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <CaseDocumentPacketSection
        cards={documentCards}
        du={du}
        onCardAction={handleDocumentCardAction}
      />

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
              const verified = isRenderableOfficialLink(status);
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
          <Info className="civic-case-plan__disclaimer-icon" aria-hidden />
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
