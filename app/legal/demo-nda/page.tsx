import type { Metadata } from 'next';
import Link from 'next/link';
import { ndaConfig } from '@/config/nda';
import { NdaPrintButton } from './NdaPrintButton';

export const metadata: Metadata = {
  title: 'Vertraulichkeitsvereinbarung (NDA) – Demo-Zugang',
  description:
    'Geheimhaltungsvereinbarung für den Zugang zu einer vertraulichen Demo-Umgebung (DeinDeutschland / Bürger App).',
};

type Props = { searchParams: Promise<{ print?: string }> };

export default async function DemoNdaPage({ searchParams }: Props) {
  const { print } = await searchParams;
  const isPrintView = print === '1';

  return (
    <div
      className="min-h-screen bg-slate-50 text-gray-800"
      style={{
        minHeight: '100dvh',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
      }}
    >
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3 print:static print:border-b">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-bold text-gray-900">Vertraulichkeitsvereinbarung (NDA)</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              für den Zugang zu einer vertraulichen Demo-Umgebung – DeinDeutschland / Bürger App
            </p>
          </div>
          {isPrintView ? (
            <NdaPrintButton />
          ) : (
            <Link
              href="/"
              className="text-sm text-blue-600 hover:underline"
            >
              ← Zur Startseite
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 print:py-0">
        <article
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:border-0 print:shadow-none print:rounded-none"
          id="nda-print-content"
        >
          <div className="p-6 sm:p-8 text-[13px] leading-relaxed space-y-4 print:p-0 print:text-[11pt] print:leading-snug nda-print-content">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 print:whitespace-pre-wrap">
              {ndaConfig.fullText}
            </pre>
          </div>
          <p className="p-6 pt-4 text-xs text-gray-500 border-t border-gray-100 print:pt-2">
            {ndaConfig.footer}
          </p>

          <div className="p-6 sm:p-8 pt-6 mt-6 border-t border-gray-200 print:mt-8 print:pt-8">
            <p className="text-xs text-gray-500 mb-6 print:text-[10pt]">
              Optional: Für die Demo-Zugänge ist die dokumentierte elektronische Zustimmung rechtlich ausreichend. Die folgenden Unterschriftszeilen dienen der optionalen Dokumentation bei Bedarf (z. B. Ausdruck zur Ablage).
            </p>
            <div className="grid gap-8 sm:grid-cols-2 print:grid-cols-2">
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
              </div>
            </div>
          </div>
        </article>

        {!isPrintView && (
          <p className="mt-6 text-center">
            <Link href="/" className="text-blue-600 hover:underline text-sm">
              ← Zur Startseite
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
