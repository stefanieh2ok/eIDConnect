# Sprint 2 — Connector-Readiness & Modul-Härtung

**Datum:** 2026-06-14  
**Basis:** `fcd0574` (PR #2 auf `main`) · Sprint 1: `docs/SPRINT-1-BACKEND-GOVERNANCE-FOUNDATION.md`  
**Scope:** Schlanke Adapter-Interfaces, Trust-Center-Sichtbarkeit, Governance-Härtung — keine Live-Integration  
**Verifikation:** `npm run build` · `npm test` · `npm run lint`

---

## 1. Ziel des Sprints

HookAI Civic soll als GovTech-Demo klarer zeigen:

1. Welche Module Demo/Mock/Live/Adapter-ready sind (`CIVIC_MODULE_STATUS`)
2. Welche Deutschland-Stack-Anschlüsse perspektivisch vorgesehen sind (`lib/adapters/`)
3. Dass aktuell **keine** echten Behördenintegrationen behauptet werden
4. Dass Audit-Persistenz von Supabase-Konfiguration abhängt
5. Dass Wahlvorschau und Prämien politisch neutral bleiben

---

## 2. Adapter-Interfaces (neu)

**Pfad:** `lib/adapters/`

| Datei | Adapter | `currentStatus` |
|-------|---------|-----------------|
| `pvog.ts` | PVOG / XZuFi | `not_started` |
| `fimLeika.ts` | FIM / LeiKa | `mock_ready` |
| `fitConnect.ts` | FIT-Connect | `not_started` |
| `oparl.ts` | OParl | `mock_ready` |
| `identity.ts` | BundID / eID | `not_started` |
| `eudiWallet.ts` | EUDI Wallet | `not_started` |
| `rewardWalletPass.ts` | Reward Wallet Pass | `mock_ready` |
| `index.ts` | Registry `CIVIC_EXTERNAL_ADAPTERS` | — |

Jeder Adapter: `name`, `purpose`, `currentStatus`, `demoBoundary`, `futureIntegrationNotes`, optional `requiredSecrets` / `officialDocsToVerify`, **`noLiveCalls: true`**.

Keine API-Keys, keine HTTP-Clients, keine Produktivversprechen.

---

## 3. Modul-Status / Trust-Center

**Bestehend genutzt:** `lib/civicModuleStatus.ts` (`CIVIC_MODULE_STATUS`) — nicht dupliziert.

**Erweiterung:**

- `CIVIC_MODULE_UI_LABELS` + `CIVIC_MODULE_KEYS` für read-only UI
- `components/shell/CivicDemoStatusPanel.tsx` — Modulliste mit Disclaimer, Adapter-Hinweis, Audit-Zeile
- Eingebunden in Trust Center (`AppHeader.tsx`) nach Demo-Stammdaten

---

## 4. Audit-Persistenzstatus

**`lib/security/audit-config.ts`:**

- `getAuditPersistenceDisplay()` — read-only Hinweis für Trust Center
- `isSupabasePublicUrlConfigured()` — client-sichtbare URL-Prüfung

**Klarstellung:**

- Persistent nur mit vollständiger Server-Konfiguration (URL + Service Role)
- Demo-Fallback ist **nicht** persistent
- Kein revisionssicheres Audit-Logging behauptet

---

## 5. Wahlvorschau-Neutralität

**Prüfung `ElectionsSection` / `OriginalStimmzettel`:**

- Keine automatische Vorauswahl realer Politiker (`useState(null)`)
- Nutzergeführte Information mit echten Kandidatendaten (bewusst aus Sprint 1)
- Labels ergänzt: „keine echte Stimmabgabe, keine Empfehlung“ in InfoHints

**Walkthrough:** weiterhin neutraler Musterstimmzettel (Sprint 1, unverändert).

---

## 6. Prämien-Governance

**Prüfung `LeaderboardSection` / `sectionProductLabels`:**

- Sichtbares Label **„Prämien“** ✓
- Gift-Icon in Navigation ✓
- Copy: „unabhängig von Entscheidung“ ✓
- `RECORD_ELECTION_VOTE` → 0 Punkte (Sprint 1) ✓
- Kirkel / Naturfreibad / QR / Wallet-Mock unverändert ✓
- Interner Key `leaderboard` beibehalten ✓

---

## 7. Bewusst NICHT gebaut

- Keine echten Behörden-API-Calls (PVOG, FIM, FIT-Connect, OParl, BundID, EUDI)
- Keine neuen API-Routen
- Keine Admin-Konsole für Audit
- Keine `leaderboard` → `praemien` Key-Migration
- Keine großen Feature-Flows
- Keine DD-/Sovereignty-/Backup-Dateien
- Keine Änderung an `wahlen-deutschland.ts` / Stimmzettel-Logik

---

## 8. Offene Punkte für Sprint 3

1. **ElectionsSection:** Optional Demo-Ballot-Modus auch außerhalb Walkthrough (fiktive Kandidaten)
2. **Connector Health:** Read-only `healthCheck()` Mock pro Adapter (ohne Netzwerk)
3. **Setup-Seite:** Env-Check für Audit-Persistenz (serverseitig)
4. **Meldungen:** Entscheidung Supabase vs. rein lokal
5. **Control Plane:** Runtime-Anbindung `CIVIC_MODULE_STATUS` an Section-Header-Badges
6. **DD-Doku:** Separater Review-Zyklus für `docs/due-diligence/` (nicht in diesem Sprint)

---

*Ende Sprint 2*
