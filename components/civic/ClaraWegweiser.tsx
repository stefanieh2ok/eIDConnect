'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  useClaraCaseInputBridgeRegistration,
  type ClaraCaseInputBridge,
} from '@/context/ClaraCaseInputContext';
import { useClaraCaseInput } from '@/hooks/useClaraCaseInput';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import { CivicCasePlan } from '@/components/civic/CivicCasePlan';
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';
import { journeyQuickStartText } from '@/lib/civic/civicJourneyResolver';
import { getJourneyDomainLabel, getJourneyTemplateById } from '@/lib/civic/civicJourneyTemplates';
import { KIRKEL_DEMO_CONTEXT } from '@/lib/civic/demoCivicContext';

export type ClaraWegweiserMode = 'private' | 'business' | 'unsure';

type Props = {
  du?: boolean;
  plz?: string;
  bundesland?: string;
  wohnort?: string;
  onPlanReady?: (plan: CivicCasePlanResult) => void;
};

const DOMAIN_OPTIONS: {
  id: ClaraWegweiserMode;
  label: string;
}[] = [
  { id: 'private', label: 'Privat' },
  { id: 'business', label: 'Selbstständig / Unternehmen' },
  { id: 'unsure', label: 'Beides' },
];

const PLACEHOLDER =
  'Ich bekomme ein Kind und möchte wissen, welche Unterlagen ich brauche — z. B. Elterngeld, Kindergeld, Kita oder Krankenversicherung.';

const QUICK_START_ROWS: {
  key: string;
  title: string;
  journeyId: CivicJourneyId;
  exampleId?: string;
}[] = [
  { key: 'geburt-kita', title: 'Geburt & Kita', journeyId: 'child_birth_kita' },
  { key: 'umzug', title: 'Umzug', journeyId: 'moving_with_children' },
  { key: 'wohngeld', title: 'Wohngeld & Unterstützung', journeyId: 'housing_benefits' },
  { key: 'pflege', title: 'Pflegefall', journeyId: 'care_family', exampleId: 'pflege-parent' },
  { key: 'passport', title: 'Reisepass & Ausweis', journeyId: 'passport_id' },
  { key: 'gewerbe', title: 'Gewerbe anmelden', journeyId: 'business_registration', exampleId: 'gewerbe-start' },
  { key: 'arbeitgeber', title: 'Arbeitgeber werden', journeyId: 'employer_first_hire', exampleId: 'first-employee' },
];

export function ClaraWegweiser({ du = true, plz, bundesland, wohnort, onPlanReady }: Props) {
  const caseInput = useClaraCaseInput({ du, plz, bundesland, wohnort, onPlanReady });
  const dockVisibilityGuardRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [inputGuardScrolledPast, setInputGuardScrolledPast] = React.useState(false);

  const showFloatingDock = inputGuardScrolledPast;

  const domainChipLabel = useMemo(() => {
    if (caseInput.journeyHint) {
      return getJourneyDomainLabel(caseInput.journeyHint, du);
    }
    if (caseInput.mode === 'business') return du ? 'Unternehmen' : 'Unternehmen';
    if (caseInput.mode === 'private') return du ? 'Privat' : 'Privat';
    return null;
  }, [caseInput.journeyHint, caseInput.mode, du]);

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
      return;
    }
    caseInput.loadJourneyQuickStart(row.journeyId, preset);
  };

  return (
    <div className="clara-wegweiser clara-wegweiser--workflow clara-wegweiser--kirkel">
      <div className="clara-wegweiser__workflow">
        <header className="clara-wegweiser__workflow-header">
          <p className="clara-wegweiser__micro-label clara-wegweiser__micro-label--lavender">
            Clara Wegweiser
          </p>
          <h2 id="clara-wegweiser-heading" className="clara-wegweiser__headline">
            {du
              ? 'Behördenwege in Kirkel strukturiert vorbereiten.'
              : 'Behördenwege in Kirkel strukturiert vorbereiten.'}
          </h2>
          <p className="clara-wegweiser__subheadline">
            {du
              ? 'Beschreibe deine Situation oder wähle einen Startpunkt. Clara führt dich Schritt für Schritt durch Unterlagen, Stellen und nächste Schritte.'
              : 'Beschreiben Sie Ihre Situation oder wählen Sie einen Startpunkt. Clara führt Sie Schritt für Schritt durch Unterlagen, Stellen und nächste Schritte.'}
          </p>
          <p className="clara-wegweiser__compliance clara-wegweiser__compliance--inline">
            Keine Rechtsberatung. Keine Antragstellung durch Clara.
          </p>
          <div
            className="clara-wegweiser__context-chips"
            data-testid="wegweiser-context-chips"
            aria-label={du ? 'Demo-Kontext' : 'Demo-Kontext'}
          >
            <span className="clara-wegweiser__context-chip">{KIRKEL_DEMO_CONTEXT.municipality}</span>
            <span className="clara-wegweiser__context-chip">
              {du ? 'Identifiziert' : 'Identifiziert'}
            </span>
            {domainChipLabel ? (
              <span className="clara-wegweiser__context-chip clara-wegweiser__context-chip--domain">
                {domainChipLabel}
              </span>
            ) : null}
          </div>
        </header>

        <div ref={dockVisibilityGuardRef} className="clara-wegweiser__dock-guard">
          <div className="clara-wegweiser__input-card" data-testid="wegweiser-input-card">
            <label htmlFor={caseInput.textareaId} className="clara-wegweiser__textarea-label">
              {du ? 'Deine Situation' : 'Ihre Situation'}
            </label>
            <textarea
              id={caseInput.textareaId}
              ref={caseInput.textareaRef}
              value={caseInput.text}
              onChange={(e) => caseInput.setText(e.target.value)}
              rows={3}
              placeholder={PLACEHOLDER}
              className="clara-wegweiser__textarea"
            />
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
            <p className="clara-wegweiser__submit-hint" aria-live="polite">
              {caseInput.canSubmit
                ? du
                  ? 'Bereit — Clara erstellt deinen Behördenfahrplan für Kirkel.'
                  : 'Bereit — Clara erstellt Ihren Behördenfahrplan für Kirkel.'
                : du
                  ? 'Beschreibe kurz deine Situation oder wähle einen Startpunkt.'
                  : 'Beschreiben Sie kurz Ihre Situation oder wählen Sie einen Startpunkt.'}
            </p>
          </div>

          {!caseInput.plan ? (
            <>
              <section
                className="clara-wegweiser__quick-starts"
                aria-labelledby="clara-quick-starts-heading"
                data-testid="wegweiser-quick-starts"
              >
                <h3 id="clara-quick-starts-heading" className="clara-wegweiser__quick-starts-title">
                  {du ? 'Oder wähle einen Startpunkt' : 'Oder wählen Sie einen Startpunkt'}
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
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section
                className="clara-wegweiser__domain-fieldset"
                data-testid="wegweiser-domain-fieldset"
                aria-labelledby="clara-domain-heading"
              >
                <h3 id="clara-domain-heading" className="clara-wegweiser__domain-title">
                  Bereich
                </h3>
                <div
                  className="clara-wegweiser__mode-segment"
                  role="group"
                  aria-label={du ? 'Bereich' : 'Bereich'}
                >
                  {DOMAIN_OPTIONS.map((m) => {
                    const selected = caseInput.mode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => caseInput.setMode(m.id)}
                        className={
                          'clara-wegweiser__mode-segment-btn' +
                          (selected ? ' clara-wegweiser__mode-segment-btn--selected' : '')
                        }
                        aria-pressed={selected}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          ) : null}
        </div>
      </div>

      {caseInput.plan ? (
        <div ref={resultRef} className="clara-wegweiser__result">
          <div className="clara-wegweiser__result-header">
            <h3 className="clara-wegweiser__result-title">
              {du ? 'Dein Behördenfahrplan' : 'Ihr Behördenfahrplan'}
            </h3>
            <button
              type="button"
              onClick={caseInput.handleClear}
              className="clara-wegweiser__result-reset"
            >
              {du ? 'Neuer Fall' : 'Neuer Fall'}
            </button>
          </div>
          <CivicCasePlan plan={caseInput.plan} du={du} />
        </div>
      ) : null}
    </div>
  );
}
