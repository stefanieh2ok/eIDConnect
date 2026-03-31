# Deploy-Checkliste (Vercel · Supabase · NDA)

## Vercel

1. **Projekt verbinden** mit Git-Repo und **Production Branch** deployen (jedes `git push` löst ggf. neuen Build aus).
2. **Environment Variables** (Project → Settings → Environment Variables) – mindestens wie in `docs/VERCEL_ENV_ZUM_KOPIEREN.md`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - ggf. weitere Keys (OpenAI, DocuSign, …), die die App nutzt.
3. Nach dem Setzen der Variablen: **Redeploy** auslösen (Deployments → … → Redeploy), damit der Build die neuen Werte hat.
4. Wenn die Seite „alt“ wirkt: Browser-Cache leeren oder harten Reload; prüfen, ob der richtige **Production**-Deployment aktiv ist.

## Supabase (was fehlt oft)

Ohne Supabase-URL + Service Role in Vercel:

- Demo-Links (`/access/[token]`) zeigen die **Konfigurations-Fehlerseite**.
- Token-Validierung und Sessions funktionieren nicht.

**Einmalig im Supabase-Dashboard:**

1. SQL aus `docs/SUPABASE_ALLES_AUSFUEHREN.sql` (oder die einzelnen Migrations unter `supabase/migrations/`) im **SQL Editor** ausführen.
2. Tabellen prüfen: z. B. `demo_tokens`, `demo_sessions`, `nda_acceptance_logs` (je nach Setup).
3. Siehe auch `docs/SCHRITT_FUER_SCHRITT_APP_UND_ADMIN.md`.

## NDA-PDF (localhost & Vercel)

- **Korrekter Download:** `GET /api/nda/download` (liefert `application/pdf`).
- **Falsch:** Link nur auf `/legal/demo-nda` mit Label „PDF“ – das ist die **HTML-Seite**.
- **Lokal:** `npm run dev` nutzen; API-Route läuft unter `http://localhost:3000/api/nda/download`.
- Wenn PDF nicht generiert wird: **Server-Logs** prüfen (`pdf-lib` / `buildNdaPdfBuffer`); auf Vercel **Function Logs** in Vercel.

## Design (Glassmorphism · iPhone-Rahmen)

- Onboarding: `components/Login/LoginScreen.tsx` + `components/ui/IphoneFrame.tsx` (Glass-Karte im Geräterahmen).
- Demo-App: `app/demo/[demoId]/DemoAppClient.tsx` (gleicher Rahmen).
- NDA-Gate: `app/access/[token]/page.tsx` (Glass + iPhone).

Nach Deploy: **Hard-Reload** – CDN kann alte Assets cachen.
