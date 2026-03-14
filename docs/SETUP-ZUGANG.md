# Demo-Zugang einrichten (HookAI)

Damit die Meldung „Demo-Zugang derzeit nicht verfügbar“ verschwindet und der Zugangslink funktioniert, diese Schritte in Reihenfolge durchführen.

---

## 1. Umgebungsdatei anlegen/ergänzen

Im Projektordner (dort, wo `package.json` liegt):

```bash
npm run setup-env
```

Das erstellt `.env.local` aus `.env.example` oder ergänzt fehlende Variablen. Bestehende Werte werden **nicht** überschrieben.

---

## 2. Supabase-Projekt

### 2.1 Projekt anlegen (falls noch keins existiert)

1. Öffne [supabase.com](https://supabase.com) und melde dich an.
2. **New Project** → Name und Datenbank-Passwort wählen → Region wählen → **Create**.
3. Warte, bis das Projekt bereit ist.

### 2.2 URL und API-Key kopieren

1. Im Supabase-Dashboard links **Project Settings** (Zahnrad) → **API**.
2. Notieren:
   - **Project URL** (z. B. `https://abcdefgh.supabase.co`) → das ist `NEXT_PUBLIC_SUPABASE_URL`
   - Unter **Project API keys** den **service_role**-Key („secret“, nicht anon) → das ist `SUPABASE_SERVICE_ROLE_KEY`

### 2.3 In .env.local eintragen

Datei `.env.local` im Projektroot öffnen und die Platzhalter ersetzen:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- Keine Leerzeichen um das `=`.
- Keine Anführungszeichen um die Werte.
- Den **service_role**-Key niemals im Frontend oder in Git verwenden.

---

## 3. Datenbank-Migrationen ausführen

Die Tabellen (z. B. `demo_access_tokens`, `demo_sessions`, `audit_logs`) müssen in Supabase existieren.

1. Im Supabase-Dashboard: **SQL Editor** öffnen.
2. **Option A (empfohlen):** Die Datei **`supabase/migrations/000_run_all_in_order.sql`** im Editor öffnen, **gesamten Inhalt** kopieren, im SQL Editor einfügen und **Run** klicken (einmal ausführen).
3. **Option B:** Die vier Dateien einzeln in dieser Reihenfolge ausführen: `001_demo_and_proof.sql` → `002_audit_logs.sql` → `003_demo_session_auth.sql` → `004_demo_access_tokens.sql`.

---

## 4. Admin-Zugang (Basic Auth)

In `.env.local` sollten stehen (ggf. anpassen):

```env
ADMIN_BASIC_USER=admin
ADMIN_BASIC_PASS=dein-sicheres-langes-Passwort
```

Ohne diese Werte kannst du `/admin` nicht öffnen.

---

## 5. Dev-Server neu starten

Nach jeder Änderung an `.env.local`:

```bash
# Im Terminal: Strg+C zum Beenden, dann:
npm run dev
```

Anschließend die Zugangsseite mit deinem Link erneut aufrufen.

---

## Kurz-Checkliste

- [ ] `npm run setup-env` ausgeführt
- [ ] Supabase-Projekt angelegt bzw. geöffnet
- [ ] `NEXT_PUBLIC_SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` eingetragen (echte Werte)
- [ ] Migrationen 001–004 im Supabase SQL Editor ausgeführt
- [ ] `ADMIN_BASIC_USER` und `ADMIN_BASIC_PASS` in `.env.local` gesetzt
- [ ] `npm run dev` neu gestartet

Danach: Admin unter `/admin` öffnen → Tab „Access-Token (NDA)“ → Link erstellen → Link auf der Startseite (HookAI Zugang) einfügen → **Zugang öffnen**.
