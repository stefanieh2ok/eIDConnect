'use client';

import { useState, useEffect, useMemo } from 'react';

const DEMO_ID = 'buerger-app';

export type WatermarkProps = {
  fullName: string;
  company: string;
  email?: string;
  demoId?: string;
  /** Opacity 0–1; default 0.12, gut auf Screenshots lesbar */
  opacity?: number;
};

function formatTimestamp(d: Date): string {
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function Watermark({
  fullName,
  company,
  email = '',
  demoId = DEMO_ID,
  opacity = 0.14,
}: WatermarkProps) {
  const [timestamp, setTimestamp] = useState(() => formatTimestamp(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(formatTimestamp(new Date()));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const line1 = [fullName, company].filter(Boolean).join(' · ');
  const line2 = email ? `${email} · ${demoId}` : demoId;
  const line3 = timestamp;
  const text = useMemo(
    () => `CONFIDENTIAL · ${line1} · ${line2} · ${line3}`.trim(),
    [line1, line2, line3]
  );

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-[-50%] flex items-center justify-center"
        style={{
          transform: 'rotate(-25deg)',
          transformOrigin: 'center center',
        }}
      >
        <div
          className="grid gap-[6vh] gap-x-[14vw]"
          style={{
            gridTemplateColumns: 'repeat(4, 1fr)',
            opacity,
            color: 'var(--watermark-color, #111827)',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 'clamp(10px, 1.8vw, 13px)',
            fontWeight: 600,
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i}>{text}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
