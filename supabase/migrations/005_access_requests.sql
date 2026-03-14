-- Zugangsanfragen von der Startseite; Zugang wird erst nach Freigabe durch Admin erstellt.

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
