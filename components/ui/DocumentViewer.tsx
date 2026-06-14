'use client';

import React, { useEffect } from 'react';
import { ChevronLeft, Info, X } from 'lucide-react';

type DocumentViewerProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  sourceLabel?: string;
  onClose: () => void;
  onBack?: () => void;
  onInfo?: () => void;
  children: React.ReactNode;
};

export function DocumentViewer({
  open,
  title,
  subtitle,
  sourceLabel,
  onClose,
  onBack,
  onInfo,
  children,
}: DocumentViewerProps) {
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-document-viewer-open', 'true');
    return () => document.documentElement.removeAttribute('data-document-viewer-open');
  }, [open]);

  if (!open) return null;

  return (
    <div className="document-viewer" role="dialog" aria-modal="true" aria-label={title}>
      <header className="document-viewer__header">
        <button
          type="button"
          onClick={onBack ?? onClose}
          className="document-viewer__icon-btn"
          aria-label="Zurück"
        >
          <ChevronLeft size={22} aria-hidden />
        </button>
        <div className="document-viewer__titles">
          <h2 className="document-viewer__title">{title}</h2>
          {subtitle ? <p className="document-viewer__subtitle">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {onInfo ? (
            <button
              type="button"
              onClick={onInfo}
              className="document-viewer__icon-btn"
              aria-label="Quelle und Information"
            >
              <Info size={20} aria-hidden />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="document-viewer__icon-btn"
            aria-label="Schließen"
          >
            <X size={22} aria-hidden />
          </button>
        </div>
      </header>
      {sourceLabel ? (
        <p className="document-viewer__source">{sourceLabel}</p>
      ) : null}
      <div className="document-viewer__body">{children}</div>
    </div>
  );
}
