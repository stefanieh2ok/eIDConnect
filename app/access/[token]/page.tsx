import { redirect } from 'next/navigation';
import { findAccessTokenByRawToken, isTokenExpired } from '@/lib/security/token';
import { ndaConfig } from '@/config/nda';
import { AcceptNdaButton } from '@/components/access/accept-nda-button';

export const metadata = {
  title: 'Vertraulicher Demo-Zugang – HookAI',
};

type AccessPageProps = {
  params: Promise<{ token: string }>;
};

export default async function AccessPage({ params }: AccessPageProps) {
  const { token } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12 text-neutral-900">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-semibold">Demo-Zugang derzeit nicht verfügbar</h1>
          <p className="text-sm text-neutral-600">
            Die Konfiguration fehlt. Bitte in der Projektdatei <code className="bg-neutral-200 px-1 rounded">.env.local</code> setzen:
          </p>
          <ul className="text-sm text-neutral-700 text-left list-disc list-inside">
            <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
            <li><code>SUPABASE_SERVICE_ROLE_KEY</code></li>
          </ul>
          <p className="text-xs text-neutral-500">
            Anleitung: <code className="bg-neutral-200 px-1 rounded">docs/SETUP-ZUGANG.md</code> im Projekt. Anschließend Dev-Server neu starten.
          </p>
        </div>
      </main>
    );
  }

  const tokenRecord = await findAccessTokenByRawToken(token);

  if (!tokenRecord) {
    redirect('/access/denied?reason=invalid');
  }

  if (tokenRecord.is_revoked) {
    redirect('/access/denied?reason=revoked');
  }

  if (isTokenExpired(tokenRecord.expires_at)) {
    redirect('/access/denied?reason=expired');
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-6 py-8 sm:py-12 text-neutral-950 pb-safe max-w-screen-xl mx-auto">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Vertraulicher Zugriff
          </p>
          <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            {ndaConfig.header}
          </h1>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Diese Demo enthält vertrauliche Informationen, Geschäftsgeheimnisse und
            nicht öffentliche Produkt- und Konzeptbestandteile. Der Zugriff ist nur
            nach Zustimmung zur Vertraulichkeitsvereinbarung zulässig.
          </p>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
            <p className="text-sm font-semibold text-neutral-900">
              Personalisierter Demo-Zugang
            </p>
            <div className="mt-2 space-y-1 text-sm text-neutral-700">
              <p><span className="font-medium">Empfänger:</span> {tokenRecord.full_name}</p>
              {tokenRecord.company ? (
                <p><span className="font-medium">Firma:</span> {tokenRecord.company}</p>
              ) : null}
              <p><span className="font-medium">E-Mail:</span> {tokenRecord.email}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Kurzfassung</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-700">
              {ndaConfig.gateSummary.map((item, i) => (
                <li key={i} className="rounded-xl bg-neutral-50 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-neutral-900">Vollständige Vertraulichkeitsvereinbarung</h2>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/legal/demo-nda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  NDA als PDF herunterladen
                </a>
                <a
                  href="/legal/demo-nda?print=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Druckversion öffnen
                </a>
              </div>
            </div>
            <div className="mt-4 max-h-[min(50vh,28rem)] overflow-y-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
              <pre className="whitespace-pre-wrap text-sm leading-6 text-neutral-700 font-sans">
                {ndaConfig.fullText}
              </pre>
            </div>
            <p className="mt-4 text-xs text-neutral-500 border-t border-neutral-100 pt-4">
              {ndaConfig.footer}
            </p>
            <div className="mt-8 border-t border-neutral-200 pt-6">
              <AcceptNdaButton token={token} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
