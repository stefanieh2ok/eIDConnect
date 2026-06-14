'use client';

import React from 'react';
import {
  CIVIC_MODULE_KEYS,
  CIVIC_MODULE_STATUS,
  CIVIC_MODULE_UI_LABELS,
} from '@/lib/civicModuleStatus';
import { CIVIC_EXTERNAL_ADAPTERS } from '@/lib/adapters';
import { getAuditPersistenceDisplay } from '@/lib/security/audit-config';
import type { DemoMode, ExternalAdapterStatus } from '@/types/governance';

const DEMO_MODE_LABELS: Record<DemoMode, string> = {
  mock: 'Mock',
  demo: 'Demo',
  staged: 'Staging',
  live: 'Live',
  'external-adapter-ready': 'Adapter-ready',
};

const ADAPTER_STATUS_LABELS: Record<ExternalAdapterStatus, string> = {
  not_started: 'Nicht gestartet',
  mock_ready: 'Mock bereit',
  adapter_ready: 'Adapter bereit',
  sandbox_ready: 'Sandbox',
  production_ready: 'Produktion',
};

export function CivicDemoStatusPanel() {
  const audit = getAuditPersistenceDisplay();
  const mockAdapterCount = CIVIC_EXTERNAL_ADAPTERS.filter((a) => a.noLiveCalls).length;

  return (
    <section className="settings-shell-section" aria-labelledby="civic-demo-status-title">
      <p id="civic-demo-status-title" className="text-[13px] font-bold text-[#003366]">
        Demo- &amp; Modulstatus
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">
        Read-only Übersicht — keine echten Behördenintegrationen, keine Live-API-Calls.
      </p>

      <ul className="mt-2.5 space-y-2" aria-label="Modulstatus">
        {CIVIC_MODULE_KEYS.map((key) => {
          const entry = CIVIC_MODULE_STATUS[key];
          const label = CIVIC_MODULE_UI_LABELS[key];
          return (
            <li
              key={key}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span className="text-[11px] font-semibold text-[#1A2B45]">{label}</span>
                <span className="text-[10px] font-medium text-neutral-500">
                  {DEMO_MODE_LABELS[entry.mode]}
                  {entry.adapterStatus
                    ? ` · ${ADAPTER_STATUS_LABELS[entry.adapterStatus]}`
                    : ''}
                </span>
              </div>
              <p className="mt-1 text-[10px] leading-snug text-neutral-600">{entry.disclaimer}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 rounded-lg border border-[#D6E0EE] bg-[#F0F4FA] px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
          Deutschland-Stack (perspektivisch)
        </p>
        <p className="mt-1 text-[10px] leading-snug text-neutral-700">
          {mockAdapterCount} Adapter als Mock/Interface definiert (PVOG, FIM/LeiKa, FIT-Connect,
          OParl, BundID/eID, EUDI Wallet, Prämien-Wallet) — vor Käufergespräch offiziell
          verifizieren.
        </p>
      </div>

      <div
        className={`mt-3 rounded-lg border px-3 py-2.5 ${
          audit.mode === 'persistent'
            ? 'border-emerald-200 bg-emerald-50/60'
            : 'border-amber-200 bg-amber-50/60'
        }`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Audit</p>
        <p className="mt-0.5 text-[11px] font-semibold text-[#1A2B45]">{audit.shortLabel}</p>
        <p className="mt-1 text-[10px] leading-snug text-neutral-700">{audit.detail}</p>
      </div>
    </section>
  );
}
