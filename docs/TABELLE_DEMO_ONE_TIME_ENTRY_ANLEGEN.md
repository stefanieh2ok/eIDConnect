# Tabelle `demo_one_time_entry` in Supabase anlegen

Diese Tabelle wird für den **E-Mail-Fallback** nach der DocuSign-Unterzeichnung benötigt (Einmal-Link zur Demo).

## Option A: Supabase Dashboard (ohne Token)

1. Öffne **https://supabase.com/dashboard** und wähle dein Projekt (z. B. die App mit `vtauafbbzdvhrxoyfnpe`).
2. Links auf **SQL Editor** klicken.
3. **New query** wählen und das folgende SQL einfügen:

```sql
-- Einmal-Links für Demo-Einstieg nach DocuSign-Signatur (Fallback per E-Mail)
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
```

4. Auf **Run** (oder Strg+Enter) klicken.
5. Wenn die Meldung erfolgreich ist, ist die Tabelle angelegt.

## Option B: Setup-Route (wenn SUPABASE_ACCESS_TOKEN gesetzt ist)

1. In **.env.local** eintragen:  
   `SUPABASE_ACCESS_TOKEN=dein-personal-access-token`  
   (Supabase Dashboard → Account/Profil → **Access Tokens** → Generate new token)
2. Dev-Server neu starten (`npm run dev`).
3. Im Browser aufrufen:  
   **http://localhost:3002/api/setup/create-table**  
   (oder mit Secret: `http://localhost:3002/api/setup/create-table?secret=dein-setup-secret`, falls `SETUP_MIGRATE_SECRET` gesetzt ist.)

Die Setup-Route legt dabei auch die Tabellen `demo_access_tokens` und `access_requests` an (falls noch nicht vorhanden) sowie **demo_one_time_entry**.
