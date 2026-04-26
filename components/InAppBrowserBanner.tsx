'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { isMessengerInAppBrowser } from '@/lib/inAppBrowser';
import { APP_DISPLAY_NAME } from '@/lib/branding';

const SESSION_KEY = 'hookai_inapp_browser_hint_v1';

/**
 * Hinweis für Nutzer, die den Link z. B. aus WhatsApp öffnen (eingebetteter Browser).
 */
export function InAppBrowserBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      /* ignore */
    }
    setVisible(isMessengerInAppBrowser());
  }, []);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  const copyLink = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      try {
        window.prompt('Bitte den Link markieren und kopieren:', url);
      } catch {
        /* ignore */
      }
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="sticky top-0 z-[9999] border-b border-[#002040] bg-[#003366] px-3 py-2.5 text-left text-white shadow-md"
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))' }}
      role="region"
      aria-label="Hinweis zum eingebetteten Browser"
    >
      <p className="text-[11px] font-semibold leading-snug sm:text-xs">
        Sie öffnen {APP_DISPLAY_NAME} im eingebetteten Browser (z. B. WhatsApp). Für Anmeldung, Ton und Mikrofon
        bitte oben auf <span className="whitespace-nowrap">⋯</span> tippen und{' '}
        <span className="font-bold">In Safari öffnen</span> (iPhone) bzw.{' '}
        <span className="font-bold">Im Browser öffnen</span> (Android) wählen.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="min-h-[40px] rounded-lg bg-white/15 px-3 text-[11px] font-bold text-white ring-1 ring-white/30 hover:bg-white/25"
        >
          Link kopieren
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="min-h-[40px] rounded-lg bg-white px-3 text-[11px] font-bold text-[#003366] hover:bg-slate-100"
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}
