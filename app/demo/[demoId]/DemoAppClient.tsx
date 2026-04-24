'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { AppProvider } from '@/context/AppContext';
import BuergerApp from '@/components/BuergerApp';
import { DemoProvider, useDemoLogger } from '@/lib/demo-logger';
import { ExternalLinkProvider } from '@/components/ExternalLink';
import { AntiCopyLayer } from '@/components/security/AntiCopyLayer';
import { IphoneFrame } from '@/components/ui/IphoneFrame';
import { clearIntroSessionKeys } from '@/lib/introPreLoginPhase';

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

const INTRO_DONE_KEY = 'eidconnect_product_intro_done_v4';

export function DemoAppClient({
  tokenId,
  sessionId,
  recipientName,
  recipientOrg,
}: DemoAppClientProps) {
  /**
   * Synchron in der Render-Phase (pro sessionId), **bevor** BuergerApp `readPreLoginPhase` liest:
   * sonst bleibt `eidconnect_prelogin_v2: ok` aus der letzten Sitzung hängen → kein
   * Anrede-Dropdown, „unverändert“-Effekt. useEffect wäre zu spät.
   */
  const resetGate = useRef<string | null>(null);
  if (typeof window !== 'undefined' && resetGate.current !== sessionId) {
    resetGate.current = sessionId;
    try {
      localStorage.removeItem(INTRO_DONE_KEY);
      clearIntroSessionKeys();
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(INTRO_DONE_KEY);
      clearIntroSessionKeys();
    } catch {
      // ignore
    }
  }, [sessionId]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    } catch {
      // ignore
    }
    try {
      window.scrollTo(0, 0);
    } catch {
      /* jsdom: not implemented */
    }
    try {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {
      /* ignore */
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
