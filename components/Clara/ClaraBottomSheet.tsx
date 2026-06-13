'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronUp, X } from 'lucide-react';

export type ClaraSheetSize = 'half' | 'full';

type ClaraBottomSheetProps = {
  open: boolean;
  size: ClaraSheetSize;
  onClose: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  contextLabel?: string;
  onQuickAction?: (action: string) => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function ClaraBottomSheet({
  open,
  size,
  onClose,
  onExpand,
  onCollapse,
  contextLabel,
  onQuickAction,
  children,
  footer,
}: ClaraBottomSheetProps) {
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.setAttribute('data-clara-sheet-open', size);
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.removeAttribute('data-clara-sheet-open');
    };
  }, [open, size]);

  if (!open || typeof document === 'undefined') return null;

  const portalRoot = document.getElementById('clara-portal-root') ?? document.body;

  return createPortal(
    <div className="clara-sheet-overlay" role="presentation" onClick={onClose}>
      <section
        className={`clara-sheet clara-sheet--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label="Clara Assistentin"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="clara-sheet__header">
          <div className="clara-sheet__grab" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="clara-sheet__title-row">
              <h2 className="clara-sheet__title">Clara</h2>
              {size === 'half' && onExpand ? (
                <button
                  type="button"
                  onClick={onExpand}
                  className="clara-sheet__expand-btn"
                  aria-label="Clara vergrößern"
                >
                  <ChevronUp size={18} aria-hidden />
                </button>
              ) : null}
              {size === 'full' && onCollapse ? (
                <button
                  type="button"
                  onClick={onCollapse}
                  className="clara-sheet__expand-btn"
                  aria-label="Clara verkleinern"
                >
                  <ChevronUp size={18} className="rotate-180" aria-hidden />
                </button>
              ) : null}
            </div>
            <p className="clara-sheet__meta">KI-gestützt · neutral · quellenbasiert</p>
            {contextLabel ? (
              <p className="clara-sheet__context">Kontext: {contextLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="clara-hit-target clara-sheet__close"
            aria-label="Clara schließen"
          >
            <X size={20} aria-hidden />
          </button>
        </header>

        <div className="clara-sheet__quick-actions" role="toolbar" aria-label="Clara Schnellaktionen">
          {['Schritt erklären', 'Unterlagen prüfen', 'Termin vorbereiten', 'Quelle anzeigen'].map(
            (label) => (
              <button
                key={label}
                type="button"
                className="clara-sheet__quick-chip"
                onClick={() => onQuickAction?.(label)}
              >
                {label}
              </button>
            ),
          )}
        </div>

        <div className="clara-sheet__scroll">{children}</div>

        {footer ? <div className="clara-sheet__footer">{footer}</div> : null}

        <p className="clara-sheet__disclaimer">
          Clara gibt Orientierung. Verbindlich entscheidet die zuständige Stelle.
        </p>
      </section>
    </div>,
    portalRoot,
  );
}
