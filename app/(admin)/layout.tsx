import { headers } from 'next/headers';
import { isValidBasicAuth } from '@/lib/security/basic-auth';
import Link from 'next/link';
import AdminAuthGate from '@/components/admin/AdminAuthGate';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const authHeader = h.get('authorization') ?? h.get('Authorization');
  if (!isValidBasicAuth(authHeader)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-xl font-semibold text-slate-800 mb-2">Authentifizierung erforderlich</h1>
          <p className="text-slate-600 mb-6">
            Der Admin-Bereich ist geschützt. Bitte melden Sie sich mit Benutzername und Passwort an.
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Klicken Sie auf den Button – der Browser zeigt dann das Anmeldefenster (Benutzername und Passwort aus den Einstellungen des Projekts).
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
  return <AdminAuthGate>{children}</AdminAuthGate>;
}
