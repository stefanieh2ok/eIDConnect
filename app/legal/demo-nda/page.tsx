import type { Metadata } from 'next';
import Link from 'next/link';
import NdaPrintButton from '@/components/NdaPrintButton';
import { ndaConfig } from '@/config/nda';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import { AppStage } from '@/components/ui/AppStage';
import { IphoneFrame } from '@/components/ui/IphoneFrame';

export const metadata: Metadata = {
  title: `Vertraulichkeitserklärung – ${APP_DISPLAY_NAME}`,
  description: `Vertraulichkeitserklärung für den Zugang zur vertraulichen Demo-Umgebung von ${APP_DISPLAY_NAME}.`,
};

type Props = { searchParams: Promise<{ print?: string; returnTo?: string }> };

export default async function DemoNdaPage({ searchParams }: Props) {
  const { print, returnTo } = await searchParams;
  const isPrintView = print === '1';
  // `returnTo` kann je nach Client/Encoding als `%2Faccess%2F...` ankommen.
  // Wir machen es robust, damit "Zurück" immer korrekt auf die vorherige Gate-Seite führt.
  let safeReturnTo: string | null = null;
  if (typeof returnTo === 'string' && returnTo.length > 0) {
    const candidate = returnTo.startsWith('%') ? decodeURIComponent(returnTo) : returnTo;
    safeReturnTo = candidate.startsWith('/') ? candidate : null;
  }

  return (
    <AppStage>
    <IphoneFrame>
    <div
      className="h-full min-h-0 overflow-y-auto rounded-b-[1.75rem] bg-[#F7F9FC] text-gray-800"
      style={{
        paddingLeft: 'max(0.6rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.6rem, env(safe-area-inset-right))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <header className="bg-white border-b border-[#D6E0EE] sticky top-0 z-10 px-3 py-3 print:static">
        <div className="mx-auto flex w-full max-w-[360px] flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-bold text-[#1A2B45]">Vertraulichkeitserklärung</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Demo-Zugang · {APP_DISPLAY_NAME}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <NdaPrintButton />
            <Link
              href={safeReturnTo ?? '/'}
              className="text-sm text-[#0055A4] hover:underline ml-1"
            >
              {safeReturnTo ? '← Zurück' : '← Startseite'}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[360px] px-2 py-3 print:py-0">
        <article
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:border-0 print:shadow-none print:rounded-none"
          id="nda-print-content"
        >
          <div className="p-4 text-[13px] leading-relaxed space-y-4 print:p-0 print:text-[11pt] print:leading-snug nda-print-content max-h-[70vh] overflow-y-auto print:max-h-none print:overflow-visible">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 print:whitespace-pre-wrap">
              {ndaConfig.fullText}
            </pre>
          </div>
          <p className="p-6 pt-4 text-xs text-gray-500 border-t border-gray-100 print:pt-2">
            {ndaConfig.footer}
          </p>

          <div className="mt-6 border-t border-gray-200 p-4 pt-6 print:mt-8 print:pt-8">
            <p className="text-xs text-gray-500 mb-6 print:text-[10pt]">
              Optional: Für die Demo-Zugänge ist die dokumentierte elektronische Zustimmung rechtlich ausreichend. Die folgenden Unterschriftszeilen dienen der optionalen Dokumentation bei Bedarf (z. B. Ausdruck zur Ablage).
            </p>
            <div className="grid grid-cols-1 gap-8 print:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1 print:text-[11pt]">
                  {ndaConfig.signatureLabelDisclosing}
                </p>
                {ndaConfig.signatureImagePath ? (
                  <img
                    src={ndaConfig.signatureImagePath}
                    alt="Unterschrift Offenlegende Partei"
                    className="max-h-16 max-w-[220px] object-contain object-left print:max-h-12 print:max-w-[180px]"
                  />
                ) : (
                  <div className="h-12 border-b border-gray-400 print:h-10" aria-hidden />
                )}
                <p className="mt-1 text-xs text-gray-500">Ort, Datum</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1 print:text-[11pt]">
                  {ndaConfig.signatureLabelReceiving}
                </p>
                <div className="h-12 border-b border-gray-400 print:h-10" aria-hidden />
                <p className="mt-1 text-xs text-gray-500">Ort, Datum</p>
                <p className="mt-1 text-xs text-gray-500 italic">{ndaConfig.signatureHintReceiving}</p>
              </div>
            </div>
          </div>
        </article>

        {!isPrintView && (
          <p className="mt-6 text-center">
            <Link
              href={safeReturnTo ?? '/'}
              className="text-blue-600 hover:underline text-sm"
            >
              {safeReturnTo ? '← Zurück' : '← Zur Startseite'}
            </Link>
          </p>
        )}
      </main>
    </div>
    </IphoneFrame>
    </AppStage>
  );
}
