'use client';

import type { ReactNode } from 'react';

export type CivicSegmentOption<T extends string> = {
  value: T;
  label: ReactNode;
  /** Optional count badge, e.g. open items. */
  count?: number;
};

type CivicSegmentedControlProps<T extends string> = {
  options: CivicSegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
};

/**
 * Segmented view switcher (tabs) — same visual family as CivicStepProgress.
 * Use for real view changes (Offen/Ergebnisse, Aktuell/Ergebnisse).
 */
export function CivicSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}: CivicSegmentedControlProps<T>) {
  return (
    <div
      className={`civic-segmented-control app-segment flex gap-1${className ? ` ${className}` : ''}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={`civic-segmented-control__btn app-segment-btn flex-1 transition-all${
              isActive ? ' civic-segmented-control__btn--active' : ''
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {option.count != null && option.count > 0 ? (
              <span className="civic-segmented-control__count"> ({option.count})</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
