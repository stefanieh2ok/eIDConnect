import { NextRequest, NextResponse } from 'next/server';

/**
 * Einmaliger Aufruf: Gibt das SQL zum Anlegen der Tabelle access_requests zurück
 * oder weist auf scripts/sql/access_requests.sql hin.
 *
 * Aufruf: GET /api/setup/migrate-access-requests?secret=DEIN_SETUP_SECRET
 * In .env.local: SETUP_MIGRATE_SECRET=dein-secret
 */

const SQL = `
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
end $$;
`.trim();

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const expected = process.env.SETUP_MIGRATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Ungültig oder fehlendes secret. In .env.local: SETUP_MIGRATE_SECRET setzen und ?secret=... in der URL verwenden.',
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'Bitte diesen SQL-Block in Supabase ausführen: SQL Editor → New query → einfügen → Run.',
    sql: SQL,
    hinweis: 'Datei im Projekt: scripts/sql/access_requests.sql',
  });
}
