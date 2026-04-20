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
  email_provider: string | null;
  email_provider_id: string | null;
  email_status: 'sent' | 'failed' | null;
  email_sent_at: string | null;
  email_last_error: string | null;
};

type EmailConfig = {
  ready: boolean;
  apiKeyPresent: boolean;
  apiKeyLooksValid: boolean;
  from: string;
  fromDomain: string;
  isResendSandboxDomain: boolean;
  isFreeMailDomain: boolean;
  appUrl: string;
  effectiveLinkBase: string;
  blockingIssues: string[];
  nextSteps: string[];
};

type ApprovedRowMeta = {
  accessUrl?: string;
};

function EmailConfigBanner({
  config,
  configError,
  reload,
}: {
  config: EmailConfig | null;
  configError: string | null;
  reload: () => void;
}) {
  if (!config) {
    if (configError) {
      return (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {configError}{' '}
          <button type="button" onClick={reload} className="underline">
            Neu versuchen
          </button>
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
        Mail-Konfiguration wird geprueft ...
      </div>
    );
  }

  if (config.ready) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
        <p>
          <strong>Mail-Versand bereit.</strong> Absender: <code className="bg-emerald-100 px-1 rounded">{config.from}</code>
          {config.effectiveLinkBase ? (
            <>
              {' '}
              Link-Basis: <code className="bg-emerald-100 px-1 rounded">{config.effectiveLinkBase}</code>
            </>
          ) : null}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      <p className="font-semibold">Mail-Versand an externe Tester aktuell NICHT moeglich.</p>
      <ul className="mt-2 list-disc pl-5 space-y-1">
        {config.blockingIssues.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
      {config.nextSteps.length > 0 ? (
        <>
          <p className="mt-2 font-semibold">So beheben (einmalig, ca. 5 Minuten):</p>
          <ol className="mt-1 list-decimal pl-5 space-y-1">
            {config.nextSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <p className="mt-2 text-xs">
            Direktlinks:{' '}
            <a className="underline" href="https://resend.com/domains" target="_blank" rel="noopener noreferrer">
              resend.com/domains
            </a>{' '}
            ·{' '}
            <a className="underline" href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
              vercel.com/dashboard
            </a>
          </p>
        </>
      ) : null}
      <p className="mt-2 text-xs">
        Bis dahin pro freigegebener Anfrage <strong>Mail-Entwurf oeffnen</strong> nutzen - damit kommt jeder Tester sofort an seinen Link.
      </p>
      <button
        type="button"
        onClick={reload}
        className="mt-2 rounded border border-amber-400 bg-white px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
      >
        Status erneut pruefen
      </button>
    </div>
  );
}

function buildMailto(to: string, accessUrl: string, recipientName: string): string {
  const subject = 'Dein HookAI Demo-Zugang';
  const greeting = recipientName?.trim() ? recipientName.trim().split(' ')[0] : 'du';
  const body = [
    `Hallo ${greeting},`,
    '',
    'dein Zugang zur HookAI Demo wurde freigegeben. Hier ist dein persönlicher Link:',
    '',
    accessUrl,
    '',
    'Bitte im Browser deines Geräts öffnen. Der Link führt zuerst zur Vertraulichkeitsvereinbarung und danach direkt in die Demo.',
    '',
    'Viele Grüße',
    'Stefanie Hook',
  ].join('\n');
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function AccessRequestsTab() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [lastAccessUrl, setLastAccessUrl] = useState<string | null>(null);
  const [lastAccessMeta, setLastAccessMeta] = useState<{ id: string; email: string; name: string } | null>(null);
  const [approvedMeta, setApprovedMeta] = useState<Record<string, ApprovedRowMeta>>({});
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [emailConfigError, setEmailConfigError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadEmailConfig = async () => {
    setEmailConfigError(null);
    try {
      const res = await fetch('/api/admin/email-config', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setEmailConfigError(data?.error || 'Mail-Konfiguration konnte nicht geladen werden.');
        setEmailConfig(null);
        return;
      }
      setEmailConfig(data as EmailConfig);
    } catch {
      setEmailConfigError('Mail-Konfiguration: Netzwerkfehler.');
    }
  };

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

  useEffect(() => {
    loadEmailConfig();
  }, []);

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
        const target = requests.find((r) => r.id === id);
        await load();
        setLastAccessUrl(data.accessUrl || null);
        setLastAccessMeta(target ? { id, email: target.email, name: target.full_name } : null);
        if (data.accessUrl) {
          setApprovedMeta((prev) => ({ ...prev, [id]: { accessUrl: data.accessUrl } }));
        }
        if (data.emailSent) {
          setError(null);
          setSuccess('Freigegeben. E-Mail mit Zugangslink wurde an den Nutzer gesendet.');
        } else if (data.emailError) {
          setSuccess('Zugang freigegeben. E-Mail konnte nicht zugestellt werden – Link unten kopieren oder „Mail-Entwurf öffnen“ nutzen.');
          setError(`E-Mail-Fehler: ${data.emailError}`);
        } else {
          setSuccess('Freigegeben. E-Mail wurde nicht versendet (RESEND_API_KEY prüfen). Link unten kopieren.');
        }
        setTimeout(() => { setSuccess(null); setError(null); setLastAccessUrl(null); setLastAccessMeta(null); }, 30000);
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
        if (data.accessUrl) {
          setApprovedMeta((prev) => ({ ...prev, [id]: { accessUrl: data.accessUrl } }));
        }
        if (data.emailSent) {
          setSuccess('E-Mail mit neuem Zugangslink wurde erneut gesendet.');
        } else if (data.emailError) {
          setError(
            `E-Mail konnte nicht versendet werden. Nutze den Mailto-Notausgang in der Karte. Fehler: ${data.emailError}`
          );
        } else {
          setError('E-Mail wurde nicht versendet (RESEND_API_KEY prüfen). Link in der Karte kopieren.');
        }
        setTimeout(() => { setSuccess(null); setError(null); }, 18000);
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
      <EmailConfigBanner config={emailConfig} configError={emailConfigError} reload={loadEmailConfig} />
      
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
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm space-y-2">
          <p className="font-medium text-blue-900">Zugangslink (kopieren und an Nutzer schicken):</p>
          <p className="text-blue-800 break-all select-all font-mono text-xs">{lastAccessUrl}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(lastAccessUrl);
                  setCopiedId('top');
                  setTimeout(() => setCopiedId(null), 2000);
                } catch {}
              }}
              className="rounded border border-blue-300 bg-white px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-100"
            >
              {copiedId === 'top' ? 'Kopiert' : 'Link kopieren'}
            </button>
            {lastAccessMeta ? (
              <a
                href={buildMailto(lastAccessMeta.email, lastAccessUrl, lastAccessMeta.name)}
                className="rounded border border-blue-600 bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
              >
                Mail-Entwurf an {lastAccessMeta.email} oeffnen
              </a>
            ) : null}
          </div>
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
                  {r.status === 'approved' && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                      <span
                        className={`inline-block rounded px-2 py-0.5 font-medium ${
                          r.email_status === 'sent'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.email_status === 'failed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.email_status === 'sent'
                          ? 'E-Mail gesendet'
                          : r.email_status === 'failed'
                            ? 'E-Mail fehlgeschlagen'
                            : 'E-Mail-Status offen'}
                      </span>
                      {r.email_sent_at ? (
                        <span className="text-gray-500">Versand: {formatDate(r.email_sent_at)}</span>
                      ) : null}
                      {r.email_provider_id ? (
                        <span className="font-mono text-[10px] text-gray-400" title="Provider-ID (Resend)">
                          id: {r.email_provider_id}
                        </span>
                      ) : null}
                    </div>
                  )}
                  {r.status === 'approved' && r.email_last_error ? (
                    <p className="mt-1 text-xs text-rose-700 break-words">
                      Letzter Mailfehler: {r.email_last_error}
                    </p>
                  ) : null}
                  {r.status === 'approved' && approvedMeta[r.id]?.accessUrl ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md bg-slate-50 p-2 text-xs text-slate-700">
                      <span className="font-mono break-all select-all">{approvedMeta[r.id]?.accessUrl}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          const url = approvedMeta[r.id]?.accessUrl ?? '';
                          if (!url) return;
                          try {
                            await navigator.clipboard.writeText(url);
                            setCopiedId(r.id);
                            setTimeout(() => setCopiedId((cur) => (cur === r.id ? null : cur)), 2000);
                          } catch {}
                        }}
                        className="rounded border border-slate-300 bg-white px-2 py-0.5 font-medium text-slate-700 hover:bg-slate-100"
                      >
                        {copiedId === r.id ? 'Kopiert' : 'Kopieren'}
                      </button>
                      <a
                        href={buildMailto(r.email, approvedMeta[r.id]?.accessUrl ?? '', r.full_name)}
                        className="rounded border border-blue-600 bg-blue-600 px-2 py-0.5 font-medium text-white hover:bg-blue-700"
                      >
                        Mail-Entwurf oeffnen
                      </a>
                    </div>
                  ) : null}
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
