'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { ChevronRight, Info, Mic } from 'lucide-react';
import {
  useClaraCaseInputBridgeRegistration,
  type ClaraCaseInputBridge,
} from '@/context/ClaraCaseInputContext';
import { useClaraCaseInput } from '@/hooks/useClaraCaseInput';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import { CivicCasePlan } from '@/components/civic/CivicCasePlan';
import { ClaraWegweiserChatFlow } from '@/components/civic/ClaraWegweiserChatFlow';
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';
import { journeyQuickStartText } from '@/lib/civic/civicJourneyResolver';
import { getJourneyTemplateById } from '@/lib/civic/civicJourneyTemplates';
import { KIRKEL_DEMO_CONTEXT } from '@/lib/civic/demoCivicContext';

export type ClaraWegweiserMode = 'private' | 'business' | 'unsure';

type Props = {
  du?: boolean;
  plz?: string;
  bundesland?: string;
  wohnort?: string;
  onPlanReady?: (plan: CivicCasePlanResult) => void;
};

const PLACEHOLDER =
  'Ich wurde gekündigt und möchte wissen, was jetzt wichtig ist.';

const QUICK_START_ROWS: {
  key: string;
  title: string;
  journeyId: CivicJourneyId;
  exampleId?: string;
}[] = [
  { key: 'kuendigung', title: 'Kündigung & Arbeit', journeyId: 'job_loss_unemployment' },
  { key: 'geburt-kita', title: 'Geburt & Kita', journeyId: 'child_birth_kita' },
  { key: 'umzug', title: 'Umzug mit Kindern', journeyId: 'moving_with_children' },
  { key: 'wohngeld', title: 'Wohngeld & Unterstützung', journeyId: 'housing_support' },
  { key: 'pflege', title: 'Pflegefall', journeyId: 'family_care', exampleId: 'pflege-parent' },
  { key: 'gewerbe', title: 'Gewerbe anmelden', journeyId: 'business_registration', exampleId: 'gewerbe-start' },
];

export function ClaraWegweiser({ du = true, plz, bundesland, wohnort, onPlanReady }: Props) {
  const caseInput = useClaraCaseInput({ du, plz, bundesland, wohnort, onPlanReady });
  const dockVisibilityGuardRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [inputGuardScrolledPast, setInputGuardScrolledPast] = React.useState(false);

  const showFloatingDock = !caseInput.plan && !caseInput.isClarifying && inputGuardScrolledPast;

  const contextLocationLabel = useMemo(() => KIRKEL_DEMO_CONTEXT.municipality, []);

  const fieldHelpText = du
    ? 'Beschreibe kurz deine Situation oder wähle einen häufigen Fall.'
    : 'Beschreiben Sie kurz Ihre Situation oder wählen Sie einen häufigen Fall.';

  const readyHelpText = du
    ? 'Bereit — Clara erstellt deinen Fahrplan für Kirkel.'
    : 'Bereit — Clara erstellt Ihren Fahrplan für Kirkel.';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (caseInput.plan) {
      document.documentElement.dataset.claraWegweiserPlan = 'true';
    } else {
      delete document.documentElement.dataset.claraWegweiserPlan;
    }
    return () => {
      delete document.documentElement.dataset.claraWegweiserPlan;
    };
  }, [caseInput.plan]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.getElementById('main-content');
    const target = dockVisibilityGuardRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInputGuardScrolledPast(!entry.isIntersecting);
      },
      { root, threshold: 0, rootMargin: '0px 0px 0px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [caseInput.plan]);

  useEffect(() => {
    if (!caseInput.plan || !resultRef.current) return;
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [caseInput.plan]);

  const bridge = useMemo<ClaraCaseInputBridge>(
    () => ({
      isActive: true,
      focusInput: caseInput.focusInput,
      appendTranscript: caseInput.appendTranscript,
      submitPlan: caseInput.handleAnalyze,
      canSubmit: caseInput.canSubmit,
      speechSupported: caseInput.speechSupported,
      startSpeechInput: caseInput.startSpeechInput,
      speechListening: caseInput.speechListening,
      speechMessage: caseInput.speechMessage,
      showFloatingDock,
      isClarifying: caseInput.isClarifying,
      dismissClarification: caseInput.dismissClarification,
      resetTransientUi: caseInput.resetTransientUi,
    }),
    [
      caseInput.focusInput,
      caseInput.appendTranscript,
      caseInput.handleAnalyze,
      caseInput.canSubmit,
      caseInput.speechSupported,
      caseInput.startSpeechInput,
      caseInput.speechListening,
      caseInput.speechMessage,
      showFloatingDock,
      caseInput.isClarifying,
      caseInput.dismissClarification,
      caseInput.resetTransientUi,
    ],
  );

  useClaraCaseInputBridgeRegistration(bridge);

  const loadQuickStart = (row: (typeof QUICK_START_ROWS)[number]) => {
    const preset = journeyQuickStartText(row.journeyId);
    if (row.exampleId) {
      caseInput.loadExample(row.exampleId, false);
      caseInput.setJourneyHint(row.journeyId);
      const template = getJourneyTemplateById(row.journeyId);
      if (template) {
        caseInput.setMode(template.defaultMode === 'business' ? 'business' : 'private');
      }
    } else {
      caseInput.loadJourneyQuickStart(row.journeyId, preset);
    }
    requestAnimationFrame(() => caseInput.focusInput());
  };

  return (
    <div className="clara-wegweiser clara-wegweiser--workflow clara-wegweiser--kirkel clara-wegweiser--compact">
      {caseInput.isClarifying && caseInput.guidedIntake ? (
        <ClaraWegweiserChatFlow
          intake={caseInput.guidedIntake}
          answers={caseInput.intakeAnswers}
          activeQuestionIndex={caseInput.activeQuestionIndex}
          onAnswer={caseInput.setIntakeAnswer}
          onClassifierSelect={caseInput.selectClassifierJourney}
          onAdvance={caseInput.advanceClarification}
          onSkipQuestion={caseInput.skipCurrentQuestion}
          onSubmitSkip={caseInput.submitPlanSkip}
          analyzing={caseInput.analyzing}
          du={du}
        />
      ) : (
        <>
          <div className="clara-wegweiser__workflow">
        <div ref={dockVisibilityGuardRef} className="clara-wegweiser__dock-guard">
          <div className="clara-wegweiser__input-card" data-testid="wegweiser-input-card">
            <div className="clara-wegweiser__context-chips" data-testid="wegweiser-context-row">
              <span className="clara-wegweiser__context-chip">{contextLocationLabel}</span>
              <span className="clara-wegweiser__context-chip clara-wegweiser__context-chip--neutral">
                {du ? 'Profil' : 'Profil'}
              </span>
              <details className="clara-wegweiser__compliance-info clara-wegweiser__compliance-info--inline">
                <summary className="clara-wegweiser__compliance-info-trigger">
                  <Info className="clara-wegweiser__compliance-info-icon" aria-hidden />
                  <span>Hinweis</span>
                </summary>
                <p className="clara-wegweiser__compliance-info-body">
                  {du
                    ? 'Keine Rechtsberatung. Keine Antragstellung durch Clara.'
                    : 'Keine Rechtsberatung. Keine Antragstellung durch Clara.'}
                </p>
              </details>
            </div>
            <div className="clara-wegweiser__input-card-head">
              <label htmlFor={caseInput.textareaId} className="clara-wegweiser__textarea-label">
                {du ? 'Deine Situation' : 'Ihre Situation'}
              </label>
              {caseInput.speechSupported ? (
                <button
                  type="button"
                  className={
                    'clara-wegweiser__dictate-btn' +
                    (caseInput.speechListening ? ' clara-wegweiser__dictate-btn--listening' : '')
                  }
                  onClick={caseInput.startSpeechInput}
                  aria-pressed={caseInput.speechListening}
                  data-testid="wegweiser-dictate-btn"
                >
                  <Mic className="clara-wegweiser__dictate-icon" aria-hidden />
                  {caseInput.speechListening
                    ? du
                      ? 'Hört zu…'
                      : 'Hört zu…'
                    : du
                      ? 'Diktieren'
                      : 'Diktieren'}
                </button>
              ) : null}
            </div>
            <p className="clara-wegweiser__field-help" data-testid="wegweiser-field-help">
              {caseInput.canSubmit ? readyHelpText : fieldHelpText}
            </p>
            <div className="clara-wegweiser__input-composer">
              <textarea
                id={caseInput.textareaId}
                ref={caseInput.textareaRef}
                value={caseInput.text}
                onChange={(e) => caseInput.setText(e.target.value)}
                rows={1}
                placeholder={PLACEHOLDER}
                className="clara-wegweiser__textarea"
                data-testid="wegweiser-textarea"
              />
            </div>
            <button
              type="button"
              onClick={caseInput.handleAnalyze}
              disabled={!caseInput.canSubmit}
              className={
                'clara-wegweiser__cta-primary btn-primary t-button' +
                (caseInput.canSubmit ? ' clara-wegweiser__cta-primary--ready' : '')
              }
            >
              {caseInput.analyzing ? 'Erstelle Behördenfahrplan…' : 'Behördenfahrplan erstellen'}
            </button>
          </div>

          {!caseInput.plan && !caseInput.isClarifying ? (
            <section
              className="clara-wegweiser__quick-starts"
              aria-labelledby="clara-quick-starts-heading"
              data-testid="wegweiser-quick-starts"
            >
              <h3 id="clara-quick-starts-heading" className="clara-wegweiser__quick-starts-title">
                {du ? 'Häufige Fälle' : 'Häufige Fälle'}
              </h3>
              <ul className="clara-wegweiser__example-rows">
                {QUICK_START_ROWS.map((row) => (
                  <li key={row.key}>
                    <button
                      type="button"
                      onClick={() => loadQuickStart(row)}
                      className="clara-wegweiser__example-row"
                    >
                      <span>{row.title}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      {caseInput.plan ? (
        <div ref={resultRef} className="clara-wegweiser__result">
          <div className="clara-wegweiser__result-header">
            <h3 className="clara-wegweiser__result-title">
              {du ? 'Dein Fahrplan' : 'Ihr Fahrplan'}
            </h3>
            <button
              type="button"
              onClick={caseInput.handleClear}
              className="clara-wegweiser__result-reset"
            >
              {du ? 'Neuer Fall' : 'Neuer Fall'}
            </button>
          </div>
          <CivicCasePlan plan={caseInput.plan} du={du} onEditContext={caseInput.handleEditContext} />
        </div>
      ) : null}
        </>
      )}
    </div>
  );
}
