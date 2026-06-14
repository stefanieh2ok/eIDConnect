'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetViewportScroll } from '@/lib/resetViewportScroll';

export function CheckboxAcceptButton({ token }: { token: string }) {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!accepted) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/accept-checkbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Fehler beim Akzeptieren.');
        return;
      }
      const redirectTo = typeof data.redirectTo === 'string' ? data.redirectTo.trim() : '';
      if (!redirectTo) return;

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
    } catch {
      setError('Netzwerkfehler. Bitte erneut versuchen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer select-none items-center gap-2">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-blue-600"
        />
        <span className="t-body-sm leading-tight">
          NDA gelesen, Inhalte vertraulich.
        </span>
      </label>

      <button
        type="button"
        onClick={handleAccept}
        disabled={!accepted || loading}
        className="btn-primary t-button w-full"
      >
        {loading ? 'Wird vorbereitet …' : 'Zustimmen und Vorschau öffnen'}
      </button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
