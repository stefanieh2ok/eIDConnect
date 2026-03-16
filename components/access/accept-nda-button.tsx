'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ndaConfig } from '@/config/nda';

export function AcceptNdaButton({ token }: { token: string }) {
  const searchParams = useSearchParams();
  const [docusignLoading, setDocusignLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentUrl, setConsentUrl] = useState<string | null>(null);

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
    setConsentUrl(null);
    try {
      const response = await fetch('/api/docusign/send-nda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        const msg = result.error ?? 'DocuSign konnte nicht gestartet werden.';
        setError(msg);
        setConsentUrl(result.consentUrl ?? null);
        return;
      }
      setConsentUrl(null);
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

  const returnEmails =
    ndaConfig.returnEmailPrimary && ndaConfig.returnEmailSecondary
      ? `${ndaConfig.returnEmailPrimary} oder ${ndaConfig.returnEmailSecondary}`
      : ndaConfig.returnEmailPrimary ?? '';

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        Sie können die Vertraulichkeitsvereinbarung digital über DocuSign unterzeichnen oder die{' '}
        <strong>Druckversion</strong> ausdrucken, unterschreiben und die unterzeichnete PDF an{' '}
        {returnEmails ? (
          <>
            <a href={`mailto:${ndaConfig.returnEmailPrimary}`} className="text-blue-600 underline">{ndaConfig.returnEmailPrimary}</a>
            {' oder '}
            <a href={`mailto:${ndaConfig.returnEmailSecondary}`} className="text-blue-600 underline">{ndaConfig.returnEmailSecondary}</a>
          </>
        ) : (
          'die angegebene E-Mail-Adresse'
        )}{' '}
        zurücksenden.
      </p>

      <button
        type="button"
        onClick={handleDocuSign}
        disabled={docusignLoading}
        className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {docusignLoading
          ? 'DocuSign wird vorbereitet …'
          : 'Unterzeichnen Sie mit DocuSign und öffnen Sie die Demo'}
      </button>

      {ndaConfig.sentenceBelowButton ? (
        <p className="text-xs text-neutral-500">{ndaConfig.sentenceBelowButton}</p>
      ) : null}

      {(error || showDocusignError) ? (
        <div className="space-y-2">
          <p className="text-sm text-red-600">{error ?? showDocusignError}</p>
          {consentUrl ? (
            <p className="text-sm text-neutral-600">
              Einmalige Einwilligung für JWT:{' '}
              <a
                href={consentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline hover:text-blue-700"
              >
                Consent-URL in DocuSign öffnen und zustimmen
              </a>
              . Danach erneut auf „Unterzeichnen Sie mit DocuSign …“ klicken. Redirect URI in Apps and Keys prüfen; DOCUSIGN_USE_DEMO=true für Sandbox.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
