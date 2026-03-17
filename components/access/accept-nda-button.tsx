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

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
        <p className="font-medium">Nach der Unterzeichnung:</p>
        <p className="mt-1 text-blue-800">
          DocuSign leitet Sie automatisch zurück. <strong>Die Seite wechselt dann von selbst in die Demo</strong> – Sie landen in der Anwendung und können starten.
        </p>
        <p className="mt-1 text-blue-800">
          Zusätzlich erhalten Sie eine E-Mail von uns mit einem <strong>direkten Link in die Demo</strong>. Falls die Weiterleitung im Browser einmal nicht klappt, einfach auf den Link in der E-Mail klicken.
        </p>
      </div>

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
          {(showDocusignError && (docusignMessage === 'not_completed' || docusignMessage === 'return_no_envelope')) ? (
            <p className="text-sm text-neutral-600">
              Wenn Sie bereits unterschrieben haben und die Bestätigungs-E-Mail von DocuSign erhalten haben, ist die Rückleitung oft an der <strong>Redirect-URL</strong> gescheitert. In DocuSign (Apps and Keys) unter <strong>Redirect URIs</strong> muss exakt stehen: <code className="text-xs bg-neutral-100 px-1 rounded break-all">https://e-id-connect-lr65.vercel.app/api/docusign/return</code>. Danach Zugangs-Link aus der E-Mail in diesem Browser erneut öffnen.
            </p>
          ) : null}
          {/issuer_not_found/i.test(error ?? '') ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">Vercel / Sandbox:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-amber-800">
                <li>In Vercel → Projekt → Settings → Environment Variables: <strong>DOCUSIGN_USE_DEMO=true</strong> setzen.</li>
                <li>In DocuSign (Apps and Keys) unter Redirect URIs eintragen: <strong>https://[deine-vercel-app].vercel.app/api/docusign/return</strong> (exakt die Vercel-URL dieser App).</li>
                <li>Danach in Vercel einen Redeploy auslösen.</li>
              </ul>
            </div>
          ) : consentUrl ? (
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
