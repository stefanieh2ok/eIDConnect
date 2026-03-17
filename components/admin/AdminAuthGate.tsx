'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Client-seitige Absicherung: Ruft /api/admin/verify auf.
 * Nur bei 200 werden die Kinder gerendert – sonst Hinweis zur Anmeldung.
 */
export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/admin/verify', { credentials: 'include' })
      .then((res) => {
        setAllowed(res.ok);
      })
      .catch(() => setAllowed(false));
  }, []);

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600">Prüfe Berechtigung…</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-xl font-semibold text-slate-800 mb-2">Anmeldung erforderlich</h1>
          <p className="text-slate-600 mb-6">
            Der Admin-Bereich ist geschützt. Bitte öffnen Sie den folgenden Link – der Browser zeigt dann das Anmeldefenster.
          </p>
          <Link
            href="/admin"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700"
          >
            Admin-Bereich öffnen (Anmeldung)
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
