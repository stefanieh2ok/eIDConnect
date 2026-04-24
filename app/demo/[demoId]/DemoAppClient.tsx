'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { AppProvider } from '@/context/AppContext';
import BuergerApp from '@/components/BuergerApp';
import { DemoProvider, useDemoLogger } from '@/lib/demo-logger';
import { ExternalLinkProvider } from '@/components/ExternalLink';
import { AntiCopyLayer } from '@/components/security/AntiCopyLayer';
import { IphoneFrame } from '@/components/ui/IphoneFrame';
import { clearIntroSessionKeys } from '@/lib/introPreLoginPhase';
import { resetViewportScroll } from '@/lib/resetViewportScroll';

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
        {/* Kein eigenes bottom-radius: der äußere IphoneFrame clippt mit overflow-hidden;
           abweichender Radius wirkte wie „Auslauf“ unter dem Rahmen. */}
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F7F9FC]">
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
    const flush = () => {
      resetViewportScroll();
      const loginScroll = document.getElementById('login-main-scroll');
      if (loginScroll) loginScroll.scrollTop = 0;
      const mainScroll = document.getElementById('main-scroll');
      if (mainScroll) mainScroll.scrollTop = 0;
    };
    flush();
    const raf = requestAnimationFrame(flush);
    return () => cancelAnimationFrame(raf);
  }, [sessionId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = window.setTimeout(() => resetViewportScroll(), 0);
    const t2 = window.setTimeout(() => resetViewportScroll(), 120);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
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
