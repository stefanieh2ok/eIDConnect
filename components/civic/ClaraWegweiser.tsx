'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  useClaraCaseInputBridgeRegistration,
  type ClaraCaseInputBridge,
} from '@/context/ClaraCaseInputContext';
import { useClaraCaseInput } from '@/hooks/useClaraCaseInput';
import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import { CivicCasePlan } from '@/components/civic/CivicCasePlan';

export type ClaraWegweiserMode = 'private' | 'business' | 'unsure';

type Props = {
  du?: boolean;
  plz?: string;
  bundesland?: string;
  wohnort?: string;
  onPlanReady?: (plan: CivicCasePlanResult) => void;
};

const MODE_OPTIONS: {
  id: ClaraWegweiserMode;
  label: string;
}[] = [
  { id: 'private', label: 'Privat' },
  { id: 'business', label: 'Geschäftlich' },
  { id: 'unsure', label: 'Ich bin unsicher' },
];

const PLACEHOLDER =
  'Ich bekomme ein Kind und möchte wissen, welche Unterlagen ich brauche — z. B. Elterngeld, Kindergeld, Kita oder Krankenversicherung.';

const GEBURT_KITA_PRESET =
  'Ich bekomme ein Kind und möchte wissen, welche Unterlagen ich brauche — z. B. Elterngeld, Kindergeld, Kita-Anmeldung und Krankenversicherung.';

const EXAMPLE_ROWS: {
  key: string;
  title: string;
  exampleId?: string;
  presetText?: string;
  mode?: ClaraWegweiserMode;
}[] = [
  { key: 'geburt-kita', title: 'Geburt & Kita', presetText: GEBURT_KITA_PRESET, mode: 'private' },
  { key: 'move-kids', title: 'Umzug mit Kindern', exampleId: 'move-kids' },
  { key: 'pflege-parent', title: 'Pflegefall', exampleId: 'pflege-parent' },
  { key: 'gewerbe-start', title: 'Gewerbe anmelden', exampleId: 'gewerbe-start' },
];

export function ClaraWegweiser({ du = true, plz, bundesland, wohnort, onPlanReady }: Props) {
  const caseInput = useClaraCaseInput({ du, plz, bundesland, wohnort, onPlanReady });
  const inputWorkflowRef = useRef<HTMLDivElement | null>(null);
  const [inputScrolledPast, setInputScrolledPast] = useState(false);

  const showFloatingDock = Boolean(caseInput.plan) || inputScrolledPast;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.getElementById('main-content');
    const target = inputWorkflowRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInputScrolledPast(!entry.isIntersecting);
      },
      { root, threshold: 0, rootMargin: '-8px 0px 0px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

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

  const loadExampleRow = (row: (typeof EXAMPLE_ROWS)[number]) => {
    if (row.exampleId) {
      caseInput.loadExample(row.exampleId, false);
      return;
    }
    if (row.presetText) {
      caseInput.setText(row.presetText);
      if (row.mode) caseInput.setMode(row.mode);
      caseInput.textareaRef.current?.focus();
    }
  };

  return (
    <div className="clara-wegweiser clara-wegweiser--workflow">
      <div ref={inputWorkflowRef} className="clara-wegweiser__workflow">
        <header className="clara-wegweiser__workflow-header">
          <p className="clara-wegweiser__micro-label">Clara Wegweiser</p>
          <h2 id="clara-wegweiser-heading" className="clara-wegweiser__headline">
            Von der Lebenslage zum Behördenfahrplan.
          </h2>
          <p className="clara-wegweiser__subheadline">
            {du
              ? 'Beschreibe deine Situation. Clara sortiert mögliche Behördenwege, Unterlagen und nächste Schritte.'
              : 'Beschreiben Sie Ihre Situation. Clara sortiert mögliche Behördenwege, Unterlagen und nächste Schritte.'}
          </p>
          <p className="clara-wegweiser__compliance clara-wegweiser__compliance--inline">
            Keine Rechtsberatung. Keine Antragstellung durch Clara.
          </p>
        </header>

        <div className="clara-wegweiser__input-block">
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
        </div>

        <fieldset className="clara-wegweiser__mode-fieldset">
          <legend className="clara-wegweiser__mode-legend sr-only">
            {du ? 'Kontext wählen' : 'Kontext wählen'}
          </legend>
          <div className="clara-wegweiser__mode-segment" role="group" aria-label={du ? 'Kontext wählen' : 'Kontext wählen'}>
            {MODE_OPTIONS.map((m) => {
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
        </fieldset>

        <div className="clara-wegweiser__submit-block">
          <div className="clara-wegweiser__cta-row">
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
            <button
              type="button"
              onClick={() => caseInput.loadExample('move-kids', false)}
              className="clara-wegweiser__cta-secondary btn-ghost t-button"
            >
              Beispielfall laden
            </button>
          </div>
          <p
            className="clara-wegweiser__submit-hint"
            aria-live="polite"
          >
            {caseInput.canSubmit
              ? du
                ? 'Bereit — Clara erstellt deinen Behördenfahrplan aus deiner Situation.'
                : 'Bereit — Clara erstellt Ihren Behördenfahrplan aus Ihrer Situation.'
              : du
                ? 'Beschreibe kurz deine Situation, dann erstellt Clara deinen Behördenfahrplan.'
                : 'Beschreiben Sie kurz Ihre Situation, dann erstellt Clara Ihren Behördenfahrplan.'}
          </p>
        </div>

        {!caseInput.plan ? (
          <section className="clara-wegweiser__examples" aria-labelledby="clara-examples-heading">
            <h3 id="clara-examples-heading" className="clara-wegweiser__examples-title">
              Beispielfälle
            </h3>
            <ul className="clara-wegweiser__example-rows">
              {EXAMPLE_ROWS.map((row) => (
                <li key={row.key}>
                  <button
                    type="button"
                    onClick={() => loadExampleRow(row)}
                    className="clara-wegweiser__example-row"
                  >
                    <span>{row.title}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {caseInput.plan ? (
        <div className="clara-wegweiser__result">
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
