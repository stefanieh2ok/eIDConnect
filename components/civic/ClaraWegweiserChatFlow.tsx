'use client';

import React, { useEffect } from 'react';
import type { GuidedIntakeResult, IntakeAnswerMap, IntakeQuestion } from '@/lib/civic/civicGuidedIntake';
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';
import {
  buildCompactAnsweredSummary,
  illnessGuidanceText,
  shouldShowIllnessGuidance,
} from '@/lib/civic/wegweiserChatFlow';
import { countSelectableClarificationOptions } from '@/lib/civic/wegweiserFamilyIntake';

type Props = {
  intake: GuidedIntakeResult;
  answers: IntakeAnswerMap;
  activeQuestionIndex: number;
  onAnswer: (questionId: string, value: string) => void;
  onClassifierSelect: (journeyId: CivicJourneyId) => void;
  onAdvance: () => void;
  onSkipQuestion: () => void;
  onSubmitSkip: () => void;
  analyzing?: boolean;
  du?: boolean;
};

function AnswerChips({
  question,
  selected,
  onSelect,
}: {
  question: IntakeQuestion;
  selected?: string;
  onSelect: (value: string) => void;
}) {
  const chipOptions = (question.options ?? []).filter((opt) => opt.value !== 'skip');

  if (chipOptions.length === 0) {
    return (
      <p className="wegweiser-clara-chat__question-helper" role="note" data-testid="intake-q-empty">
        Für diese Frage gibt es keine passenden Antwortoptionen — du kannst den Fahrplan trotzdem erstellen.
      </p>
    );
  }

  return (
    <fieldset className="wegweiser-clara-chat__question" data-testid={`intake-q-${question.id}`}>
      <legend className="wegweiser-clara-chat__question-label">{question.label}</legend>
      {question.helper ? (
        <p className="wegweiser-clara-chat__question-helper">{question.helper}</p>
      ) : null}
      <div className="wegweiser-clara-chat__chips" role="group">
        {chipOptions.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className={
                'wegweiser-clara-chat__chip' +
                (isSelected ? ' wegweiser-clara-chat__chip--selected' : '')
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

export function ClaraWegweiserChatFlow({
  intake,
  answers,
  activeQuestionIndex,
  onAnswer,
  onClassifierSelect,
  onAdvance,
  onSkipQuestion,
  onSubmitSkip,
  analyzing = false,
  du = true,
}: Props) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const shell = document.querySelector('.civic-app-shell');
    const scrollEl = document.getElementById('main-content');
    const prevScrollOverflow = scrollEl?.style.overflow ?? '';

    if (scrollEl) scrollEl.style.overflow = 'hidden';
    document.documentElement.setAttribute('data-clara-clarification-open', 'true');
    shell?.setAttribute('data-clara-clarification-open', 'true');

    return () => {
      if (scrollEl) scrollEl.style.overflow = prevScrollOverflow;
      document.documentElement.removeAttribute('data-clara-clarification-open');
      shell?.removeAttribute('data-clara-clarification-open');
    };
  }, []);

  const questions = intake.questions;
  const currentQuestion = intake.lowConfidence ? null : questions[activeQuestionIndex] ?? null;
  const totalQuestions = questions.length;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const hasCurrentAnswer = Boolean(currentAnswer && currentAnswer !== 'skip');
  const selectableCount = currentQuestion ? countSelectableClarificationOptions(currentQuestion) : 0;
  const noValidQuestionOptions = Boolean(currentQuestion && selectableCount === 0);
  const progressLabel =
    !intake.lowConfidence && totalQuestions > 0
      ? `Frage ${Math.min(activeQuestionIndex + 1, totalQuestions)} von ${totalQuestions}`
      : null;

  const answeredSummary = buildCompactAnsweredSummary(answers, questions, activeQuestionIndex);
  const showIllnessNote = shouldShowIllnessGuidance(answers);

  const introBubble =
    intake.journeyId === 'job_loss_unemployment'
      ? du
        ? 'Ich glaube, es geht um Kündigung & Arbeitslosigkeit.'
        : 'Ich glaube, es geht um Kündigung & Arbeitslosigkeit.'
      : intake.introMessage.split('\n\n')[0];

  return (
    <section
      className="wegweiser-clara-chat"
      data-testid="clara-wegweiser-chat-flow"
      aria-labelledby="wegweiser-clara-chat-title"
    >
      <header className="wegweiser-clara-chat__head">
        <p className="clara-wegweiser__micro-label clara-wegweiser__micro-label--lavender">
          Clara Wegweiser
        </p>
        <h2 id="wegweiser-clara-chat-title" className="wegweiser-clara-chat__title">
          Clara fragt kurz nach
        </h2>
        <p className="wegweiser-clara-chat__subtitle">
          {du
            ? 'Mit ein paar Angaben wird dein Fahrplan genauer.'
            : 'Mit ein paar Angaben wird Ihr Fahrplan genauer.'}
        </p>
      </header>

      <div className="wegweiser-clara-chat__thread">
        {intake.safeGuidance && intake.integrityClass !== 'normal_help' ? (
          <div className="wegweiser-clara-chat__bubble wegweiser-clara-chat__bubble--clara" role="note">
            {intake.safeGuidance}
          </div>
        ) : null}

        <div
          className="wegweiser-clara-chat__bubble wegweiser-clara-chat__bubble--clara"
          data-testid="clara-chat-intro"
        >
          {introBubble}
        </div>

        {answeredSummary ? (
          <p className="wegweiser-clara-chat__answered" data-testid="clara-chat-answered-summary">
            {du ? 'Bisher: ' : 'Bisher: '}
            {answeredSummary}
          </p>
        ) : null}

        {showIllnessNote ? (
          <div
            className="wegweiser-clara-chat__bubble wegweiser-clara-chat__bubble--clara wegweiser-clara-chat__bubble--note"
            data-testid="clara-chat-illness-guidance"
            role="note"
          >
            {illnessGuidanceText(du)}
          </div>
        ) : null}

        {intake.lowConfidence && intake.classifierOptions?.length ? (
          <div className="wegweiser-clara-chat__active" data-testid="intake-classifier">
            <p className="wegweiser-clara-chat__bubble wegweiser-clara-chat__bubble--clara">
              {intake.introMessage}
            </p>
            <p className="wegweiser-clara-chat__question-label">
              {du ? 'Worum geht es am ehesten?' : 'Worum geht es am ehesten?'}
            </p>
            <div className="wegweiser-clara-chat__chips">
              {intake.classifierOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="wegweiser-clara-chat__chip"
                  onClick={() => onClassifierSelect(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ) : currentQuestion ? (
          <div className="wegweiser-clara-chat__active">
            {progressLabel ? (
              <p className="wegweiser-clara-chat__progress" data-testid="clarification-progress">
                {progressLabel}
              </p>
            ) : null}
            <div className="wegweiser-clara-chat__bubble wegweiser-clara-chat__bubble--clara wegweiser-clara-chat__bubble--question">
              {currentQuestion.label}
            </div>
            <AnswerChips
              question={currentQuestion}
              selected={currentAnswer}
              onSelect={(value) => onAnswer(currentQuestion.id, value)}
            />
          </div>
        ) : null}
      </div>

      {!intake.lowConfidence && !noValidQuestionOptions ? (
        <div className="wegweiser-clara-chat__actions">
          <button
            type="button"
            className="wegweiser-clara-chat__cta-primary"
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
          <div className="wegweiser-clara-chat__secondary-actions">
            <button
              type="button"
              className="wegweiser-clara-chat__cta-secondary"
              disabled={analyzing}
              onClick={onSkipQuestion}
              data-testid="clarification-skip-btn"
            >
              Überspringen
            </button>
            <button
              type="button"
              className="wegweiser-clara-chat__cta-secondary"
              disabled={analyzing}
              onClick={onSubmitSkip}
              data-testid="clarification-submit-skip-btn"
            >
              {du ? 'Fahrplan trotzdem erstellen' : 'Fahrplan trotzdem erstellen'}
            </button>
          </div>
        </div>
      ) : (
        <div className="wegweiser-clara-chat__actions">
          <button
            type="button"
            className="wegweiser-clara-chat__cta-primary"
            disabled={analyzing}
            onClick={onSubmitSkip}
            data-testid="clarification-submit-skip-btn"
          >
            {analyzing ? 'Erstelle Behördenfahrplan…' : du ? 'Fahrplan trotzdem erstellen' : 'Fahrplan trotzdem erstellen'}
          </button>
        </div>
      )}

      <p className="wegweiser-clara-chat__disclaimer">
        Keine Rechtsberatung. Clara reicht nichts ein — verbindlich entscheidet die zuständige Stelle.
      </p>
    </section>
  );
}
