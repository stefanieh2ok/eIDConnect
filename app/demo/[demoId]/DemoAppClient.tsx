'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { AppProvider } from '@/context/AppContext';
import BuergerApp from '@/components/BuergerApp';
import { DemoProvider, useDemoLogger } from '@/lib/demo-logger';
import { AntiCopyLayer } from '@/components/security/AntiCopyLayer';

function DemoBanner() {
  const { meta } = useDemoLogger();
  if (!meta) return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 text-center text-xs text-amber-900">
      <p className="font-semibold">
        Dieser Demo-Link ist personalisiert und ausschließlich für den benannten Empfänger bestimmt. Eine Weiterleitung, gemeinsame Nutzung oder Offenlegung an Dritte ist untersagt.
      </p>
      <p className="mt-1">
        Vertrauliche personalisierte Demo für <strong>{meta.recipientOrg || meta.recipientName}</strong> – Zugriff wird dokumentiert.
        {' '}
        <Link href="/legal/demo-nda" className="underline" target="_blank" rel="noopener noreferrer">Geheimhaltungsvereinbarung</Link>
      </p>
    </div>
  );
}

function DemoContent() {
  const pathRef = useRef<string>('');
  const { logPageView } = useDemoLogger();

  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    if (path !== pathRef.current) {
      pathRef.current = path;
      logPageView(path);
    }
  });

  return (
    <>
      <DemoBanner />
      <AntiCopyLayer disableSelect className="min-h-0 flex flex-col flex-1">
        <BuergerApp />
      </AntiCopyLayer>
    </>
  );
}

type DemoAppClientProps = {
  tokenId: string;
  sessionId: string;
  recipientName: string;
  recipientOrg: string;
};

export function DemoAppClient({
  tokenId,
  sessionId,
  recipientName,
  recipientOrg,
}: DemoAppClientProps) {
  return (
    <AppProvider>
      <DemoProvider
        tokenId={tokenId}
        sessionId={sessionId}
        recipientName={recipientName}
        recipientOrg={recipientOrg}
      >
        <DemoContent />
      </DemoProvider>
    </AppProvider>
  );
}
