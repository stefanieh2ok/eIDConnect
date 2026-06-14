# Connector Readiness Matrix V1 — HookAI Civic

**Stand:** 2026-06-13 (Sprint 1 Abgleich) · **Zweck:** Adapter-Status für Souveränität und Due Diligence  
**Code-Abgleich:** `lib/kirkelServiceResolver.ts` + `lib/civicModuleStatus.ts` = Demo/Mapping, keine Live-Adapter  
**Positionierung:** Bridge-Layer zum Deutschland-Stack — nicht Ersatz für Deutschland-App oder Fachverfahren  
**Index:** `docs/DATA-ROOM-INDEX.md`

---

## 1. Legende

### Status

| Status | Bedeutung |
|--------|-----------|
| **Offen** | Nicht implementiert, nur konzeptionell |
| **Demo** | Simuliert / kuratiert / Mock-Daten |
| **Readonly Pilot** | Echte API, nur lesend, nicht produktiv |
| **Verified Pilot** | Echte Anbindung im begrenzten Pilot |
| **Production** | Produktiv freigegeben mit SLA |

### Reifegrad-Bezug

| Connector-Status | Typischer Gesamt-Reifegrad |
|------------------|----------------------------|
| Offen / Demo | Demo |
| Readonly Pilot | Verified Demo |
| Verified Pilot | Pilot Ready |
| Production | Production Ready / Sovereign Scale |

---

## 2. Übersichtsmatrix

| Adapter | Status | Zweck | Risiko (Top) | Produktivvoraussetzung (Kurz) |
|---------|--------|-------|--------------|-------------------------------|
| FIM/LeiKa | Offen | Leistungskatalog, Zuständigkeit | Falsche Leistungszuordnung | FIM-API-Zugang, Mapping, Redaktion |
| PVOG | Offen | Verwaltungsportale, Online-Dienste | Veraltete Portal-URLs | PVOG-Metadaten, Verified-URLs |
| OParl | Demo | Transparenz, Ratsinfos | API-Änderung, Vollständigkeit | OParl-Endpoint pro Mandant, Cache |
| BundID / eID | Offen | Identität, Alter, Wohnort | VfB, Datenschutz, Betrieb | Berechtigungszertifikat oder Provider |
| EUDI-Wallet | Offen | Identität (EU) | Trust Framework, Interop | EUDI-Pilot, Claims-Mapping |
| Terminportale | Demo | Terminweg, Hinweise | Scheinbare Buchung | Offizielle Termin-API, kein Scraping |
| Fachverfahren | Offen | Verbindliche Anträge | Schattenanträge | GovTalk/XÖV, Verfahrens-ID |
| Dokumentenservice | Demo | Nachweise, Upload | Malware, Datenabfluss | Virenscan, Verschlüsselung, Audit |
| Postfach / Secure Comm | Offen | Behördenkommunikation | E-Mail-Unsicherheit | DE-Mail / eBO / sichere API |
| Kommunale Formularserver | Offen | Strukturierte Online-Formulare | Veraltete Formularversionen | Mandanten-URL, verified Metadaten |
| Zuständigkeitsfinder (Länder) | Offen | Korrekte Behördenzuordnung | Falsche Stelle | FIM + Landes-API |
| Audit / Event-Log | Demo | Nachweis, Compliance | Lücken, PII in Logs | Zentrales SIEM, Retention, Export |

---

## 3. Adapter-Detailkarten

### 3.1 FIM / LeiKa (Fachinformationssystem Leistungen und Kommunen)

| Feld | Inhalt |
|------|--------|
| **Status** | Offen |
| **Zweck** | Normierter Leistungskatalog, Zuständigkeitsregeln, Grundlage für Service Resolver |
| **Aktueller Ersatz** | `data/kirkel-service-catalog.json`, `lib/kirkelServiceResolver.ts` |
| **Risiken** | Abweichung Demo-Katalog vs. FIM; fehlende Aktualisierung; falsche Kreis-/Kommune-Zuständigkeit |
| **Produktivvoraussetzungen** | FIM-LeiKa-Schnittstelle oder Export; Mapping `leistung_key` ↔ FIM-ID; Redaktionsworkflow; `last_checked_at`; Mandanten-Override nur dokumentiert |
| **Control-Plane-Objekt** | `Quellen`, `Leistungen`, `Zuständigkeiten` |
| **Verified-Gate** | Externe Links und Übergabe nur bei FIM-bestätigter Leistung |

---

### 3.2 PVOG (Portalverbund der Öffentlichen Verwaltung)

| Feld | Inhalt |
|------|--------|
| **Status** | Offen |
| **Zweck** | Verknüpfung zu offiziellen Online-Diensten; `verified_submission_channel` |
| **Aktueller Ersatz** | `verified_submission_channel: null`, `submission_channel_status: demo_only` |
| **Risiken** | Tote Links; Nutzer verwechselt Demo mit echtem Portal |
| **Produktivvoraussetzungen** | PVOG-Metadatenfeed; URL-Validierung; periodischer Link-Check; Anzeige nur bei `verified` |
| **Control-Plane-Objekt** | `Übergabekanäle`, `Connector-Status` |

---

### 3.3 OParl

| Feld | Inhalt |
|------|--------|
| **Status** | Demo |
| **Zweck** | Ratsinformationen, Transparenz, demokratische Nachvollziehbarkeit |
| **Aktueller Ersatz** | Regionale Demo-Daten, `REGIONAL_DATA_PATTERN` |
| **Risiken** | Unvollständige API-Abdeckung; OParl 1.0/1.1-Unterschiede; Performance |
| **Produktivvoraussetzungen** | Mandanten-OParl-URL; readonly Sync; Cache + `last_checked_at`; Fehlertoleranz |
| **Control-Plane-Objekt** | `Quellen`, `Module` (Transparenz) |
| **Clara-Bezug** | Source-Lock: Clara darf OParl nur über verifizierten Cache referenzieren; **keine PII** im Prompt (nur Region-/Service-IDs) |

---

### 3.4 BundID / eID (Online-Ausweisfunktion)

| Feld | Inhalt |
|------|--------|
| **Status** | Offen (UI/Konzept) |
| **Zweck** | Verifizierte Identität; Alter/Wohnort aus Claims; keine manuelle Altersgruppe |
| **Aktueller Ersatz** | Demo-Profil, Vorschau-Perspektive in Demo & Audit |
| **Risiken** | VfB-Antrag; Provider-Abhängigkeit; Adress-Claims nicht immer vorhanden |
| **Produktivvoraussetzungen** | eID-Service-Provider oder eigener eID-Server (BSI TR-03130); `VerifiedIdentity`-Abstraktion (`EU_WALLET_ROADMAP.md`); DPIA |
| **Control-Plane-Objekt** | `Rollen`, `Schutzbedarf`, Mandanten-Identitätsprovider |
| **Deutschland-Stack** | HookAI nutzt eID — ersetzt sie nicht |

---

### 3.5 EUDI-Wallet (EU Digital Identity Wallet)

| Feld | Inhalt |
|------|--------|
| **Status** | Offen (Roadmap) |
| **Zweck** | Zweiter Identitätskanal; portable Claims; EU-Interop |
| **Aktueller Ersatz** | Textuelle Erwähnung in Intro/TTS |
| **Risiken** | Trust Framework noch in Evolution; unterschiedliche Assurance Levels |
| **Produktivvoraussetzungen** | EUDI-Pilotzugang; gleiche `VerifiedIdentity`-Schicht wie eID; Wohnort-Claim-Regeln (`EU_WALLET_ROADMAP.md`) |
| **Control-Plane-Objekt** | `Connector-Status`, `KI-Kontexte` (keine Roh-Claims in Clara) |

---

### 3.6 Terminportale

| Feld | Inhalt |
|------|--------|
| **Status** | Demo |
| **Zweck** | Terminweg anzeigen; optional private .ics-Erinnerung (kein Behördenkalender) |
| **Aktueller Ersatz** | `lib/fuerMichTermin.ts`, `appointment_status`, Default `unklar` |
| **Risiken** | Nutzer hält .ics für echten Termin; Scraping von Slot-Verfügbarkeit |
| **Produktivvoraussetzungen** | Offizielle Termin-API oder verifizierte Deep-Links; `appointment_status=verified`; kein Kalender-Schreibzugriff |
| **Control-Plane-Objekt** | `Terminlogik`, `Übergabekanäle` |
| **Verbot** | Kein Scraping, kein Schreiben in Behördenkalender |

---

### 3.7 Fachverfahren (GovTalk / XÖV / Verfahrenssteckbrief)

| Feld | Inhalt |
|------|--------|
| **Status** | Offen |
| **Zweck** | Verbindliche Antragsübermittlung an zuständige Stelle |
| **Aktueller Ersatz** | Behördenweg-**Simulation** (`fuerMichDokumente.ts`) |
| **Risiken** | HookAI wird als Antragskanal missverstanden |
| **Produktivvoraussetzungen** | Verfahrens-ID; technischer Konnektor; Authentifizierung; Empfangsbestätigung; Storno-Logik |
| **Control-Plane-Objekt** | `Übergabekanäle`, `Audit-Events` |
| **Gate** | Nur `source_status=verified` + `submission_channel_status=production` |

---

### 3.8 Dokumentenservice

| Feld | Inhalt |
|------|--------|
| **Status** | Demo (lokal) |
| **Zweck** | Nachweise vorbereiten; Zuordnung Datei ↔ Nachweis |
| **Aktueller Ersatz** | `FuerMichDocumentPrep.tsx` — Metadaten only, keine Speicherung |
| **Risiken** | Schatten-Upload; OCR ohne Governance; PII in Dateinamen |
| **Produktivvoraussetzungen** | Verschlüsselter Storage; Virenscan; TTL/Löschung; Rollen; Audit; Anbindung an Fachverfahren-Connector |
| **Control-Plane-Objekt** | `Dokumentenlogik`, `Schutzbedarf` |

---

### 3.9 Postfach / Secure Communication (DE-Mail, eBO, sichere Behörden-API)

| Feld | Inhalt |
|------|--------|
| **Status** | Offen |
| **Zweck** | Sichere asynchrone Kommunikation Bürger ↔ Behörde |
| **Aktueller Ersatz** | Keine E-Mail-Anträge (bewusst verboten) |
| **Risiken** | E-Mail als Schattenkanal; Phishing |
| **Produktivvoraussetzungen** | Zertifizierter Kommunikationskanal; Mandanten-Konfiguration; keine Plaintext-E-Mail für Anträge |
| **Control-Plane-Objekt** | `Übergabekanäle` |

---

### 3.10 Audit / Event-Log

| Feld | Inhalt |
|------|--------|
| **Status** | Demo |
| **Zweck** | Nachweis für Zugriff, NDA, KI-Outputs, Config-Änderungen |
| **Aktueller Ersatz** | `lib/ai/clara-ai-audit.ts` (Hashes), Supabase-Tabellen `audit_logs` / `demo_access_logs` (konfigurierbar) |
| **Risiken** | Lücken; PII in Logs; keine Export-Funktion |
| **Produktivvoraussetzungen** | SIEM-Anbindung; Retention-Policy; Mandanten-Isolation; Export für Prüfer; Control-Plane-Events vollständig |
| **Control-Plane-Objekt** | `Audit-Events` |

---

### 3.11 Kommunale Formularserver (z. B. Formularserver.de, XÖV-Formulare)

| Feld | Inhalt |
|------|--------|
| **Status** | Offen |
| **Zweck** | Strukturierte Online-Formulare und Antragsvorstufen der Kommune/Landkreis |
| **Aktueller Ersatz** | Wegweiser-Orientierung + Dokumenten-Vorbereitung (`lib/fuerMichDokumente.ts`); keine Formular-API |
| **Risiken** | Formular-Version veraltet; mandantenspezifische URLs; Nutzer verwechselt Demo mit echtem Formular |
| **Produktivvoraussetzungen** | Mandanten-Formularserver-URL; `source_status=verified`; Metadaten (Formular-ID, Version); kein Scraping |
| **Control-Plane-Objekt** | `Übergabekanäle`, `Quellen`, `Leistungen` |
| **Deutschland-Stack** | Ergänzt PVOG/Fachverfahren — HookAI leitet hin, ersetzt nicht |

---

### 3.12 Zuständigkeitsfinder (Länder / Bund)

| Feld | Inhalt |
|------|--------|
| **Status** | Offen |
| **Zweck** | Korrekte Zuständigkeit (Kommune, Kreis, Land, Bund) aus Adresse/Leistung |
| **Aktueller Ersatz** | `lib/kirkelServiceResolver.ts`, `lib/demo-address-persist.ts`, `data/kirkel-service-catalog.json` |
| **Risiken** | Falsche Stelle in Demo; Grenzfälle (Kreis-/Kommune-Wechsel) |
| **Produktivvoraussetzungen** | Landes-Zuständigkeitsfinder-API oder FIM-Regelwerk; PLZ/Ort aus verified Identity; Audit der Ableitung |
| **Control-Plane-Objekt** | `Zuständigkeiten`, `Quellen`, `Leistungen` |
| **Deutschland-Stack** | FIM/LeiKa als normative Quelle; Zuständigkeitsfinder als operativer Lookup |

---

## 4. Connector Readiness Layer (Architektur)

```
                    ┌─────────────────────┐
                    │  Civic Control Plane │
                    └──────────┬──────────┘
                               │ config / status
         ┌─────────────────────┼─────────────────────┐
         v                     v                     v
  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │ Identity     │    │ Leistungen   │    │ Transparenz  │
  │ eID, Wallet  │    │ FIM, PVOG    │    │ OParl        │
  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             v
                    ┌─────────────────────┐
                    │  HookAI Civic Core   │
                    │  Resolver · Clara    │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         v                     v                     v
  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │ Dokumente    │    │ Termine      │    │ Fachverfahren│
  │ (secure)     │    │ (portale)    │    │ (XÖV)        │
  └──────────────┘    └──────────────┘    └──────────────┘
```

**Prinzip:** Jeder Adapter implementiert ein gemeinsames Interface:

```typescript
type CivicConnector = {
  id: string;
  status: 'offen' | 'demo' | 'readonly_pilot' | 'verified_pilot' | 'production';
  healthCheck(): Promise<{ ok: boolean; lastChecked: string; message?: string }>;
  // adapter-spezifische Methoden
};
```

---

## 5. Priorisierte Connector-Roadmap

| Phase | Connectors | Ziel-Reifegrad |
|-------|------------|----------------|
| **Jetzt (Demo)** | OParl (readonly test), Audit (erweitern) | Verified Demo |
| **Pilot 1** | eID **oder** Wallet, OParl produktiv readonly | Pilot Ready |
| **Pilot 2** | FIM/LeiKa-Stichprobe, Terminportale (verified links) | Pilot Ready |
| **Production** | PVOG, Dokumentenservice, Fachverfahren (1 Verfahren) | Production Ready |
| **Scale** | Postfach, Multi-Mandant, souveräne KI | Sovereign Scale |

---

## 6. Abhängigkeit zum Deutschland-Stack

| Deutschland-Stack-Komponente | HookAI Civic Connector | Beziehung |
|------------------------------|-------------------------|-----------|
| Deutschland-App | — | **Komplementär** — HookAI als kommunaler Layer |
| BundID / eID | 3.4 | Identität für Tiefgang, nicht für jeden Klick |
| EUDI-Wallet | 3.5 | Paralleler Kanal |
| PVOG | 3.2 | Übergabe an Online-Dienste |
| FIM/LeiKa | 3.1 | Leistungswahrheit |
| OZG-Fachverfahren | 3.7 | Verbindliche Anträge **nach** Orientierung |
| Terminportale | 3.6 | Termin **nach** Wegweiser |

**Botschaft für Käufer:** HookAI Civic **reduziert** Komplexität für Bürger vor dem offiziellen Stack — und **verstärkt** die Nutzung verifizierter Kanäle, statt sie zu umgehen.

---

## 7. Verweise

- Data-Room-Index: `docs/DATA-ROOM-INDEX.md`
- Souveränität: `docs/SOVEREIGNTY-ARCHITECTURE.md`
- Control Plane: `docs/CONTROL-PLANE-BLUEPRINT.md`
- Kirkel-Resolver: `docs/feature-fuer-mich/KIRKEL-SERVICE-RESOLVER.md`
- eID: `docs/EID-INTEGRATION.md`
- Wallet: `docs/EU_WALLET_ROADMAP.md`
- Demo-Audit: `docs/APP-AUDIT-MATRIX.md`
