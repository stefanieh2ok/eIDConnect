'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { EbeneLevel } from '@/types';

export type CalendarGeoScope = 'all' | EbeneLevel;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const LABEL: Record<CalendarGeoScope, string> = {
  all: 'Alle',
  bund: 'Bund',
  land: 'Land',
  kreis: 'Kreis',
  kommune: 'Kommune',
};

type Props = {
  value: CalendarGeoScope;
  /** verfügbare Ebenen (ohne "all") */
  availableLevels: EbeneLevel[];
  onChange: (next: CalendarGeoScope) => void;
};

export function CalendarScopeFilter({ value, availableLevels, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [anchor, setAnchor] = useState<{ left: number; top: number; width: number } | null>(null);

  const options = useMemo(() => {
    const opts: CalendarGeoScope[] = ['all'];
    for (const l of ['bund', 'land', 'kreis', 'kommune'] as const) {
      if (availableLevels.includes(l)) opts.push(l);
    }
    return opts;
  }, [availableLevels]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="Kalender-Filter"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          const r = btnRef.current?.getBoundingClientRect();
          if (r) setAnchor({ left: r.left, top: r.bottom, width: r.width });
          setOpen((p) => !p);
        }}
        className="inline-flex h-8 px-2.5 items-center justify-center rounded-full border border-neutral-200 bg-white/75 text-neutral-700 text-[11px] font-semibold shadow-sm backdrop-blur hover:bg-white"
      >
        Filter
      </button>

      {open && anchor && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className="fixed z-[61] rounded-xl border border-neutral-200 bg-white/96 py-1 shadow-xl backdrop-blur-xl"
            style={{
              top: anchor.top + 6,
              left: clamp(anchor.left + anchor.width - 180, 8, window.innerWidth - 188),
              width: 180,
            }}
            role="menu"
            aria-label="Kalender Ebenen auswählen"
          >
            {options.map((opt) => {
              const selected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-[11px] text-neutral-800 hover:bg-neutral-100/80"
                  style={{ fontWeight: selected ? 700 : 600 }}
                >
                  <span className="flex items-center justify-between">
                    <span>{LABEL[opt]}</span>
                    {selected ? <span className="text-neutral-500">✓</span> : <span className="w-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

