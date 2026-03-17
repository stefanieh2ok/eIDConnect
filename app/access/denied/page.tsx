import Link from 'next/link';

export const metadata = {
  title: 'Zugang verweigert – HookAI',
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
      return 'Der Zugangslink ist ungültig oder konnte nicht verifiziert werden.';
    case 'max_views':
      return 'Die maximale Anzahl an Zugriffen für diesen Link wurde erreicht.';
    case 'error':
      return 'Ein technischer Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie den Absender.';
    default:
      return 'Der Zugriff auf diese Demo wurde verweigert.';
  }
}

export default async function AccessDeniedPage({
  searchParams,
}: AccessDeniedPageProps) {
  const { reason } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-8 sm:p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Zugriff verweigert
        </p>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
          Kein Zugriff auf diese Demo
        </h1>
        <p className="mt-4 text-sm leading-6 text-neutral-600">
          {getReasonText(reason)}
        </p>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 text-sm text-neutral-700">
          Dieser Bereich ist ausschließlich für autorisierte Empfänger mit
          gültigem personalisiertem Demo-Zugang bestimmt.
        </div>

        {reason && (
          <p className="mt-4 text-xs text-neutral-400 text-center">
            Grund: {reason}
          </p>
        )}

        <p className="mt-6 text-center">
          <Link href="/demo" className="text-sm text-blue-600 hover:underline">
            Zum Demo-Einstieg
          </Link>
        </p>
      </div>
    </main>
  );
}
