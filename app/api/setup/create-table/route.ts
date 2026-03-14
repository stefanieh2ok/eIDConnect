import { NextRequest, NextResponse } from 'next/server';

/**
 * Legt die Tabelle access_requests direkt in Supabase an (Management API).
 * Kein SQL-Kopieren nötig.
 *
 * Voraussetzung: In .env.local eintragen
 *   SUPABASE_ACCESS_TOKEN=dein-personal-access-token
 * (Supabase Dashboard → Account → Access Tokens → Generate token)
 *
 * Aufruf: POST /api/setup/create-table mit Body: { "secret": "dein-setup-secret" }
 * oder GET /api/setup/create-table?secret=dein-setup-secret
 *
 * Optional: SETUP_MIGRATE_SECRET in .env.local setzen; dann secret in der Anfrage mitgeben.
 * Wenn SETUP_MIGRATE_SECRET nicht gesetzt ist, wird bei vorhandenem SUPABASE_ACCESS_TOKEN trotzdem ausgeführt (einmaliges Setup).
 */

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

export async function GET(request: NextRequest) {
  const secret = process.env.SETUP_MIGRATE_SECRET
    ? request.nextUrl.searchParams.get('secret')
    : null;
  if (process.env.SETUP_MIGRATE_SECRET && secret !== process.env.SETUP_MIGRATE_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'Ungültiges oder fehlendes secret. Optional: SETUP_MIGRATE_SECRET in .env.local setzen und ?secret=... angeben.' },
      { status: 400 }
    );
  }
  return runCreateTable();
}

export async function POST(request: NextRequest) {
  let secret: string | null = null;
  try {
    const body = await request.json();
    secret = typeof body?.secret === 'string' ? body.secret : null;
  } catch {
    secret = null;
  }
  if (process.env.SETUP_MIGRATE_SECRET && secret !== process.env.SETUP_MIGRATE_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'Ungültiges oder fehlendes secret. Body: { "secret": "dein-setup-secret" } oder SETUP_MIGRATE_SECRET weglassen.' },
      { status: 400 }
    );
  }
  return runCreateTable();
}

async function runCreateTable() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!token || token.length < 20) {
    return NextResponse.json(
      {
        ok: false,
        error: 'SUPABASE_ACCESS_TOKEN fehlt in .env.local. Supabase Dashboard → Account → Access Tokens → Generate new token. Token in .env.local eintragen.',
      },
      { status: 400 }
    );
  }

  if (!url || !url.startsWith('https://')) {
    return NextResponse.json(
      {
        ok: false,
        error: 'NEXT_PUBLIC_SUPABASE_URL fehlt oder ungültig in .env.local. Muss z.B. https://xxxx.supabase.co sein.',
      },
      { status: 400 }
    );
  }

  const refMatch = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  const ref = refMatch ? refMatch[1] : null;
  if (!ref) {
    return NextResponse.json(
      { ok: false, error: 'Projekt-Ref aus NEXT_PUBLIC_SUPABASE_URL konnte nicht gelesen werden.' },
      { status: 400 }
    );
  }

  const apiUrl = `https://api.supabase.com/v1/projects/${ref}/database/query`;
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: SQL }),
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!res.ok) {
      const err = data as { message?: string; error?: string };
      return NextResponse.json(
        {
          ok: false,
          error: err?.message || err?.error || `Supabase API: ${res.status}. ${text.slice(0, 200)}`,
        },
        { status: res.status >= 400 ? res.status : 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Tabellen demo_access_tokens und access_requests wurden angelegt. „Zugang anfordern“ auf der Startseite sollte jetzt funktionieren.',
    });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json(
      { ok: false, error: err?.message || 'Verbindung zur Supabase API fehlgeschlagen.' },
      { status: 500 }
    );
  }
}
