'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AcceptNdaButton } from '@/components/security/AcceptNdaButton';
import { GATE_SUMMARY } from '@/lib/nda-content';

export default function DemoAccessPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token?.trim()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-100">
        <p className="text-gray-800 text-center">Kein Zugangslink angegeben.</p>
        <Link href="/demo" className="mt-4 text-sm text-blue-600 hover:underline">
          Zum Demo-Einstieg
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-100 text-gray-900 p-4"
      style={{
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
        paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="max-w-[26rem] mx-auto w-full flex flex-col flex-1 min-h-0">
        <p className="text-center text-xs text-gray-500 uppercase tracking-wide mt-1 mb-3">
          Vertraulicher Zugang
        </p>

        <p className="text-center font-semibold text-[15px] leading-snug text-gray-900 mb-4 px-1">
          {GATE_SUMMARY.strictSentence}
        </p>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col p-4">
          <div className="space-y-3 text-[13px] leading-relaxed text-gray-700 mb-4">
            {GATE_SUMMARY.summaryParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <p className="mb-4">
            <Link
              href="/legal/demo-nda"
              className="text-blue-600 hover:underline text-[13px] font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vollständige Vertraulichkeitsvereinbarung anzeigen
            </Link>
          </p>

          <AcceptNdaButton token={token} />
        </div>
      </div>
    </div>
  );
}
