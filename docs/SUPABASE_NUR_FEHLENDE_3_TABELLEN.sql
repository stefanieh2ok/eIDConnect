-- =============================================================================
-- Nur die 3 fehlenden Tabellen: demo_access_logs, proof_reports, meldungen
-- Supabase Dashboard → SQL Editor → New query → einfügen → Run
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) demo_access_logs – Append-only Zugriffslogs
-- ---------------------------------------------------------------------------
create table if not exists demo_access_logs (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references demo_sessions(id) on delete restrict,
  token_id uuid references demo_tokens(id) on delete restrict,
  accessed_at timestamptz default now(),
  ip_address text,
  user_agent text,
  page_path text,
  event_type text not null default 'page_view',
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_demo_access_logs_session_id on demo_access_logs(session_id);
create index if not exists idx_demo_access_logs_token_id on demo_access_logs(token_id);
create index if not exists idx_demo_access_logs_accessed_at on demo_access_logs(accessed_at desc);

alter table demo_access_logs enable row level security;

create policy "Admin read demo_access_logs" on demo_access_logs
  for select using (auth.role() = 'authenticated');

-- Append-only Trigger: kein UPDATE/DELETE erlaubt
create or replace function reject_demo_access_logs_modify()
returns trigger as $$
begin
  raise exception 'demo_access_logs ist append-only: UPDATE/DELETE nicht erlaubt.';
end;
$$ language plpgsql security definer;

drop trigger if exists trg_demo_access_logs_no_modify on demo_access_logs;
create trigger trg_demo_access_logs_no_modify
  before update or delete on demo_access_logs
  for each row execute function reject_demo_access_logs_modify();


-- ---------------------------------------------------------------------------
-- 2) proof_reports – Beweis-Reports (unveränderlich)
-- ---------------------------------------------------------------------------
create table if not exists proof_reports (
  id uuid default gen_random_uuid() primary key,
  token_id uuid not null references demo_tokens(id) on delete restrict,
  generated_at timestamptz default now(),
  content_hash text not null,
  report_data jsonb not null
);

create index if not exists idx_proof_reports_token_id on proof_reports(token_id);

alter table proof_reports enable row level security;

create policy "Admin read proof_reports" on proof_reports
  for select using (auth.role() = 'authenticated');
create policy "Admin insert proof_reports" on proof_reports
  for insert with check (auth.role() = 'authenticated');

-- Unveränderlich-Trigger: kein UPDATE/DELETE erlaubt
create or replace function reject_proof_reports_modify()
returns trigger as $$
begin
  raise exception 'proof_reports sind unveränderlich: UPDATE/DELETE nicht erlaubt.';
end;
$$ language plpgsql security definer;

drop trigger if exists trg_proof_reports_no_modify on proof_reports;
create trigger trg_proof_reports_no_modify
  before update or delete on proof_reports
  for each row execute function reject_proof_reports_modify();


-- ---------------------------------------------------------------------------
-- 3) meldungen – Bürger-Meldungen (Admin CRUD)
-- ---------------------------------------------------------------------------
create table if not exists meldungen (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text,
  status text not null default 'Neu' check (status in ('Neu', 'In Bearbeitung', 'Erledigt')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  ort text,
  description text,
  created_by_demo_token_id uuid references demo_tokens(id) on delete set null
);

alter table meldungen enable row level security;

create policy "Admin full meldungen" on meldungen
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


-- =============================================================================
-- Fertig. Alle 3 Tabellen mit Indizes, RLS, Policies und Triggern angelegt.
-- =============================================================================
