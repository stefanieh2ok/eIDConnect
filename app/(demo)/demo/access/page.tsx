'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AcceptNdaButton } from '@/components/security/AcceptNdaButton';
import { GATE_SUMMARY } from '@/lib/nda-content';
import { IphoneFrame } from '@/components/ui/IphoneFrame';
import ProductIdentityHeader from '@/components/ui/ProductIdentityHeader';

export default function DemoAccessPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token?.trim()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-100">
        <p className="text-gray-800 text-center">Kein Zugangslink angegeben.</p>
        <Link href="/demo" className="mt-4 text-sm text-blue-600 hover:underline">
          Zum Vorschau-Einstieg
        </Link>
      </div>
    );
  }

  return (
    <IphoneFrame>
      <div className="flex h-full min-h-0 flex-col overflow-y-auto rounded-b-[1.75rem] px-2 pb-[88px] pt-1">
        <div className="mx-auto w-full max-w-[360px] flex-1 space-y-4 pb-6 text-neutral-950">
          <div className="card-section">
            <ProductIdentityHeader />
            <p className="mt-1 text-left text-[11px] font-medium leading-snug text-neutral-600">
              Informieren. Verstehen. Mitwirken.
            </p>
            <p className="t-kicker mt-2">Vertraulicher Zugang</p>

            <p className="t-body mt-3">{GATE_SUMMARY.strictSentence}</p>

            <div className="card-content mt-4 space-y-2.5">
              {GATE_SUMMARY.summaryParagraphs.map((para, i) => (
                <p key={i} className="t-body-sm">{para}</p>
              ))}
            </div>
          </div>

          <section className="card-content">
            <Link
              href={`/legal/demo-nda?print=1&returnTo=${encodeURIComponent(`/demo/access?token=${encodeURIComponent(token)}`)}`}
              className="btn-secondary t-button mb-3 inline-flex w-full items-center justify-center"
            >
              PDF drucken
            </Link>

            <div className="rounded-xl border border-neutral-200 bg-[#F8FAFC] p-3">
              <AcceptNdaButton token={token} />
            </div>
          </section>
        </div>
      </div>
    </IphoneFrame>
  );
}
