'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';

export type DemoMeta = {
  tokenId: string;
  sessionId: string | null;
  recipientName: string;
  recipientOrg: string;
};

const DemoContext = createContext<DemoMeta | null>(null);

export function useDemo() {
  return useContext(DemoContext);
}

const HEARTBEAT_MS = 30_000;

export function DemoProvider({
  children,
  tokenId,
  sessionId,
  recipientName,
  recipientOrg,
}: {
  children: React.ReactNode;
  tokenId: string;
  sessionId: string | null;
  recipientName: string;
  recipientOrg: string;
}) {
  const sessionRef = useRef(sessionId);
  const tokenIdRef = useRef(tokenId);
  sessionRef.current = sessionId;
  tokenIdRef.current = tokenId;

  const log = useCallback(
    async (eventType: string, pagePath?: string, metadata?: Record<string, unknown>, extra?: { viewport?: string; timezone?: string; referrer?: string; sessionDurationSeconds?: number }) => {
      try {
        const body: Record<string, unknown> = {
          tokenId: tokenIdRef.current,
          sessionId: sessionRef.current ?? undefined,
          eventType,
          pagePath: pagePath ?? (typeof window !== 'undefined' ? window.location.pathname + window.location.search : undefined),
          metadata: metadata ?? {},
        };
        if (extra?.viewport) body.viewport = extra.viewport;
        if (extra?.timezone) body.timezone = extra.timezone;
        if (extra?.referrer) body.referrer = extra.referrer;
        if (extra?.sessionDurationSeconds != null) body.sessionDurationSeconds = extra.sessionDurationSeconds;

        await fetch('/api/demo/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch (_) {}
    },
    []
  );

  useEffect(() => {
    if (!sessionRef.current) return;
    const t = setInterval(() => {
      const viewport = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : undefined;
      const timezone = typeof Intl !== 'undefined' && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined;
      log('heartbeat', undefined, {}, { viewport, timezone });
    }, HEARTBEAT_MS);
    return () => clearInterval(t);
  }, [log]);

  useEffect(() => {
    const start = Date.now();
    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - start) / 1000);
      fetch('/api/demo/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: tokenIdRef.current,
          sessionId: sessionRef.current,
          eventType: 'demo_close',
          sessionDurationSeconds: duration,
        }),
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const meta: DemoMeta = {
    tokenId,
    sessionId,
    recipientName,
    recipientOrg,
  };

  return (
    <DemoContext.Provider value={meta}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoLogger() {
  const meta = useDemo();
  const sessionRef = useRef(meta?.sessionId ?? null);
  sessionRef.current = meta?.sessionId ?? null;
  const tokenIdRef = useRef(meta?.tokenId ?? '');
  tokenIdRef.current = meta?.tokenId ?? '';

  const logPageView = useCallback(
    (path: string) => {
      if (!meta) return;
      fetch('/api/demo/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: tokenIdRef.current,
          sessionId: sessionRef.current,
          eventType: 'page_view',
          pagePath: path,
          viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : undefined,
          timezone: typeof Intl !== 'undefined' && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
          referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
        }),
      }).catch(() => {});
    },
    [meta]
  );

  return { meta, logPageView };
}
