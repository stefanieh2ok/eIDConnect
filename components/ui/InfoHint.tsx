'use client';

import React, { useId, useRef, useState } from 'react';
import { Info } from 'lucide-react';

type InfoHintProps = {
  label?: string;
  children: React.ReactNode;
  className?: string;
};

export function InfoHint({ label = 'Weitere Information', children, className = '' }: InfoHintProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);

  return (
    <span ref={rootRef} className={`info-hint ${className}`.trim()}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
        className="info-hint__trigger"
        aria-label={label}
      >
        <Info size={13} strokeWidth={2.2} aria-hidden />
      </button>
      {open ? (
        <span
          id={panelId}
          role="tooltip"
          className="info-hint__panel"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </span>
      ) : null}
    </span>
  );
}
