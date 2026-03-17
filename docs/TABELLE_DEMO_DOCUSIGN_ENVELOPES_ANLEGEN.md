# Tabelle `demo_docusign_envelopes` in Supabase anlegen

Diese Tabelle speichert die Zuordnung Access-Token → DocuSign-Envelope. Wenn DocuSign beim Redirect nach der Unterzeichnung den `envelopeId`-Parameter weglässt, kann die App den Envelope anhand des Tokens trotzdem ermitteln und die Weiterleitung in die Demo durchführen.

## SQL im Supabase SQL Editor ausführen

```sql
-- Siehe supabase/migrations/008_demo_docusign_envelopes.sql
create table if not exists demo_docusign_envelopes (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null,
  envelope_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_demo_docusign_envelopes_token_created
  on demo_docusign_envelopes (token_hash, created_at desc);

alter table demo_docusign_envelopes enable row level security;
```

Die API nutzt die Service-Role und kann die Tabelle damit lesen/schreiben.
