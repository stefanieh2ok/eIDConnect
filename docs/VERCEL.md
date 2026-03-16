# Deployment auf Vercel (App teilen über Vercel-Domain)

Die App kann auf Vercel deployed werden, damit du den Zugangslink (z. B. für die NDA/DocuSign-Freischaltung) über eine stabile Domain teilen kannst.

## Schritte

1. **Projekt mit Vercel verbinden**  
   [vercel.com](https://vercel.com) → New Project → Repository verbinden (GitHub/GitLab/Bitbucket) oder `vercel` CLI.

2. **Umgebungsvariablen in Vercel setzen**  
   Project → Settings → Environment Variables. Alle aus `.env.local` bzw. `.env.example` benötigten Werte eintragen, insbesondere:
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - DocuSign: `DOCUSIGN_INTEGRATION_KEY`, `DOCUSIGN_USER_ID`, `DOCUSIGN_ACCOUNT_ID`, **`DOCUSIGN_PRIVATE_KEY`**
     - **Wichtig:** `DOCUSIGN_PRIVATE_KEY` in **einer Zeile** eintragen, Zeilenumbrüche als `\n` (Backslash + n), z. B. `"-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"`. Sonst kommt „Request failed with status code 400“ oder „secretOrPrivateKey must be an asymmetric key“.
   - **`DOCUSIGN_USE_DEMO`** (nicht in DocuSign, nur in Vercel bzw. `.env.local` setzen):
     - **`DOCUSIGN_USE_DEMO=true`**, wenn dein Integration Key in DocuSign unter **Environment: Development** (apps-d.docusign.com) läuft – sonst z. B. „Invalid_grant: Issuer_not_found“.
     - **`DOCUSIGN_USE_DEMO=false`** (oder weglassen), wenn du später auf DocuSign **Production** („Promote to production“) umgestellt hast.
   - **`NEXT_PUBLIC_APP_URL`** = deine Vercel-URL, z. B. `https://dein-projekt.vercel.app`  
     (wichtig für DocuSign-Rückkehr-URL und Admin-Links)
   - Optional: `ADMIN_DEMO_SECRET` (für Admin-Direktzugang), `RESEND_API_KEY`.

3. **Deploy**  
   Nach dem ersten Deploy erhältst du eine URL wie `https://dein-projekt.vercel.app`.  
   Diese URL in `NEXT_PUBLIC_APP_URL` eintragen und ggf. erneut deployen, damit DocuSign und Redirects korrekt auf die Vercel-Domain zeigen.

4. **Links teilen**  
   - Zugangslink für Empfänger: `https://dein-projekt.vercel.app/access/DEIN_TOKEN`
   - Admin-Direktzugang (nur mit Secret):  
     `https://dein-projekt.vercel.app/api/admin/enter-demo?secret=DEIN_ADMIN_DEMO_SECRET&demo_id=eidconnect-v1`

## Hinweise

- **E-Mail-Link vs. localhost:** Der Link aus der Zugangs-E-Mail führt auf die **deployed App** (Vercel-URL). Damit dort „Sie“-Texte und der DocuSign-Button korrekt angezeigt werden und der 400-Fehler verschwindet, muss der **neueste Stand** (mit „Sie“, korrektem Key-Handling) auf Vercel deployed sein (z. B. Git Push → automatischer Deploy).
- **`NEXT_PUBLIC_APP_URL`** muss auf die tatsächlich genutzte Domain zeigen (z. B. Vercel-URL oder eigene Domain), damit die DocuSign-Return-URL und Redirects nach dem Signieren funktionieren. In DocuSign (Apps and Keys) die **Redirect URI** für genau diese URL eintragen und ggf. **JWT Consent** einmal im Browser erteilen.
