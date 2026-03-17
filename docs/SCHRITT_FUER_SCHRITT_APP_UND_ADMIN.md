# Schritt-für-Schritt: App startet nach DocuSign + Admin mit Login

**Idiotensicher – alles der Reihe nach abarbeiten.**

---

## Teil A: Admin – damit nicht jeder ohne Login reinkommt

### A1. Zugangsdaten auf Vercel eintragen

1. Browser öffnen → **https://vercel.com** → einloggen.
2. Dein **Projekt** wählen (z. B. e-id-connect / eIDConnect).
3. Oben auf **„Settings“** klicken.
4. Links auf **„Environment Variables“** klicken.
5. Zwei Variablen anlegen (jeweils **„Add New“**):

   **Erste Variable:**
   - **Key (Name):** `ADMIN_BASIC_USER`
   - **Value:** z. B. `admin` (oder ein anderer Benutzername – **ohne** Anführungszeichen)
   - **Environment:** Production (Haken setzen), ggf. auch Preview
   - **Save** klicken.

   **Zweite Variable:**
   - **Key (Name):** `ADMIN_BASIC_PASS`
   - **Value:** ein **starkes Passwort** (z. B. mind. 12 Zeichen, Groß-/Kleinbuchstaben, Zahl, Sonderzeichen) – **ohne** Anführungszeichen
   - **Environment:** Production (Haken), ggf. Preview
   - **Save** klicken.

6. **Wichtig:** Nach dem Anlegen oder Ändern von Variablen **neu deployen**:
   - Oben auf **„Deployments“** gehen.
   - Beim **neuesten Deployment** auf die **drei Punkte (⋯)** klicken.
   - **„Redeploy“** wählen → bestätigen.
   - Warten, bis der Build durch ist (grüner Haken).

### A2. Admin testen (ohne gespeichertes Passwort)

1. **Neues Inkognito-/Privatfenster** öffnen (damit der Browser kein altes Passwort mitschickt).
2. In die Adresszeile tippen: **https://e-id-connect-lr65.vercel.app/admin**
3. **Enter** drücken.
4. **Erwartung:** Es erscheint ein **Anmeldedialog** (Benutzername + Passwort) **oder** eine Seite „Authentifizierung erforderlich“ / „Anmeldung erforderlich“ mit Button.
5. **Benutzername** und **Passwort** eintragen – **genau so**, wie in Vercel unter A1 gesetzt (Groß-/Kleinschreibung beachten).
6. **Erwartung:** Du siehst die **Admin-Seite** (Demo-Links, Tabs usw.).

**Wenn du ohne Login reinkommst:**  
→ Prüfen, ob A1 und der **Redeploy** wirklich erledigt sind. Danach nochmal in einem **neuen** Inkognito-Fenster testen.

---

## Teil B: App startet nach DocuSign-Unterzeichnung

### B1. Supabase – Tabellen anlegen (einmalig)

1. Browser → **https://supabase.com/dashboard** → einloggen.
2. Dein **Projekt** auswählen.
3. Links auf **„SQL Editor“** klicken.
4. **„New query“** wählen.
5. Das **komplette** SQL unten in das Fenster einfügen (alles markieren und einfügen).
6. **„Run“** (oder Strg+Enter) drücken.
7. Es sollte **„Success“** erscheinen.

**SQL (komplett kopieren):**

```sql
-- Tabelle 1: Einmal-Link nach DocuSign (E-Mail mit Demo-Link)
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

-- Tabelle 2: DocuSign Envelope pro Token (Weiterleitung in die App auch ohne envelopeId in der URL)
create table if not exists demo_docusign_envelopes (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null,
  envelope_id text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_demo_docusign_envelopes_token_created on demo_docusign_envelopes (token_hash, created_at desc);
alter table demo_docusign_envelopes enable row level security;
```

### B2. DocuSign – Redirect-URI prüfen

1. **DocuSign** einloggen (Admin / Apps and Keys).
2. Deine **Integration** (App) auswählen.
3. Unter **„Redirect URI“** muss **genau** stehen:
   - `https://e-id-connect-lr65.vercel.app/api/docusign/return`
4. Kein `/` am Ende, keine weiteren Parameter. Speichern.

### B3. Code deployen

1. Im Projektordner (z. B. in Cursor/VS Code) alle Änderungen **committen**.
2. Nach **GitHub** (oder dein verbundenes Repo) **pushen**.
3. **Vercel** baut automatisch. Unter **Deployments** warten, bis der neueste Build **erfolgreich** (grün) ist.

### B4. Test – App nach Unterschrift starten

1. **Neuen Zugangs-Link** erzeugen:
   - **https://e-id-connect-lr65.vercel.app/admin** öffnen (mit Login).
   - Tab **„Demo-Links“**.
   - Beim Block **„Neuer Zugangs-Link (mit NDA / DocuSign)“** Vorname, Nachname, E-Mail (deine Test-E-Mail), optional Organisation ausfüllen.
   - **„Link erstellen“** klicken → Link kopieren.

2. **Inkognito-Fenster** öffnen, den **kopierten Link** in die Adresszeile einfügen, Enter.

3. Auf der NDA-Seite auf **„Unterzeichnen Sie mit DocuSign und öffnen Sie die Demo“** klicken.

4. In DocuSign das Dokument **unterschreiben** und am Ende auf **„Finish“** klicken.

5. **Erwartung:** Du wirst **direkt in die Demo** weitergeleitet (Seite **/demo/eidconnect-v1** o. ä.), **nicht** zurück auf die NDA-Seite mit Fehlermeldung.

**Wenn du wieder auf der NDA-Seite landest:**  
→ B1 (Tabellen), B2 (Redirect-URI) und B3 (Deploy) nochmal prüfen. In Vercel unter **Functions / Logs** nach Fehlermeldungen zu „docusign“ oder „return“ suchen.

---

## Kurz-Checkliste

| Schritt | Erledigt? |
|--------|-----------|
| **Admin** | |
| A1 – ADMIN_BASIC_USER + ADMIN_BASIC_PASS auf Vercel gesetzt | ☐ |
| A1 – Nach Variablen Redeploy ausgeführt | ☐ |
| A2 – Admin im Inkognito nur mit Login erreichbar | ☐ |
| **App nach DocuSign** | |
| B1 – Beide Supabase-Tabellen (SQL) ausgeführt | ☐ |
| B2 – DocuSign Redirect-URI = …/api/docusign/return | ☐ |
| B3 – Code gepusht, Vercel-Build grün | ☐ |
| B4 – Test: Unterschrift → Weiterleitung in die Demo | ☐ |

Wenn alle Punkte abgehakt sind und etwas trotzdem nicht funktioniert: Vercel **Function Logs** und ggf. Supabase **Logs** prüfen und die genaue Fehlermeldung oder das Verhalten (z. B. „bleibe auf NDA-Seite“, „Admin ohne Dialog“) notieren.
