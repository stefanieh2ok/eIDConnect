-- Track e-mail send attempts for access requests.
-- Note: "delivered" still requires webhook/events from provider (future step).

alter table if exists access_requests
  add column if not exists email_provider text,
  add column if not exists email_provider_id text,
  add column if not exists email_status text check (email_status in ('sent', 'failed')),
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_last_error text;

create index if not exists idx_access_requests_email_status
  on access_requests (email_status);
