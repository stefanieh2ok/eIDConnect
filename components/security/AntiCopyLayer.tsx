'use client';

import { useCallback } from 'react';

export type AntiCopyLayerProps = {
  children: React.ReactNode;
  /** Textauswahl deaktivieren (Standard: true). */
  disableSelect?: boolean;
  className?: string;
};

/**
 * Leichte UI-Abschreckung: Rechtsklick, Drag, ggf. Textauswahl deaktivieren.
 * Kein echter Kopierschutz – nur Reibung.
 */
export function AntiCopyLayer({
  children,
  disableSelect = true,
  className = '',
}: AntiCopyLayerProps) {
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className={className}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      style={
        disableSelect
          ? {
              WebkitUserSelect: 'none',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
