'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DemoLinksTab from './demo-links/DemoLinksTab';
import AccessLogTab from './access-log/AccessLogTab';
import MeldungenTab from './meldungen/MeldungenTab';
import AccessTokensTab from './access-tokens/AccessTokensTab';
import AccessRequestsTab from './access-requests/AccessRequestsTab';
import { APP_DISPLAY_NAME } from '@/lib/branding';

const TABS = [
  { id: 'links', label: 'Demo-Links' },
  { id: 'access-tokens', label: 'Access-Token (NDA)' },
  { id: 'access-requests', label: 'Zugangsanfragen' },
  { id: 'log', label: 'Zugriffs-Log' },
  { id: 'meldungen', label: 'Meldungen' },
] as const;

export default function AdminPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('links');
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold">Admin – {APP_DISPLAY_NAME}</h1>
        <div className="flex items-center gap-3">
          <a
            href="/admin/tokens"
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
          >
            Tokens verwalten
          </a>
          <a
            href="/admin/audit"
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
          >
            Audit-Logs ansehen
          </a>
          <button type="button" onClick={handleSignOut} className="text-sm text-gray-600 hover:text-gray-900">
            Abmelden
          </button>
        </div>
      </header>
      <nav className="flex border-b border-gray-200 bg-white">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main className="p-4 max-w-6xl mx-auto">
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/admin/tokens"
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
          >
            Tokens verwalten
          </a>
          <a
            href="/admin/audit"
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
          >
            Audit-Logs ansehen
          </a>
        </div>
        {tab === 'links' && <DemoLinksTab />}
        {tab === 'access-tokens' && <AccessTokensTab />}
        {tab === 'access-requests' && <AccessRequestsTab />}
        {tab === 'log' && <AccessLogTab />}
        {tab === 'meldungen' && <MeldungenTab />}
      </main>
    </div>
  );
}
