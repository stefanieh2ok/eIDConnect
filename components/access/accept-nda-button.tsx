'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

const INTRO_AUTOSTART_ONCE_KEY = 'eidconnect_intro_autostart_once';
const INTRO_AUDIO_SESSION_KEY = 'eidconnect_intro_audio_v1';
const PRELOGIN_PHASE_KEY = 'eidconnect_prelogin_v2';
const WANTS_WALKTHROUGH_KEY = 'eidconnect_wants_walkthrough_v1';

const MSG_SIGNING_UNAVAILABLE = 'Der Signaturprozess konnte derzeit nicht gestartet werden.';
const MSG_CONNECTION_UNAVAILABLE = 'Die Verbindung zum Signaturdienst ist momentan nicht verfügbar.';
const MSG_SIGNING_INCOMPLETE =
  'Die Unterzeichnung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.';
const MSG_SUCCESS =
  'Die Vertraulichkeitserklärung wurde erfolgreich unterzeichnet.';
const MSG_ENV_SETUP =
  'Für diese Umgebung ist der Signaturdienst noch nicht vollständig eingerichtet. Bitte kontaktieren Sie den technischen Ansprechpartner.';

function mapReturnErrorMessage(code: string | null): string | null {
  if (!code || code === 'return_no_envelope') return null;
  if (code === 'not_completed') return MSG_SIGNING_INCOMPLETE;
  return MSG_SIGNING_UNAVAILABLE;
}

function classifyApiError(raw: string | undefined | null): {
  display: string;
  issuerSetup: boolean;
} {
  if (!raw) return { display: MSG_SIGNING_UNAVAILABLE, issuerSetup: false };
  const issuerSetup = /issuer_not_found/i.test(raw);
  const lower = raw.toLowerCase();
  if (/consent_required|consent|grant|authorize|invalid_request/i.test(lower)) {
    return { display: MSG_CONNECTION_UNAVAILABLE, issuerSetup: false };
  }
  if (issuerSetup) {
    return { display: MSG_CONNECTION_UNAVAILABLE, issuerSetup: true };
  }
  if (/network|fetch failed|econnrefused|timeout/i.test(lower)) {
    return { display: MSG_CONNECTION_UNAVAILABLE, issuerSetup: false };
  }
  return { display: MSG_SIGNING_UNAVAILABLE, issuerSetup: false };
}

type AcceptNdaButtonProps = {
  token: string;
  returnEmailPrimary?: string;
  returnEmailSecondary?: string;
  sentenceBelowButton?: string;
};

export function AcceptNdaButton({
  token,
  returnEmailPrimary,
  returnEmailSecondary,
  sentenceBelowButton,
}: AcceptNdaButtonProps) {
  const searchParams = useSearchParams();
  const [signingLoading, setSigningLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentUrl, setConsentUrl] = useState<string | null>(null);
  const [issuerSetupHint, setIssuerSetupHint] = useState(false);

  const returnCode = searchParams.get('docusign');
  const showReturnError = mapReturnErrorMessage(returnCode);
  const showSignedInfo = returnCode === 'return_no_envelope';

  const handleDigitalSign = async () => {
    try {
      if (typeof window !== 'undefined') {
        // Nach NDA immer mit Clara-gestütztem Einstieg starten.
        sessionStorage.setItem(PRELOGIN_PHASE_KEY, 'anrede');
        sessionStorage.setItem(WANTS_WALKTHROUGH_KEY, '1');
        sessionStorage.setItem(INTRO_AUTOSTART_ONCE_KEY, '1');
        sessionStorage.setItem(INTRO_AUDIO_SESSION_KEY, '1');
      }
    } catch {
      // ignore
    }
    setSigningLoading(true);
    setError(null);
    setConsentUrl(null);
    setIssuerSetupHint(false);
    try {
      const response = await fetch('/api/docusign/send-nda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        const consent = result.consentUrl as string | undefined;
        setConsentUrl(consent ?? null);
        if (consent) {
          setError(null);
        } else {
          const c = classifyApiError(
            typeof result.error === 'string' ? result.error : null
          );
          setError(c.display);
          setIssuerSetupHint(c.issuerSetup);
        }
        return;
      }
      setConsentUrl(null);
      if (result.signingUrl) {
        window.location.href = result.signingUrl;
      } else {
        setError(MSG_SIGNING_UNAVAILABLE);
      }
    } catch {
      setError(MSG_CONNECTION_UNAVAILABLE);
    } finally {
      setSigningLoading(false);
    }
  };

  const returnEmails =
    returnEmailPrimary && returnEmailSecondary
      ? `${returnEmailPrimary} oder ${returnEmailSecondary}`
      : returnEmailPrimary ?? '';

  return (
    <div className="space-y-4">
      <p className="t-body-sm">
        Alternativ können Sie die{' '}
        <strong>Druckversion</strong> ausdrucken, unterschreiben und die unterzeichnete PDF an{' '}
        {returnEmails ? (
          <>
            <a href={`mailto:${returnEmailPrimary}`} className="text-blue-600 underline">
              {returnEmailPrimary}
            </a>
            {' oder '}
            <a href={`mailto:${returnEmailSecondary}`} className="text-blue-600 underline">
              {returnEmailSecondary}
            </a>
          </>
        ) : (
          'die angegebene E-Mail-Adresse'
        )}{' '}
        zurücksenden.
      </p>

      <div className="card-info">
        <p className="t-body-sm font-semibold text-[#003B71]">Nach der Unterzeichnung:</p>
        <p className="mt-1 text-blue-800">
          Sie werden automatisch zurückgeleitet. <strong>Die Seite wechselt dann in die Demo</strong> – Sie können
          direkt starten.
        </p>
        <p className="mt-1 text-blue-800">
          Zusätzlich erhalten Sie eine E-Mail mit einem <strong>direkten Link in die Demo</strong>. Falls die
          Weiterleitung im Browser einmal nicht klappt, nutzen Sie den Link in der E-Mail.
        </p>
      </div>

      {showSignedInfo && (
        <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4 text-sm text-green-900">
          <p className="font-semibold text-base">{MSG_SUCCESS}</p>
          <p className="mt-2">
            Wenn die Demo nicht automatisch geöffnet wurde, klicken Sie bitte <strong>erneut auf den Button unten</strong>{' '}
            – Sie werden dann weitergeleitet.
          </p>
          <p className="mt-1 text-green-800">
            Zusätzlich erhalten Sie in Kürze eine E-Mail mit einem direkten Link zur Demo.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleDigitalSign}
        disabled={signingLoading}
        className="btn-primary t-button w-full"
      >
        {signingLoading
          ? 'In Bearbeitung …'
          : showSignedInfo
            ? 'Demo öffnen'
            : 'Digital signieren'}
      </button>

      <p className="t-body-sm text-center">
        <a href="/api/nda/download?disposition=inline" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 underline hover:text-blue-700">
          Vertraulichkeitserklärung als PDF ansehen
        </a>
      </p>

      {sentenceBelowButton ? (
        <p className="text-xs text-neutral-500">{sentenceBelowButton}</p>
      ) : null}

      {(error || showReturnError || consentUrl || issuerSetupHint) && (
        <div className="space-y-2">
          {(error ?? showReturnError) ? (
            <p className="text-sm text-red-600">{error ?? showReturnError}</p>
          ) : null}
          {showReturnError && (returnCode === 'not_completed' || returnCode === 'return_no_envelope') ? (
            <p className="text-sm text-neutral-600">
              Falls die automatische Weiterleitung nicht funktioniert hat, öffnen Sie bitte den Zugangslink aus der
              E-Mail erneut oder verwenden Sie den Link zur Demo in der Bestätigungs-E-Mail.
            </p>
          ) : null}
          {issuerSetupHint ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p>{MSG_ENV_SETUP}</p>
            </div>
          ) : null}
          {consentUrl ? (
            <p className="text-sm text-neutral-600">
              Einmalige technische Einrichtung des Signaturdienstes:{' '}
              <a
                href={consentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline hover:text-blue-700"
              >
                Einrichtung öffnen und zustimmen
              </a>
              . Danach erneut auf „Digital signieren“ klicken.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
