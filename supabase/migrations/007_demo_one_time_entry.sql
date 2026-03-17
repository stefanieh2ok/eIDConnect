-- Einmal-Links für Demo-Einstieg nach DocuSign-Signatur (Fallback per E-Mail)
-- Wird nach erfolgreicher Signatur erzeugt und per E-Mail versendet; einmaliger Klick setzt Session-Cookie und leitet in die Demo.

create table if not exists demo_one_time_entry (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  raw_session_token text not null,
  demo_id text not null,
  session_expires_at timestamptz not null,
  expires_at timestamptz not null default (now() + interval '1 hour'),
  created_at timestamptz not null default now()
);

create index if not exists idx_demo_one_time_entry_token_hash on demo_one_time_entry (token_hash);
create index if not exists idx_demo_one_time_entry_expires_at on demo_one_time_entry (expires_at);

alter table demo_one_time_entry enable row level security;

create policy "Service role full access demo_one_time_entry"
  on demo_one_time_entry for all to service_role using (true) with check (true);
