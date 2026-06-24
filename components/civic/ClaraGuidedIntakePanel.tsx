'use client';

import React from 'react';
import type { GuidedIntakeResult, IntakeAnswerMap, IntakeQuestion } from '@/lib/civic/civicGuidedIntake';
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';

type Props = {
  intake: GuidedIntakeResult;
  answers: IntakeAnswerMap;
  onAnswer: (questionId: string, value: string) => void;
  onClassifierSelect: (journeyId: CivicJourneyId) => void;
  onSubmitWithAnswers: () => void;
  onSubmitSkip: () => void;
  analyzing?: boolean;
  du?: boolean;
};

function QuestionBlock({
  question,
  selected,
  onSelect,
}: {
  question: IntakeQuestion;
  selected?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <fieldset className="clara-guided-intake__question" data-testid={`intake-q-${question.id}`}>
      <legend className="clara-guided-intake__question-label">{question.label}</legend>
      {question.helper ? <p className="clara-guided-intake__question-helper">{question.helper}</p> : null}
      <div className="clara-guided-intake__options" role="group">
        {(question.options ?? []).map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className={
                'clara-guided-intake__chip' + (isSelected ? ' clara-guided-intake__chip--selected' : '')
              }
              aria-pressed={isSelected}
              onClick={() => onSelect(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ClaraGuidedIntakePanel({
  intake,
  answers,
  onAnswer,
  onClassifierSelect,
  onSubmitWithAnswers,
  onSubmitSkip,
  analyzing = false,
  du = true,
}: Props) {
  const hasAnswers = Object.values(answers).some((v) => v && v !== 'skip');

  return (
    <section
      className="clara-guided-intake"
      data-testid="clara-guided-intake"
      aria-labelledby="clara-guided-intake-heading"
    >
      <h3 id="clara-guided-intake-heading" className="clara-guided-intake__title">
        {du ? 'Clara stellt kurz nach' : 'Clara stellt kurz nach'}
      </h3>
      <p className="clara-guided-intake__intro">{intake.introMessage}</p>

      {intake.safeGuidance && intake.integrityClass !== 'normal_help' ? (
        <aside className="clara-guided-intake__safe-guidance" role="note" data-testid="intake-safe-guidance">
          {intake.safeGuidanceSteps?.length ? (
            <ul className="clara-guided-intake__safe-list">
              {intake.safeGuidanceSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          ) : null}
        </aside>
      ) : null}

      {intake.lowConfidence && intake.classifierOptions?.length ? (
        <div className="clara-guided-intake__classifier" data-testid="intake-classifier">
          <p className="clara-guided-intake__classifier-label">
            {du ? 'Worum geht es am ehesten?' : 'Worum geht es am ehesten?'}
          </p>
          <div className="clara-guided-intake__options">
            {intake.classifierOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="clara-guided-intake__chip"
                onClick={() => onClassifierSelect(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="clara-guided-intake__questions">
          {intake.questions.map((q) => (
            <QuestionBlock
              key={q.id}
              question={q}
              selected={answers[q.id]}
              onSelect={(v) => onAnswer(q.id, v)}
            />
          ))}
        </div>
      )}

      {!intake.lowConfidence ? (
        <div className="clara-guided-intake__actions">
          <button
            type="button"
            className="clara-guided-intake__cta-primary"
            disabled={analyzing}
            onClick={onSubmitWithAnswers}
          >
            {analyzing
              ? 'Erstelle Behördenfahrplan…'
              : hasAnswers
                ? 'Fahrplan mit Antworten erstellen'
                : 'Fragen beantworten & Fahrplan erstellen'}
          </button>
          <button
            type="button"
            className="clara-guided-intake__cta-secondary"
            disabled={analyzing}
            onClick={onSubmitSkip}
          >
            {du ? 'Fahrplan trotzdem erstellen' : 'Fahrplan trotzdem erstellen'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
