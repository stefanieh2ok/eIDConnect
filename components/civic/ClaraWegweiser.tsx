'use client';

import React, { useMemo } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
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
  hint: string;
}[] = [
  { id: 'private', label: 'Privat', hint: 'Familie, Wohnen, Arbeit, Pflege' },
  { id: 'business', label: 'Geschäftlich', hint: 'Gewerbe, Gründung, Mitarbeitende' },
  { id: 'unsure', label: 'Ich bin unsicher', hint: 'Clara sortiert den Kontext' },
];

/** UI display metadata for example case cards (planner ids unchanged). */
const EXAMPLE_CARD_META: Record<
  string,
  { title: string; situation: string; modeTag: 'Privat' | 'Geschäftlich' }
> = {
  'move-kids': {
    title: 'Umzug mit Kindern',
    situation: 'Umzug, niedriges Einkommen, Schulwechsel, Unterstützung',
    modeTag: 'Privat',
  },
  'pflege-parent': {
    title: 'Pflegefall in der Familie',
    situation: 'Pflegebedürftigkeit, Leistungen und zuständige Stellen',
    modeTag: 'Privat',
  },
  'gewerbe-start': {
    title: 'Gewerbe anmelden',
    situation: 'Gewerbeanmeldung, Finanzamt, IHK, Gewerbeamt',
    modeTag: 'Geschäftlich',
  },
  'first-employee': {
    title: 'Erste Mitarbeitende einstellen',
    situation: 'Pflichten, Meldungen, Sozialversicherung',
    modeTag: 'Geschäftlich',
  },
};

const PLACEHOLDER =
  'Ich ziehe mit zwei Kindern um und brauche Unterstützung. Oder: Ich möchte ein Gewerbe anmelden und weiß nicht, welche Stellen ich informieren muss.';

const FLOW_STEPS = [
  'Situation beschreiben',
  'Behördenfahrplan erhalten',
  'Offizielle Wege nutzen',
] as const;

export function ClaraWegweiser({ du = true, plz, bundesland, wohnort, onPlanReady }: Props) {
  const caseInput = useClaraCaseInput({ du, plz, bundesland, wohnort, onPlanReady });

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
    ],
  );

  useClaraCaseInputBridgeRegistration(bridge);

  return (
    <div className="clara-wegweiser">
      <section
        className="clara-wegweiser__cockpit"
        aria-labelledby="clara-wegweiser-heading"
      >
        <div className="clara-wegweiser__cockpit-inner">
          <p className="clara-wegweiser__micro-label">Clara Wegweiser</p>

          <div className="clara-wegweiser__title-row">
            <span className="clara-wegweiser__icon" aria-hidden>
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="clara-wegweiser-heading" className="clara-wegweiser__headline">
                Von der Lebenslage zum Behördenfahrplan.
              </h2>
              <p className="clara-wegweiser__subheadline">
                {du
                  ? 'Beschreibe deine Situation in Alltagssprache. Clara sortiert mögliche Behördenwege, Unterlagen und nächste Schritte — bevor du den offiziellen Antrag extern stellst.'
                  : 'Beschreiben Sie Ihre Situation in Alltagssprache. Clara sortiert mögliche Behördenwege, Unterlagen und nächste Schritte — bevor Sie den offiziellen Antrag extern stellen.'}
              </p>
            </div>
          </div>

          <p className="clara-wegweiser__compliance">
            Keine Rechtsberatung. Keine Antragstellung durch Clara. Maßgeblich bleiben die Angaben
            der zuständigen Stelle.
          </p>

          <ol className="clara-wegweiser__flow" aria-label={du ? 'Ablauf' : 'Ablauf'}>
            {FLOW_STEPS.map((step, i) => (
              <li key={step} className="clara-wegweiser__flow-step">
                <span className="clara-wegweiser__flow-num" aria-hidden>
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="clara-wegweiser__input-block">
            <label htmlFor={caseInput.textareaId} className="clara-wegweiser__textarea-label">
              {du ? 'Deine Situation' : 'Ihre Situation'}
            </label>
            <textarea
              id={caseInput.textareaId}
              ref={caseInput.textareaRef}
              value={caseInput.text}
              onChange={(e) => caseInput.setText(e.target.value)}
              rows={5}
              placeholder={PLACEHOLDER}
              className="clara-wegweiser__textarea"
              aria-describedby="clara-wegweiser-dock-hint"
            />
            <p id="clara-wegweiser-dock-hint" className="clara-wegweiser__dock-hint">
              {du
                ? 'Tipp: „Clara“ unten fokussiert dieses Feld. Mit dem Mikrofon kannst du sprechen — falls dein Browser das unterstützt.'
                : 'Tipp: „Clara“ unten fokussiert dieses Feld. Mit dem Mikrofon können Sie sprechen — falls Ihr Browser das unterstützt.'}
            </p>
          </div>

          <fieldset className="clara-wegweiser__mode-fieldset">
            <legend className="clara-wegweiser__mode-legend">
              {du ? 'Kontext wählen' : 'Kontext wählen'}
            </legend>
            <div className="clara-wegweiser__mode-grid" role="group">
              {MODE_OPTIONS.map((m) => {
                const selected = caseInput.mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => caseInput.setMode(m.id)}
                    className={
                      'clara-wegweiser__mode-card' +
                      (selected ? ' clara-wegweiser__mode-card--selected' : '')
                    }
                    aria-pressed={selected}
                  >
                    <span className="clara-wegweiser__mode-card-title">{m.label}</span>
                    <span className="clara-wegweiser__mode-card-hint">{m.hint}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="clara-wegweiser__cta-row">
            <button
              type="button"
              onClick={caseInput.handleAnalyze}
              disabled={!caseInput.text.trim() || caseInput.analyzing}
              className="clara-wegweiser__cta-primary btn-primary t-button"
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
        </div>
      </section>

      {!caseInput.plan ? (
        <section className="clara-wegweiser__examples" aria-labelledby="clara-examples-heading">
          <h3 id="clara-examples-heading" className="clara-wegweiser__examples-title">
            Beispielfälle
          </h3>
          <ul className="clara-wegweiser__examples-grid">
            {caseInput.examples.map((ex) => {
              const meta = EXAMPLE_CARD_META[ex.id];
              return (
                <li key={ex.id}>
                  <button
                    type="button"
                    onClick={() => caseInput.loadExample(ex.id, false)}
                    className="clara-wegweiser__example-card"
                  >
                    <span className="clara-wegweiser__example-card-top">
                      <span className="clara-wegweiser__example-card-title">
                        {meta?.title ?? ex.label}
                      </span>
                      <span
                        className={
                          'clara-wegweiser__example-tag' +
                          (meta?.modeTag === 'Geschäftlich'
                            ? ' clara-wegweiser__example-tag--business'
                            : '')
                        }
                      >
                        {meta?.modeTag ?? (ex.mode === 'business' ? 'Geschäftlich' : 'Privat')}
                      </span>
                    </span>
                    <span className="clara-wegweiser__example-situation">
                      {meta?.situation ?? ex.label}
                    </span>
                    <span className="clara-wegweiser__example-action">
                      In Situation übernehmen
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

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
