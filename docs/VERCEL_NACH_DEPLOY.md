# Nach dem ersten Vercel-Deploy – Schritt für Schritt

Die App ist live. Damit Zugang, E-Mails und Admin funktionieren, musst du **Umgebungsvariablen** in Vercel setzen und **Supabase** anpassen. (Diese Schritte gehen nur in deinem Browser – Vercel/Supabase-Login kann niemand anderes für dich ausführen.)

**Kurzliste:** Siehe **VERCEL_ENV_ZUM_KOPIEREN.md** – dort stehen nur die Variablennamen und was du eintragen musst.

---

## Teil 1: Vercel – Umgebungsvariablen

1. **Vercel öffnen**  
   https://vercel.com → dein Projekt **e-id-connect-lr65** (oder wie es heißt) anklicken.

2. **Settings öffnen**  
   Oben in der Projekt-Ansicht auf **Settings** klicken.

3. **Environment Variables**  
   Links im Menü **Environment Variables** wählen.

4. **Variablen anlegen**  
   Für jede Zeile unten: Auf **Add New** klicken, **Name** und **Value** eintragen, **Environment** „Production“ (und ggf. Preview) wählen, **Save**.

   | Name | Value | Woher |
   |------|--------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://dein-projekt.supabase.co` | Supabase → Project Settings → API → Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (langer Key) | Supabase → Project Settings → API → Service role → Reveal |
   | `NEXT_PUBLIC_APP_URL` | `https://e-id-connect-lr65.vercel.app` | Deine Vercel-URL (ohne Slash am Ende!) |
   | `ADMIN_BASIC_USER` | z. B. `admin` | Frei wählbar |
   | `ADMIN_BASIC_PASS` | Starkes Passwort | Frei wählbar |
   | `ADMIN_DEMO_SECRET` | Langer geheimer String | Frei wählbar (nur für dich; für Admin-Direktzugang) |
   | `RESEND_API_KEY` | `re_...` | Resend.com → API Keys (wenn „Zugang anfordern“ E-Mails senden soll) |

   **Optional (nur wenn DocuSign genutzt wird):**
   - `DOCUSIGN_INTEGRATION_KEY`
   - `DOCUSIGN_USER_ID`
   - `DOCUSIGN_ACCOUNT_ID`
   - `DOCUSIGN_PRIVATE_KEY`
   - ggf. `DOCUSIGN_USE_DEMO=true`

5. **Redeploy**  
   Oben auf **Deployments** gehen → beim letzten Deployment auf die **drei Punkte (⋯)** klicken → **Redeploy** wählen. Warten, bis der Build durch ist.

---

## Teil 2: Supabase – URLs für die Live-Domain

1. **Supabase Dashboard** öffnen  
   https://supabase.com/dashboard → dein Projekt.

2. **Authentication → URL Configuration**  
   Links **Authentication** (oder **Auth**) → **URL Configuration** (oder unter Providers/Settings).

3. **Eintragen**  
   - **Site URL:** genau deine Vercel-URL, z. B. `https://e-id-connect-lr65.vercel.app`  
   - **Redirect URLs:** eine Zeile hinzufügen: `https://e-id-connect-lr65.vercel.app/**`  
   - **Save** klicken.

---

## Teil 3: Tabellen (wenn „Zugang anfordern“ genutzt wird)

Wenn auf der Live-Seite steht: *„Tabelle für Zugang anfordern noch nicht angelegt“*:

1. **Setup-Seite in der App**  
   Im Browser: `https://deine-vercel-url.vercel.app/setup` öffnen.

2. **Prüfen**  
   Auf **„Prüfen“** klicken. Wenn „Tabelle access_requests: Fehlt“ angezeigt wird, die angezeigte SQL-Anleitung nutzen.

3. **SQL in Supabase ausführen**  
   Supabase → **SQL Editor** → **New query** → SQL aus der Setup-Anleitung einfügen → **Run**.

4. **Optional: Tabelle per Klick anlegen**  
   Wenn du in Vercel (Environment Variables) einen **SupABASE_ACCESS_TOKEN** gesetzt hast (aus Supabase → Account → Access Tokens), kannst du auf der Setup-Seite **„Tabelle jetzt anlegen“** nutzen. Dafür muss die Variable in Vercel gesetzt und ein Redeploy gemacht worden sein.

---

## Checkliste

- [ ] Vercel: `NEXT_PUBLIC_SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` gesetzt  
- [ ] Vercel: `NEXT_PUBLIC_APP_URL` = deine Vercel-URL  
- [ ] Vercel: `ADMIN_BASIC_USER`, `ADMIN_BASIC_PASS`, `ADMIN_DEMO_SECRET` gesetzt  
- [ ] Vercel: Redeploy ausgeführt  
- [ ] Supabase: Site URL und Redirect URLs auf die Vercel-URL gesetzt  
- [ ] Supabase: Tabellen angelegt (wenn „Zugang anfordern“ genutzt wird)

Danach solltest du die App unter der Vercel-URL nutzen können, Admin unter `/admin/login` und den Admin-Direktzugang unter  
`https://deine-url.vercel.app/api/admin/enter-demo?secret=DEIN_ADMIN_DEMO_SECRET&demo_id=eidconnect-v1`.
