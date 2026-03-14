'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { AppProvider } from '@/context/AppContext';
import BuergerApp from '@/components/BuergerApp';
import { DemoProvider, useDemoLogger } from '@/lib/demo-logger';
import { NDA_VERSION, GATE_SUMMARY } from '@/lib/nda-content';
import { Watermark } from '@/components/security/Watermark';
import { AntiCopyLayer } from '@/components/security/AntiCopyLayer';

const STORAGE_KEY_PREFIX = 'demo_terms_';

function AcceptanceGate({
  recipientName,
  recipientOrg,
  tokenId,
  sessionId,
  onAccept,
}: {
  recipientName: string;
  recipientOrg: string;
  tokenId: string;
  sessionId: string | null;
  onAccept: () => void;
}) {
  const [accepting, setAccepting] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  function handleAccept() {
    if (!checkboxChecked) return;
    setAccepting(true);
    const viewport = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : undefined;
    const timezone = typeof Intl !== 'undefined' && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined;
    const referrer = typeof document !== 'undefined' ? document.referrer || undefined : undefined;

    fetch('/api/demo/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenId,
        sessionId,
        eventType: 'terms_accepted',
        pagePath: '/demo',
        nda_version: NDA_VERSION,
        viewport,
        timezone,
        referrer,
      }),
    })
      .then(() =>
        fetch('/api/demo/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenId, sessionId }),
        })
      )
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data?.redirectTo) {
          window.location.href = data.redirectTo;
          return;
        }
        if (data?.success) {
          if (typeof window !== 'undefined') window.sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${tokenId}`, '1');
          onAccept();
        } else {
          setAccepting(false);
        }
      })
      .catch(() => setAccepting(false));
  }

  const orgLabel = recipientOrg || recipientName;
  const canSubmit = checkboxChecked && !accepting;

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-100 text-gray-900"
      style={{
        minHeight: '100dvh',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
        paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="max-w-[26rem] mx-auto w-full flex flex-col flex-1 min-h-0">
        {/* Dezent: kein Produktname, nur Kontext – Neugier auf das, was kommt */}
        <p className="text-center text-xs text-gray-500 uppercase tracking-wide mt-1 mb-3">
          Vertraulicher Zugang
        </p>

        <p className="text-center font-semibold text-[15px] leading-snug text-gray-900 mb-4 px-1">
          {GATE_SUMMARY.strictSentence}
        </p>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
          <div className="p-4 overflow-y-auto flex-1 overscroll-contain">
            <div className="space-y-3 text-[13px] leading-relaxed text-gray-700">
              {GATE_SUMMARY.summaryParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <p className="mt-4">
              <Link
                href="/legal/demo-nda"
                className="text-blue-600 hover:underline text-[13px] font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vollständige Vertraulichkeitsvereinbarung anzeigen
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <label className="flex gap-3 cursor-pointer select-none items-start">
            <input
              type="checkbox"
              checked={checkboxChecked}
              onChange={(e) => setCheckboxChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              aria-describedby="acceptance-desc"
            />
            <span id="acceptance-desc" className="text-[13px] text-gray-700 leading-snug">
              Ich habe die Vertraulichkeitsvereinbarung gelesen und akzeptiere sie. Ich bestätige, dass ich der berechtigte Empfänger dieses personalisierten Links bin.
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleAccept}
          disabled={!canSubmit}
          className="mt-4 w-full py-3.5 rounded-xl font-semibold text-[15px] text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none transition-colors touch-manipulation"
        >
          {accepting ? 'Bitte warten…' : 'Zugang bestätigen und Demo starten'}
        </button>

        <p className="mt-3 text-center text-[11px] text-gray-500">
          Personalisiert für <strong>{orgLabel}</strong> · Version {NDA_VERSION}
        </p>
      </div>
    </div>
  );
}

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
  const { meta, logPageView } = useDemoLogger();

  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    if (path !== pathRef.current) {
      pathRef.current = path;
      logPageView(path);
    }
  });

  return (
    <>
      {meta && (
        <Watermark
          fullName={meta.recipientName}
          company={meta.recipientOrg ?? ''}
          demoId="buerger-app"
        />
      )}
      <AntiCopyLayer disableSelect className="min-h-0 flex flex-col flex-1">
        <DemoBanner />
        <BuergerApp />
      </AntiCopyLayer>
    </>
  );
}

function DemoExpired() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-100">
      <p className="text-lg text-gray-800 text-center">Diese Demo ist nicht mehr verfügbar.</p>
    </div>
  );
}

export default function DemoPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [payload, setPayload] = useState<{
    tokenId: string;
    sessionId: string | null;
    recipientName: string;
    recipientOrg: string;
  } | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const openLogged = useRef(false);

  useEffect(() => {
    if (!token?.trim()) {
      setStatus('invalid');
      return;
    }

    let cancelled = false;

    (async () => {
      const res = await fetch(`/api/demo/validate?token=${encodeURIComponent(token.trim())}`);
      if (cancelled) return;
      if (!res.ok) {
        if (res.status === 403 || res.status === 404) {
          try {
            await fetch('/api/demo/log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token: token?.trim(),
                eventType: 'token_expired_attempt',
                pagePath: '/demo',
              }),
            });
          } catch (_) {}
        }
        setStatus('invalid');
        return;
      }

      const data = await res.json();
      if (cancelled) return;

      setPayload({
        tokenId: data.tokenId,
        sessionId: null,
        recipientName: data.recipientName,
        recipientOrg: data.recipientOrg ?? '',
      });
      setStatus('valid');
    })();

    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (status !== 'valid' || !payload || openLogged.current) return;
    openLogged.current = true;

    const viewport = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : undefined;
    const timezone = typeof Intl !== 'undefined' && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined;
    const referrer = typeof document !== 'undefined' ? document.referrer || undefined : undefined;

    fetch('/api/demo/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenId: payload.tokenId,
        eventType: 'demo_open',
        pagePath: '/demo',
        viewport,
        timezone,
        referrer,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.sessionId) {
          setPayload((p) => (p ? { ...p, sessionId: data.sessionId } : p));
        }
      })
      .catch(() => {});
  }, [status, payload]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-100">
        <p className="text-gray-600">Laden…</p>
      </div>
    );
  }

  if (status === 'invalid') {
    return <DemoExpired />;
  }

  if (!payload) return null;

  // Einmalige Akzeptanz der Geheimhaltung (pro Token, gespeichert in sessionStorage)
  if (!termsAccepted) {
    return (
      <AcceptanceGate
        recipientName={payload.recipientName}
        recipientOrg={payload.recipientOrg}
        tokenId={payload.tokenId}
        sessionId={payload.sessionId}
        onAccept={() => setTermsAccepted(true)}
      />
    );
  }

  return (
    <AppProvider>
      <DemoProvider
        tokenId={payload.tokenId}
        sessionId={payload.sessionId}
        recipientName={payload.recipientName}
        recipientOrg={payload.recipientOrg}
      >
        <DemoContent />
      </DemoProvider>
    </AppProvider>
  );
}
