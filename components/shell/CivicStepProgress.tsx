'use client';

import { Check } from 'lucide-react';

export type CivicStepOption = {
  key: string;
  label: string;
};

type CivicStepProgressProps = {
  steps: CivicStepOption[];
  currentIndex: number;
  ariaLabel: string;
  /** Only completed steps are clickable when provided. */
  onStepClick?: (index: number) => void;
  className?: string;
};

/**
 * Process step indicator — visually aligned with CivicSegmentedControl,
 * but semantically a non-tab stepper (aria-current="step", no free forward nav).
 */
export function CivicStepProgress({
  steps,
  currentIndex,
  ariaLabel,
  onStepClick,
  className = '',
}: CivicStepProgressProps) {
  return (
    <nav
      className={`civic-step-progress app-segment${className ? ` ${className}` : ''}`}
      aria-label={ariaLabel}
    >
      <ol className="civic-step-progress__list">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;
          const isFuture = index > currentIndex;
          const canNavigateBack = Boolean(onStepClick && isDone);

          const stepClass = [
            'civic-step-progress__step',
            isActive ? 'civic-step-progress__step--active' : '',
            isDone ? 'civic-step-progress__step--done' : '',
            isFuture ? 'civic-step-progress__step--future' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const content = (
            <>
              {isDone ? (
                <Check className="civic-step-progress__check" aria-hidden size={14} strokeWidth={2.5} />
              ) : null}
              <span className="civic-step-progress__label">{step.label}</span>
            </>
          );

          return (
            <li key={step.key} className={stepClass}>
              {canNavigateBack ? (
                <button
                  type="button"
                  className="civic-step-progress__btn"
                  onClick={() => onStepClick?.(index)}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {content}
                </button>
              ) : (
                <span
                  className="civic-step-progress__btn civic-step-progress__btn--static"
                  role="step"
                  aria-current={isActive ? 'step' : undefined}
                  aria-disabled={isFuture ? true : undefined}
                >
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
