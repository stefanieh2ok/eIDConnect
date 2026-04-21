'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IphoneFrame } from '@/components/ui/IphoneFrame';

/**
 * Inhalt der Startseite (HookAI Zugang).
 * showSetupLink: nur true, wenn Admin-Cookie gesetzt (Cookie wird serverseitig geprüft).
 */

function extractAccessToken(value: string): string | null {
  if (!value || typeof value !== 'string') return null;
  let line = value.split(/\r?\n/)[0]?.trim().replace(/\s+/g, ' ') ?? '';
  try {
    line = decodeURIComponent(line);
  } catch {
    // bleiben lassen
  }
  line = line.trim();
  if (!line) return null;
  const accessMatch = line.match(/\/access\/([a-zA-Z0-9_-]+)/);
  if (accessMatch) return accessMatch[1];
  const dmMatch = line.match(/(dm_[a-fA-F0-9]{48})/);
  if (dmMatch) return dmMatch[1];
  const tokenCandidates = line.split(/[\s,;]+/).map((s) => s.replace(/[?#].*$/, '').trim());
  for (const t of tokenCandidates) {
    if (/^dm_[a-zA-Z0-9_-]+$/.test(t) && t.length >= 10) return t;
  }
  const afterSlash = line.replace(/^.*\//, '').split(/[?#]/)[0]?.trim() ?? '';
  if (/^[a-zA-Z0-9_-]+$/.test(afterSlash) && afterSlash.length >= 10) return afterSlash;
  return null;
}

type HomeContentProps = {
  showSetupLink: boolean;
};

export default function HomeContent({ showSetupLink }: HomeContentProps) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestCompany, setRequestCompany] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestErrorShowSetupLinks, setRequestErrorShowSetupLinks] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccessMessage, setRequestSuccessMessage] = useState<string | null>(null);

  const handleZugang = () => {
    setError('');
    const token = extractAccessToken(input);
    if (!token) {
      setError('Bitte füge den kompletten Link ein oder gib den Zugangscode ein.');
      return;
    }
    router.push(`/access/${token}`);
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError('');
    setRequestLoading(true);
    setRequestSuccessMessage(null);
    try {
      const res = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: requestName.trim(),
          email: requestEmail.trim(),
          company: requestCompany.trim() || undefined,
        }),
      });
      let data: { success?: boolean; error?: string; detail?: string; setupLink?: string; message?: string };
      try {
        data = await res.json();
      } catch {
        setRequestError('Antwort konnte nicht gelesen werden. Bitte prüfen: Läuft die App (npm run dev)? Gleiche Adresse im Browser? → Setup: /setup');
        return;
      }
      if (!res.ok) {
        const msg = data.error || 'Anfrage fehlgeschlagen.';
        const withDetail = data.detail ? `${msg} — Details: ${data.detail}` : msg;
        setRequestError(data.setupLink ? `${withDetail} Bitte zuerst: ${data.setupLink} öffnen.` : withDetail);
        return;
      }
      setRequestSuccessMessage(data.message || 'Ihre Anfrage wurde gesendet. Sie erhalten eine E-Mail, sobald Ihr Zugang freigegeben wurde.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verbindungsfehler';
      setRequestError(`Server nicht erreichbar (${msg}). Bitte prüfen: App läuft (npm run dev)? Gleiche Adresse im Browser? Tabelle anlegen: /setup`);
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <IphoneFrame>
      <main className="scrollbar-hide flex h-full min-h-0 w-full flex-col overflow-y-auto rounded-b-[1.75rem] px-3 py-3 text-neutral-900">
      <div className="mx-auto w-full max-w-[360px] flex flex-col items-center gap-6 rounded-2xl border border-white/25 bg-white/12 p-4 shadow-lg backdrop-blur-xl">
        {/* Marke */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            HookAI
          </h1>
          <p className="text-sm text-neutral-500 text-center">
            Zugang
          </p>
        </div>

        {/* Zugang anfordern – zuerst */}
        {requestSuccessMessage ? (
          <div className="w-full rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              {requestSuccessMessage}
            </p>
          </div>
        ) : (
          <div className="w-full space-y-3">
            <p className="text-sm font-medium text-neutral-700">
              Noch keinen Link? Hier können Sie einen Zugang anfordern
            </p>
            <p className="text-xs text-neutral-500 -mt-2">
              Bereits registriert? Einfach E-Mail erneut eintragen – wir schicken Ihnen sofort einen neuen Zugangslink.
            </p>
            <form onSubmit={handleRequestAccess} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                required
                minLength={2}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
              <input
                type="email"
                placeholder="E-Mail"
                value={requestEmail}
                onChange={(e) => setRequestEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
              <input
                type="text"
                placeholder="Firma (optional)"
                value={requestCompany}
                onChange={(e) => setRequestCompany(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
              {requestError ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-600">{requestError}</p>
                  {requestErrorShowSetupLinks && (
                    <div className="flex flex-col gap-2">
                      <a
                        href="/setup"
                        className="inline-block rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100 text-center"
                      >
                        → Setup: Prüfen & Tabelle anlegen
                      </a>
                      <a
                        href="/api/check-setup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-neutral-500 underline"
                      >
                        Direkt prüfen (öffnet /api/check-setup)
                      </a>
                    </div>
                  )}
                </div>
              ) : null}
              <button
                type="submit"
                disabled={requestLoading}
                className="w-full py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 transition-colors touch-manipulation"
              >
                {requestLoading ? 'Wird erstellt…' : 'Zugang anfordern'}
              </button>
            </form>
          </div>
        )}

        {/* Bereits Link/Code: danach einfügen */}
        <div className="w-full space-y-3">
          <label htmlFor="access-input" className="block text-sm font-medium text-neutral-700">
            Personalisierte Zugangs-E-Mail erhalten? Link oder Zugangscode einfügen
          </label>
          <input
            id="access-input"
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder="https://…/access/… oder Zugangscode"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleZugang()}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3.5 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          />
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}
          <button
            type="button"
            onClick={handleZugang}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 transition-colors touch-manipulation"
          >
            Zugang öffnen
          </button>
        </div>

        <p className="text-xs text-neutral-500 text-center max-w-[20rem]">
          Wenn Sie einen personalisierten Link per E-Mail erhalten haben, fügen Sie ihn oben ein oder öffnen Sie ihn direkt. Ohne Link können Sie weiter oben einen Zugang anfordern.
        </p>
        {showSetupLink && (
          <p className="text-xs text-center">
            <a href="/setup" className="text-neutral-500 underline hover:text-neutral-700">
              Tabelle für „Zugang anfordern“ noch nicht angelegt? → Setup-Anleitung
            </a>
          </p>
        )}
        <p className="text-xs text-center text-neutral-500">
          Admin-Bereich:&nbsp;
          <a href="/admin" className="underline hover:text-neutral-700">
            Hier anmelden
          </a>
        </p>
      </div>
      </main>
    </IphoneFrame>
  );
}
