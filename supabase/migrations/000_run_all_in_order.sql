-- Alle Migrationen in einer Datei – im Supabase Dashboard unter SQL Editor einfügen und einmal ausführen.
-- Reihenfolge: 001 → 002 → 003 → 004 (dieses File nur als Referenz; Inhalt ist 001–004 zusammengeführt).

-- ========== 001_demo_and_proof.sql ==========
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

create table if not exists proof_reports (
  id uuid default gen_random_uuid() primary key,
  token_id uuid not null references demo_tokens(id) on delete restrict,
  generated_at timestamptz default now(),
  content_hash text not null,
  report_data jsonb not null
);

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

create index if not exists idx_demo_sessions_token_id on demo_sessions(token_id);
create index if not exists idx_demo_access_logs_session_id on demo_access_logs(session_id);
create index if not exists idx_demo_access_logs_token_id on demo_access_logs(token_id);
create index if not exists idx_demo_access_logs_accessed_at on demo_access_logs(accessed_at desc);
create index if not exists idx_proof_reports_token_id on proof_reports(token_id);
create index if not exists idx_demo_tokens_token on demo_tokens(token);
create index if not exists idx_demo_tokens_expires_at on demo_tokens(expires_at);

alter table demo_tokens enable row level security;
alter table demo_sessions enable row level security;
alter table demo_access_logs enable row level security;
alter table proof_reports enable row level security;
alter table meldungen enable row level security;

create policy "Admin full demo_tokens" on demo_tokens for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Admin read demo_sessions" on demo_sessions for select using (auth.role() = 'authenticated');
create policy "Admin read demo_access_logs" on demo_access_logs for select using (auth.role() = 'authenticated');
create policy "Admin read proof_reports" on proof_reports for select using (auth.role() = 'authenticated');
create policy "Admin insert proof_reports" on proof_reports for insert with check (auth.role() = 'authenticated');
create policy "Admin full meldungen" on meldungen for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create or replace function reject_demo_access_logs_modify() returns trigger as $$
begin raise exception 'demo_access_logs ist append-only: UPDATE/DELETE nicht erlaubt.'; end;
$$ language plpgsql security definer;
drop trigger if exists trg_demo_access_logs_no_modify on demo_access_logs;
create trigger trg_demo_access_logs_no_modify before update or delete on demo_access_logs for each row execute function reject_demo_access_logs_modify();

create or replace function reject_proof_reports_modify() returns trigger as $$
begin raise exception 'proof_reports sind unveränderlich: UPDATE/DELETE nicht erlaubt.'; end;
$$ language plpgsql security definer;
drop trigger if exists trg_proof_reports_no_modify on proof_reports;
create trigger trg_proof_reports_no_modify before update or delete on proof_reports for each row execute function reject_proof_reports_modify();

-- ========== 002_audit_logs.sql ==========
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  demo_id text not null default 'buerger-app',
  token_id uuid references demo_tokens(id) on delete restrict,
  session_id uuid references demo_sessions(id) on delete restrict,
  event_type text not null,
  event_data jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);
create index if not exists idx_audit_logs_token_id on audit_logs(token_id);
create index if not exists idx_audit_logs_session_id on audit_logs(session_id);
create index if not exists idx_audit_logs_created_at on audit_logs(created_at desc);
create index if not exists idx_audit_logs_event_type on audit_logs(event_type);
alter table audit_logs enable row level security;
create policy "Admin read audit_logs" on audit_logs for select to authenticated using (true);

-- ========== 003_demo_session_auth.sql ==========
alter table demo_sessions
  add column if not exists session_token_hash text unique,
  add column if not exists demo_id text,
  add column if not exists session_expires_at timestamptz,
  add column if not exists full_name text,
  add column if not exists company text,
  add column if not exists email text,
  add column if not exists is_active boolean default true;
create index if not exists idx_demo_sessions_session_token_hash on demo_sessions (session_token_hash) where session_token_hash is not null;
create index if not exists idx_demo_sessions_demo_id on demo_sessions (demo_id) where demo_id is not null;
create index if not exists idx_demo_sessions_is_active on demo_sessions (is_active);
alter table audit_logs add column if not exists device_fingerprint text;

-- ========== 004_demo_access_tokens.sql ==========
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

create table if not exists demo_acceptance_logs (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references demo_access_tokens(id) on delete restrict,
  demo_id text not null,
  full_name text not null,
  company text,
  email text not null,
  nda_version text not null,
  nda_document_hash text not null,
  accepted_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  referrer text,
  session_id uuid
);
create index if not exists idx_demo_acceptance_logs_token_id on demo_acceptance_logs (token_id);
create index if not exists idx_demo_acceptance_logs_demo_id on demo_acceptance_logs (demo_id);
create index if not exists idx_demo_acceptance_logs_accepted_at on demo_acceptance_logs (accepted_at desc);

alter table demo_sessions add column if not exists access_token_id uuid references demo_access_tokens(id) on delete restrict;
alter table demo_sessions alter column token_id drop not null;
create index if not exists idx_demo_sessions_access_token_id on demo_sessions (access_token_id) where access_token_id is not null;

alter table demo_access_tokens enable row level security;
alter table demo_acceptance_logs enable row level security;
create policy "Admin read demo_access_tokens" on demo_access_tokens for select to authenticated using (true);
create policy "Admin read demo_acceptance_logs" on demo_acceptance_logs for select to authenticated using (true);

-- ========== 005_access_requests ==========
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
create policy "Admin read access_requests" on access_requests for select to authenticated using (true);
