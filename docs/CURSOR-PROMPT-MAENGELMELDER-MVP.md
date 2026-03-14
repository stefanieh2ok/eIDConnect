# Cursor-Prompt – Bürger-App: Mängelmelder MVP (geschärft)

## Einschätzung & was du ändern solltest

- **Dein Konzept ist stimmig:** Phase-1-Roadmap (Mängelmelder, Status, Karte) passt; Bürger-zuerst ist richtig.
- **Prompt schärfen:** Projektstack explizit nennen (Expo/RN + Supabase). Supabase-Upload und Anti-Spam **konkret vorgeben**, damit Cursor nicht anders baut.
- **Anti-Spam:** Max. 5 Meldungen pro Stunde pro User – im Prompt fest verlangen.
- **Schema:** `city`, `district`, `category_id` in der Tabelle von Anfang an, für Filter/Dashboard später.
- **Demo-Story:** 10 Schritte im Prompt fixieren, dann baut Cursor den Flow genau so.

---

## 1:1 Cursor-Prompt (copy-paste)

```text
# CURSOR PROMPT – eIDConnect: Mängelmelder MVP ergänzen

## ROLLE

Du arbeitest in einem bestehenden **React Native / Expo**-Projekt mit **Supabase**-Backend.
Deine Aufgabe ist es, einen **demo-fähigen Mängelmelder als MVP** zu ergänzen.

## HARTE REGELN

1. Nichts Bestehendes löschen.
2. Nichts Bestehendes grundlegend umbauen.
3. Alle vorhandenen Features müssen unverändert weiter funktionieren.
4. Neue Features werden **nur ergänzt**.
5. Alle UI-Texte sind **auf Deutsch**.
6. Arbeite **schrittweise**, teste nach jedem Schritt.
7. Verwende nur Packages, die bereits installiert sind oder für dieses Feature zwingend nötig sind.
8. Prüfe zuerst die bestehende Projektstruktur und füge dich in die vorhandene Architektur ein.
9. Falls bestehende Komponenten, Theme-Dateien, Navigationsmuster oder Supabase-Utilities existieren, **nutze diese konsequent weiter**.
10. Kein Overengineering: Ziel ist ein **sauberer Expo-Go Demo-MVP**.

## PROJEKTKONTEXT

Das Referenz-Mängelmelder-Projekt ist ein React Native / Expo Projekt mit u. a.:
- Onboarding mit manueller Stadtwahl (Bundesland → Stadt → Bezirk)
- Anzeige von Regierungsstrukturen je nach Standort
- Parteiinformationen und Wahlinfos
- Tab-Navigation
- Backend: Supabase (PostgreSQL, Auth, Storage)

Diese Funktionen bleiben vollständig erhalten.

## ZIEL

Ein **Mängelmelder MVP** für eine 3–5 Minuten Demo (z. B. Bürgermeister):
- Bürger können einen Mangel in Sekunden melden.
- Die Meldung ist sofort sichtbar.
- Die Kommune kann perspektivisch damit arbeiten.

## DEMO-FLOW (so muss die App bedienbar sein)

1. Startscreen → „Meine Stadt: [gewählte Stadt]“
2. Tab **Melden** öffnen
3. Kategorie wählen (z. B. Beleuchtung, Schlagloch, Müll, Grünflächen, Sonstiges)
4. Foto aufnehmen
5. Standort auf Karte markieren (oder GPS übernehmen)
6. Kurze Beschreibung eingeben
7. Absenden
8. Bestätigung: Status **Gemeldet**
9. Unter „Meine Meldungen“ die neue Meldung mit Status sehen
10. Kartenübersicht zeigt Pin für die Meldung

## FEATURE 1: MELDEN-SCREEN

- Neuer Screen **„Melden“** (Tab oder Eintrag in der Navigation).
- Formular: **Kategorie** (Dropdown/Buttons), **Foto** (Kamera/Galerie), **Standort** (Karte oder GPS), **Beschreibung** (Text).
- Button **„Meldung absenden“**.
- Nach Absenden: Erfolgsmeldung und Weiterleitung zu „Meine Meldungen“ oder Karte.

## FEATURE 2: SUPABASE – REPORTS TABELLE

Tabelle `reports` (oder bestehende Namenskonvention nutzen) mit mindestens:

- id (uuid, primary key)
- created_at (timestamptz)
- user_id (Referenz auf auth.users, falls Auth genutzt wird)
- category (text) – z. B. "Beleuchtung", "Schlagloch", "Müll", "Grünflächen", "Sonstiges"
- description (text)
- photo_urls (text[] oder jsonb) – URLs der hochgeladenen Fotos
- latitude, longitude (numeric) – Standort
- status (text) – z. B. "gemeldet", "in_bearbeitung", "erledigt"
- **city (text)** – für Filter/Dashboard
- **district (text)** – für Filter/Dashboard
- **category_id (text)** – optional, für Statistik

Row Level Security (RLS) so setzen, dass Nutzer eigene Meldungen lesen können; Kommunen-Login später erweiterbar.

## FEATURE 3: FOTO-UPLOAD (Supabase Storage)

Nutze **Supabase Storage**. Bucket z. B. `report-photos` (öffentlich lesbar für Anzeige).

Upload-Flow **genau so** umsetzen (oder an bestehende Supabase-Utility anpassen):

```javascript
const uploadPhoto = async (uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const { data, error } = await supabase.storage
    .from('report-photos')
    .upload(fileName, blob, { contentType: 'image/jpeg' });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('report-photos').getPublicUrl(fileName);
  return urlData.publicUrl;
};
```

Pro Meldung eine oder mehrere URLs in `photo_urls` speichern.

## FEATURE 4: MEINE MELDUNGEN

- Screen/Liste **„Meine Meldungen“** (von aktuell eingeloggten User).
- Anzeige: Datum, Kategorie, Kurztext/Beschreibung, **Status** (Gemeldet / In Bearbeitung / Erledigt), optional Foto-Thumbnail.
- Optional: Tap öffnet Detail mit Karte.

## FEATURE 5: KARTENÜBERSICHT

- Karte (z. B. react-native-maps oder WebView mit Leaflet/OSM) mit Pins für Meldungen.
- Pins für alle sichtbaren Meldungen (z. B. nach Stadt/Bezirk gefiltert), Status optional farblich.

## ANTI-SPAM (PFLICHT)

- **Max. 5 Meldungen pro Stunde pro User** (anhand user_id oder device/session).
- Bei Überschreitung: klare Meldung „Sie haben in dieser Stunde bereits 5 Meldungen abgegeben. Bitte später erneut versuchen.“
- Kein Overengineering (z. B. keine E-Mail-Verifizierung für MVP).

## WAS NICHT GEÄNDERT WIRD

- Bestehende Onboarding- und Stadtwahl-Logik
- Bestehende Tabs und Navigation (außer neuer Tab „Melden“ / „Meine Meldungen“)
- Bestehende Theme- und Design-Systeme

## SPRACHE

Alle neuen UI-Texte: **Deutsch**.
```

---

## Hinweis zu diesem Repo

**Dieses Repo ist eine Next.js-Web-App** (kein React Native, kein Expo, kein Supabase). Den obigen Prompt kannst du 1:1 in einem **separaten** Expo-Projekt in Cursor verwenden.

In **dieser** Next.js-App wurde ein **Mängelmelder-Demo-MVP** ergänzt (Tab „Melden“, Formular, Meine Meldungen, lokale Speicherung), damit du den Flow hier sofort zeigen kannst. Für echten Einsatz mit Fotos und Persistenz: Supabase in diesem Projekt nachrüsten oder den Prompt im Expo-Projekt umsetzen.
