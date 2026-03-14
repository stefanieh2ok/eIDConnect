-- Einmal in Supabase ausführen: SQL Editor → New query → einfügen → Run
-- Legt zuerst demo_access_tokens an, dann access_requests (verhindert Fehler „relation demo_access_tokens does not exist“).

-- 1) demo_access_tokens (wird von access_requests referenziert)
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

-- 2) access_requests
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

-- 3) nda_acceptance_logs (dokumentierte elektronische NDA-Zustimmung)
create table if not exists nda_acceptance_logs (
  id uuid primary key default gen_random_uuid(),
  token text not null,
  recipient_name text not null,
  recipient_org text,
  nda_version text not null,
  nda_text_checksum text not null,
  accepted_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  session_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_nda_acceptance_logs_token on nda_acceptance_logs (token);
create index if not exists idx_nda_acceptance_logs_accepted_at on nda_acceptance_logs (accepted_at desc);
alter table nda_acceptance_logs enable row level security;
do $$ begin
  create policy "Admin read nda_acceptance_logs" on nda_acceptance_logs for select to authenticated using (true);
exception when duplicate_object then null;
end $$;
