import { redirect } from 'next/navigation';
import { findAccessTokenByRawToken, isTokenExpired } from '@/lib/security/token';
import { ndaConfig } from '@/config/nda';
import { AcceptNdaButton } from '@/components/access/accept-nda-button';
import { CheckboxAcceptButton } from '@/components/access/checkbox-accept-button';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import { IphoneFrame } from '@/components/ui/IphoneFrame';

export const metadata = {
  title: `Vertraulicher Demo-Zugang – ${APP_DISPLAY_NAME}`,
};

type AccessPageProps = {
  params: Promise<{ token: string }>;
};

export default async function AccessPage({ params }: AccessPageProps) {
  const { token } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <IphoneFrame>
        <main className="flex h-full min-h-0 w-full items-center justify-center rounded-b-[1.75rem] px-3 py-6">
          <div className="w-full max-w-[360px] rounded-2xl border border-neutral-200 bg-white/70 p-6 text-neutral-900 shadow-lg backdrop-blur-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600">
              Was fehlt auf Supabase?
            </p>
            <h1 className="mt-2 text-xl font-semibold">Demo-Zugang derzeit nicht verfügbar</h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700">
              Die Konfiguration fehlt. Bitte in der Projektdatei{' '}
              <code className="rounded bg-neutral-100 px-1 py-0.5 text-neutral-900">.env.local</code> setzen:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-neutral-800">
              <li>
                <code className="rounded bg-neutral-100 px-1 py-0.5 text-neutral-900">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>
              </li>
              <li>
                <code className="rounded bg-neutral-100 px-1 py-0.5 text-neutral-900">
                  SUPABASE_SERVICE_ROLE_KEY
                </code>
              </li>
            </ul>
            <p className="mt-3 text-xs text-neutral-600">
              Anleitung:{' '}
              <code className="rounded bg-neutral-100 px-1 py-0.5 text-neutral-800">docs/SETUP-ZUGANG.md</code> im Projekt.
              Danach Dev-Server neu starten. Auf Vercel dieselben Variablen unter Project Settings → Environment
              Variables eintragen und neu deployen.
            </p>
          </div>
        </main>
      </IphoneFrame>
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

  const glassCard =
    // Helles Gerät, aber lesbarer Kontrast: leicht dunkleres Frosted-Glas + Dark Text.
    // Kein sm:-Padding: sonst schaltet auf Desktop der Viewport um und wirkt „nicht iPhone“.
    'rounded-2xl border border-neutral-200 bg-white/65 p-4 shadow-sm backdrop-blur-xl';

  return (
    <IphoneFrame>
      <div
        className="flex h-full min-h-0 flex-col overflow-y-auto rounded-b-[1.75rem] px-2 pb-3 pt-1"
        style={{
          // Kein starker Farbverlauf mehr: iPhoneFrame liefert den Hintergrund, hier nur „clean“.
          background: 'transparent',
        }}
      >
        <div className="mx-auto w-full max-w-[360px] space-y-4 pb-6 text-neutral-950">
          <div className={glassCard}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600">
              Vertraulicher Zugriff
            </p>
            <h1 className="mt-2 text-lg font-semibold tracking-tight text-neutral-900">{ndaConfig.header}</h1>
            <p className="mt-3 text-xs leading-relaxed text-neutral-700">
              Für den Zugriff auf vertrauliche Inhalte ist vorab eine digitale Unterzeichnung der
              Vertraulichkeitserklärung erforderlich.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-neutral-700">
              Die Unterzeichnung wird über den vorgesehenen Signaturdienst der Organisation durchgeführt.
            </p>

            <div className="mt-4 rounded-xl border border-neutral-200 bg-white/60 p-3 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold text-neutral-900">Personalisierter Demo-Zugang</p>
              <div className="mt-2 space-y-1 text-xs text-neutral-800">
                <p>
                  <span className="font-medium text-neutral-900">Empfänger:</span> {tokenRecord.full_name}
                </p>
                {tokenRecord.company ? (
                  <p>
                    <span className="font-medium text-neutral-900">Firma:</span> {tokenRecord.company}
                  </p>
                ) : null}
                <p>
                  <span className="font-medium text-neutral-900">E-Mail:</span> {tokenRecord.email}
                </p>
              </div>
            </div>
          </div>

          <section className={glassCard}>
            <h2 className="text-sm font-semibold text-neutral-900">Druckversion</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">
              Druckoptimierte Ansicht öffnen – im Systemdialog als PDF speichern oder ausdrucken, z. B. für Ablage
              oder die Rechtsabteilung.
            </p>
            <a
              href={`/legal/demo-nda?print=1&returnTo=${encodeURIComponent(`/access/${token}`)}`}
              className="mt-3 flex w-full items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95"
              style={{ background: 'linear-gradient(135deg, #003366 0%, #0055A4 100%)' }}
            >
              PDF drucken
            </a>
          </section>

          <section className={glassCard}>
            <h2 className="text-sm font-semibold text-neutral-900">Kurzfassung</h2>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-neutral-800">
              {ndaConfig.gateSummary.map((item, i) => (
                <li key={i} className="rounded-lg border border-neutral-200 bg-white/55 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className={glassCard}>
            <h2 className="text-sm font-semibold text-neutral-900" id="nda-fulltext">
              Vertraulichkeitserklärung (Volltext)
            </h2>
            <div
              className="mt-3 max-h-[min(42vh,18rem)] overflow-y-auto rounded-xl border border-neutral-200 bg-white/70 p-3 backdrop-blur"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed text-neutral-800">
                {ndaConfig.fullText}
              </pre>
            </div>
            <p className="mt-3 border-t border-neutral-200 pt-3 text-[10px] text-neutral-600">{ndaConfig.footer}</p>
            <div className="mt-5 border-t border-neutral-200 pt-4">
              {tokenRecord.require_docusign === false ? (
                <CheckboxAcceptButton token={token} />
              ) : (
                <AcceptNdaButton token={token} />
              )}
            </div>
          </section>
        </div>
      </div>
    </IphoneFrame>
  );
}
