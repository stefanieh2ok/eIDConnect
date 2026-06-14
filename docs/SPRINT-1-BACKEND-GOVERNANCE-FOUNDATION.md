# Sprint 1 — Backend / Governance Foundation

**Datum:** 2026-06-13  
**Basis:** `docs/SPRINT-0-BESTANDSINVENTAR.md`  
**Scope:** Chirurgische Governance-Foundation — keine großen API-Pakete, keine Frontend-Refactors  
**Verifikation:** `npm run build` ✓ · `npm test` 232/232 ✓ · `npm run lint` ✓ (bekannte Warnings)

---

## 1. Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `types/governance.ts` | **Neu** — `DemoMode`, `ExternalAdapterStatus`, Modul-Typen |
| `types/index.ts` | Re-Export Governance-Typen; Kommentar `leaderboard` → „Prämien“ |
| `lib/civicModuleStatus.ts` | **Neu** — zentrale Modul-Status-Map |
| `lib/sectionProductLabels.ts` | **Neu** — `leaderboard` → „Prämien“ Mapping |
| `lib/security/audit-config.ts` | **Neu** — `isSupabaseAuditConfigured()` |
| `lib/security/audit-server.ts` | Graceful Demo-Fallback ohne Supabase |
| `app/api/audit/route.ts` | Response `{ success, persisted, auditFallback? }` |
| `lib/ai/clara-ai-audit.ts` | Kommentar: nicht persistent ohne Supabase |
| `context/AppContext.tsx` | `RECORD_ELECTION_VOTE` vergibt keine Punkte mehr |
| `data/constants.ts` | `DEMO_POINTS_PER_WAHL = 0` (deprecated) |
| `data/introWalkthroughClara.ts` | Neutrale Wahlvorschau-Clara-Texte |
| `data/introOverlayMarketing.ts` | Framing „Keine Empfehlung“ |
| `components/Intro/DemoIntroWalkthrough.tsx` | Neutraler Musterstimmzettel (kein Merz/CDU) |
| `components/BuergerApp.tsx` | FAQ eID-Überclaim korrigiert |
| `lib/kirkelServiceResolver.ts` | Connector-Abgleich-Kommentar |
| `docs/CONNECTOR-READINESS-MATRIX.md` | Sprint-1-Code-Abgleich-Hinweis |
| `__tests__/lib/civicModuleStatus.test.ts` | **Neu** |
| `__tests__/lib/auditConfig.test.ts` | **Neu** |

**Nicht geändert (bewusst):** `ElectionsSection.tsx`, `StimmzettelModal.tsx`, `data/wahlen-deutschland.ts` (App-Wahlvorschau mit echten Daten bleibt nutzergeführt; Walkthrough neutralisiert).

---

## 2. DemoMode / ExternalAdapterStatus

**Datei:** `types/governance.ts`

```ts
DemoMode: 'mock' | 'demo' | 'staged' | 'live' | 'external-adapter-ready'
ExternalAdapterStatus: 'not_started' | 'mock_ready' | 'adapter_ready' | 'sandbox_ready' | 'production_ready'
```

- Getrennte Konzepte, nicht zusammengeführt  
- `CivicConfidenceLevel` (`types/civic.ts`) unangetastet  
- Keine Verhaltensänderung in der App — nur Typisierung + Status-Map

---

## 3. Modul-Status-Map

**Datei:** `lib/civicModuleStatus.ts` → `CIVIC_MODULE_STATUS`

| Modul | mode | sourceType | adapterStatus (optional) |
|-------|------|------------|---------------------------|
| wegweiser | demo | demo | mock_ready |
| meldungen | demo | mock | not_started |
| abstimmungen | demo | demo | — |
| wahlen | demo | demo | not_started |
| kalender | demo | demo | — |
| postfach | demo | mock | not_started |
| praemien | demo | demo | mock_ready |
| clara | demo | external | adapter_ready |
| eid_wallet | external-adapter-ready | external | not_started |

Jeder Eintrag enthält `disclaimer` und optional `sectionKey` (z. B. `praemien` → `leaderboard`).

---

## 4. Wahlvorschau-Änderungen

**Problem (Sprint 0):** Walkthrough markierte automatisch Friedrich Merz (CDU) mit ✗ und zeigte CDU-Programm/Quellen.

**Lösung:** `IntroWahlenWalkthroughDemo` nutzt jetzt **fiktiven Musterstimmzettel**:
- Musterkandidat:in A/B/C, Partei A–D  
- Demo-Markierung nur auf **Musterkandidat:in A** (fiktiv)  
- Keine CDU-URLs, keine realen Politiker  
- Labels: „Demo-Beispiel · Keine echte Stimmabgabe · Keine Empfehlung“  
- Info-Buttons: „Kandidat ansehen“, „Wahlprogramm öffnen“, „Stimmzettel verstehen“

**Clara-Texte** (`introWalkthroughClara.ts`): neutralisiert gemäß Spec.

**Offen für Sprint 2:** `ElectionsSection` / `wahlen-deutschland.ts` zeigen weiterhin echte Kandidaten zur **nutzergeführten** Information — ohne Auto-Markierung im Walkthrough.

---

## 5. Punkte-/Prämien-Governance

| Vorher | Nachher |
|--------|---------|
| `RECORD_ELECTION_VOTE` +200 Punkte (`DEMO_POINTS_PER_WAHL`) | **0 Punkte** — Wahlvorschau entkoppelt |
| Konstante = 200 | `DEMO_POINTS_PER_WAHL = 0` (deprecated, dokumentiert) |

**Unverändert:**
- Abstimmungen: `DEMO_POINTS_PER_ABSTIMMUNG` — „Punkte für Mitwirkung“, unabhängig von Ja/Nein  
- Meldungen: `DEMO_POINTS_PER_MELDUNG`  
- Prämien-Flow Kirkel/Naturfreibad/QR/Wallet  
- Copy: „unabhängig von Entscheidung“

---

## 6. Prämien-Naming / Gift-Icon

| Ebene | Status |
|-------|--------|
| UI-Label | **„Prämien“** — unverändert |
| Icon | **Gift** — unverändert |
| Interner Key | **`leaderboard`** — beibehalten |
| Walkthrough-ID | **`praemien`** — unverändert |
| Mapping | `lib/sectionProductLabels.ts` + Kommentar in `types/index.ts` |

Keine Migration von `leaderboard` — Tests, Tour-IDs und Routing stabil.

---

## 7. Audit-Fallback / Supabase

| Zustand | Verhalten |
|---------|-----------|
| Supabase konfiguriert | `insertAuditLog` → `audit_logs`, `{ persisted: true }` |
| Supabase fehlt | Console-Warnung, `{ persisted: false, reason: 'no_supabase' }` — **kein Throw** |
| `/api/audit` | `{ success: true, persisted: false, auditFallback: 'no_supabase' }` — UI crasht nicht |
| Client `logAuditEvent` | Fängt Fehler weiterhin still ab |

**Klarstellung im Code:**  
„Demo audit fallback only — not persistent. Supabase/Postgres required for persistent audit logging.“

`/api/demo/log` bleibt bei fehlendem Supabase bei 503 (Pitch-Zugang) — bewusst nicht geändert.

---

## 8. Connector-Matrix-Abgleich

- `docs/CONNECTOR-READINESS-MATRIX.md`: Verweis auf `lib/civicModuleStatus.ts` + `kirkelServiceResolver.ts`  
- `lib/kirkelServiceResolver.ts`: Kommentar FIM/LeiKa/PVOG = Offen; Resolver = Demo/Mapping  
- **Keine** Live-Adapter integriert  
- **Keine** falschen Produktiv-Behauptungen ergänzt

---

## 9. Korrigierte kritische Claims

| Fundstelle | Vorher | Nachher |
|------------|--------|---------|
| `BuergerApp.tsx` Security-FAQ eID | „eID erforderlich“ | Demo ohne produktiven eID; perspektivisch eID/EUDI |
| Walkthrough Wahlen | Auto-Merz-Markierung | Fiktiver Musterstimmzettel |
| Wahlvorschau-Punkte | +200 bei Vote | 0 Punkte |

Bereits korrekt (unverändert): Postfach-Disclaimer, `civicCompliance.ts`, StimmzettelModal „Konzeptdemo“.

---

## 10. Bewusst nicht gebaut

- Keine neuen API-Routen  
- Keine `leaderboard` → `praemien` Key-Migration  
- Keine FIM/PVOG/OParl/BundID-Integration  
- Keine Änderung an ElectionsSection / wahlen-deutschland.ts  
- Keine großen Copy-Refactors  
- Kein `/api/demo/log` Fallback (bleibt 503 ohne DB)

---

## 11. Build / Test / Lint

| Befehl | Ergebnis |
|--------|----------|
| `npm run build` | ✓ PASS |
| `npm test` | ✓ 36 suites, **232** tests (+6) |
| `npm run lint` | ✓ PASS (bekannte react-hooks/img Warnings) |

---

## 12. Empfehlung für Sprint 2

1. **ElectionsSection:** Optional neutrale Demo-Ballot-Variante auch außerhalb Walkthrough evaluieren  
2. **Status-Map in UI:** `CIVIC_MODULE_STATUS.disclaimer` in Trust-Center / Demo-Banner einbinden (read-only)  
3. **Audit:** Admin-UI `persisted`-Flag anzeigen; Env-Check in Setup-Seite  
4. **DemoMode in Runtime:** Section-Header aus Status-Map (ohne Routing-Änderung)  
5. **Meldungen:** Entscheidung Supabase-Tabelle vs. rein lokal  
6. **Governance-Tests:** E2E Walkthrough-Szene Wahlen visuell prüfen (kein Merz im DOM)

---

*Ende Sprint 1*
