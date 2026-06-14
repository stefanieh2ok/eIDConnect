'use client';

import { useEffect } from 'react';

/**
 * App-Router-Fehlergrenze: verhindert leere „missing required error components“-Zustände,
 * wenn ein Laufzeitfehler im Segment auftritt (z. B. nach kaputtem .next-Cache).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-4 px-4 py-8 font-sans text-neutral-900">
      <h1 className="text-lg font-semibold text-[#1A2B45]">Die Seite konnte nicht geladen werden</h1>
      <p className="text-sm leading-relaxed text-neutral-600">
        Bitte den Entwicklungsserver stoppen, den Ordner <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">.next</code> löschen
        und <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">npm run dev</code> neu starten — nicht parallel zu{' '}
        <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">npm run build</code> ausführen.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="self-start rounded-lg border border-[#0055A4]/40 bg-[#F0F6FC] px-4 py-2 text-sm font-semibold text-[#003B73] hover:bg-[#E4EEF8]"
      >
        Erneut versuchen
      </button>
    </div>
  );
}
