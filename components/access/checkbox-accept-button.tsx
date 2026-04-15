'use client';

import { useState } from 'react';

export function CheckboxAcceptButton({ token }: { token: string }) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!accepted) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/accept-checkbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Fehler beim Akzeptieren.');
        return;
      }
      if (data.redirectTo) {
        window.location.href = data.redirectTo;
      }
    } catch {
      setError('Netzwerkfehler. Bitte erneut versuchen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
        <p className="font-medium">Test-Zugang (ohne DocuSign)</p>
        <p className="mt-1 text-blue-800">
          Bitte lesen Sie die Vertraulichkeitsvereinbarung oben und bestätigen Sie mit dem Häkchen.
          Sie werden anschließend direkt in die Demo weitergeleitet.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-neutral-700">
          Ich habe die Vertraulichkeitsvereinbarung gelesen und stimme den Bedingungen zu.
          Ich verpflichte mich, die Inhalte vertraulich zu behandeln.
        </span>
      </label>

      <button
        type="button"
        onClick={handleAccept}
        disabled={!accepted || loading}
        className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 border-2 border-[#0066CC]"
      >
        {loading ? 'Wird vorbereitet …' : 'Zustimmen und Demo öffnen'}
      </button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
