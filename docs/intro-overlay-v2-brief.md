# Intro Overlay v2 — Fachliches Briefing

**Stand:** 2026-06-29  
**Baseline:** `main` @ `98447fe`  
**Zielgruppe:** Bürger:innen in einer kommunalen Demo (z. B. Kirkel)  
**Zeitbudget:** unter 2 Minuten bis „Direkt zur App“  
**Scope:** Briefing only — keine Implementierung in diesem Dokument

---

## 1. Kurzthese

Das Intro zeigt in wenigen, ruhigen Schritten, wie HookAI Civic im Alltag entlastet: Clara hilft beim Sortieren und Vorbereiten — Entscheidungen und offizielle Wege bleiben bei den zuständigen Stellen.

---

## 2. Empfohlene Anrede

**Empfehlung: „Du“ als Standard in der Kirkel-Bürger-Demo**

| Kriterium | Du | Sie |
|-----------|----|-----|
| Bürgernähe | stark | formaler |
| Vertrauen | nahbar, nicht belanglos | respektvoll, distanzierter |
| Kommunale Nutzbarkeit | gut für Mobile-first, Alltagssprache | gut für ältere Zielgruppen / formelle Erwartung |
| Demo vor institutionellen Käufern | wirkt modern und nutzerzentriert | wirkt behördenkonform, weniger „App-Gefühl“ |

**Begründung:** Für eine Kirkel-Bürger-Demo ist „Du“ der natürlichere Einstieg: kurz, freundlich, ohne Marketing-Ton. Die App unterstützt bereits Du/Sie — **beide Varianten** sollen in v2 parallel gepflegt werden; die **Default-Vorauswahl** in der Demo kann auf „Du“ stehen.

**Offene Entscheidung für Stefanie:** Soll die Anrede-Auswahl vor Screen 1 sichtbar bleiben (wie heute) oder erst nach dem ersten Willkommenssatz?

---

## 3. Story-Bogen (6 Screens)

| # | Screen-ID | Funktion im Bogen |
|---|-----------|-------------------|
| 1 | `welcome` | Orientierung: Problem + Nutzen |
| 2 | `clara-role` | Clara einordnen: Wegweiserin, keine Entscheiderin |
| 3 | `wegweiser` | Hauptweg: Schritte verstehen, vorbereiten |
| 4 | `melden` | Meldungen einfach machen |
| 5 | `beteiligen-wahlen` | Mitgestalten: Abstimmen, Wahlen, Termine |
| 6 | `vertrauen-start` | Grenzen, Vertrauen, Start in die App |

**Zeitrichtwert:** ca. 15–20 Sekunden pro Screen → gesamt ca. 1:30–2:00 Minuten.

---

## 4. Screens im Detail

### Screen 1 — `welcome`

| Feld | Inhalt |
|------|--------|
| **Titel** | Willkommen in HookAI Civic |
| **Haupttext** | Viele Wege zur Verwaltung wirken unübersichtlich. HookAI Civic hilft dir, das Wichtige zu finden und Schritt für Schritt vorzubereiten. |
| **Button** | Weiter |
| **Visual** | App-Shell Kirkel: Logo, Bottom-Nav, dezenter Kirkel-Kontext (ohne vollständigen Walkthrough) |
| **Nutzeraktion** | Tipp auf „Weiter“ |
| **Nicht behaupten** | Kein „alles digital erledigt“, kein Ersatz der Gemeindeverwaltung, keine Garantie auf Vollständigkeit |

**Copy Variante A (kurz):**  
„Verwaltungsthemen können viel wirken. HookAI Civic bringt Ordnung in deinen Weg — ohne Fachchinesisch.“

**Copy Variante B (wärmer):**  
„Ob Kita, Meldung oder Termin: Manchmal weiß man nicht, wo man anfangen soll. Hier bekommst du einen ruhigen Einstieg für Kirkel.“

---

### Screen 2 — `clara-role`

| Feld | Inhalt |
|------|--------|
| **Titel** | Clara begleitet dich |
| **Haupttext** | Clara ist deine Wegweiserin: Sie stellt Fragen, ordnet dein Anliegen und bereitet nächste Schritte vor. Sie entscheidet nicht für die Verwaltung. |
| **Button** | So funktioniert Clara |
| **Visual** | Clara-Dock / Wegweiser-Eingabe mit kurzem Beispieltext (neutral, z. B. Lebenslage ohne Spezialfall-Baby-Demo) |
| **Nutzeraktion** | Weiter; optional kurzer Tap in Textfeld (ohne echten Submit) |
| **Nicht behaupten** | Keine „KI-Entscheidung“, keine Zusage zu Fristen, Leistungen oder Unterlagen |

**Copy Variante A:**  
„Clara hilft dir sortieren — nicht bewilligen. Offizielle Stellen bleiben maßgeblich.“

**Copy Variante B:**  
„Stell dein Anliegen in eigenen Worten. Clara macht daraus einen verständlichen Fahrplan — ohne Druck und ohne Behördenjargon.“

---

### Screen 3 — `wegweiser`

| Feld | Inhalt |
|------|--------|
| **Titel** | Wegweiser |
| **Haupttext** | Im Wegweiser siehst du, was als Nächstes sinnvoll ist: Schritte, Unterlagen und Hinweise — übersichtlich aufbereitet. |
| **Button** | Wegweiser ansehen |
| **Visual** | Echter Wegweiser mit Behördenfahrplan / Klärungsdialog (390px: Textarea + „Behördenfahrplan erstellen“ sichtbar) |
| **Nutzeraktion** | Weiter nach Sicht auf Plan-Karte oder Chat-Flow |
| **Nicht behaupten** | Kein „Antrag eingereicht“, keine erfundenen Fristen, kein Anspruch auf amtliche Vollständigkeit |

**Copy Variante A:**  
„Ein Anliegen, ein klarer Plan. Du weißt, was als Nächstes dran ist.“

**Copy Variante B:**  
„Ob Umzug, Kita oder ein anderes Thema: Der Wegweiser führt dich Schritt für Schritt — ohne dass du alles auf einmal wissen musst.“

---

### Screen 4 — `melden`

| Feld | Inhalt |
|------|--------|
| **Titel** | Melden |
| **Haupttext** | Etwas in der Gemeinde auffällig? Unter Melden kannst du Anliegen festhalten und strukturiert vorbereiten. |
| **Button** | Melden entdecken |
| **Visual** | Meldungen-Modul: Liste oder Formular mit lokalem Beispiel (z. B. Spielplatz/Mängel — ohne Panik-Ton) |
| **Nutzeraktion** | Weiter; Bottom-Nav „Melden“ kurz hervorgehoben |
| **Nicht behaupten** | Keine echte Übermittlung an die Gemeinde in der Demo, kein „sofort erledigt“ |

**Copy Variante A:**  
„Meldung machen — klar beschrieben, gut vorbereitet.“

**Copy Variante B:**  
„Wenn dir etwas auffällt, musst du nicht erst wissen, welches Amt zuständig ist. Du startest hier und bereitest sauber vor.“

---

### Screen 5 — `beteiligen-wahlen`

| Feld | Inhalt |
|------|--------|
| **Titel** | Mitgestalten |
| **Haupttext** | Unter Beteiligen und Wahlen findest du Abstimmungen und Termine aus deiner Region — zum Informieren und Mitmachen in der Demo. |
| **Button** | Weiter |
| **Visual** | Split oder Wechsel: Beteiligen-Karte + Kalender-/Wahlen-Ausschnitt (390px: ein aktiver Bereich, zweiter angedeutet) |
| **Nutzeraktion** | Weiter |
| **Nicht behaupten** | Keine echte Stimmabgabe, keine Wahlempfehlung, kein „live verbunden“ |

**Copy Variante A:**  
„Abstimmen, Termine sehen, Wahlen verstehen — an einem Ort.“

**Copy Variante B:**  
„Was in Kirkel gerade relevant ist, sollst du leichter mitverfolgen können — informiert, ohne Überforderung.“

**Hinweis Postfach (nur Text, kein eigener Screen):**  
„Nachrichten und Rückfragen können später im Postfach nachverfolgt werden — in dieser Demo nur als Vorschau.“

---

### Screen 6 — `vertrauen-start`

| Feld | Inhalt |
|------|--------|
| **Titel** | Bereit für den Einstieg |
| **Haupttext** | HookAI Civic bereitet vor — entscheidet aber nicht. Gesetzliche Vorgaben und zuständige Stellen bleiben maßgeblich. In der Demo werden keine echten Anträge versendet. |
| **Button** | Direkt zur App |
| **Visual** | Ruhige App-Shell mit Logo + Bottom-Nav; optional dezenter Hinweis „Demo · Kirkel“ |
| **Nutzeraktion** | „Direkt zur App“ → Intro schließen |
| **Nicht behaupten** | Kein Live-Betrieb, keine Vollständigkeit, keine Garantie auf Bearbeitungszeit |

**Copy Variante A:**  
„Du behältst die Kontrolle. Clara unterstützt — die Verwaltung entscheidet.“

**Copy Variante B:**  
„Du kannst jetzt selbst ausprobieren. Alles hier ist eine Demo: zum Verstehen, nicht zum offiziellen Einreichen.“

---

## 5. Empfohlene Screen-Reihenfolge

1. **Willkommen / Problem** (`welcome`)  
2. **Clara als Wegweiserin** (`clara-role`)  
3. **Wegweiser** (`wegweiser`)  
4. **Melden** (`melden`)  
5. **Beteiligen / Wahlen / Kalender** (`beteiligen-wahlen`)  
6. **Vertrauen / Start** (`vertrauen-start`)

**Bewusst nicht im Kern-Bogen:** Prämien-Wallet, ausführliches Postfach, Baby-Spezialfall, Ökosystem-Finale — können später als optionale Vertiefung, nicht in v2 Pflicht.

---

## 6. Screenshot-Briefing

| Screen | App-Ausschnitt | Fokus | Sichtbare Aktion | 390px-Pflicht |
|--------|----------------|-------|------------------|---------------|
| `welcome` | Gesamtshell nach Demo-Entry | Logo, Kirkel-Kontext, Bottom-Nav | Keine Modul-Tiefe | Nav-Labels lesbar, Header nicht abgeschnitten |
| `clara-role` | Wegweiser geöffnet, Clara-Dock | Textarea + Clara-Pill | Cursor/Tap auf Eingabe | Dock überlappt Melden-Button **nicht** |
| `wegweiser` | Klärungsdialog oder Plan-Karte | „Behördenfahrplan“ / nächste Schritte | Button „Behördenfahrplan erstellen“ oder Plan-CTA | Plan-Titel + erster Schritt ohne Scroll |
| `melden` | Meldungen-Liste oder Detail | Meldungskarte mit Ort/Thema | Bottom-Nav „Melden“ aktiv | FAB/CTA nicht von Nav verdeckt |
| `beteiligen-wahlen` | Beteiligen oder Wahlen | Eine Abstimmung oder Kalendertermin | Tab-Wechsel Beteiligen ↔ Wahlen | Termin-Datum + Titel lesbar |
| `vertrauen-start` | Shell ohne Modul-Overlay | Vertrauenszeile + CTA | „Direkt zur App“ prominent | CTA vollständig sichtbar, kein CSS-404 |

**Screenshot-Produktion:** Aus `npm run dev:clean` @ 390px und Desktop; keine gestellten Mockups. Bestehende QA-Pfade (`acceptance-390px-qa`) als Referenz für stabile Views.

---

## 7. Copy-Varianten — Übersicht

Jeder Screen hat oben **Variante A** (kurz/direkt) und **Variante B** (wärmer). Für Sie-Anrede: konsequent „Sie/Ihnen“ statt „du/dir“ — gleiche Struktur, gleiche Länge.

**Beispiel Sie — Screen 2, Variante A:**  
„Clara hilft Ihnen sortieren — nicht bewilligen. Offizielle Stellen bleiben maßgeblich.“

---

## 8. Governance-Hinweise (verbindlich für v2-Copy)

- Clara trifft **keine** Verwaltungsentscheidung.
- Clara **ersetzt keine** Behörde.
- Im Intro werden **keine echten Anträge** versendet.
- **Offizielle Quellen** und gesetzliche Vorgaben bleiben maßgeblich.
- Die Demo macht **keinen Vollständigkeitsanspruch**.
- **Kein Live-Claim** (keine „amtlich angebunden“, „sofort online“, o. Ä.).
- Keine erfundenen Fristen, Leistungen oder Pflichtunterlagen.
- Keine technischen Begriffe (PVOG, XZuFi, GovService) im Bürger-Intro.
- Postfach nur als **Vorschau-Hinweis**, falls Modul nicht voll aktiv.

---

## 9. Käufer-Demo-Nutzen (institutionelle Perspektive)

Für Gemeinde, Landkreis oder IT-Dienstleister soll aus dem Intro erkennbar sein:

| Nutzen | Was Käufer sehen sollen |
|--------|-------------------------|
| Weniger Rückfragen | Bürger:innen kommen vorbereilter — mit klaren Schritten und Unterlagenhinweisen |
| Vollständigere Vorgänge | Strukturierte Vorbereitung vor dem offiziellen Kanal |
| Bessere Anschlussfähigkeit | HookAI Civic als **Vorbereitungs- und Wegweiser-Schicht**, nicht als Parallelverwaltung |
| Klare Abgrenzung | Keine Schattenverwaltung, keine automatische Entscheidung, keine Umgehung zuständiger Stellen |
| Vertrauen & Compliance | Transparente Demo-Grenzen, respektvolle Anrede, kein Overclaim |

---

## 10. Abgrenzung zu v1 (Ist-Zustand)

Das aktuelle Intro (`DemoIntroWalkthrough`) ist inhaltlich reich, aber lang (viele Szenen: Baby-Beispiel, Prämien, Postfach, Ökosystem). **v2** soll:

- kürzer sein (6 statt ~12+ Schritte),
- stärker auf **Hauptwege** fokussieren,
- Clara-Rolle **früher und klarer** erklären,
- Vertrauensgrenzen **am Ende bündeln**,
- auf **390px Mobile-first** optimiert sein.

**Nicht in v2-Scope (separat / später):** TTS-Fix Production (UX-002), Primary-URL (UX-005), flaky Jest-Tests.

---

## 11. Offene Entscheidungen für Stefanie

1. **Default-Anrede:** Du bestätigen oder Sie als Default für bestimmte Demo-Zielgruppen?
2. **Anrede-Gate:** Vor Screen 1 oder integriert in Willkommen?
3. **Beispiel im Wegweiser:** Neutraler Kirkel-Alltag (Kita/Umzug) statt Baby-Story?
4. **Postfach:** Nur ein Satz in Screen 5 oder komplett weglassen?
5. **Vorlesen (TTS):** Intro-Voice aktiv lassen, sobald UX-002 auf lr65 gelöst — oder v2 zunächst rein visuell?
6. **„Direkt zur App“ vs. geführter Walkthrough:** Nur Kurzintro oder optional „Mehr erfahren“ für 2–3 Zusatzscreens?
7. **Screenshot-Stil:** Echte App-Einbettung (wie v1) oder statische Screenshots mit Overlay-Text?

---

## 12. Empfehlung nächster Schritt

**Ja — separater Intro-v2-Code-PR kann gestartet werden**, sobald die offenen Entscheidungen in Abschnitt 11 (mindestens Anrede, Wegweiser-Beispiel, Postfach-Hinweis) geklärt sind.

**Vorgeschlagener PR-Scope (nicht in diesem Prompt):**

- Neue Screen-Konfiguration / reduzierte Step-Liste
- Copy aus diesem Briefing (Variante A oder B nach Freigabe)
- Screenshot-Einbettungen gemäß Abschnitt 6
- Keine Änderung an Clara-Governance, Auth, TTS-Route oder Demo-Daten
- Regression: bestehende `acceptance-390px-qa` + UX-003 Nav weiter grün

---

## Referenzen

- QA-Baseline: `main` @ `98447fe`, acceptance 35/35
- Deployment-Audio: `docs/demo-audio-tts-deployment.md`
- Ist-Intro: `components/Intro/DemoIntroWalkthrough.tsx`, `data/introOverlayMarketing.ts`
