-- Speichert für jeden Access-Token den zuletzt erstellten DocuSign-Envelope.
-- Fallback, wenn DocuSign beim Redirect den envelopeId-Parameter weglässt.

create table if not exists demo_docusign_envelopes (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null,
  envelope_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_demo_docusign_envelopes_token_created
  on demo_docusign_envelopes (token_hash, created_at desc);

-- RLS: nur Service-Role schreibt/liest (API)
alter table demo_docusign_envelopes enable row level security;
