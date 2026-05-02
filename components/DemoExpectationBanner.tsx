'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

/**
 * Kurzes Erwartungsmanagement für die Konzeptvorschau (P1).
 */
export default function DemoExpectationBanner() {
  const { state } = useApp();
  const du = state.anrede !== 'sie';
  const [open, setOpen] = useState(false);

  const bullets = du
    ? [
        'HookAI Civic – kein produktives Verwaltungs- oder Wahlsystem.',
        'Keine rechtlich wirksame Stimmabgabe; Abstimmungen und Rückmeldungen dienen nur der Veranschaulichung.',
        'Clara: KI-gestützte Orientierung, neutral, ohne Wahlempfehlung; Antworten strukturiert nach Vorgabe.',
        'Politische Angaben nur mit verifizierbarer Primärquelle oder als „nicht verifiziert“ gekennzeichnet.',
        'Datenverarbeitung nur im Rahmen der gezeigten Vorschau-Funktionen; Details unter Info / Transparenz.',
      ]
    : [
        'HookAI Civic – kein produktives Verwaltungs- oder Wahlsystem.',
        'Keine rechtlich wirksame Stimmabgabe; Abstimmungen und Rückmeldungen dienen nur der Veranschaulichung.',
        'Clara: KI-gestützte Orientierung, neutral, ohne Wahlempfehlung; Antworten strukturiert nach Vorgabe.',
        'Politische Angaben nur mit verifizierbarer Primärquelle oder als „nicht verifiziert“ gekennzeichnet.',
        'Datenverarbeitung nur im Rahmen der gezeigten Vorschau-Funktionen; Details unter Info / Transparenz.',
      ];

  return (
    <div
      className="mx-3 mt-2 mb-1 rounded-xl border text-left shadow-sm"
      style={{
        borderColor: 'var(--gov-border)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(247,249,252,0.98) 100%)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
        aria-expanded={open}
      >
        <span className="text-[11px] font-bold leading-snug" style={{ color: 'var(--gov-heading)' }}>
          {du ? 'Was diese Vorschau zeigt – und was nicht' : 'Was diese Vorschau zeigt – und was nicht'}
        </span>
        <span className="text-[10px] font-semibold tabular-nums text-[#003366]">{open ? '▲' : '▼'}</span>
      </button>
      {open ? (
        <ul className="list-none space-y-1.5 border-t px-3 py-2.5 text-[10px] leading-snug text-[#374151]" style={{ borderColor: 'var(--gov-border)' }}>
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-bold text-[#003366]">{String.fromCharCode(97 + i)})</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
