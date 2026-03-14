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

export default function AdminTokensPage() {
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
    const confirmed = window.confirm(
      'Möchtest du diesen Demo-Zugang wirklich widerrufen?'
    );

    if (!confirmed) return;

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
    <main className="min-h-screen bg-neutral-100 px-4 sm:px-6 py-8 sm:py-12 text-neutral-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            ← Admin
          </Link>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Admin / Tokens
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
            Demo-Zugänge verwalten
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Bestehende personalisierte Demo-Links prüfen und widerrufen.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
          {loading ? (
            <div className="px-4 sm:px-8 py-8 text-sm text-neutral-600">
              Lade Tokens …
            </div>
          ) : error ? (
            <div className="px-4 sm:px-8 py-8 text-sm text-red-600">{error}</div>
          ) : tokens.length === 0 ? (
            <div className="px-4 sm:px-8 py-8 text-sm text-neutral-600">
              Keine Tokens vorhanden.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-neutral-50 text-neutral-600">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 font-medium">Name</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Firma</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Demo</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Ablauf</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Status</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">NDA</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr
                      key={token.id}
                      className="border-t border-neutral-200"
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <div className="font-medium text-neutral-900">
                          {token.full_name}
                        </div>
                        <div className="text-neutral-600 text-xs sm:text-sm">
                          {token.email}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-neutral-700">
                        {token.company ?? '—'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-neutral-700">
                        {token.demo_id}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-neutral-700">
                        {prettyDate(token.expires_at)}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {token.is_revoked ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                            Widerrufen
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                            Aktiv
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-neutral-700">
                        {token.nda_version}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {!token.is_revoked ? (
                          <button
                            type="button"
                            onClick={() => void handleRevoke(token.id)}
                            className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
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
    </main>
  );
}
