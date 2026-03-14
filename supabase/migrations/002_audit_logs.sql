-- Anti-Leak Audit-Logs (Phase 1)
-- Append-only; nur INSERT über Service-Role, Admin liest.

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

create policy "Admin read audit_logs" on audit_logs
  for select to authenticated using (true);

-- INSERT nur über Service-Role (API), kein Policy für anon/authenticated
-- Service-Role umgeht RLS.
