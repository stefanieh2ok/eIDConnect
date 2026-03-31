'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AcceptNdaButton } from '@/components/security/AcceptNdaButton';
import { GATE_SUMMARY } from '@/lib/nda-content';
import { IphoneFrame } from '@/components/ui/IphoneFrame';

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
    <IphoneFrame>
      <div className="flex h-full min-h-0 flex-col overflow-y-auto rounded-b-[1.75rem] px-2 pb-4">
        <div className="mx-auto w-full max-w-[360px] flex-1 space-y-3 text-gray-900">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600">
            Vertraulicher Zugang
          </p>

          <p className="px-1 text-center text-[13px] font-semibold leading-snug text-neutral-900">
            {GATE_SUMMARY.strictSentence}
          </p>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/65 p-4 shadow-sm backdrop-blur-xl">
            <div className="mb-4 space-y-3 text-[13px] leading-relaxed text-neutral-800">
              {GATE_SUMMARY.summaryParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <Link
              href={`/legal/demo-nda?print=1&returnTo=${encodeURIComponent(`/demo/access?token=${encodeURIComponent(token)}`)}`}
              className="mb-4 flex w-full items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95"
              style={{ background: 'linear-gradient(135deg, #003366 0%, #0055A4 100%)' }}
            >
              PDF drucken
            </Link>

            <div className="rounded-xl border border-white/20 bg-white/95 p-3 text-neutral-900 shadow-inner">
              <AcceptNdaButton token={token} />
            </div>
          </div>
        </div>
      </div>
    </IphoneFrame>
  );
}
