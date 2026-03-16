'use client';

import { useState } from 'react';

const SQL = `-- 1) Zuerst demo_access_tokens (wird von access_requests benötigt)
create table if not exists demo_access_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  demo_id text not null,
  full_name text not null,
  company text,
  email text not null,
  nda_version text not null,
  nda_document_hash text not null,
  expires_at timestamptz not null,
  max_views integer not null default 10,
  max_devices integer not null default 1,
  is_revoked boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_demo_access_tokens_token_hash on demo_access_tokens (token_hash);
create index if not exists idx_demo_access_tokens_expires_at on demo_access_tokens (expires_at);
create index if not exists idx_demo_access_tokens_demo_id on demo_access_tokens (demo_id);
alter table demo_access_tokens enable row level security;
do $$ begin
  create policy "Admin read demo_access_tokens" on demo_access_tokens for select to authenticated using (true);
exception when duplicate_object then null;
end $$;

-- 2) Dann access_requests
create table if not exists access_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  company text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  demo_access_token_id uuid references demo_access_tokens(id) on delete set null
);
create index if not exists idx_access_requests_status on access_requests (status);
create index if not exists idx_access_requests_created_at on access_requests (created_at desc);
alter table access_requests enable row level security;
do $$ begin
  create policy "Admin read access_requests" on access_requests for select to authenticated using (true);
exception when duplicate_object then null;
end $$;`;

type CheckResult = {
  ok: boolean;
  status?: string;
  checks?: { step: string; ok: boolean; message: string }[];
  nextStep?: string;
};

export default function SetupPage() {
  const [copied, setCopied] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createResult, setCreateResult] = useState<{ ok: boolean; message?: string; error?: string } | null>(null);
  const [createSecret, setCreateSecret] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheck = async () => {
    setCheckLoading(true);
    setCheckResult(null);
    try {
      const res = await fetch('/api/check-setup');
      const data = await res.json();
      setCheckResult(data);
    } catch {
      setCheckResult({
        ok: false,
        nextStep: 'Server nicht erreichbar. Bitte npm run dev starten und diese Seite unter der gleichen Adresse öffnen (z.B. localhost:3002).',
      });
    } finally {
      setCheckLoading(false);
    }
  };

  const handleCreateTable = async () => {
    setCreateLoading(true);
    setCreateResult(null);
    try {
      const res = await fetch('/api/setup/create-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createSecret ? { secret: createSecret } : {}),
      });
      const data = await res.json();
      setCreateResult(data);
      if (data.ok) setTimeout(() => handleCheck(), 500);
    } catch {
      setCreateResult({ ok: false, error: 'Server nicht erreichbar.' });
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-xl font-semibold text-neutral-900">
          Tabelle „access_requests“ anlegen
        </h1>

        {/* Admin-Login */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-900">Admin-Login (/admin)</h2>
          <p className="mt-1 text-sm text-amber-800">
            Benutzername und Passwort stehen in <strong>.env.local</strong> (<code className="rounded bg-amber-100 px-1">ADMIN_BASIC_USER</code>, <code className="rounded bg-amber-100 px-1">ADMIN_BASIC_PASS</code>). Standardwerte: <strong>admin</strong> / <strong>bitte-ein-langes-starkes-passwort</strong>. Beim Anmeldedialog genau so eintragen (Groß-/Kleinschreibung beachten). Nach Änderung in .env.local: Server neu starten.
          </p>
        </div>

        {/* Tabelle direkt anlegen */}
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
          <h2 className="text-sm font-semibold text-green-900">Tabelle direkt anlegen</h2>
          <p className="mt-1 text-sm text-green-800">
            Wenn du in <strong>.env.local</strong> einen <strong>SUPABASE_ACCESS_TOKEN</strong> eingetragen hast, wird die Tabelle hier per Klick angelegt – ohne SQL zu kopieren.
          </p>
          <p className="mt-1 text-xs text-green-700">
            Token erzeugen: Supabase Dashboard → Profil/Account → <strong>Access Tokens</strong> → Generate new token. Token in .env.local als SUPABASE_ACCESS_TOKEN=... eintragen, Server neu starten.
          </p>
          <div className="mt-2">
            <label className="text-xs text-green-800">Falls du SETUP_MIGRATE_SECRET in .env.local gesetzt hast:</label>
            <input
              type="text"
              placeholder="Secret (optional)"
              value={createSecret}
              onChange={(e) => setCreateSecret(e.target.value)}
              className="mt-1 w-full max-w-xs rounded border border-green-300 bg-white px-2 py-1 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleCreateTable}
            disabled={createLoading}
            className="mt-3 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            {createLoading ? 'Wird angelegt …' : 'Tabelle jetzt anlegen'}
          </button>
          {createResult && (
            <div className={`mt-3 text-sm ${createResult.ok ? 'text-green-800' : 'text-red-700'}`}>
              {createResult.ok ? createResult.message : createResult.error}
            </div>
          )}
        </div>

        {/* Diagnose */}
        <div className="rounded-xl border border-neutral-300 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-800">1. Prüfen, was fehlt</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Klicke auf „Prüfen“ – dann siehst du genau, ob Einstellungen oder die Tabelle fehlen.
          </p>
          <button
            type="button"
            onClick={handleCheck}
            disabled={checkLoading}
            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {checkLoading ? 'Prüfe …' : 'Prüfen'}
          </button>
          {checkResult && (
            <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4">
              {checkResult.checks?.map((c, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 text-sm ${c.ok ? 'text-green-700' : 'text-red-700'}`}
                >
                  <span>{c.ok ? '✓' : '✗'}</span>
                  <span>
                    <strong>{c.step}:</strong> {c.message}
                  </span>
                </div>
              ))}
              {checkResult.nextStep && (
                <p className="mt-2 text-sm font-medium text-neutral-800">
                  Nächster Schritt: {checkResult.nextStep}
                </p>
              )}
              {checkResult.ok && (
                <p className="text-sm font-medium text-green-700">
                  Alles bereit – „Zugang anfordern“ auf der Startseite sollte funktionieren.
                </p>
              )}
            </div>
          )}
        </div>

        {/* SQL-Anleitung */}
        <div className="rounded-xl border border-neutral-300 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-800">
            2. Tabellen anlegen (wenn die Prüfung „Tabelle fehlt“ meldet)
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Das SQL unten legt zuerst <strong>demo_access_tokens</strong> an, danach <strong>access_requests</strong>. So tritt der Fehler „relation demo_access_tokens does not exist“ nicht auf.
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-neutral-700">
            <li>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Supabase Dashboard
              </a>{' '}
              → dein Projekt → links <strong>SQL Editor</strong> → <strong>New query</strong>.
            </li>
            <li>Unten auf <strong>„Kopieren“</strong> klicken, dann im Supabase-Fenster <strong>einfügen</strong> (Strg+V).</li>
            <li>Auf <strong>Run</strong> klicken.</li>
          </ol>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded bg-neutral-50 p-3 text-xs text-neutral-800">
            {SQL}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-3 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            {copied ? 'Kopiert!' : 'Kopieren'}
          </button>
        </div>

        <p className="text-sm text-neutral-500">
          Wenn die Prüfung „Verbindung fehlgeschlagen“ oder „Key ungültig“ meldet: In <strong>.env.local</strong> müssen
          stehen: <code className="rounded bg-neutral-200 px-1">NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co</code> und{' '}
          <code className="rounded bg-neutral-200 px-1">SUPABASE_SERVICE_ROLE_KEY=...</code>. Den <strong>Service Role Key</strong> in Supabase holen: Project Settings → API → bei „Service role“ auf <strong>Reveal</strong> klicken und den <em>langen</em> Schlüssel kopieren (nicht die Project-ID wie „vtauaf...“). Danach Server neu starten (Strg+C, dann <code className="rounded bg-neutral-200 px-1">npm run dev</code>).
        </p>
      </div>
    </main>
  );
}
