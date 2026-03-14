# Tabelle `access_requests` anlegen

Die Tabelle wird für **„Zugang anfordern“** auf der Startseite und den Admin-Tab **„Zugangsanfragen“** benötigt.

## Automatisch (empfohlen)

1. In **`.env.local`** eintragen:
   - **`DATABASE_URL=...`** aus Supabase: **Project Settings → Database → Connection string (URI)** – bei `[YOUR-PASSWORD]` dein Datenbank-Passwort eintragen
2. **`npm install`** ausführen (falls noch nicht), dann **App starten:** `npm run dev`
3. Die Tabelle **access_requests** wird automatisch angelegt:
   - beim **ersten App-Start** (Log: *Tabelle access_requests angelegt bzw. vorhanden*), oder
   - beim **ersten „Zugang anfordern“** (wenn die Tabelle noch fehlte)

Wenn du **keine** DATABASE_URL setzen willst: **Variante 3** (SQL im Supabase Dashboard) nutzen.

## Variante 2: Einmal-URL (falls keine DATABASE_URL)

Wenn du keine DATABASE_URL verwenden willst: **SETUP_MIGRATE_SECRET** und **DATABASE_URL** in `.env.local` setzen, dann im Browser aufrufen:  
**`<deine-App-URL>/api/setup/migrate-access-requests?secret=dein-secret`**

## Variante 3: SQL im Supabase Dashboard

1. **Supabase Dashboard** → dein Projekt → **SQL Editor** → **New query**
2. Inhalt der Datei **`scripts/sql/access_requests.sql`** einfügen → **Run**

---

**Danach testen:** Startseite → „Zugang anfordern“ → Admin → Tab **„Zugangsanfragen“** → Anfrage **Freigeben**.
