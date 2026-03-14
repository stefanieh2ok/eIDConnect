'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type AuditLog = {
  id: string;
  demo_id: string | null;
  token_id: string | null;
  session_id: string | null;
  event_type: string;
  event_data: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  device_fingerprint: string | null;
  created_at: string;
};

type AuditResponse = {
  success: boolean;
  logs?: AuditLog[];
  error?: string;
};

function prettyDate(value: string) {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [demoId, setDemoId] = useState('');
  const [eventType, setEventType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('limit', '200');

      if (demoId.trim()) {
        params.set('demoId', demoId.trim());
      }

      if (eventType.trim()) {
        params.set('eventType', eventType.trim());
      }

      const response = await fetch(`/api/admin/audit?${params.toString()}`, {
        credentials: 'include',
      });
      const data = (await response.json()) as AuditResponse;

      if (!response.ok || !data.success) {
        setError(data.error ?? 'Audit-Logs konnten nicht geladen werden.');
        return;
      }

      setLogs(data.logs ?? []);
    } catch {
      setError('Technischer Fehler beim Laden der Audit-Logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  const stats = useMemo(() => {
    const byType = logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.event_type] = (acc[log.event_type] ?? 0) + 1;
      return acc;
    }, {});

    return byType;
  }, [logs]);

  return (
    <main className="min-h-screen bg-neutral-100 px-4 sm:px-6 py-8 sm:py-12 text-neutral-950">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              ← Admin
            </Link>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Admin / Audit
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
              Audit-Logs
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Protokollierte Ereignisse: NDA-Akzeptanz, Reveal-Events, Seitenzugriffe.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              className="rounded-2xl border border-neutral-300 px-4 py-3 text-sm"
              placeholder="Demo ID filtern"
              value={demoId}
              onChange={(e) => setDemoId(e.target.value)}
            />
            <input
              className="rounded-2xl border border-neutral-300 px-4 py-3 text-sm"
              placeholder="Event Type filtern"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            />
            <button
              type="button"
              onClick={() => void loadLogs()}
              className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Filter anwenden
            </button>
          </div>
        </div>

        {Object.keys(stats).length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {Object.entries(stats).map(([key, value]) => (
              <div
                key={key}
                className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-sm"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  {key}
                </p>
                <p className="mt-2 text-xl sm:text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-4 sm:px-6 py-4">
            <h2 className="text-lg font-semibold">Ereignisse</h2>
          </div>

          {loading ? (
            <div className="px-4 sm:px-6 py-8 text-sm text-neutral-600">
              Lade Audit-Logs …
            </div>
          ) : error ? (
            <div className="px-4 sm:px-6 py-8 text-sm text-red-600">{error}</div>
          ) : logs.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-sm text-neutral-600">
              Keine Logs gefunden.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-neutral-50 text-neutral-600">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 font-medium">Zeitpunkt</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Event</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Demo</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">IP</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Session</th>
                    <th className="px-4 sm:px-6 py-4 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t border-neutral-200 align-top"
                    >
                      <td className="px-4 sm:px-6 py-4 text-neutral-700">
                        {prettyDate(log.created_at)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 font-medium text-neutral-900">
                        {log.event_type}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-neutral-700">
                        {log.demo_id ?? '—'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-neutral-700">
                        {log.ip_address ?? '—'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-neutral-700 font-mono text-xs">
                        {log.session_id ? log.session_id.slice(0, 8) + '…' : '—'}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <pre className="max-w-[280px] sm:max-w-[360px] overflow-x-auto whitespace-pre-wrap rounded-xl bg-neutral-50 p-3 text-xs text-neutral-700">
                          {JSON.stringify(log.event_data ?? {}, null, 2)}
                        </pre>
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
