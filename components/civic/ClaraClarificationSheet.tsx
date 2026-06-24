'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { GuidedIntakeResult, IntakeAnswerMap, IntakeQuestion } from '@/lib/civic/civicGuidedIntake';
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';
import { getCivicAppModalRoot } from '@/lib/civic/civicAppModalRoot';

type Props = {
  open: boolean;
  intake: GuidedIntakeResult;
  answers: IntakeAnswerMap;
  activeQuestionIndex: number;
  onAnswer: (questionId: string, value: string) => void;
  onClassifierSelect: (journeyId: CivicJourneyId) => void;
  onAdvance: () => void;
  onSkipQuestion: () => void;
  onSubmitSkip: () => void;
  onClose: () => void;
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
  const chipOptions = (question.options ?? []).filter((opt) => opt.value !== 'skip');

  return (
    <fieldset
      className="clara-clarification-sheet__question"
      data-testid={`intake-q-${question.id}`}
    >
      <legend className="clara-clarification-sheet__question-label">{question.label}</legend>
      {question.helper ? (
        <p className="clara-clarification-sheet__question-helper">{question.helper}</p>
      ) : null}
      <div className="clara-clarification-sheet__options" role="group">
        {chipOptions.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className={
                'clara-clarification-sheet__chip' +
                (isSelected ? ' clara-clarification-sheet__chip--selected' : '')
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

export function ClaraClarificationSheet({
  open,
  intake,
  answers,
  activeQuestionIndex,
  onAnswer,
  onClassifierSelect,
  onAdvance,
  onSkipQuestion,
  onSubmitSkip,
  onClose,
  analyzing = false,
  du = true,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!open || typeof document === 'undefined') {
      setPortalRoot(null);
      return;
    }
    setPortalRoot(getCivicAppModalRoot());
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;

    const shell = document.querySelector('.civic-app-shell');
    const scrollEl = document.getElementById('main-content');
    const modalRoot = getCivicAppModalRoot();
    const prevScrollOverflow = scrollEl?.style.overflow ?? '';
    const prevBodyOverflow = document.body.style.overflow;

    if (scrollEl) scrollEl.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.setAttribute('data-clara-clarification-open', 'true');
    shell?.setAttribute('data-clara-clarification-open', 'true');
    modalRoot?.setAttribute('aria-hidden', 'false');

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (scrollEl) scrollEl.style.overflow = prevScrollOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.removeAttribute('data-clara-clarification-open');
      shell?.removeAttribute('data-clara-clarification-open');
      modalRoot?.setAttribute('aria-hidden', 'true');
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined' || !portalRoot) return null;

  const questions = intake.questions;
  const currentQuestion = intake.lowConfidence ? null : questions[activeQuestionIndex] ?? null;
  const totalQuestions = questions.length;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const hasCurrentAnswer = Boolean(currentAnswer && currentAnswer !== 'skip');
  const progressLabel =
    !intake.lowConfidence && totalQuestions > 0
      ? `Frage ${Math.min(activeQuestionIndex + 1, totalQuestions)} von ${totalQuestions}`
      : null;

  const introLead = du
    ? 'Ich habe deine Lage erkannt. Mit ein paar Angaben wird dein Fahrplan genauer.'
    : 'Ich habe Ihre Lage erkannt. Mit ein paar Angaben wird Ihr Fahrplan genauer.';

  return createPortal(
    <div
      className="clara-clarification-sheet-overlay clara-clarification-sheet-overlay--app-contained"
      role="presentation"
      onClick={onClose}
      data-testid="clara-clarification-overlay"
      data-app-contained="true"
    >
      <section
        className="clara-clarification-sheet clara-clarification-sheet--app-contained"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clara-clarification-title"
        data-testid="clara-clarification-sheet"
        data-app-contained="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="clara-clarification-sheet__header">
          <div className="clara-clarification-sheet__grab" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="clara-clarification-sheet__kicker">Clara Wegweiser</p>
            <h2 id="clara-clarification-title" className="clara-clarification-sheet__title">
              {du ? 'Clara fragt kurz nach' : 'Clara fragt kurz nach'}
            </h2>
            <p className="clara-clarification-sheet__intro">{introLead}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="clara-clarification-sheet__close clara-hit-target"
            aria-label="Klärung schließen und Fahrplan erstellen"
          >
            <X size={20} aria-hidden />
          </button>
        </header>

        <div className="clara-clarification-sheet__scroll">
          <p className="clara-clarification-sheet__context">{intake.introMessage}</p>

          {intake.safeGuidance && intake.integrityClass !== 'normal_help' ? (
            <aside
              className="clara-clarification-sheet__safe-guidance"
              role="note"
              data-testid="intake-safe-guidance"
            >
              {intake.safeGuidanceSteps?.length ? (
                <ul className="clara-clarification-sheet__safe-list">
                  {intake.safeGuidanceSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              ) : null}
            </aside>
          ) : null}

          {intake.lowConfidence && intake.classifierOptions?.length ? (
            <div className="clara-clarification-sheet__classifier" data-testid="intake-classifier">
              <p className="clara-clarification-sheet__classifier-label">
                {du ? 'Worum geht es am ehesten?' : 'Worum geht es am ehesten?'}
              </p>
              <div className="clara-clarification-sheet__options">
                {intake.classifierOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="clara-clarification-sheet__chip"
                    onClick={() => onClassifierSelect(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : currentQuestion ? (
            <>
              {progressLabel ? (
                <p className="clara-clarification-sheet__progress" data-testid="clarification-progress">
                  {progressLabel}
                </p>
              ) : null}
              <QuestionBlock
                question={currentQuestion}
                selected={currentAnswer}
                onSelect={(value) => onAnswer(currentQuestion.id, value)}
              />
            </>
          ) : null}
        </div>

        {!intake.lowConfidence ? (
          <div className="clara-clarification-sheet__actions">
            <button
              type="button"
              className="clara-clarification-sheet__cta-primary"
              disabled={analyzing || !hasCurrentAnswer}
              onClick={onAdvance}
              data-testid="clarification-advance-btn"
            >
              {analyzing
                ? 'Erstelle Behördenfahrplan…'
                : activeQuestionIndex >= totalQuestions - 1
                  ? 'Fahrplan erstellen'
                  : 'Weiter'}
            </button>
            <div className="clara-clarification-sheet__secondary-actions">
              <button
                type="button"
                className="clara-clarification-sheet__cta-secondary"
                disabled={analyzing}
                onClick={onSkipQuestion}
                data-testid="clarification-skip-btn"
              >
                Überspringen
              </button>
              <button
                type="button"
                className="clara-clarification-sheet__cta-secondary"
                disabled={analyzing}
                onClick={onSubmitSkip}
                data-testid="clarification-submit-skip-btn"
              >
                {du ? 'Fahrplan trotzdem erstellen' : 'Fahrplan trotzdem erstellen'}
              </button>
            </div>
          </div>
        ) : (
          <div className="clara-clarification-sheet__actions">
            <button
              type="button"
              className="clara-clarification-sheet__cta-secondary"
              disabled={analyzing}
              onClick={onSubmitSkip}
              data-testid="clarification-submit-skip-btn"
            >
              {du ? 'Fahrplan trotzdem erstellen' : 'Fahrplan trotzdem erstellen'}
            </button>
          </div>
        )}

        <p className="clara-clarification-sheet__disclaimer">
          Keine Rechtsberatung. Clara reicht nichts ein — verbindlich entscheidet die zuständige Stelle.
        </p>
      </section>
    </div>,
    portalRoot,
  );
}
