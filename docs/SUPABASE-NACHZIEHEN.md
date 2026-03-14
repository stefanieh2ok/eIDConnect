# Supabase: Policies und Trigger nachziehen

Wenn du die **Tabellen** (demo_tokens, demo_sessions, demo_access_logs, proof_reports, meldungen) schon angelegt hast und nur **RLS-Policies** sowie **Trigger** nachziehen willst, führe die folgenden Schritte im **Supabase Dashboard → SQL Editor** nacheinander aus.

---

## Schritt 1: Alte Policies entfernen (falls vorhanden)

Falls du die Tabellen schon mit älteren Policies erstellt hast, diese zuerst droppen:

```sql
-- Nur ausführen, wenn du bereits Policies mit diesen Namen hast
drop policy if exists "Admin full demo_tokens" on demo_tokens;
drop policy if exists "Admin read demo_sessions" on demo_sessions;
drop policy if exists "Admin read demo_access_logs" on demo_access_logs;
drop policy if exists "Admin read insert proof_reports" on proof_reports;
drop policy if exists "Admin read proof_reports" on proof_reports;
drop policy if exists "Admin insert proof_reports" on proof_reports;
drop policy if exists "Admin full meldungen" on meldungen;
```

---

## Schritt 2: RLS aktivieren (falls noch nicht)

```sql
alter table demo_tokens enable row level security;
alter table demo_sessions enable row level security;
alter table demo_access_logs enable row level security;
alter table proof_reports enable row level security;
alter table meldungen enable row level security;
```

---

## Schritt 3: Neue Policies anlegen

```sql
-- demo_tokens: Admin darf alles (lesen + schreiben)
create policy "Admin full demo_tokens" on demo_tokens
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- demo_sessions: Admin nur lesen
create policy "Admin read demo_sessions" on demo_sessions
  for select using (auth.role() = 'authenticated');

-- demo_access_logs: Admin nur lesen
create policy "Admin read demo_access_logs" on demo_access_logs
  for select using (auth.role() = 'authenticated');

-- proof_reports: Admin nur lesen + einfügen (kein Update/Delete)
create policy "Admin read proof_reports" on proof_reports
  for select using (auth.role() = 'authenticated');
create policy "Admin insert proof_reports" on proof_reports
  for insert with check (auth.role() = 'authenticated');

-- meldungen: Admin CRUD
create policy "Admin full meldungen" on meldungen
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```

---

## Schritt 4: Trigger für append-only demo_access_logs

```sql
create or replace function reject_demo_access_logs_modify()
returns trigger as $$
begin
  raise exception 'demo_access_logs ist append-only: UPDATE/DELETE nicht erlaubt.';
end;
$$ language plpgsql security definer;

drop trigger if exists trg_demo_access_logs_no_modify on demo_access_logs;
create trigger trg_demo_access_logs_no_modify
  before update or delete on demo_access_logs
  for each row execute function reject_demo_access_logs_modify();
```

---

## Schritt 5: Trigger für unveränderliche proof_reports

```sql
create or replace function reject_proof_reports_modify()
returns trigger as $$
begin
  raise exception 'proof_reports sind unveränderlich: UPDATE/DELETE nicht erlaubt.';
end;
$$ language plpgsql security definer;

drop trigger if exists trg_proof_reports_no_modify on proof_reports;
create trigger trg_proof_reports_no_modify
  before update or delete on proof_reports
  for each row execute function reject_proof_reports_modify();
```

---

## Reihenfolge im Überblick

| Schritt | Inhalt |
|--------|--------|
| 1 | Alte Policies droppen (nur bei bestehendem Setup) |
| 2 | RLS an allen 5 Tabellen aktivieren |
| 3 | Neue Policies anlegen |
| 4 | Trigger auf demo_access_logs (kein UPDATE/DELETE) |
| 5 | Trigger auf proof_reports (kein UPDATE/DELETE) |

**Hinweis:** Die API-Routes nutzen den **Service-Role-Key** und umgehen RLS. Die Trigger greifen trotzdem: Auch mit Service-Role sind UPDATE und DELETE auf `demo_access_logs` und `proof_reports` in der Datenbank blockiert.
