-- Access-Tokens (personalisierte Links mit NDA-Version, max_views, max_devices)
-- Session-Token nur gehasht speichern, nie im Klartext.

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

-- Akzeptanz-Log (jede NDA-Annahme pro Token)
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

-- Sessions können aus demo_tokens (bestehender Flow) oder demo_access_tokens (Accept-Flow) stammen
alter table demo_sessions
  add column if not exists access_token_id uuid references demo_access_tokens(id) on delete restrict;

-- token_id nullable machen, damit Accept-Flow nur access_token_id setzt
alter table demo_sessions
  alter column token_id drop not null;

create index if not exists idx_demo_sessions_access_token_id on demo_sessions (access_token_id) where access_token_id is not null;

-- RLS: Admin darf lesen; INSERT/UPDATE nur über Service-Role (API)
alter table demo_access_tokens enable row level security;
alter table demo_acceptance_logs enable row level security;

create policy "Admin read demo_access_tokens" on demo_access_tokens
  for select to authenticated using (true);

create policy "Admin read demo_acceptance_logs" on demo_acceptance_logs
  for select to authenticated using (true);
