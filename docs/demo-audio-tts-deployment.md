# Demo Audio / TTS — Deployment-Aufgaben

Stand: 2026-06-16 · Branch-Baseline: `main` @ UX-003 merged

Code-Fixes in `fix/demo-audio-tts-csp`: UX-001 (CSP Silent-Unlock), UX-004 (Launch-MP3-404).  
**Ops-only (kein Code-Fix):** UX-002, UX-005.

---

## UX-002 — Production `/api/tts` HTTP 502

| Feld | Wert |
|------|------|
| Route | `POST /api/tts` (`app/api/tts/route.ts`) |
| Lokal | Kein 502 bei gesetztem gültigen `OPENAI_API_KEY` in `.env.local` |
| Production (lr65) | **502** — OpenAI lehnt den Server-Key ab |
| Upstream | `https://api.openai.com/v1/audio/speech` (Modell `gpt-4o-mini-tts`) |

**Root cause:** Vercel-Projekt für **`https://e-id-connect-lr65.vercel.app`** hat `OPENAI_API_KEY` gesetzt, aber der Wert ist **ungültig/abgelaufen** (OpenAI antwortet mit „Incorrect API key“ → Route mappt auf 502).

**Hinweis:** Fehlt der Key komplett, liefert die Route **503** (nicht 502) — siehe `app/api/tts/route.ts`.

### Vercel-Aufgabe (lr65)

1. Vercel Dashboard → Projekt **e-id-connect-lr65** (nicht Primary-Alias).
2. Settings → Environment Variables → `OPENAI_API_KEY` auf gültigen OpenAI-Key setzen (Production + Preview).
3. **Redeploy:** ja — nach Env-Änderung Production neu deployen.
4. Verifikation: `POST /api/tts` mit `{"text":"Test"}` → **200** + `Content-Type: audio/mpeg`.

**Kein Secret in Repo oder Docs committen.**

---

## UX-005 — Primary `e-id-connect.vercel.app` → `reason=config`

| Feld | Wert |
|------|------|
| URL | `https://e-id-connect.vercel.app` |
| Symptom | `/api/demo/enter` → `/access/denied?reason=config` |
| lr65 | Funktioniert mit Supabase + Demo-Token |

**Root cause:** Primary-Vercel-Deployment ohne Supabase-Env (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

### Vercel-Aufgabe (Primary — separates Projekt/Alias)

1. Vercel Dashboard → Projekt hinter **`e-id-connect.vercel.app`** (nicht lr65 vermischen).
2. Supabase-Env vars spiegeln wie auf lr65.
3. Optional: `OPENAI_API_KEY` für TTS.
4. **Redeploy:** ja.
5. Bis Fix: Demo-URL **`https://e-id-connect-lr65.vercel.app`** kommunizieren.

**Nicht in diesem Fix-Branch adressiert** — reine Deployment-Konfiguration.

---

## Demo-URL-Referenz

| Base | Status | Verwendung |
|------|--------|------------|
| `https://e-id-connect-lr65.vercel.app` | Demo-fähig (nach Env-Fix für TTS) | Production-Smoke, Live-Demo |
| `https://e-id-connect.vercel.app` | `reason=config` | Erst nach UX-005 Ops-Fix |
