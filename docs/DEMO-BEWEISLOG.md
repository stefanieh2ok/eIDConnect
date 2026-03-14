# Demo-Zugang mit Beweis-Log (MVP)

## Übersicht

Drei Features für den juristisch abgesicherten Demo-Zugang:

1. **Personalisierter Demo-Link** mit Token, Session- und Zugriffs-Log (append-only)
2. **Beweis-Export** als PDF inkl. SHA-256-Hash und unveränderlicher Speicherung
3. **Minimales Admin-Interface** (Demo-Links, Zugriffs-Log, Meldungen)

## Setup

### 1. Supabase

- Projekt anlegen auf [supabase.com](https://supabase.com)
- SQL aus `supabase/migrations/001_demo_and_proof.sql` im SQL-Editor ausführen (Tabellen + RLS)
- In Supabase Auth ggf. einen Admin-User anlegen (E-Mail/Passwort)
- Unter **Settings → API**: `Project URL` und `anon` Key sowie `service_role` Key kopieren

### 2. Umgebungsvariablen

`.env.local` anlegen (siehe `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key (nur Server, nie im Client)

### 3. Admin-Login

- Aufruf: **https://deine-domain/admin**
- Ohne Login → Weiterleitung zu **/admin/login**
- Mit Supabase Auth (E-Mail/Passwort) anmelden

### 4. Demo-Link erzeugen

- Im Admin: Tab **Demo-Links** → Empfänger, Organisation, Ablauf (z. B. 30 Tage) → **Link erstellen**
- Link kopieren (z. B. `https://deine-domain/demo?token=gov-berlin-2026-03`)
- Link nur an die jeweilige Person/Organisation weitergeben (kein öffentliches Listing)

### 5. Demo aufrufen

- Besuch **/demo?token=…** → Token wird serverseitig validiert
- Gültig: Einmalig erscheint ein **Vertraulichkeits-Gate** (kein NDA-Popup, ein Klick „Akzeptieren und Demo starten“). Die Akzeptanz wird als Event `terms_accepted` geloggt und pro Token in sessionStorage gespeichert (kein erneutes Gate bei Reload).
- Im Hintergrund: Session + Log (demo_open, terms_accepted, page_view, heartbeat, demo_close)
- Jeder Screen zeigt: *„Dieser Demo-Link ist personalisiert … Eine Weiterleitung … ist untersagt.“* sowie *„Vertrauliche personalisierte Demo für [Organisation] – Zugriff wird dokumentiert.“* mit Link zur **Geheimhaltungsvereinbarung** (/legal/demo-nda)
- Footer: *„Diese personalisierte Demo-Session wird zu Dokumentationszwecken protokolliert.“*

### 6. Beweis-PDF

- Im Admin bei dem jeweiligen Demo-Link: **Beweis-PDF exportieren**
- PDF enthält: Empfänger, Organisation, Token, Zeiträume, alle Sessions (inkl. Viewport, Sprache, Zeitzone, Referrer), chronologische Zugriffe/Events, SHA-256-Hash im Footer
- Hash wird vor dem PDF-Rendering über den strukturierten Report-Inhalt (JSON) berechnet und im PDF sowie in `proof_reports` gespeichert – Tabellen-Trigger verhindern UPDATE/DELETE auf `proof_reports`

## Wichtige Punkte

- **Einmaliger Click-Through** zur Geheimhaltung: sichtbarer Vertragstext (Kurzfassung + Link zur Vollversion), **Checkbox** „Ich habe die Vertraulichkeitsvereinbarung gelesen und akzeptiere sie“, Button „Zugang bestätigen und Demo starten“ – kein blockierendes NDA-Popup
- **NDA-Versionierung und Dokumenten-Hash:** Bei Akzeptanz werden `nda_version` und `nda_document_hash` (SHA-256 des kanonischen NDA-Texts) in `demo_access_logs.metadata` gespeichert – Nachweis, welche Fassung akzeptiert wurde
- **Öffentliche NDA-Seite** unter `/legal/demo-nda` – vollständige Vertraulichkeitsvereinbarung (§§ 1–15, inkl. Demo-Link, Screenshots, KI-Upload, Reverse Engineering, Protokollierung) zum Verlinken in E-Mails und aus der Demo
- **Demo-Seiten:** `noindex`, `nofollow` (Metadata im Demo-Layout)
- **Logging nur bei gültigem Demo-Token**, kein externes Analytics
- **demo_access_logs:** nur INSERT – append-only; Trigger verhindert UPDATE/DELETE auch mit Service-Role
- **proof_reports:** Nur SELECT + INSERT für Admin; Trigger verhindert UPDATE/DELETE (Hash/Report unveränderlich)
- **DSGVO:** Kein Cookie-Banner (kein Marketing-Tracking), nur Dokumentation der Demo-Session

### RLS-Übersicht

| Tabelle            | Admin (authenticated) | API (Service-Role)     |
|--------------------|------------------------|------------------------|
| demo_tokens        | SELECT, INSERT, UPDATE | SELECT (Validierung)  |
| demo_sessions      | SELECT                 | INSERT, UPDATE (Ende)  |
| demo_access_logs   | SELECT                 | INSERT (Trigger: kein UPDATE/DELETE) |
| proof_reports      | SELECT, INSERT         | –                      |
| meldungen          | SELECT, INSERT, UPDATE, DELETE | –              |

## Dateien (Auswahl)

- `app/(demo)/layout.tsx` – noindex, Footer-Hinweis
- `app/(demo)/demo/page.tsx` – Token-Validierung, AcceptanceGate (terms_accepted), DemoProvider, Banner mit NDA-Link
- `app/legal/demo-nda/page.tsx` – Vollständige Vertraulichkeitsvereinbarung §§ 1–15 (öffentlich, mobil-optimiert)
- `lib/nda-content.ts` – NDA_VERSION, GATE_SUMMARY (Kurzfassung für Gate)
- `lib/nda-canonical.server.ts` – Kanonischer NDA-Text für Hash-Berechnung (nur Server)
- `app/api/demo/validate/route.ts` – Token prüfen
- `app/api/demo/log/route.ts` – Sessions + Logs (Event-Typen inkl. terms_accepted), Service-Role
- `app/api/admin/proof-report/route.ts` – PDF + Hash + proof_reports
- `lib/demo-logger.tsx` – DemoProvider, Heartbeat, demo_close
- `middleware.ts` – Admin-Schutz (außer /admin/login); für `/demo` Security-Headers (no-store, X-Frame-Options, CSP)
- `app/(admin)/admin/` – Tabs Demo-Links (inkl. „Vertraulichkeits-Text kopieren“ + NDA-Link), Zugriffs-Log, Meldungen

## Session-Validierung (Cookie, serverseitig)

- **Cookie:** Nach NDA-Akzeptanz wird `POST /api/demo/session` aufgerufen; die API legt in `demo_sessions` einen `session_token_hash` an (Roh-Token nur im HTTP-only-Cookie `demo_session`, nie in der DB).
- **Protected Route:** `/demo/[demoId]` (z. B. `/demo/buerger-app`) wird von einem Server-Layout geschützt: `getActiveDemoSession()` liest das Cookie, prüft Hash und Ablauf; bei fehlender/ungültiger Session Redirect nach `/access/denied`.
- **Audit:** `POST /api/audit` verlangt eine aktive Demo-Session (Cookie); Einträge in `audit_logs` inkl. `device_fingerprint` (Hash aus IP + User-Agent).
- **Dateien:** `lib/supabase-admin.ts`, `lib/security/session.ts`, `lib/security/audit-server.ts`, `lib/security/hash.ts`, `lib/security/request.ts`, `app/api/demo/session/route.ts`, `app/demo/[demoId]/layout.tsx`, `app/access/denied/page.tsx`. Migration: `003_demo_session_auth.sql`.

## Access-Token-Flow (/api/accept)

Personalisierte Links mit **max_views** (Akzeptanzen) und **max_devices** (gleichzeitige Sessions):

- **Tabellen:** `demo_access_tokens` (token_hash, demo_id, full_name, company, email, nda_version, nda_document_hash, expires_at, max_views, max_devices, is_revoked), `demo_acceptance_logs` (jede NDA-Annahme). Sessions aus diesem Flow: `demo_sessions.access_token_id` gesetzt, `token_id` null. Migration: `004_demo_access_tokens.sql`.
- **POST /api/accept:** Body `{ token: rawAccessToken, accepted: true }`. Validiert Token, prüft max_views/max_devices, legt Session an, schreibt Akzeptanz + Audit (`nda_accepted`), setzt Cookie, antwortet mit `redirectTo: /demo/{demo_id}`.
- **Einstieg:** `/demo/access?token=RAW_TOKEN` – NDA-Gate mit `AcceptNdaButton`; nach Klick Redirect auf geschützte Demo.
- **Dateien:** `lib/security/token.ts`, `lib/security/session-create.ts`, `lib/security/acceptance.ts`, `app/api/accept/route.ts`, `components/security/AcceptNdaButton.tsx`, `app/(demo)/demo/access/page.tsx`. Access-Tokens erzeugen: Roh-Token generieren (z. B. `ds_` + 64 Hex), Hash in `demo_access_tokens` speichern, Link `/demo/access?token=ROH` versenden (Admin/Script ergänzbar).

## Anti-Leak-Layer (Phase 1)

Abschreckung, Zuordenbarkeit und Audit – kein Screenshot-Blocker.

- **Watermark** (`components/security/Watermark.tsx`): Persönliches Wasserzeichen (Name, Organisation, demoId, Zeitstempel, CONFIDENTIAL), diagonal wiederholt, alle 60 s aktualisiert, `pointer-events: none`.
- **Protected Demo**: Alle Demo-Seiten unter `/demo` erhalten Security-Headers (Cache-Control no-store, X-Frame-Options DENY, Referrer-Policy no-referrer, CSP) und im Inhalt Watermark + AntiCopyLayer (Rechtsklick/Drag/Textauswahl deaktiviert).
- **Audit-Logs** (`audit_logs`): Event-Typen z. B. `sensitive_content_revealed`, `module_opened`, `rapid_navigation`; API `POST /api/audit` (tokenId/sessionId erforderlich). Migration: `supabase/migrations/002_audit_logs.sql`.
- **SensitiveContent** (`components/security/SensitiveContent.tsx`): Blur-Placeholder, Klick „Vertraulichen Inhalt anzeigen“, Reveal wird in `audit_logs` geloggt.
- **Dateien**: `lib/security/headers.ts`, `lib/security/audit.ts`, `app/api/audit/route.ts`, `components/security/` (Watermark, SensitiveContent, AntiCopyLayer).

## KI-/IP-Dokumentation (außerhalb des UI)

- Stand der Demo vor jedem externen Termin in Git dokumentieren
- Zentrale Screenshots/Exporte mit nachvollziehbarer Version ablegen
- Bei KI-generierten Inhalten: menschliche Überarbeitung und finale Auswahl dokumentieren (z. B. in Code-Kommentaren oder einem Changelog)
