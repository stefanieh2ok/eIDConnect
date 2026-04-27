import type { Metadata } from 'next';
import Link from 'next/link';
import { ndaConfig } from '@/config/nda';
import { APP_DISPLAY_NAME } from '@/lib/branding';

export const metadata: Metadata = {
  title: `Vertraulichkeitserklärung – ${APP_DISPLAY_NAME}`,
  description: `Vertraulichkeitserklärung für den Zugang zur vertraulichen Demo-Umgebung von ${APP_DISPLAY_NAME}.`,
};

type Props = { searchParams: Promise<{ print?: string; returnTo?: string }> };

export default async function DemoNdaPage({ searchParams }: Props) {
  const { returnTo } = await searchParams;
  // `returnTo` kann je nach Client/Encoding als `%2Faccess%2F...` ankommen.
  // Wir machen es robust, damit "Zurück" immer korrekt auf die vorherige Gate-Seite führt.
  let safeReturnTo: string | null = null;
  if (typeof returnTo === 'string' && returnTo.length > 0) {
    const candidate = returnTo.startsWith('%') ? decodeURIComponent(returnTo) : returnTo;
    safeReturnTo = candidate.startsWith('/') ? candidate : null;
  }

  return (
    <div className="min-h-screen bg-white text-[#162033]">
      <header className="sticky top-0 z-10 border-b border-[#DDE7F2] bg-white px-4 py-3 print:hidden">
        <div className="mx-auto flex max-w-[900px] items-center justify-between">
          <div>
            <h1 className="t-card-title">Geheimhaltungsvereinbarung (NDA)</h1>
            <p className="t-meta mt-0.5">Dokumentansicht · {APP_DISPLAY_NAME}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/api/nda/download?disposition=inline" target="_blank" rel="noopener noreferrer" className="btn-secondary t-button inline-flex items-center justify-center">
              PDF drucken
            </a>
            <a href="/api/nda/download" className="btn-primary t-button inline-flex items-center justify-center">
              PDF herunterladen
            </a>
            <Link href={safeReturnTo ?? '/'} className="btn-ghost t-button inline-flex items-center justify-center">
              {safeReturnTo ? 'Zurück' : 'Startseite'}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[900px] px-6 py-8">
        <article className="relative overflow-hidden rounded-2xl border border-[#DDE7F2] bg-white p-8 shadow-sm">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <span className="app-confidential-watermark__line top-[48%] text-[26px]" style={{ opacity: 0.07 }}>
              HookAI · Confidential
            </span>
          </div>
          <pre className="relative whitespace-pre-wrap font-sans text-[11pt] leading-[1.45] text-neutral-800">
            {ndaConfig.fullText}
          </pre>
        </article>
      </main>
    </div>
  );
}
