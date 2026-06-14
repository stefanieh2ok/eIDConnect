# Sprint 0 — Bestandsinventar HookAI Civic

**Datum:** 2026-06-13  
**Rolle:** Senior Technical Auditor / GovTech Solution Architect / Due-Diligence-Reviewer  
**Scope:** Reine Bestandsaufnahme — keine Code-, UI- oder Backend-Änderungen in diesem Sprint  
**Repo:** `hookai-civic-demo` v0.2.0  
**Verifikation:** `npm run build` ✓ · `npm test` ✓ (226/226) · `npm run lint` ✓ (nur Warnings)

---

## 1. Executive Summary

HookAI Civic ist eine **Next.js 14 App-Router-Demo** mit starkem Frontend-/Pitch-Fokus. Die Kern-Bürgerreise (Anrede → 12-Szenen-Walkthrough → App-Shell) ist **implementiert und testbar**. Fast alle Bürger-Module sind **Demo/Mock mit lokaler Persistenz** (localStorage, statische Daten); echte Behördenanbindung, E-Voting, Zustellung und Produktiv-Adapter **existieren nicht**.

**Stabil und review-reif:** Intro/Walkthrough-Orchestrierung, Navigation, Abstimmungs-UI, Wahlvorschau mit Disclaimer, Prämien-Flow (Kirkel/Naturfreibad/QR/Wallet-Vorschau), Clara TTS/Chat-API, Demo-Zugang/NDA/Supabase-Logging für Pitch-Demos.

**Riskant für Compliance/Neutralität:**
- Walkthrough animiert **Friedrich Merz (CDU)** mit Kreuz-Markierung auf dem Stimmzettel → **Politische Neutralität / Endorsement-Risiko**
- `RECORD_ELECTION_VOTE` vergibt `DEMO_POINTS_PER_WAHL` (200 Punkte) bei Wahlvorschau-Aktion → potenzielle Kopplung Wahl ↔ Punkte
- Interner Section-Key `leaderboard` vs. sichtbares Label **„Prämien“** — technisch stabil, dokumentationspflichtig

**Backend:** ~35 API-Routen (Clara, TTS, Demo-Session, Admin, DocuSign, Audit). Supabase-Schema für Demo-Tokens, Sessions, Access-Logs, Audit-Logs, NDA, Access-Requests — **persistent wenn konfiguriert**, sonst 503/Fallback. Bürger-Meldungen-Tabelle in Supabase **ohne Frontend-Anbindung**.

**Empfehlung Sprint 1:** Adapter-Readiness und Audit-Persistenz vertiefen; Wahlvorschau-Risiko und Punkte-Wahl-Kopplung **bewerten, nicht still ändern**; `DemoMode` vs. `ExternalAdapterStatus` formalisieren (noch nicht als Typen vorhanden).

---

## 2. Was existiert wirklich?

### 2.1 Technologie-Stack

| Aspekt | Ist-Zustand |
|--------|-------------|
| Framework | **Next.js 14.2.35** (App Router) |
| Router | **App Router** (`app/`) — kein `pages/`-Verzeichnis |
| Sprache | **TypeScript 5** (`strict: true`, Path-Alias `@/*`) |
| UI | React 18, Tailwind 3.4, Framer Motion, lucide-react |
| State | `context/AppContext.tsx` (Reducer + localStorage-Hydration) |
| Tests | Jest 29 + Testing Library (34 Suites, 226 Tests) |
| DB | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) — optional per Env |
| Auth (Demo) | Token-Links, NDA, DocuSign, Demo-Session-Cookies |
| Auth (Admin) | Basic Auth via `middleware.ts` (`ADMIN_BASIC_USER/PASS`) |
| KI | OpenAI über `/api/clara/*`, `/api/tts` (provider in `lib/ai/`) |
| Deploy | Vercel-Scripts in `package.json` |

### 2.2 Projektstruktur (Kern)

```
app/                    # App Router: /, /demo, /access, /admin, /api/*
components/             # UI-Module (BuergerApp, Intro, Sections, Clara, …)
context/                # AppContext (globaler Demo-State)
data/                   # Statische Demo-Daten, Walkthrough-Texte, Wahlen, Civic-Registry
lib/                    # Orchestrierung, Security, Supabase, Civic-Engine, AI
types/                  # Section, Wahl, Civic-Typen, security
supabase/migrations/    # 11 SQL-Migrationen (Demo, Audit, NDA, Access)
__tests__/              # Unit/Component-Tests
scripts/                # Dev/Ops-Hilfsskripte (nicht alle in package.json)
public/                 # Brand, Demo-HTML-Vorschauen, Audio-Platzhalter
docs/                   # Umfangreiche DD-, Feature- und Architektur-Doku
```

### 2.3 Frontend-Module (implementiert)

| Modul | Hauptdateien | Status |
|-------|--------------|--------|
| **App-Shell** | `components/BuergerApp.tsx` | Vollständig — Section-Routing, Pre-Login-Flow, Rewards-Opt-in-Prompt |
| **Header/Nav** | `AppHeader.tsx`, `AppBottomNav.tsx`, `lib/appNavConfig.ts` | Vollständig — Wegweiser, Melden, Beteiligen, Wahlen + Utility (Postfach, Kalender, Prämien) |
| **Intro/Anrede** | `AnredeGate.tsx`, `IntroEntryBranch.tsx`, `IntroOverlay.tsx` | Vollständig |
| **Walkthrough** | `DemoIntroWalkthrough.tsx`, `WalkthroughSceneEmbeds.tsx`, `lib/walkthroughOrchestration.ts` | **12 Schritte** implementiert |
| **Wegweiser** | `FuerMichSection.tsx`, `FuerMichLifeEventPicker.tsx`, `data/fuerMich*` | Implementiert (Kirkel-Demo) |
| **Meldungen** | `MeldungenSection.tsx` | UI + Walkthrough-Film-Modus; Submit nur Context/local |
| **Abstimmungen** | `LiveSection.tsx`, `VotingCard.tsx`, `VotingControls.tsx` | Demo-Karten aus `data/constants.ts` / `demoVoting2026.ts` |
| **Wahlen** | `ElectionsSection.tsx`, `StimmzettelModal.tsx`, `OriginalStimmzettel.tsx` | Wahlvorschau + lokale „Auswahl gespeichert“ |
| **Kalender** | `CalendarSection.tsx` | Demo-Termine/Fristen |
| **Postfach** | `PostfachSection.tsx`, `data/demoPostfachMessages.ts` | Statische Demo-Nachrichten + Disclaimer |
| **Prämien** | `LeaderboardSection.tsx`, `WalkthroughPraemienOrchestrated.tsx` | Kirkel, Naturfreibad, QR, Wallet-Vorschau |
| **Clara** | `ClaraDock.tsx`, `ClaraChat.tsx`, `ClaraVoiceInterface.tsx`, `services/claraAI.ts` | TTS + Chat + Walkthrough-Sync |
| **Login/eID** | `LoginScreen.tsx` | Perspektiv-Demo (eID/EU-Wallet); im Haupt-Walkthrough **nicht** erster Schritt |

### 2.4 Walkthrough-Szenen (12) — verifiziert in Code

Reihenfolge in `lib/walkthroughOrchestration.ts`:

1. `intro` — HookAI Civic Elevator  
2. `wegweiser` — Baby-Beispiel (`WalkthroughWegweiserBaby`)  
3. `profil` — Demo-Stammdaten  
4. `behoerdenweg` — Checkliste Baby kommt  
5. `meldungen` — Rattenplage Drachenspielplatz (Film-Sequenz)  
6. `abstimmen` — Abstimmung + Punkte-Animation  
7. `wahlen` — Bundestags-Stimmzettel, **Merz-Markierung** (`IntroWahlenWalkthroughDemo`)  
8. `kalender`  
9. `postfach`  
10. `praemien` — Kirkel/Naturfreibad/QR/Wallet  
11. `oekosystem`  
12. `outro`

**TTS:** Runtime nutzt `machineSpeakParts()` → nur `speakSegments` aus `data/introWalkthroughClara.ts` (kein `line10s` zur Laufzeit). `line10s*` bleibt für UI/Manifest.

### 2.5 API-Routen (existierend)

| Gruppe | Routen | Zweck |
|--------|--------|-------|
| **Clara/KI** | `/api/clara/chat`, `/analyze`, `/region-context` | LLM-Chat, Analyse, Regional-Kontext |
| **TTS** | `/api/tts` | Clara-Sprachausgabe (mit AI-Audit-Log) |
| **Demo-Zugang** | `/api/demo/enter`, `/validate`, `/session`, `/log` | Token, Session, page_view/heartbeat |
| **Audit** | `/api/audit`, `/api/admin/audit` | Client-Events → `audit_logs` |
| **Access/NDA** | `/api/request-access`, `/accept`, `/accept-checkbox`, `/access/enter-demo`, `/nda/*`, `/legal/nda-pdf` | Pitch-Zugang, NDA |
| **DocuSign** | `/api/docusign/send-nda`, `/return` | NDA-Signatur |
| **Admin** | `/api/admin/*` (tokens, access-requests, proof-report, email, verify, …) | Demo-Verwaltung |
| **Setup** | `/api/check-setup`, `/api/setup/*` | Supabase-Tabellen |
| **Sonst** | `/api/tokens`, `/api/debug/token-check` | Token-Verwaltung |

**Keine** Bürger-API für: Meldungen-Submit, Wahlabgabe, Postfach-Zustellung, Prämien-Einlösung, Behördenanträge.

### 2.6 Supabase / Schema

Migrationen unter `supabase/migrations/`:

| Migration | Inhalt |
|-----------|--------|
| `001` | `demo_tokens`, `demo_sessions`, `demo_access_logs`, `proof_reports`, **`meldungen`** |
| `002` | **`audit_logs`** |
| `003–011` | Demo-Session-Auth, Access-Tokens, NDA-Logs, DocuSign, Access-Requests, E-Mail-Tracking |

**Auth:** Kein Endnutzer-Login über Supabase Auth für Bürger-App; Admin über Basic Auth + optional Supabase `authenticated` für RLS-Read auf Audit.

**Storage/Upload:** Kein Supabase Storage im Bürger-Flow. Meldungs-Fotos: **nur Client/Blob im Walkthrough**, kein Server-Upload.

### 2.7 Tests

- **34 Test-Suites, 226 Tests** — alle grün (2026-06-13)
- Schwerpunkte: Intro/TTS, BuergerApp UI, Elections, FuerMich, Civic-Prefill, Kirkel-Wahlen, Clara-Audit, Branding

### 2.8 Demo-Daten & Assets

**Daten:** `data/constants.ts` (Wahlen/Abstimmungen), `wahlen-deutschland.ts`, `demoVoting2026.ts`, `demoPostfachMessages.ts`, `introWalkthroughClara.ts`, `introOverlayMarketing.ts`, `fuerMich*`, `kirkel-service-catalog.json`, `leistungskatalog-demo.json`, `civic/` (Kirkel-Behörden/Services/Forms)

**Assets:** `public/brand/*`, `public/demo-documents/**/demo-preview.html`, `public/images/politiker/`, `public/audio/`

### 2.9 Dokumentation

Umfangreich: `docs/due-diligence/*`, `docs/feature-fuer-mich/*`, `docs/CONNECTOR-READINESS-MATRIX.md`, `docs/SOVEREIGNTY-ARCHITECTURE.md`, `docs/WALKTHROUGH-CLARA-AUDIT.md`, u. a.

---

## 3. Was ist nur Demo / Mock / Textreferenz?

| Feature-Kontext | Klassifikation | Beleg |
|-----------------|----------------|-------|
| Wegweiser / FuerMich | **demo** + **partially implemented** | Kirkel-Katalog, `confidenceLevel: 'demo'`, keine FIM-Anbindung |
| Baby-Beispiel | **demo** (Walkthrough-Embed) | `WalkthroughSceneEmbeds.tsx`, statisch |
| Behördenweg / Checkliste | **demo** | `FuerMichInlineBehördenweg`, `CIVIC_NO_SUBMISSION` |
| Meldungen Rattenplage | **demo** | Walkthrough-Film, `RECORD_MELDUNG_SUBMITTED` ohne API |
| Bild-Upload Meldungen | **mock** (Walkthrough) / **partially** (echtes UI ohne Backend) | Kein `fetch` zu Meldungs-API |
| Abstimmungen | **demo** | `VOTING_DATA`, Swipe/Vote → localStorage |
| Punkte/Feedback | **demo** | `DEMO_POINTS_PER_ABSTIMMUNG`, `participationPoints` |
| Wahlvorschau | **demo** | Stimmzettel-Modal, „Auswahl gespeichert“, keine echte Wahl |
| Kalender | **demo** | Kuratierte Events |
| Postfach | **demo** | `DEMO_POSTFACH_MESSAGES`, Disclaimer |
| Prämien | **demo** | `regionalPraemienForCity`, QR dekorativ, Wallet „Vorschau“ |
| Clara TTS | **live API** (wenn Keys gesetzt) / Fallback | `/api/tts` |
| Clara Chat | **live API** (OpenAI) / Mock-Fallback | `services/claraAI.ts` |
| eID / EU-Wallet | **text-only / perspective** | `LoginScreen.tsx`, Walkthrough-Auth **existiert aber nicht im aktiven 12-Schritt-Flow** |
| PolitikBarometer | **exists but unused** in Walkthrough | `PolitikBarometerPanel.tsx` |
| GovTech-Adapter (FIM, PVOG, …) | **text-only / planned** | `docs/CONNECTOR-READINESS-MATRIX.md` |
| Supabase `meldungen`-Tabelle | **schema only** | Kein Frontend-Write |

---

## 4. Modul-Klassifikation (Übersicht)

| Modul | Klassifikation | Anmerkung |
|-------|----------------|-----------|
| Wegweiser | **partially implemented** / **demo** | Echte UI, Demo-Daten Kirkel |
| Profil / Stammdaten | **demo** | `CivicDemoProfile`, freiwillig |
| Behördenweg / Checkliste | **demo** | PDF-Vorschau, kein Submit |
| Meldungen | **demo** | UI vollständig, kein Behördenversand |
| Bild-Upload | **mock** (WT) / **partially** | WT-Sequenz simuliert Upload |
| Abstimmungen | **demo** | Voll funktionsfähig im Demo-Sinne |
| Punkte / Teilnahmefeedback | **demo** | localStorage, Opt-in für Prämien |
| Wahlvorschau | **demo** | Mit realem Politiker als **Beispiel-Markierung** |
| Kalender | **demo** | |
| Postfach | **demo** | |
| Prämien | **demo** | Einwilligung `consentLocalBenefits` |
| Clara TTS | **live** (API-abhängig) | |
| IntroOverlay / Walkthrough | **demo** (produktionsreif als Demo) | 12 Szenen, Tests grün |

---

## 5. Welche Module sind stabil?

- **Build/Test-Pipeline** — reproduzierbar grün  
- **Walkthrough-Orchestrierung** — zentrale Wahrheit in `walkthroughOrchestration.ts` + Clara-Texte  
- **Navigation / Section-Routing** — `Section`-Typ, `appNavConfig`, Header/BottomNav  
- **Compliance-Copy-Zentrale** — `lib/civicCompliance.ts`  
- **Demo-Zugang + Session-Logging** — API + Supabase-Schema vorhanden  
- **Clara AI Audit** — `lib/ai/clara-ai-audit.ts` → `audit_logs`  
- **Prämien-UI** — Label „Prämien“, Gift-Icon, Kirkel-Flow  
- **Abstimmungs-UI** — Neutralitätstext in `VotingControls.tsx`

---

## 6. Welche Module sind riskant?

| Risiko | Modul | Schwere |
|--------|-------|---------|
| **Politische Neutralität / Endorsement** | Wahlvorschau Walkthrough (`IntroWahlenWalkthroughDemo`) | **Hoch** |
| **Punkte bei Wahl-Aktion** | `RECORD_ELECTION_VOTE` + `DEMO_POINTS_PER_WAHL` | **Mittel** |
| **Key/Label-Drift** | `leaderboard` vs. „Prämien“ | **Niedrig** (technisch stabil) |
| **Scheinbare Behördenleistung** | FuerMich/Civic-Pakete | **Mittel** — Disclaimers vorhanden, UX könnte überzeugen |
| **Audit ohne Supabase** | `/api/audit` | **Mittel** — schlägt still fehl / 503 |
| **Clara-Halluzination** | Chat ohne harte Source-Lock-Enforcement | **Mittel** — dokumentiert in AI-Governance |
| **Legacy-Docs** | `docs/WAS-FEHLT-NOCH.md` („Stimme abgeben“) | **Niedrig** — Code hat Disclaimers |

**Prämien-Grundsatz (prominent):**  
> **Prämien dürfen niemals an eine konkrete Meinung, Partei, Stimme oder Abstimmungsentscheidung gekoppelt werden.**

**Prüfung:**
- Keine Texte „Prämie für deine Stimme“ / „Belohnung fürs Abstimmen“ gefunden  
- Explizite Unabhängigkeit: `VotingControls`, `LeaderboardSection`, `introWalkthroughClara`  
- **Aber:** `DEMO_POINTS_PER_WAHL` (200) bei `RECORD_ELECTION_VOTE` — technische Kopplung Wahlvorschau-Aktion ↔ Punktepool (nicht Ja/Nein-spezifisch, aber wahlbezogen)  
- Einwilligung: `consentLocalBenefits`, Rewards-Opt-in-Prompt in `BuergerApp.tsx`  
- Abstimmungs-Punkte: einheitlich `DEMO_POINTS_PER_ABSTIMMUNG`, unabhängig von Vote-Richtung

---

## 7. API-Routen — Kurzliste

Vollständige Liste siehe Build-Output (45 App-Routen + 35 API-Endpunkte). Keine neuen Routen in Sprint 0 empfohlen.

---

## 8. Supabase / Auth / Storage

| Capability | Vorhanden? |
|------------|------------|
| Supabase Client/Admin | Ja (`lib/supabase/*`) |
| Demo-Token/Session | Ja |
| Audit persistent | Ja (wenn DB konfiguriert) |
| NDA/DocuSign-Logs | Ja |
| Bürger-Auth (eID live) | **Nein** — nur UI-Perspektive |
| File Storage | **Nein** im Civic-Flow |
| Meldungen DB-Write | Schema ja, **App nein** |

---

## 9. Audit-Logging

| Kanal | Persistenz | Event-Typen |
|-------|------------|-------------|
| `/api/demo/log` | Supabase `demo_access_logs` | demo_open, page_view, heartbeat, demo_close, … |
| `/api/audit` | Supabase `audit_logs` | demo_page_viewed, module_opened, sensitive_content_revealed, … |
| Clara AI | `audit_logs` via `logClaraAiOutput` | input/output hashes, model, sourceRefs |
| Client | `lib/security/audit.ts` | fetch zu `/api/audit`, Fehler still |
| Admin UI | `app/(admin)/admin/audit/page.tsx` | Read über `/api/admin/audit` |

**Fazit:** Nicht nur In-Memory — **Supabase/Postgres-ready**, aber **abhängig von Env-Konfiguration**. Ohne Supabase: Demo-Logging fällt aus oder 503.

**Hinweis:** `DemoMode` und `ExternalAdapterStatus` als **getrennte Typen existieren noch nicht** — nur `CivicConfidenceLevel` und Connector-Matrix in Doku.

---

## 10. GovTech-Adapter

Aus `docs/CONNECTOR-READINESS-MATRIX.md` + Code-Scan:

| Adapter | Code-Status | Ersatz im Repo |
|---------|-------------|----------------|
| **FIM / LeiKa** | Offen | `kirkel-service-catalog.json`, `kirkelServiceResolver.ts` |
| **PVOG** | Offen | `verified_submission_channel: null` |
| **OParl** | Demo (Doku) | Keine Live-API |
| **BundID / eID** | Offen | `LoginScreen` Perspektive |
| **EUDI Wallet** | Offen | Text in Login/Walkthrough-Auth |
| **Apple/Google Wallet** | Demo UI | `LeaderboardSection` „Vorschau“ |
| **FIT-Connect / XZuFi / FIM live** | Nicht im Code | Nur Architektur-Docs |
| **Postfach / eBO** | Offen | `demoPostfachMessages.ts` |
| **Audit/Event-Log** | Demo/Pilot | Supabase-Tabellen |

---

## 11. Status-Begriffe im Code

| Begriff | Vorkommen |
|---------|-----------|
| `demo` | `CivicConfidenceLevel`, `SourceStatus`, API `eventType`, Demo-Session |
| `mock` | Kaum als Enum — eher in Tests/Doku |
| `live` | Section `live` (= Abstimmungen), `is_live` in `demo_sessions` |
| `verified` | `CivicConfidenceLevel`, `SourceStatus` |
| `reference_only` | Civic-Forms/Services |
| `production` / `sandbox` / `staged` / `adapter` | Primär in **Dokumentation**, nicht als zentrale App-Enums |
| `confidenceLevel` | `types/civic.ts` — **nicht** gleichbedeutend mit `ExternalAdapterStatus` |

**Empfehlung später:** `DemoMode` (Modul) ≠ `ExternalAdapterStatus` (Connector) explizit typisieren.

---

## 12. Kritische Claims — Fundstellen

| Claim / Formulierung | Datei(en) | Bewertung |
|---------------------|-----------|-----------|
| „keine echte Stimmabgabe“ | `introWalkthroughClara.ts`, `ElectionsSection.tsx`, `introOverlayMarketing.ts` | ✅ Korrekt disclaimer |
| „keine echte Zustellung oder Behördenanbindung“ | Postfach-Clara/Overlay/`demoPostfachMessages.ts` | ✅ |
| „kein automatischer Bescheid“ | `introOverlayMarketing.ts`, Profil-Clara | ✅ |
| „Auswahl gespeichert“ / Stimmzettel-Aktion | `StimmzettelModal.tsx` — „Nur Teil der Konzeptdemo, ohne rechtliche Wirkung“ | ⚠️ UX kann verwirren, Disclaimer vorhanden |
| „Verbindlich entscheidet die zuständige Stelle“ | `lib/civicCompliance.ts` | ✅ |
| „Es wurde nichts übermittelt“ | `civicCompliance.ts` | ✅ |
| „garantiert“ (Neutralität) | `docs/SERIOESE_KORREKTUR.md` | ⚠️ Marketing-Doku, nicht Runtime |
| „Beispielprämie für aktive Beteiligung“ | `WalkthroughPraemienOrchestrated.tsx` | ✅ nicht stimmen-/parteispezifisch |
| eID „erforderlich“ (FAQ in BuergerApp) | `BuergerApp.tsx` ~Zeile 669 | ⚠️ Widerspruch zu Demo-only — Kontext prüfen in Sprint 1 |

**Nicht gefunden im Produktionscode:** „KI entscheidet“, „rechtsverbindlich“ (Antrag), „Anspruch berechnen“ als Nutzerversprechen, „echte Zustellung“ als Claim.

---

## 13. Politische Neutralität — Wahlvorschau

### 13.1 Befunde

1. **Realer Politiker als Demo-Auswahl?** **Ja** — `data/wahlen-deutschland.ts` enthält **Friedrich Merz** (CDU, btw25). Walkthrough `IntroWahlenWalkthroughDemo` in `DemoIntroWalkthrough.tsx` markiert Merz automatisch mit ✗ (Erststimme) und zeigt CDU-Programmauszug + offizielle CDU-Quellen.

2. **Vorausgewählt?** **Ja, im Walkthrough scripted** — Animation setzt `phase: tick` nur für Merz (`isMerz && showMerzMark`). Nutzer wählt nicht selbst; es ist eine **Auto-Demo**.

3. **Disclaimer vorhanden?** **Ja** — u. a. „Wahlvorschau — keine echte Stimmabgabe“, „Die Markierung ist nur ein Beispiel“, „Vorschau · Demo-Dokument“, Clara-TTS in `introWalkthroughClara.ts`.

4. **Wirkt wie Empfehlung?** **Risiko: Ja, visuell** — Kreuz bei realem Kanzlerkandidaten + CDU-Programm-Highlight kann trotz Disclaimer wie **Zustimmung** wirken. → **Politische Neutralität / Endorsement-Risiko**

5. **Betroffene Dateien**

| Datei | Rolle |
|-------|-------|
| `data/wahlen-deutschland.ts` | Kandidatendaten Merz |
| `components/Intro/DemoIntroWalkthrough.tsx` | `IntroWahlenWalkthroughDemo` Animation |
| `data/introWalkthroughClara.ts` | Clara-Texte Wahlvorschau |
| `data/introOverlayMarketing.ts` | Framing „keine echte Stimmabgabe“ |
| `components/Elections/ElectionsSection.tsx` | Produkt-Wahlvorschau (separat vom WT-Embed) |
| `components/Modals/StimmzettelModal.tsx` | Interaktive Vorschau im App-Betrieb |
| `components/Voting/OriginalStimmzettel.tsx` | Stimmzettel-Rendering |

**Hinweis:** Im **App-Modus** (außerhalb Walkthrough) wählt der Nutzer selbst; Walkthrough ist das größere Risiko wegen Auto-Markierung.

---

## 14. Prämien / Mitwirken — Fundstellen

### 14.1 Sichtbares UI

| UI | Label/Icon |
|----|------------|
| Header `AppHeader.tsx` | **„Prämien“**, `Gift`, `id="tour-rewards-btn"`, `aria-label="Prämien"` |
| `LeaderboardSection.tsx` | H2 **„Prämien“** |
| `ClaraDock.tsx` | `leaderboard: 'Prämien'` |
| `AppNavigation.tsx` | `label: 'Prämien'` |
| Bottom Nav | Kein Prämien-Tab (nur Header-Utility) |

### 14.2 Interne Keys

| Key | Verwendung |
|-----|------------|
| `Section: 'leaderboard'` | Routing, Context, Tests |
| Walkthrough: `'praemien'` | `walkthroughOrchestration`, `introOverlayMarketing` |
| `REWARDS_OPTIN_PROMPT_SHOWN_KEY` | localStorage |
| `DEMO_POINTS_*` | Punkte-Konstanten |
| „Mitwirkungspunkte“ | Copy in `VotingControls`, `AppHeader` Settings |

### 14.3 Empfehlung (später, nicht Sprint 0)

- **UI-Label:** „Prämien“ (bereits umgesetzt)  
- **Interner Key `leaderboard`:** kann vorerst bleiben — breite Referenzbasis (`BuergerApp`, `AppContext`, Tests, Tour-IDs)  
- **Walkthrough-ID `praemien`:** separater Namespace, kein Widerspruch zu Section-Key  
- Migration `leaderboard` → `praemien` nur mit vollständiger Referenz-Suche und Test-Update

---

## 15. npm-Script-Inventar

| Script | Befehl | Zweck | Später sicher ausführbar? |
|--------|--------|-------|---------------------------|
| `dev` | `next dev -p 3002` | Dev-Server Port 3002 | **Ja** |
| `clean:next` | `node scripts/clean-next-cache.mjs` | `.next` + `node_modules/.cache` löschen | **Ja** |
| `dev:clean` | clean + dev | Dev nach Cache-Clean | **Ja** |
| `build` | `next build` | Production Build | **Ja** ✓ |
| `start` | `next start` | Production Server | **Ja** (nach build) |
| `lint` | `next lint` | ESLint | **Ja** ✓ |
| `test` | `jest` | Unit/Component-Tests | **Ja** ✓ |
| `test:watch` | `jest --watch` | Watch-Modus | **Ja** |
| `setup-env` | `node scripts/setup-env.js` | Env-Hilfe | **Unklar** — Env/Secrets nötig |
| `create-access-requests-table` | `node scripts/create-access-requests-table.js` | DB-Setup | **Unklar** — Supabase-Creds |
| `fetch-wikidata` | `node scripts/fetch-wikidata-politiker.mjs` | Politiker-Daten | **Ja** (Netzwerk) |
| `check` | lint + tsc + test | CI-ähnliche Prüfung | **Ja** |
| `smoke` | `node scripts/smoke-check-ui.mjs` | UI-Smoke | **Unklar** — Server auf 3002? |
| `precheck:responsive` | `node scripts/pre-check-responsive.mjs` | Responsive-Check | **Unklar** |
| `capture:intro` | `capture-demo-screens.mjs` | Screenshots | **Unklar** — Server + Playwright |
| `test:ui` | jest BuergerApp.ui | UI-Testsubset | **Ja** |
| `deploy:vercel` | `npx vercel@latest` | Deploy Preview | **Ja** (Vercel-Login) |
| `deploy:vercel:prod` | vercel --prod | Prod Deploy | **Ja** (Vercel-Login) |
| `repair:tailwind` | `repair-tailwind.mjs` | Tailwind-Reparatur | **Ja** (bei Bedarf) |

**Nicht in package.json** (existieren als Dateien): `qa-a11y-probe.mjs`, `qa-mobile-polish.mjs`, `capture-intro-mobile.mjs`, `create-10min-link.mjs`, … — nur manuell aufrufbar.

---

## 16. Build-/Test-Ergebnis

| Befehl | Ergebnis | Details |
|--------|----------|---------|
| `npm run build` | **PASS** | Next 14.2.35, 45 Seiten, ESLint-Warnings (hooks, img) |
| `npm test` | **PASS** | 34 suites, 226 tests, ~10s |
| `npm run lint` | **PASS** | Exit 0, gleiche Warnings wie Build |

---

## 17. Empfehlung für Sprint 1

1. **Architektur-Typen:** `DemoMode` + `ExternalAdapterStatus` einführen (ohne Verhaltensänderung) — Mapping auf `CivicConfidenceLevel` / Connector-Matrix  
2. **Audit-Härtung:** Verhalten dokumentieren wenn Supabase fehlt; Event-Katalog vervollständigen  
3. **Wahlvorschau-Risiko:** Governance-Review Auto-Merz-Sequenz — Optionen: generischer Platzhalter-Kandidat, gleichbleibende Liste ohne Auto-Tick, stärkeres „Beispiel“-Framing  
4. **Punkte-Wahl-Kopplung:** `DEMO_POINTS_PER_WAHL` policy-review — ggf. nur Abstimmungen, nicht Wahlvorschau  
5. **FuerMich/Connector:** FIM/LeiKa-Readiness gegen `kirkelServiceResolver` abgleichen  
6. **Supabase Meldungen:** Entscheidung ob Schema angebunden oder als Admin-only belassen  
7. **Doku-Sync:** `WAS-FEHLT-NOCH.md` vs. Ist-Code (`StimmzettelModal` Disclaimers)

**Nicht in Sprint 1 ohne Freigabe:** Umbenennung `leaderboard`, Walkthrough-Umbau, Prämien-Logik-Änderung, Wahlvorschau-Code-Änderung.

---

## 18. No-Go-Liste (nächster Sprint)

Diese Bereiche **nicht zerstören / nicht still umbauen:**

1. **12-Schritt-Walkthrough** — `WALKTHROUGH_MACHINE_STEPS`, TTS `speakSegments`-only-Pipeline  
2. **Tour-IDs** — `#tour-voting-btn`, `#tour-melden-btn`, `#tour-rewards-btn`, `#tour-footer`  
3. **Section-Typ** — `types/index.ts` `Section` inkl. `leaderboard`, `fuermich`, `live`  
4. **Clara Walkthrough-Sync** — Stop bei Weiter/Zurück/Skip  
5. **Prämien-Flow** — Naturfreibad-Autosequenz im Walkthrough, `consentLocalBenefits`  
6. **Compliance-Copy** — `lib/civicCompliance.ts`  
7. **Demo-Zugang** — Token, NDA, `/api/demo/log`, Session-Cookies  
8. **API-Verträge** — bestehende `/api/clara/*`, `/api/tts`, `/api/audit`  
9. **Tests** — 226 grüne Tests als Regression-Gate  
10. **Sichtbares Label „Prämien“** — bereits korrekt im Header  
11. **Build** — `npm run build` muss grün bleiben

---

## 19. Änderungen in Sprint 0

| Aktion | Datei |
|--------|-------|
| Erstellt | `docs/SPRINT-0-BESTANDSINVENTAR.md` |
| Keine Codeänderungen | — |

---

*Ende Sprint 0 Bestandsinventar*
