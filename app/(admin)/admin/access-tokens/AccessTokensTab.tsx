'use client';

import { useState } from 'react';

type CreateTokenResponse = {
  success: boolean;
  rawToken?: string;
  accessUrl?: string;
  expiresAt?: string;
  error?: string;
};

export default function AccessTokensTab() {
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [demoId, setDemoId] = useState('buerger-app-v1');
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [maxViews, setMaxViews] = useState(10);
  const [maxDevices, setMaxDevices] = useState(1);

  const [result, setResult] = useState<CreateTokenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copyUrl, setCopyUrl] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleCreateToken = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName,
          company: company || undefined,
          email,
          demoId,
          expiresInDays,
          maxViews,
          maxDevices,
        }),
      });

      const data = (await response.json()) as CreateTokenResponse;
      setResult(data);
    } catch {
      setResult({
        success: false,
        error: 'Technischer Fehler beim Erstellen des Tokens.',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyAccessUrl = () => {
    if (!result?.accessUrl) return;
    navigator.clipboard.writeText(result.accessUrl);
    setCopyUrl(true);
    setTimeout(() => setCopyUrl(false), 2000);
  };

  const sendAccessEmail = async () => {
    if (!result?.accessUrl || !email.trim()) return;
    setSendingEmail(true);
    setEmailError(null);
    setEmailSent(false);
    try {
      const response = await fetch('/api/admin/send-access-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to: email.trim(),
          accessUrl: result.accessUrl,
          recipientName: fullName.trim() || email.trim(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setEmailSent(true);
      } else {
        setEmailError(data.error || 'E-Mail konnte nicht gesendet werden.');
      }
    } catch {
      setEmailError('Technischer Fehler beim E-Mail-Versand.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Erstellen Sie personalisierte Demo-Links mit NDA-Gate. Der Empfänger öffnet den Link, sieht die Vertraulichkeitsvereinbarung und kann nach Akzeptanz die Demo nutzen.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          placeholder="Vollständiger Name *"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          placeholder="Firma"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          type="email"
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm sm:col-span-2"
          placeholder="E-Mail *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          placeholder="Demo-ID *"
          value={demoId}
          onChange={(e) => setDemoId(e.target.value)}
        />
        <input
          type="number"
          min={1}
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          placeholder="Ablauf (Tage)"
          value={expiresInDays}
          onChange={(e) => setExpiresInDays(Number(e.target.value) || 30)}
        />
        <input
          type="number"
          min={1}
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          placeholder="Max. Akzeptanzen (Views)"
          value={maxViews}
          onChange={(e) => setMaxViews(Number(e.target.value) || 10)}
        />
        <input
          type="number"
          min={1}
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          placeholder="Max. Geräte"
          value={maxDevices}
          onChange={(e) => setMaxDevices(Number(e.target.value) || 1)}
        />
      </div>

      <button
        type="button"
        onClick={handleCreateToken}
        disabled={loading}
        className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {loading ? 'Erstelle Link …' : 'Demo-Link (NDA) erstellen'}
      </button>

      {result && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          {result.success ? (
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-gray-900">Link erstellt</p>
              <p className="break-all">
                <span className="font-medium text-gray-700">URL:</span>{' '}
                {result.accessUrl}
              </p>
              <p>
                <span className="font-medium text-gray-700">Token:</span>{' '}
                <code className="rounded bg-gray-200 px-1">{result.rawToken}</code>
              </p>
              <p>
                <span className="font-medium text-gray-700">Ablauf:</span>{' '}
                {result.expiresAt
                  ? new Date(result.expiresAt).toLocaleString('de-DE')
                  : '–'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyAccessUrl}
                  className="rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
                >
                  {copyUrl ? 'Kopiert!' : 'URL kopieren'}
                </button>
                <button
                  type="button"
                  onClick={sendAccessEmail}
                  disabled={sendingEmail || !email.trim()}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {sendingEmail ? 'Wird gesendet …' : 'Per E-Mail senden'}
                </button>
              </div>
              {emailSent && (
                <p className="mt-2 text-sm text-green-700">E-Mail wurde an {email} gesendet.</p>
              )}
              {emailError && (
                <p className="mt-2 text-sm text-red-600">{emailError}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-600">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
