'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

type ExternalLinkContextValue = {
  openExternal: (url: string, label?: string) => void;
};

const ExternalLinkContext = createContext<ExternalLinkContextValue | null>(null);

export function useExternalLink() {
  const ctx = useContext(ExternalLinkContext);
  return ctx;
}

export function ExternalLinkProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<{ url: string; label?: string } | null>(null);

  const openExternal = useCallback((url: string, label?: string) => {
    setModal({ url, label });
  }, []);

  const handleConfirm = useCallback(() => {
    if (modal?.url) {
      window.open(modal.url, '_blank', 'noopener,noreferrer');
    }
    setModal(null);
  }, [modal?.url]);

  const handleCancel = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <ExternalLinkContext.Provider value={{ openExternal }}>
      {children}
      {modal && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 1rem)' }}
          onClick={handleCancel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="external-link-title"
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="external-link-title" className="text-lg font-bold text-gray-900 mb-2">
              App verlassen?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Sie verlassen die eIDConnect-App. Möchten Sie diese Seite in einem externen Browser (z. B. Safari, Chrome) öffnen?
            </p>
            <p className="text-xs text-gray-500 mb-4 truncate" title={modal.url}>
              {modal.label || modal.url}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ background: 'var(--gov-btn, #0066cc)' }}
              >
                Öffnen
              </button>
            </div>
          </div>
        </div>
      )}
    </ExternalLinkContext.Provider>
  );
}

type ExternalLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  label?: string;
};

/** Link, der vor dem Öffnen eine Bestätigung anzeigt („App verlassen?“). */
export function ExternalLink({ href, children, className, label }: ExternalLinkProps) {
  const ctx = useExternalLink();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (ctx) {
      ctx.openExternal(href, label);
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  if (ctx) {
    return (
      <a href={href} onClick={handleClick} className={className} rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
