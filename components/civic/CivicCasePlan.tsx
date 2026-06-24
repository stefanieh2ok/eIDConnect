'use client';

import React, { useCallback, useMemo } from 'react';
import { Info } from 'lucide-react';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import { CLARA_CASE_DISCLAIMER } from '@/lib/claraCaseGuidance';
import { RiskNotes } from '@/components/civic/RiskNotes';
import { WegweiserActionPlanCard } from '@/components/civic/WegweiserActionPlanCard';
import { WegweiserCompactDocumentChecklist } from '@/components/civic/WegweiserCompactDocumentChecklist';
import { downloadCasePlanTextExport } from '@/lib/documents/casePlanTextExport';
import {
  buildCompactContextSummary,
  buildWegweiserActionPlan,
  compactSourceNotice,
  groupDocumentsForPlan,
  usesActionPlanLayout,
} from '@/lib/civic/wegweiserActionPlan';

type Props = {
  plan: CivicCasePlanResult;
  du?: boolean;
  onExportPdf?: () => void;
  onEditContext?: () => void;
};

function SectionTitle({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="wegweiser-result__section-title">
      {children}
    </h3>
  );
}

export function CivicCasePlan({ plan, du = true, onExportPdf, onEditContext }: Props) {
  const actionPlan = useMemo(
    () => buildWegweiserActionPlan(plan, du, plan.sourceInputText ?? '', plan.intakeAnswers),
    [plan, du],
  );
  const contextSummary = useMemo(() => buildCompactContextSummary(plan, du), [plan, du]);
  const groupedDocs = useMemo(() => groupDocumentsForPlan(plan), [plan]);
  const sourceNote = compactSourceNotice(plan);
  const showActionPlan = usesActionPlanLayout(plan);

  const handleExport = useCallback(() => {
    if (onExportPdf) {
      onExportPdf();
      return;
    }
    downloadCasePlanTextExport(plan, du);
  }, [du, onExportPdf, plan]);

  if (!showActionPlan) {
    return (
      <div className="civic-case-plan civic-case-plan--with-dock civic-case-plan--kirkel" role="region">
        {sourceNote ? (
          <aside className="civic-source-notice civic-source-notice--lavender" role="note">
            <Info className="civic-source-notice__icon" aria-hidden />
            <p>{sourceNote}</p>
          </aside>
        ) : null}
        <p className="civic-case-plan__summary-text">{plan.situationSummary}</p>
        <section className="wegweiser-result__section" aria-labelledby="plan-disclaimer-fallback">
          <SectionTitle id="plan-disclaimer-fallback">
            {du ? 'Was Clara nicht entscheiden kann' : 'Was Clara nicht entscheiden kann'}
          </SectionTitle>
          <p className="wegweiser-result__disclaimer-text">{CLARA_CASE_DISCLAIMER}</p>
        </section>
        <div className="civic-case-plan__export-wrap">
          <button type="button" onClick={handleExport} className="civic-case-plan__export-btn">
            {du ? 'Vorbereitung herunterladen' : 'Vorbereitung herunterladen'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="wegweiser-result civic-case-plan--with-dock"
      role="region"
      aria-label={du ? 'Behördenfahrplan' : 'Behördenfahrplan'}
      data-testid="wegweiser-action-plan-result"
    >
      {sourceNote ? (
        <p className="wegweiser-result__source-note" role="note">
          {sourceNote}
        </p>
      ) : null}

      <section
        className="wegweiser-result__summary"
        aria-labelledby="plan-compact-summary"
        data-testid="wegweiser-compact-summary"
      >
        <p id="plan-compact-summary" className="wegweiser-result__summary-headline">
          {contextSummary.headline}
        </p>
        <p className="wegweiser-result__summary-location">{contextSummary.locationLine}</p>
        {contextSummary.intakeLine ? (
          <p className="wegweiser-result__summary-intake">
            {du ? 'Angaben ergänzt: ' : 'Angaben ergänzt: '}
            {contextSummary.intakeLine}
          </p>
        ) : null}
        {onEditContext ? (
          <button type="button" onClick={onEditContext} className="wegweiser-result__edit-link">
            {du ? 'Angaben bearbeiten' : 'Angaben bearbeiten'}
          </button>
        ) : null}
      </section>

      {plan.safeGuidance ? (
        <aside className="wegweiser-result__safe-guidance" role="note" data-testid="plan-safe-guidance">
          <p>{plan.safeGuidance}</p>
        </aside>
      ) : null}

      {actionPlan.primary.length > 0 ? (
        <section
          className="wegweiser-result__section"
          aria-labelledby="plan-primary-actions"
          data-testid="plan-official-actions"
        >
          <SectionTitle id="plan-primary-actions">
            {du ? 'Deine nächsten Schritte' : 'Ihre nächsten Schritte'}
          </SectionTitle>
          <div className="wegweiser-result__card-list">
            {actionPlan.primary.map((item) => (
              <WegweiserActionPlanCard key={item.actionId} item={item} du={du} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="wegweiser-result__section" aria-labelledby="plan-documents">
        <SectionTitle id="plan-documents">
          {du ? 'Unterlagen bereitlegen' : 'Unterlagen bereitlegen'}
        </SectionTitle>
        <WegweiserCompactDocumentChecklist
          likely={groupedDocs.likely}
          optional={groupedDocs.optional}
          du={du}
        />
      </section>

      {actionPlan.optional.length > 0 ? (
        <section className="wegweiser-result__section" aria-labelledby="plan-optional-actions">
          <SectionTitle id="plan-optional-actions">
            {du ? 'Optional prüfen' : 'Optional prüfen'}
          </SectionTitle>
          <div className="wegweiser-result__card-list">
            {actionPlan.optional.map((item) => (
              <WegweiserActionPlanCard key={item.actionId} item={item} du={du} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="wegweiser-result__section" aria-labelledby="plan-disclaimer">
        <SectionTitle id="plan-disclaimer">
          {du ? 'Was Clara nicht entscheiden kann' : 'Was Clara nicht entscheiden kann'}
        </SectionTitle>
        <p className="wegweiser-result__disclaimer-text">{CLARA_CASE_DISCLAIMER}</p>
        {plan.risks.length > 0 ? <RiskNotes risks={plan.risks} du={du} /> : null}
      </section>

      <div className="civic-case-plan__export-wrap">
        <button type="button" onClick={handleExport} className="civic-case-plan__export-btn">
          {du ? 'Vorbereitung herunterladen' : 'Vorbereitung herunterladen'}
        </button>
      </div>
    </div>
  );
}
