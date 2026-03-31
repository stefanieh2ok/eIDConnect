'use client';

import { useEffect, useRef } from 'react';
import { AppProvider } from '@/context/AppContext';
import BuergerApp from '@/components/BuergerApp';
import { DemoProvider, useDemoLogger } from '@/lib/demo-logger';
import { ExternalLinkProvider } from '@/components/ExternalLink';
import { AntiCopyLayer } from '@/components/security/AntiCopyLayer';
import { IphoneFrame } from '@/components/ui/IphoneFrame';

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
    <AntiCopyLayer disableSelect className="flex min-h-0 flex-1 flex-col">
      <IphoneFrame fillContainer>
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-b-[1.75rem] bg-[#F7F9FC]">
          <BuergerApp variant="device" />
        </div>
      </IphoneFrame>
    </AntiCopyLayer>
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
      <ExternalLinkProvider>
        <DemoProvider
          tokenId={tokenId}
          sessionId={sessionId}
          recipientName={recipientName}
          recipientOrg={recipientOrg}
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <DemoContent />
          </div>
        </DemoProvider>
      </ExternalLinkProvider>
    </AppProvider>
  );
}
