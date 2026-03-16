# Vercel – Umgebungsvariablen: Pro Zeile eintragen

Vercel öffnen → dein Projekt **e-id-connect-lr65** → **Settings** → **Environment Variables**.

Für **jede** der folgenden Zeilen: Auf **Add New** klicken, **Name** und **Value** wie angegeben eintragen, bei **Environment** **Production** auswählen, **Save** klicken. Dann zur nächsten Zeile.

---

**Zeile 1**
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** aus deiner `.env.local` kopieren (steht in der Zeile `NEXT_PUBLIC_SUPABASE_URL=...`, z. B. `https://vtauafbbzdvhrxoyfnpe.supabase.co`)
- Environment: **Production** → **Save**

**Zeile 2**
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** aus deiner `.env.local` kopieren (langer Key, Zeile `SUPABASE_SERVICE_ROLE_KEY=...`)
- Environment: **Production** → **Save**

**Zeile 3**
- **Name:** `NEXT_PUBLIC_APP_URL`
- **Value:** deine Vercel-URL, **ohne** Slash am Ende, z. B. `https://e-id-connect-lr65.vercel.app`
- Environment: **Production** → **Save**

**Zeile 4**
- **Name:** `ADMIN_BASIC_USER`
- **Value:** aus `.env.local` (z. B. `admin`) oder z. B. `admin`
- Environment: **Production** → **Save**

**Zeile 5**
- **Name:** `ADMIN_BASIC_PASS`
- **Value:** aus `.env.local` (Zeile `ADMIN_BASIC_PASS=...`) – dein Admin-Passwort
- Environment: **Production** → **Save**

**Zeile 6**
- **Name:** `ADMIN_DEMO_SECRET`
- **Value:** aus `.env.local` (Zeile `ADMIN_DEMO_SECRET=...`) oder ein neuer langer geheimer Text (nur für dich)
- Environment: **Production** → **Save**

**Zeile 7** (optional, nur wenn „Zugang anfordern“ E-Mails senden soll)
- **Name:** `RESEND_API_KEY`
- **Value:** aus `.env.local` (Zeile `RESEND_API_KEY=...`, z. B. `re_...`)
- Environment: **Production** → **Save**

---

**Danach:** Oben auf **Deployments** gehen → beim letzten Deployment auf die **drei Punkte (⋯)** klicken → **Redeploy** wählen und warten, bis der Build durch ist.
