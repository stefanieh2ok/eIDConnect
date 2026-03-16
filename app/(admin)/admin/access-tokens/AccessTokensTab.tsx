'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type AdminToken = {
  id: string;
  demo_id: string;
  full_name: string;
  company: string | null;
  email: string;
  nda_version: string;
  expires_at: string;
  max_views: number;
  max_devices: number;
  is_revoked: boolean;
  created_at: string;
};

type TokensResponse = {
  success: boolean;
  tokens?: AdminToken[];
  error?: string;
};

function prettyDate(value: string) {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
}

export default function AccessTokensTab() {
  const [tokens, setTokens] = useState<AdminToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/tokens?limit=200', {
        credentials: 'include',
      });
      const data = (await response.json()) as TokensResponse;
      if (!response.ok || !data.success) {
        setError(data.error ?? 'Tokens konnten nicht geladen werden.');
        return;
      }
      setTokens(data.tokens ?? []);
    } catch {
      setError('Technischer Fehler beim Laden der Tokens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTokens();
  }, []);

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Möchten Sie diesen Demo-Zugang wirklich widerrufen?')) return;
    try {
      const response = await fetch(`/api/tokens/${id}/revoke`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        window.alert(data.error ?? 'Widerruf fehlgeschlagen.');
        return;
      }
      await loadTokens();
    } catch {
      window.alert('Technischer Fehler beim Widerruf.');
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        <Link href="/admin/tokens" className="text-blue-600 hover:underline">
          Tokens verwalten (eigene Seite)
        </Link>
      </p>
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        {loading ? (
          <div className="px-6 py-8 text-sm text-neutral-600">Lade Tokens …</div>
        ) : error ? (
          <div className="px-6 py-8 text-sm text-red-600">{error}</div>
        ) : tokens.length === 0 ? (
          <div className="px-6 py-8 text-sm text-neutral-600">Keine Tokens vorhanden.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Firma</th>
                  <th className="px-4 py-3 font-medium">Demo</th>
                  <th className="px-4 py-3 font-medium">Ablauf</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr key={token.id} className="border-t border-neutral-200">
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900">{token.full_name}</div>
                      <div className="text-neutral-600 text-xs">{token.email}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{token.company ?? '—'}</td>
                    <td className="px-4 py-3 text-neutral-700">{token.demo_id}</td>
                    <td className="px-4 py-3 text-neutral-700">{prettyDate(token.expires_at)}</td>
                    <td className="px-4 py-3">
                      {token.is_revoked ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Widerrufen</span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Aktiv</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!token.is_revoked ? (
                        <button
                          type="button"
                          onClick={() => void handleRevoke(token.id)}
                          className="rounded border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-800 hover:bg-neutral-50"
                        >
                          Widerrufen
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
