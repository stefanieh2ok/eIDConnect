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
  const [success, setSuccess] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [lastAccessUrl, setLastAccessUrl] = useState<string | null>(null);

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
    setError(null);
    setActing(id);
    try {
      const res = await fetch(`/api/admin/access-requests/${id}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        await load();
        setLastAccessUrl(data.accessUrl || null);
        if (data.emailSent) {
          setError(null);
          setSuccess('Freigegeben. E-Mail mit Zugangslink wurde an den Nutzer gesendet.');
        } else if (data.emailError) {
          setSuccess('Zugang freigegeben. E-Mail konnte nicht zugestellt werden – Link unten kopieren und manuell schicken.');
          setError(`E-Mail-Fehler: ${data.emailError}`);
        } else {
          setSuccess('Freigegeben. E-Mail wurde nicht versendet (RESEND_API_KEY prüfen). Link unten kopieren.');
        }
        setTimeout(() => { setSuccess(null); setError(null); setLastAccessUrl(null); }, 18000);
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

  const handleResendEmail = async (id: string) => {
    setError(null);
    setSuccess(null);
    setActing(`resend-${id}`);
    try {
      const res = await fetch(`/api/admin/access-requests/${id}/resend-email`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        if (data.emailSent) {
          setSuccess('E-Mail mit neuem Zugangslink wurde erneut gesendet.');
        } else if (data.emailError) {
          setError(
            `E-Mail konnte nicht versendet werden. Bitte Link manuell schicken: ${data.accessUrl || ''}. Fehler: ${data.emailError}`
          );
        } else {
          setError('E-Mail wurde nicht versendet (RESEND_API_KEY prüfen). Link: ' + (data.accessUrl || ''));
        }
        setTimeout(() => { setSuccess(null); setError(null); }, 12000);
      } else {
        setError(data.error || 'E-Mail konnte nicht erneut gesendet werden.');
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
        Anfragen von der Startseite „Zugang anfordern“. Nach deiner Freigabe wird der Zugang erstellt und der Link automatisch per E-Mail an die Person geschickt.
      </p>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <strong>Damit die E-Mail wirklich ankommt:</strong> Mit dem Standard-Absender (Resend Test) liefert Resend nur an deine Resend-Account-E-Mail. Damit <em>jede</em> Person den Link per E-Mail erhält, in Resend eine Domain verifizieren (<a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">resend.com/domains</a>) und in den Umgebungsvariablen <code className="bg-amber-100 px-1 rounded">SEND_ACCESS_EMAIL_FROM</code> setzen (z. B. <code className="bg-amber-100 px-1 rounded">eIDConnect &lt;noreply@deine-domain.de&gt;</code>). Bis dahin: Link nach dem Freigeben unten kopieren und manuell schicken.
      </div>

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

      {success && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{success}</p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      {lastAccessUrl && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
          <p className="font-medium text-blue-900 mb-1">Zugangslink (kopieren und an Nutzer schicken):</p>
          <p className="text-blue-800 break-all select-all font-mono text-xs">{lastAccessUrl}</p>
        </div>
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
                <div className="flex gap-2">
                  {r.status === 'pending' && (
                    <>
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
                    </>
                  )}
                  {r.status === 'approved' && (
                    <button
                      type="button"
                      disabled={acting !== null}
                      onClick={() => handleResendEmail(r.id)}
                      className="rounded-lg border border-blue-600 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                    >
                      {acting === `resend-${r.id}` ? '…' : 'E-Mail erneut senden'}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
