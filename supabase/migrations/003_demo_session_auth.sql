-- Cookie-basierte Demo-Session: Session-Token-Hash, Demo-ID, Ablauf, Nutzerdaten
-- Bestehende demo_sessions behalten; neue Spalten für Auth-Session.

alter table demo_sessions
  add column if not exists session_token_hash text unique,
  add column if not exists demo_id text,
  add column if not exists session_expires_at timestamptz,
  add column if not exists full_name text,
  add column if not exists company text,
  add column if not exists email text,
  add column if not exists is_active boolean default true;

create index if not exists idx_demo_sessions_session_token_hash
  on demo_sessions (session_token_hash) where session_token_hash is not null;

create index if not exists idx_demo_sessions_demo_id
  on demo_sessions (demo_id) where demo_id is not null;

create index if not exists idx_demo_sessions_is_active
  on demo_sessions (is_active);

-- Audit-Logs: device_fingerprint für Heuristiken
alter table audit_logs
  add column if not exists device_fingerprint text;
