'use client';

import { useState, useEffect } from 'react';

type AccessRequest = {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  demo_access_token_id: string | null;
};

export default function AccessRequestsTab() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        filter === 'pending'
          ? '/api/admin/access-requests?status=pending'
          : '/api/admin/access-requests';
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Laden fehlgeschlagen.');
        return;
      }
      setRequests(data.requests ?? []);
    } catch {
      setError('Netzwerkfehler.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleApprove = async (id: string) => {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/access-requests/${id}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        await load();
      } else {
        setError(data.error || 'Freigabe fehlgeschlagen.');
      }
    } catch {
      setError('Netzwerkfehler.');
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id: string) => {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/access-requests/${id}/reject`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        await load();
      } else {
        setError(data.error || 'Ablehnung fehlgeschlagen.');
      }
    } catch {
      setError('Netzwerkfehler.');
    } finally {
      setActing(null);
    }
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString('de-DE', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    } catch {
      return s;
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Anfragen von der Startseite „Zugang anfordern“. Erst nach Ihrer Freigabe wird der Zugang erstellt und per E-Mail versendet.
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
            filter === 'pending'
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Offen
        </button>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
            filter === 'all'
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Alle
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Lade …</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-gray-500">
          {filter === 'pending' ? 'Keine offenen Anfragen.' : 'Keine Anfragen.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{r.full_name}</p>
                  <p className="text-sm text-gray-600">{r.email}</p>
                  {r.company && (
                    <p className="text-sm text-gray-500">{r.company}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(r.created_at)}
                    {r.status !== 'pending' && r.reviewed_at && (
                      <> · Bearbeitet: {formatDate(r.reviewed_at)}</>
                    )}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${
                      r.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : r.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {r.status === 'pending' ? 'Offen' : r.status === 'approved' ? 'Freigegeben' : 'Abgelehnt'}
                  </span>
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={acting !== null}
                      onClick={() => handleApprove(r.id)}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {acting === r.id ? '…' : 'Freigeben'}
                    </button>
                    <button
                      type="button"
                      disabled={acting !== null}
                      onClick={() => handleReject(r.id)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Ablehnen
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
