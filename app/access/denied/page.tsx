import Link from 'next/link';
import { IphoneFrame } from '@/components/ui/IphoneFrame';
import { APP_DISPLAY_NAME } from '@/lib/branding';

export const metadata = {
  title: `Zugang verweigert – ${APP_DISPLAY_NAME}`,
};

type AccessDeniedPageProps = {
  searchParams: Promise<{ reason?: string }>;
};

function getReasonText(reason?: string) {
  switch (reason) {
    case 'expired':
      return 'Dieser personalisierte Zugangslink ist abgelaufen.';
    case 'revoked':
      return 'Dieser personalisierte Zugangslink wurde widerrufen.';
    case 'invalid':
      return 'Der Zugangslink ist ungültig oder konnte nicht verifiziert werden. Mögliche Ursachen: Link wurde abgeschnitten, Token fehlt in der Datenbank, oder die Rückleitung vom Signaturdienst hat den Token nicht übermittelt. Bitte den vollständigen Link aus der E-Mail verwenden und erneut versuchen.';
    case 'max_views':
      return 'Die maximale Anzahl an Zugriffen für diesen Link wurde erreicht.';
    case 'error':
      return 'Ein technischer Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie den Absender.';
    default:
      return 'Der Zugriff auf diese Vorschau wurde verweigert.';
  }
}

export default async function AccessDeniedPage({
  searchParams,
}: AccessDeniedPageProps) {
  const { reason } = await searchParams;

  return (
    <IphoneFrame>
      <main className="flex h-full min-h-0 w-full items-center justify-center rounded-b-[1.75rem] px-3 py-6">
      <div className="w-full max-w-[360px] rounded-2xl border border-neutral-200 bg-white/70 p-6 text-neutral-900 shadow-lg backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-600">
          Zugriff verweigert
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">
          Kein Zugriff auf diese Vorschau
        </h1>
        <p className="mt-4 text-sm leading-6 text-neutral-800">
          {getReasonText(reason)}
        </p>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white/55 p-4 text-sm text-neutral-800 backdrop-blur">
          Dieser Bereich ist ausschließlich für autorisierte Empfänger mit
          gültigem personalisiertem Vorschau-Zugang bestimmt.
        </div>

        {reason && (
          <p className="mt-4 text-center text-xs text-neutral-600">
            Grund: {reason}
          </p>
        )}

        <p className="mt-6 text-center">
          <Link href="/demo" className="text-sm text-blue-700 underline hover:text-blue-800">
            Zum Vorschau-Einstieg
          </Link>
        </p>
      </div>
      </main>
    </IphoneFrame>
  );
}
