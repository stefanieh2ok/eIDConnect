'use client';

import { useState, useCallback } from 'react';
import { logAuditEvent } from '@/lib/security/audit';

export type SensitiveContentProps = {
  children: React.ReactNode;
  /** Eindeutige Kennung fürs Audit (z. B. Modul- oder Bereichs-ID). */
  label?: string;
  /** Blur-Stärke (px). */
  blurPx?: number;
  /** Nach Inaktivität (ms) wieder verdecken. 0 = aus. */
  autoHideAfterMs?: number;
  className?: string;
};

/**
 * Vertraulicher Inhalt: erst nach Klick sichtbar, Reveal wird geloggt.
 * Nur Abschreckung/Zuordenbarkeit, kein technischer Kopierschutz.
 */
export function SensitiveContent({
  children,
  label = 'sensitive',
  blurPx = 8,
  autoHideAfterMs = 0,
  className = '',
}: SensitiveContentProps) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = useCallback(() => {
    if (revealed) return;
    setRevealed(true);
    logAuditEvent({
      eventType: 'sensitive_content_revealed',
      eventData: { label },
    });
  }, [revealed, label]);

  return (
    <div className={`relative ${className}`}>
      {!revealed ? (
        <>
          <div
            className="transition-all duration-200"
            style={{
              filter: `blur(${blurPx}px)`,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
            aria-hidden
          >
            {children}
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center bg-gray-900/20 rounded-lg relative"
            style={{ backdropFilter: `blur(${Math.min(blurPx, 4)}px)` }}
          >
            <button
              type="button"
              onClick={handleReveal}
              className="px-4 py-2.5 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Vertraulichen Inhalt anzeigen
            </button>
            <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-600 pointer-events-none">
              Zugriff wird protokolliert
            </p>
          </div>
        </>
      ) : (
        <div className="relative">
          {children}
          <p className="text-[10px] text-gray-400 mt-1">Dieser Inhalt ist vertraulich. Nicht zur Weitergabe bestimmt.</p>
        </div>
      )}
    </div>
  );
}
