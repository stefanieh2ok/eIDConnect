'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ndaConfig } from '@/config/nda';

export function AcceptNdaButton({ token }: { token: string }) {
  const searchParams = useSearchParams();
  const [docusignLoading, setDocusignLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const docusignMessage = searchParams.get('docusign');
  const showDocusignError =
    docusignMessage === 'not_completed' ||
    docusignMessage === 'return_no_envelope'
      ? 'Die Unterzeichnung wurde nicht abgeschlossen.'
      : docusignMessage
        ? 'Bei der DocuSign-Rückkehr ist etwas schiefgelaufen.'
        : null;

  const handleDocuSign = async () => {
    setDocusignLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/docusign/send-nda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.error ?? 'DocuSign konnte nicht gestartet werden.');
        return;
      }
      if (result.signingUrl) {
        window.location.href = result.signingUrl;
      } else {
        setError('Keine Signatur-URL erhalten.');
      }
    } catch {
      setError('DocuSign konnte nicht gestartet werden.');
    } finally {
      setDocusignLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        Der Zugang erfolgt ausschließlich nach rechtsverbindlicher Unterzeichnung
        der Vertraulichkeitsvereinbarung über DocuSign.
      </p>

      <button
        type="button"
        onClick={handleDocuSign}
        disabled={docusignLoading}
        className="w-full rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {docusignLoading
          ? 'DocuSign wird vorbereitet …'
          : 'Mit DocuSign unterzeichnen und Demo öffnen'}
      </button>

      {ndaConfig.sentenceBelowButton ? (
        <p className="text-xs text-neutral-500">{ndaConfig.sentenceBelowButton}</p>
      ) : null}

      {(error || showDocusignError) ? (
        <p className="text-sm text-red-600">{error ?? showDocusignError}</p>
      ) : null}
    </div>
  );
}
