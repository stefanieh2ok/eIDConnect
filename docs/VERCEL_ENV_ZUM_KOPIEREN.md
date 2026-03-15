# Vercel – Variablen zum Kopieren

In Vercel: **Settings** → **Environment Variables** → **Add New**.  
Für jede Zeile: **Name** aus Spalte 1, **Value** aus deiner `.env.local` (oder aus Spalte 2), Environment **Production** wählen, **Save**.

| Name | Was eintragen |
|------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Aus .env.local (z. B. `https://vtauafbbzdvhrxoyfnpe.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Aus .env.local (langer Key von Supabase → API → Service role) |
| `NEXT_PUBLIC_APP_URL` | **Genau deine Vercel-URL**, z. B. `https://e-id-connect-lr65.vercel.app` (ohne / am Ende) |
| `ADMIN_BASIC_USER` | Aus .env.local, z. B. `admin` |
| `ADMIN_BASIC_PASS` | Aus .env.local (dein Admin-Passwort) |
| `ADMIN_DEMO_SECRET` | Aus .env.local oder neu erfinden (langer geheimer String) |
| `RESEND_API_KEY` | Aus .env.local, falls du E-Mails senden willst (z. B. `re_...`) |

**Danach:** Deployments → ⋯ beim letzten Deployment → **Redeploy**.
