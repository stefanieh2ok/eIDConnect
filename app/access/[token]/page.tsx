import { redirect } from 'next/navigation';
import { findAccessTokenByRawToken, isTokenExpired } from '@/lib/security/token';
import { getNdaConfigForRecipient } from '@/config/nda';
import { AcceptNdaButton } from '@/components/access/accept-nda-button';
import { CheckboxAcceptButton } from '@/components/access/checkbox-accept-button';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import { IphoneFrame } from '@/components/ui/IphoneFrame';
import ProductIdentityHeader from '@/components/ui/ProductIdentityHeader';

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

  const ndaConfig = getNdaConfigForRecipient({
    email: tokenRecord.email,
    company: tokenRecord.company,
  });
  const ndaDownloadUrl = `/api/nda/download?token=${encodeURIComponent(token)}`;
  const ndaInlineUrl = `/api/nda/download?token=${encodeURIComponent(token)}&disposition=inline`;

  return (
    <IphoneFrame>
      <div
        className="flex h-full min-h-0 flex-col overflow-y-auto rounded-b-[1.75rem] px-2 pb-[88px] pt-1"
        style={{
          background: 'transparent',
        }}
      >
        <div className="mx-auto w-full max-w-[360px] space-y-4 pb-6 text-neutral-950">
          <div className="card-section">
            <ProductIdentityHeader />
            <p className="t-kicker">Vertraulicher Zugriff</p>
            <h1 className="t-h1 mt-2">{ndaConfig.header || 'Vertraulicher Demo-Zugang'}</h1>
            <p className="t-body mt-3">
              Dieser personalisierte Zugang ist ausschließlich für die benannte Person bestimmt.
              Für Tester erfolgt die Freigabe über die bestätigte NDA-Zustimmung im nächsten Schritt.
            </p>

            <div className="card-content mt-4">
              <p className="t-card-title">Personalisierter Demo-Zugang</p>
              <div className="mt-2 space-y-1">
                <p>
                  <span className="t-meta font-semibold text-neutral-900">Empfänger:</span>{' '}
                  <span className="t-body-sm text-neutral-800">{tokenRecord.full_name}</span>
                </p>
                {tokenRecord.company ? (
                  <p>
                    <span className="t-meta font-semibold text-neutral-900">Organisation:</span>{' '}
                    <span className="t-body-sm text-neutral-800">{tokenRecord.company}</span>
                  </p>
                ) : null}
                <p>
                  <span className="t-meta font-semibold text-neutral-900">E-Mail:</span>{' '}
                  <span className="t-body-sm text-neutral-800">{tokenRecord.email}</span>
                </p>
              </div>
            </div>
          </div>

          <section className="card-content">
            <h2 className="t-h2">Geheimhaltungsvereinbarung</h2>
            <p className="t-body-sm mt-1">
              PDF-Dokument für Ablage, Prüfung oder Ausdruck.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <a href={ndaDownloadUrl} className="btn-primary t-button inline-flex items-center justify-center">
                PDF herunterladen
              </a>
              <a
                href={ndaInlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary t-button inline-flex items-center justify-center"
              >
                PDF drucken
              </a>
            </div>
          </section>

          <section className="card-content">
            <h2 className="t-h2">Kurzfassung</h2>
            <ul className="mt-3 space-y-2">
              {ndaConfig.gateSummary.slice(0, 4).map((item, i) => (
                <li key={i} className="card-compact t-body-sm">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="card-content">
            <p className="t-caption">{ndaConfig.footer}</p>
            <div className="mt-5 border-t border-neutral-200 pt-4">
              {tokenRecord.require_docusign === false ? (
                <CheckboxAcceptButton token={token} />
              ) : (
                <AcceptNdaButton
                  token={token}
                  returnEmailPrimary={ndaConfig.returnEmailPrimary}
                  returnEmailSecondary={ndaConfig.returnEmailSecondary}
                  sentenceBelowButton={ndaConfig.sentenceBelowButton}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </IphoneFrame>
  );
}
