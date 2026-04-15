# eID-Integration (Online-Ausweisfunktion)

Damit „Mit eID anmelden“ in eID Demo Connect **echt** funktioniert, sind folgende Schritte nötig.

---

## 1. Rechtliche / behördliche Schritte

- **Berechtigung:** Antrag bei der **Vergabestelle für Berechtigungszertifikate (VfB)** beim Bundesverwaltungsamt, um die Online-Ausweisfunktion nutzen zu dürfen.
- **Berechtigungszertifikat:** Nach Bewilligung Vertrag mit einer **Berechtigungs-CA (BerCA)** (z. B. D-TRUST) für die Ausstellung des Berechtigungszertifikats.
- **Auftragsdatenverarbeitung / Datenschutz:** Klärung mit dem eID-Service-Provider (siehe unten) und Anpassung der Datenschutzerklärung (Welche Ausweisdaten werden ausgelesen? Wo verarbeitet?).

---

## 2. Technische Optionen

### Option A: eID-Service-Provider (empfohlen)

Statt einen eigenen eID-Server zu betreiben, einen **eID-Service-Provider** nutzen, der mandantenfähige eID-Server anbietet:

- Provider liefert **SDK / API / Redirect-URL** für Ihre Web-App.
- Nutzer:in klickt „Mit eID anmelden“ → Redirect zu Provider → AusweisApp2 startet → Daten (Name, ggf. Adresse) gehen an Ihren Backend-Endpunkt (vom Provider aufgerufen oder per Token).
- **Beispiele (Recherche nötig):** Anbieter wie yes.com, Verimi, oder spezialisierte eID-Provider; BSI-Liste zertifizierter eID-Server / Diensteanbieter prüfen.

**In der App:**  
- „Mit eID anmelden“ → Redirect zu Provider-Login (eID-Flow).  
- Callback/Webhook/Token in Ihrem Backend entgegennehmen, Nutzer identifizieren, Session setzen.  
- Optional: aus eID-Adresse (falls vorhanden) Region/Kommune ableiten oder Nutzer nachträglich Adresse eingeben lassen.

### Option B: Eigener eID-Server

- **BSI TR-03130** einhalten (eID-Server, Sicherheitsframework, eIDAS-Middleware).
- Eigenes Backend (eID-Server) betreiben, das mit der **AusweisApp2** (eID-Client) kommuniziert.
- Aufwand und Betrieb (Zertifizierung, Updates, Sicherheit) sind deutlich höher; meist nur für große Behörden/Organisationen sinnvoll.

### Option C: Testumgebung (Entwicklung)

- **BSI-Testinfrastruktur** nutzen: [BSI – Testinfrastruktur eID-Server](https://www.bsi.bund.de/DE/Themen/Oeffentliche-Verwaltung/Elektronische-Identitaeten/Online-Ausweisfunktion/Testinfrastruktur/eID-Server/eID-Server.html).
- Ermöglicht Entwicklung und Tests **ohne** sofortige behördliche Registrierung; für Produktion trotzdem Option A oder B nötig.

---

## 3. Was die App dann tun muss

1. **Frontend:**  
   - Button „Mit eID anmelden“ startet eID-Flow (Redirect zu Provider oder Aufruf Ihrer Backend-URL, die zum Provider weiterleitet).

2. **Backend:**  
   - Callback/Webhook vom eID-Provider empfangen.  
   - Daten (z. B. Name, Geburtsdatum, optional Adresse) prüfen und speichern oder nur für die Session nutzen.  
   - Session/Token für eID Demo Connect setzen (z. B. Cookie/JWT).

3. **Region:**  
   - Wenn der Ausweis eine Adresse liefert: wie bei „Nur ansehen“ **PLZ/Stadt** aus eID nutzen und bestehende Logik (Nominatim, PLZ → Bundesland, `getStateFromCity`) wiederverwenden.  
   - Wenn **keine** Adresse aus eID: Nutzer:in einmalig Adresse eingeben lassen (wie bisher bei „Nur ansehen“) und daraus Region (Bund, Land, Kreis, Kommune) ableiten.

4. **Rechte:**  
   - `viewerMode = false` setzen (voll berechtigt), `userState` / `currentLocation` / `resolvedRegion` aus eID-Daten oder Adresse setzen, damit alle relevanten Inhalte (Bund, Land, Kreis, Kommune) sichtbar sind.

---

## 4. Zum Testen: BSI-Testinfrastruktur

Die BSI-Testinfrastruktur erlaubt Entwicklung und Tests **ohne** sofortige Produktions-Registrierung bei der VfB.

### 4.1 Was das BSI anbietet

- **Drei Umgebungen:**
  - **Entwicklungssystem** – Tests während der Entwicklung, neue Funktionen ausprobieren
  - **Testsystem** – Integrationstests unter realistischen Bedingungen (Spiegel des Produktivsystems)
  - **Produktivsystem** – später für Live-Betrieb mit echten Ausweisen

- **eID-Server-Testbed (Open Source):**  
  Konformitätstests für eigne eID-Server nach BSI TR-03130-4.  
  GitHub: [eID-Testbeds/server](https://github.com/eID-Testbeds/server)

### 4.2 Zugang für Entwickler

1. **Registrierung beim BSI**  
   Als Anbieter von Berechtigungszertifikaten (AuthCA) in der **Test- und Beta-PKI** registrieren lassen.

2. **Nach der Registrierung**  
   - Sie erhalten ein **Document Verifier (DV)-Zertifikat**.  
   - Sie können **technische Berechtigungszertifikate** für das Test- bzw. Entwicklungssystem ausstellen.

3. **AusweisApp2 inkl. Testmodus**  
   - [AusweisApp2](https://www.ausweisapp.bund.de/) installieren (Desktop/Mobile).  
   - Für Tests ohne echten Ausweis: **Developer-Mode** / Testinfrastruktur der AusweisApp nutzen (laut AusweisApp-Doku).

### 4.3 Konkrete Schritte für eID Demo Connect

| Schritt | Aktion |
|--------|--------|
| 1 | BSI-Seite zur Testinfrastruktur lesen und ggf. Registrierung anfragen: [BSI – Testinfrastruktur eID-Server](https://www.bsi.bund.de/DE/Themen/Oeffentliche-Verwaltung/Elektronische-Identitaeten/Online-Ausweisfunktion/Testinfrastruktur/eID-Server/eID-Server.html) |
| 2 | Entscheiden: **eigenes Test-eID-Server-Backend** (z. B. mit [eID-Testbeds](https://github.com/eID-Testbeds)) oder **Test-Zugang bei einem eID-Service-Provider** anfragen |
| 3 | Backend: Test-URL/Callback für eID-Flow bereitstellen; bei Nutzung eines Providers: Test-API/Redirect des Providers einbinden |
| 4 | Frontend: „Mit eID anmelden“ auf Test-URL/Provider-Redirect zeigen (z. B. nur wenn `NEXT_PUBLIC_EID_TEST=true`) |
| 5 | End-to-End testen: AusweisApp2 (Testmodus) → eID-Server/Provider → Callback → Session in eID Demo Connect setzen → Region auslesen oder abfragen |

### 4.4 Kontakt BSI

- **DIF-eID-Arbeitsgruppe:** [dif-eid@bsi.bund.de](mailto:dif-eid@bsi.bund.de)  
- Weitere Infos: [BSI – Testinfrastruktur (Übersicht)](https://www.bsi.bund.de/EN/Themen/Oeffentliche-Verwaltung/Elektronische-Identitaeten/Online-Ausweisfunktion/Testinfrastruktur/testinfrastruktur_node.html)

---

## 5. Kurz-Checkliste

| Schritt | Offen / Erledigt |
|--------|-------------------|
| VfB-Antrag (Bundesverwaltungsamt) | |
| Vertrag mit BerCA / eID-Service-Provider | |
| Backend: eID-Callback, Session, ggf. Speicherung | |
| Frontend: Redirect/Button → eID-Flow | |
| Region aus eID-Adresse oder Nachfrage | |
| Datenschutz, AV-Vertrag mit Provider | |
| **Test:** BSI-Testinfrastruktur nutzen (Abschnitt 4) | |

---

## 6. Links

- [AusweisApp – Für Diensteanbieter](https://ausweisapp.bund.de/fuer-diensteanbieter/leitfaden)
- [BSI – Testinfrastruktur eID-Server](https://www.bsi.bund.de/DE/Themen/Oeffentliche-Verwaltung/Elektronische-Identitaeten/Online-Ausweisfunktion/Testinfrastruktur/eID-Server/eID-Server.html)
- [BSI – eID-Infrastruktur](https://www.bsi.bund.de/DE/Themen/Oeffentliche-Verwaltung/Elektronische-Identitaeten/Online-Ausweisfunktion/eID-Infrastruktur/eid-infrastruktur_node.html)
- [BSI TR-03130 (eID-Server)](https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/Technische-Richtlinien/TR-nach-Thema-sortiert/tr03130/tr-03130.html)
- [eID-Testbeds (GitHub)](https://github.com/eID-Testbeds)
