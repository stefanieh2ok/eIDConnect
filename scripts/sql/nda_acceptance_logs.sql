-- NDA-Akzeptanz-Log (dokumentierte elektronische Zustimmung pro Zugang)
-- Wird von /api/accept befüllt (insertNdaAcceptanceLog).
-- Einmal in Supabase ausführen: SQL Editor → New query → einfügen → Run.

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
create index if not exists idx_nda_acceptance_logs_recipient on nda_acceptance_logs (recipient_name);

alter table nda_acceptance_logs enable row level security;

do $$ begin
  create policy "Admin read nda_acceptance_logs" on nda_acceptance_logs for select to authenticated using (true);
exception when duplicate_object then null;
end $$;
