'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { AppProvider, type RegistrationResidence } from '@/context/AppContext';
import BuergerApp from '@/components/BuergerApp';
import { DemoProvider, useDemoLogger } from '@/lib/demo-logger';
import { ExternalLinkProvider } from '@/components/ExternalLink';
import { AntiCopyLayer } from '@/components/security/AntiCopyLayer';
import { PhoneStage } from '@/components/layout/PhoneStage';

function DemoBanner() {
  const { meta } = useDemoLogger();
  const [dismissed, setDismissed] = useState(false);
  if (!meta || dismissed) return null;
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 text-center text-xs text-slate-600 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-1.5 right-2 p-1 rounded-full hover:bg-slate-200/60 transition-colors text-slate-400 hover:text-slate-600"
        aria-label="Hinweis schließen"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <p className="pr-6">
        Vertrauliche Demo für <strong className="text-slate-700">{meta.recipientOrg || meta.recipientName}</strong> – Zugriff wird dokumentiert.
        {' '}
        <Link href="/legal/demo-nda" className="underline hover:text-blue-600" target="_blank" rel="noopener noreferrer">NDA</Link>
      </p>
    </div>
  );
}

function DemoContent({ registrationResidence }: { registrationResidence: RegistrationResidence | null }) {
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
    <PhoneStage>
      <DemoBanner />
      <AntiCopyLayer disableSelect className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <BuergerApp registrationResidence={registrationResidence} />
      </AntiCopyLayer>
    </PhoneStage>
  );
}

type DemoAppClientProps = {
  tokenId: string;
  sessionId: string;
  recipientName: string;
  recipientOrg: string;
  registrationResidence?: RegistrationResidence | null;
};

export function DemoAppClient({
  tokenId,
  sessionId,
  recipientName,
  recipientOrg,
  registrationResidence = null,
}: DemoAppClientProps) {
  return (
    <AppProvider>
      <ExternalLinkProvider>
      <DemoProvider
        tokenId={tokenId}
        sessionId={sessionId}
        recipientName={recipientName}
        recipientOrg={recipientOrg}
      >
        <DemoContent registrationResidence={registrationResidence} />
      </DemoProvider>
    </ExternalLinkProvider>
    </AppProvider>
  );
}
