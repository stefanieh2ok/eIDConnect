'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetViewportScroll } from '@/lib/resetViewportScroll';

const INTRO_AUTOSTART_ONCE_KEY = 'eidconnect_intro_autostart_once';
const INTRO_AUDIO_SESSION_KEY = 'eidconnect_intro_audio_v1';
const PRELOGIN_PHASE_KEY = 'eidconnect_prelogin_v2';
const WANTS_WALKTHROUGH_KEY = 'eidconnect_wants_walkthrough_v1';

type AcceptNdaButtonProps = {
  token: string;
  /** Optionale Kurzfassung / Hinweistexte oberhalb des Buttons */
  children?: React.ReactNode;
};

/**
 * NDA-Gate für Access-Token-Flow: Checkbox + Button, ruft POST /api/accept auf,
 * setzt Cookie, leitet zu redirectTo weiter.
 */
export function AcceptNdaButton({ token, children }: AcceptNdaButtonProps) {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!accepted) {
      setError('Bitte akzeptiere zuerst die Vertraulichkeitsvereinbarung.');
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        // Nach NDA immer mit Clara-gestütztem Einstieg starten.
        sessionStorage.setItem(PRELOGIN_PHASE_KEY, 'anrede');
        sessionStorage.setItem(WANTS_WALKTHROUGH_KEY, '1');
        sessionStorage.setItem(INTRO_AUTOSTART_ONCE_KEY, '1');
        sessionStorage.setItem(INTRO_AUDIO_SESSION_KEY, '1');
      }
    } catch {
      // ignore
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          token,
          accepted: true,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error ?? 'Zugriff konnte nicht freigeschaltet werden.');
        return;
      }

      const redirectTo = typeof result.redirectTo === 'string' ? result.redirectTo.trim() : '';
      if (redirectTo) {
        resetViewportScroll();
        if (redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
          router.replace(redirectTo);
          return;
        }
        try {
          const u = new URL(redirectTo);
          if (typeof window !== 'undefined' && u.origin === window.location.origin) {
            router.replace(`${u.pathname}${u.search}${u.hash}`);
            return;
          }
        } catch {
          /* fall through */
        }
        window.location.href = redirectTo;
        return;
      }
      setError('Keine Weiterleitung erhalten.');
    } catch {
      setError('Technischer Fehler beim Freischalten der Demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {children}

      <label className="flex items-start gap-3 text-sm text-neutral-700 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
          aria-describedby="accept-desc"
        />
        <span id="accept-desc">
          Ich habe die Vertraulichkeitsvereinbarung gelesen, verstanden und akzeptiere sie.
        </span>
      </label>

      <button
        type="button"
        onClick={handleAccept}
        disabled={loading}
        className="w-full rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Freischaltung läuft …' : 'Ich akzeptiere die Vertraulichkeitsvereinbarung und öffne die Demo'}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
