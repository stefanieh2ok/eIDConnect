# Deployment auf Vercel (App teilen über Vercel-Domain)

Die App kann auf Vercel deployed werden, damit du den Zugangslink (z. B. für die NDA/DocuSign-Freischaltung) über eine stabile Domain teilen kannst.

## Schritte

1. **Projekt mit Vercel verbinden**  
   [vercel.com](https://vercel.com) → New Project → Repository verbinden (GitHub/GitLab/Bitbucket) oder `vercel` CLI.

2. **Umgebungsvariablen in Vercel setzen**  
   Project → Settings → Environment Variables. Alle aus `.env.local` bzw. `.env.example` benötigten Werte eintragen, insbesondere:
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - DocuSign: `DOCUSIGN_INTEGRATION_KEY`, `DOCUSIGN_USER_ID`, `DOCUSIGN_ACCOUNT_ID`, `DOCUSIGN_PRIVATE_KEY`
   - **`NEXT_PUBLIC_APP_URL`** = deine Vercel-URL, z. B. `https://dein-projekt.vercel.app`  
     (wichtig für DocuSign-Rückkehr-URL und Admin-Links)
   - Optional: `ADMIN_DEMO_SECRET` (für Admin-Direktzugang), `RESEND_API_KEY`, etc.

3. **Deploy**  
   Nach dem ersten Deploy erhältst du eine URL wie `https://dein-projekt.vercel.app`.  
   Diese URL in `NEXT_PUBLIC_APP_URL` eintragen und ggf. erneut deployen, damit DocuSign und Redirects korrekt auf die Vercel-Domain zeigen.

4. **Links teilen**  
   - Zugangslink für Empfänger: `https://dein-projekt.vercel.app/access/DEIN_TOKEN`
   - Admin-Direktzugang (nur mit Secret):  
     `https://dein-projekt.vercel.app/api/admin/enter-demo?secret=DEIN_ADMIN_DEMO_SECRET&demo_id=eidconnect-v1`

## Hinweis

`NEXT_PUBLIC_APP_URL` muss auf die tatsächlich genutzte Domain zeigen (z. B. Vercel-URL oder eigene Domain), damit die DocuSign-Return-URL und Redirects nach dem Signieren funktionieren.
