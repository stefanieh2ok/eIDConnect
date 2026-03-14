-- Demo-Zugang: personalisierte Links, Sessions, append-only Logs, Beweis-Reports
-- RLS: Logging nur über Service-Role/API; Admin liest über Auth.

-- 1) Demo-Tokens (personalisierte Links)
create table if not exists demo_tokens (
  id uuid default gen_random_uuid() primary key,
  token text unique not null,
  recipient_name text not null,
  recipient_org text,
  created_by text default 'Stefanie',
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  is_active boolean default true,
  first_accessed_at timestamptz,
  last_accessed_at timestamptz,
  access_count integer default 0
);

-- 2) Demo-Sessions (pro Besuch)
create table if not exists demo_sessions (
  id uuid default gen_random_uuid() primary key,
  token_id uuid not null references demo_tokens(id) on delete restrict,
  started_at timestamptz default now(),
  ended_at timestamptz,
  session_duration_seconds integer default 0,
  ip_address text,
  user_agent text,
  language text,
  timezone text,
  referrer text,
  viewport text,
  is_live boolean default true
);

-- 3) Append-only Zugriffs-Logs (kein UPDATE/DELETE)
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

-- 4) Beweis-Reports (Hash + JSON, unveränderlich)
create table if not exists proof_reports (
  id uuid default gen_random_uuid() primary key,
  token_id uuid not null references demo_tokens(id) on delete restrict,
  generated_at timestamptz default now(),
  content_hash text not null,
  report_data jsonb not null
);

-- 5) Bürger-Meldungen (Admin CRUD)
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

-- Indizes
create index if not exists idx_demo_sessions_token_id on demo_sessions(token_id);
create index if not exists idx_demo_access_logs_session_id on demo_access_logs(session_id);
create index if not exists idx_demo_access_logs_token_id on demo_access_logs(token_id);
create index if not exists idx_demo_access_logs_accessed_at on demo_access_logs(accessed_at desc);
create index if not exists idx_proof_reports_token_id on proof_reports(token_id);
create index if not exists idx_demo_tokens_token on demo_tokens(token);
create index if not exists idx_demo_tokens_expires_at on demo_tokens(expires_at);

-- RLS: Alle Tabellen für anonyme/authenticated Nutzer standardmäßig kein Zugriff
alter table demo_tokens enable row level security;
alter table demo_sessions enable row level security;
alter table demo_access_logs enable row level security;
alter table proof_reports enable row level security;
alter table meldungen enable row level security;

-- demo_tokens: Admin (authenticated) darf lesen/schreiben; Service-Role für API (Token-Validierung)
create policy "Admin full demo_tokens" on demo_tokens
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- demo_sessions: Admin nur SELECT; INSERT/UPDATE nur über Service-Role in API
create policy "Admin read demo_sessions" on demo_sessions
  for select using (auth.role() = 'authenticated');

-- demo_access_logs: Admin nur SELECT; INSERT nur über Service-Role; kein UPDATE/DELETE (Trigger unten)
create policy "Admin read demo_access_logs" on demo_access_logs
  for select using (auth.role() = 'authenticated');

-- proof_reports: Admin nur SELECT + INSERT; kein UPDATE/DELETE (Beweissicherung)
create policy "Admin read proof_reports" on proof_reports
  for select using (auth.role() = 'authenticated');
create policy "Admin insert proof_reports" on proof_reports
  for insert with check (auth.role() = 'authenticated');

-- meldungen: Admin CRUD
create policy "Admin full meldungen" on meldungen
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Append-only: demo_access_logs darf nicht geändert oder gelöscht werden (auch nicht durch Service-Role)
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

-- proof_reports: Nach Erstellung nicht mehr ändern (Hash/Report-Daten unveränderlich)
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

-- Service-Role umgeht RLS; API-Routes nutzen service_role für Inserts in sessions/logs.
-- Token-Validierung erfolgt serverseitig (API), nicht per direkter Client-Query.
