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

const LAST_SESSION_KEY = 'eidconnect_last_demo_session_id_v1';
const INTRO_DONE_KEY = 'eidconnect_product_intro_done_v4';
const ANREDE_SESSION_KEY = 'eidconnect_anrede_confirmed_session_v1';

export function DemoAppClient({
  tokenId,
  sessionId,
  recipientName,
  recipientOrg,
}: DemoAppClientProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const lastSession = localStorage.getItem(LAST_SESSION_KEY);
      if (lastSession !== sessionId) {
        // Neue Demo-Session: Intro-/Anrede-Flow erneut zeigen.
        localStorage.removeItem(INTRO_DONE_KEY);
        sessionStorage.removeItem(ANREDE_SESSION_KEY);
        localStorage.setItem(LAST_SESSION_KEY, sessionId);
      }
    } catch {
      // ignore storage access issues
    }
  }, [sessionId]);

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
