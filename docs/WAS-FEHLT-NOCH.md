# eID Demo Connect – Was fehlt noch?

Stand: Übersicht der offenen Punkte für einen produktionsnahen oder demo-stabilen Stand.

---

## 1. Branding & Dokumentation

| Was | Status | Empfehlung |
|-----|--------|------------|
| App-Name in UI | ✅ eID Demo Connect | – |
| README, Projektname | ✅ eID Demo Connect | `package.json` name: `eidconnect` |
| Andere Docs | ✅ Auf eID Demo Connect umgestellt | EID-INTEGRATION, Cursor-Prompt, ENVIRONMENT_SETUP etc. |

---

## 2. eID & Anonymität

| Was | Status | Empfehlung |
|-----|--------|------------|
| eID-Anmeldung | ⚠️ Nur Demo-Button, keine echte Ausweis-Anbindung | Für Produktion: eID-Service-Provider oder BSI-Testumgebung (siehe `docs/EID-INTEGRATION.md`) |
| Token/Stimmcode | ⚠️ Konzept im Intro erklärt, technisch nicht umgesetzt | Backend: echte Token-Ausgabe nach eID-Check, Trennung Identität ↔ Stimme |
| Krypto (Blindensignatur, ZK, homomorph) | ✅ Leicht erklärt | Für echte Wahlen: kryptographische Protokolle einbinden |

---

## 3. Stimmabgabe & Wahlen

| Was | Status | Empfehlung |
|-----|--------|------------|
| Stimmzettel „Stimme abgeben“ | ✅ Umgesetzt | Vote wird in Context gespeichert, Persistenz in localStorage (`eidconnect_voted_elections`), Erfolgsanzeige im Modal, „Bereits abgestimmt“ in Wahlen |
| Persistenz Abstimmungen (Wahlen) | ✅ Demo | localStorage; für Produktion: Backend mit Token/Anonymität |

---

## 4. Persistenz & Speicher

| Was | Status | Empfehlung |
|-----|--------|------------|
| Einwilligung Prämien | ✅ Umgesetzt | `eidconnect_consent_praemien` in localStorage, wird beim Start geladen |
| Mängelmelder Meldungen | ✅ Umgesetzt | `eidconnect_mangel_reports` in localStorage, inkl. optionales Foto (Base64, komprimiert) |
| Intro „schon gesehen“ | ✅ Umgesetzt | `eidconnect_intro_done` in localStorage, „App starten“ setzt Flag |

---

## 5. Mängelmelder MVP

| Was | Status | Empfehlung |
|-----|--------|------------|
| Kategorie + Beschreibung + Absenden | ✅ | – |
| Meine Meldungen + Status | ✅ | – |
| Anti-Spam (5/Stunde) | ✅ | – |
| Foto-Upload | ✅ Umgesetzt | Optionales Bild pro Meldung (komprimiert auf max. 400px, JPEG 0.75), Base64 in State/localStorage |
| Karte / Standort | ❌ Nur Text (erkannte Region) | Optional: Karten-Komponente (z. B. Leaflet/OSM), Pin setzen oder GPS |
| Backend | ❌ Kein Supabase in diesem Projekt | Für echte Nutzung: Supabase oder eigene API anbinden (siehe `docs/CURSOR-PROMPT-MAENGELMELDER-MVP.md`) |

---

## 6. Optional / Nice-to-have

- **Kalender:** Bereits Prioritäten-Hervorhebung; optional: echte Termine aus Backend.
- **Clara/KI:** API-Anbindung prüfen (OpenAI/Aleph Alpha), ob alle Flows funktionieren.
- **Barrierefreiheit:** Fokus-Reihenfolge, ARIA, Kontrast prüfen.
- **Tests:** Keine automatisierten Tests sichtbar; für Stabilität E2E oder Unit-Tests ergänzen.

---

## Priorisierung für nächste Schritte

1. **Demo stabil:** Stimmzettel-Aktion „Stimme abgeben“ mit Meldung + ggf. lokalem Speichern; Intro einmal überspringen speichern (localStorage).
2. **Branding konsistent:** README und ggf. package.json auf eID Demo Connect.
3. **Mängelmelder:** Foto (optional) und Persistenz (localStorage oder Supabase), wenn die Demo das braucht.
4. **eID:** Erst wenn Pilot/Behörde feststeht – dann EID-INTEGRATION.md durchgehen und Provider/BSI-Test anbinden.
