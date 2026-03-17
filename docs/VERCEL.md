# Deployment auf Vercel (App teilen über Vercel-Domain)

Die App kann auf Vercel deployed werden, damit du den Zugangslink (z. B. für die NDA/DocuSign-Freischaltung) über eine stabile Domain teilen kannst.

## Vercel step-by-step: Was auf Vercel eingestellt sein muss

| Variable | Wert / Hinweis |
|----------|----------------|
| `NEXT_PUBLIC_APP_URL` | `https://e-id-connect-lr65.vercel.app` (ohne / am Ende; deine Vercel-URL) |
| `ACCESS_LINK_BASE_URL` | Optional, gleicher Wert wie `NEXT_PUBLIC_APP_URL`. Wenn gesetzt, steht in der Zugangs-E-Mail **immer** dieser Link – auch wenn du die Freigabe versehentlich von localhost aus auslöst. Empfohlen auf Vercel setzen. |
| `DOCUSIGN_USE_DEMO` | `true` (Sandbox) – sonst „invalid_grant: issuer_not_found“ |
| `DOCUSIGN_INTEGRATION_KEY`, `DOCUSIGN_USER_ID`, `DOCUSIGN_ACCOUNT_ID`, `DOCUSIGN_PRIVATE_KEY` | Wie in DocuSign Apps and Keys; Private Key in einer Zeile mit `\n` |
| DocuSign Redirect URI | In DocuSign (Apps and Keys) eintragen: `https://e-id-connect-lr65.vercel.app/api/docusign/return` |
| `RESEND_API_KEY` | Resend-API-Key (E-Mail-Versand) |
| `ADMIN_NOTIFY_EMAIL` | z. B. `stefanie.h2ok@gmail.com,stefanie.hook@hookai.eu` (Benachrichtigung bei neuer Zugangsanfrage) |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase-Projekt |
| Optional: `SEND_ACCESS_EMAIL_FROM` | Standard ist „HookAI Demo &lt;onboarding@resend.dev&gt;“. Für eigenen Absender (z. B. `HookAI &lt;noreply@hookai.eu&gt;`) Domain in Resend verifizieren und diese Variable setzen. |

Nach Änderungen an Environment Variables: **Redeploy** auslösen (Deployments → … → Redeploy).

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
- **`NEXT_PUBLIC_APP_URL`** muss auf die tatsächlich genutzte Domain zeigen (z. B. Vercel-URL oder eigene Domain), damit die DocuSign-Return-URL und Redirects nach dem Signieren funktionieren. In DocuSign (Apps and Keys) die **Redirect URI** für genau diese URL eintragen, z. B. `https://e-id-connect-lr65.vercel.app/api/docusign/return`, und ggf. **JWT Consent** einmal im Browser erteilen.
- **Fehler „invalid_grant: issuer_not_found“ auf Vercel:** Dann fehlt meist **DOCUSIGN_USE_DEMO=true** in den Vercel Environment Variables (Sandbox) oder die Vercel-Redirect-URI ist in DocuSign nicht eingetragen. Beides setzen → Redeploy.
- **E-Mail zeigt „HookAI Demo“ / onboarding@resend.dev:** Das ist der Standard-Absender, wenn `SEND_ACCESS_EMAIL_FROM` nicht gesetzt ist. Für eigenen Absender (z. B. deine Domain): Resend → Domains verifizieren, dann in Vercel `SEND_ACCESS_EMAIL_FROM=HookAI <noreply@hookai.eu>` setzen.
- **Zugangs-E-Mail enthält localhost-Link:** Ursache war Freigabe von localhost aus. Ab jetzt: **ACCESS_LINK_BASE_URL** auf Vercel auf die Vercel-URL setzen; dann wird der Link in der E-Mail immer die Vercel-URL sein. Lokal in `.env.local` optional `ACCESS_LINK_BASE_URL=https://e-id-connect-lr65.vercel.app` setzen, wenn du von localhost freigibst, aber den Vercel-Link in der E-Mail haben willst.
