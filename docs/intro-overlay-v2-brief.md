# Intro Overlay v2 — Fachliches Briefing (Blockbuster Civic Story)

**Stand:** 2026-06-29 (überarbeitet)  
**Baseline:** `main` @ `98447fe` + Briefing `a742eb2`  
**Zielgruppe:** Bürger:innen in einer kommunalen Demo (z. B. Kirkel)  
**Zeitbudget:** unter 2 Minuten bis „Direkt zur App“  
**Scope:** Briefing only — keine Implementierung in diesem Dokument

---

## 1. Kurzthese

HookAI Civic ist der Einstieg in eine moderne Civic-App: In wenigen, filmisch geführten Momenten wird aus Ohnmacht Orientierung — und aus Orientierung Handlung. **Du bist nicht nur Zuschauer.**

---

## 2. Zentrale Dramaturgie

**Bogen:** Ohnmacht → Orientierung → Handlung → Mitwirkung → Vertrauen → Start

| Phase | Emotion | Screen |
|-------|---------|--------|
| Ohnmacht | „Wo fange ich an?“ | 0–1 |
| Orientierung | Ruhe, Klarheit | 2–3 |
| Handlung | Selbstwirksamkeit | 4 |
| Mitwirkung | Demokratiegefühl | 5 |
| Vertrauen + Start | Sicherheit, Aktivierung | 6 |

**Leitmotiv (wiederkehrend, dezent):**  
**„Verstehen. Vorbereiten. Melden. Mitwirken.“**

**Zentraler Claim (sichtbar):**  
**„Du bist nicht nur Zuschauer.“**

---

## 3. Emotionale Ausgangslage

Bürger:innen fühlen sich oft machtlos, weil:

- Zuständigkeiten unklar sind
- Anliegen irgendwo hängen bleiben
- Entscheidungen weit weg wirken
- Beteiligung schwer auffindbar ist
- Probleme im Ort sichtbar gemacht werden sollen
- Menschen nicht nur warten, sondern handeln und mitwirken wollen

Diese Emotion darf **stark** sein — aber nicht juristisch riskant, nicht parteipolitisch, nicht aggressiv.

---

## 4. Strikte No-Gos (Copy & Visual)

**Nicht nennen:** reale Politiker, Skandale, konkrete Vorwürfe, Parteien, Unternehmen, Lobbyismus-Vorwürfe.

**Nicht verwenden:** „ungesühnt“, „Skandal aufdecken“, „bestrafen“, „Korruption entlarven“, „Maskendeal“, Investor, Käufer, Behördenentlastung, weniger Rückfragen, vollständigere Vorgänge (im sichtbaren Intro).

**Stattdessen:** sichtbar machen, nachvollziehbar machen, verstehen, vorbereiten, melden, mitreden, mitwirken, nicht nur zuschauen, Beteiligung finden, Orientierung schaffen.

**Bevorzugte Claims (sichtbar):**

- „Du bist nicht nur Zuschauer.“
- „Mitreden beginnt mit Verstehen.“
- „Wenn etwas nicht stimmt, soll es sichtbar werden.“
- „Aus Unsicherheit wird ein nächster Schritt.“
- „Verstehen. Vorbereiten. Melden. Mitwirken.“

---

## 5. Tonalität

Filmisch, stark, klar, modern, vertrauenswürdig, demokratisch — nicht aggressiv, nicht parteipolitisch, nicht bürokratisch, nicht kindlich. Keine Emojis. Keine technischen Begriffe (PVOG, XZuFi, GovService). **Keine Investor-/Käuferbotschaften im sichtbaren Bürger:innen-Intro.**

---

## 6. Anrede

**Empfehlung: „Du“ als Default** in der Kirkel-Bürger-Demo.

- **Kein separates Anrede-Gate vor dem Intro** — Anrede wird im Profil/Settings umschaltbar oder nach dem Cold Open einmalig angeboten (offene Entscheidung, siehe Abschnitt 15).
- **Sie-Variante** parallel pflegen: gleiche Struktur, gleiche Länge, konsequent „Sie/Ihnen“.

---

## 7. Story-Bogen — 7 Screens

| # | Screen-ID | Titel (Arbeit) | Emotion |
|---|-----------|----------------|---------|
| 0 | `cold-open` | Du bist nicht nur Zuschauer. | Ohnmacht → Orientierung |
| 1 | `alltag-chaos` | Wo fange ich an? | Frust, Unsicherheit |
| 2 | `clara-wegweiserin` | Clara bringt Ordnung rein. | Vertrauen, Ruhe |
| 3 | `wegweiser-plan` | Aus Unsicherheit wird ein nächster Schritt. | Erleichterung |
| 4 | `melden-sichtbar` | Wenn etwas nicht stimmt, soll es sichtbar werden. | Selbstwirksamkeit |
| 5 | `mitwirken` | Mitreden beginnt mit Verstehen. | Demokratiegefühl |
| 6 | `vertrauen-start` | Bereit für den nächsten Schritt. | Sicherheit + Aktivierung |

**Zeitrichtwert:** Screen 0 ca. 10–15 s, Screens 1–6 je ca. 15–20 s → **gesamt ca. 1:45–2:00 Min.**

**Bewusst nicht im Kern-Bogen:** Prämien-Wallet, Baby-Spezialfall, Ökosystem-Finale, ausführliches Postfach — optional später, nicht v2-Pflicht.

---

## 8. Screens — Copy-, Visual- und Emotions-Briefing

### Screen 0 — `cold-open` (Elevator Pitch)

| Feld | Inhalt |
|------|--------|
| **Titel** | Du bist nicht nur Zuschauer. |
| **Haupttext** | HookAI Civic hilft dir, Anliegen zu verstehen, Probleme sichtbar zu machen und Beteiligung zu finden. |
| **Button** | Zeig mir, wie |
| **Emotionale Funktion** | Sofortige Relevanz — aus Distanz wird Nähe |
| **Getriggertes Problem** | „Verwaltung ist weit weg / ich kann nichts tun“ |
| **Gelöste Unsicherheit** | „Es gibt einen klaren Einstieg“ |
| **No-Go-Claims** | Kein Ersatz der Behörde, kein Live-Betrieb, kein Skandal-Narrativ |

**Copy Variante A (kurz):**  
„HookAI Civic hilft dir, Anliegen zu verstehen, Probleme sichtbar zu machen und Beteiligung zu finden.“

**Copy Variante B (wärmer):**  
„Wenn Entscheidungen weit weg wirken, brauchst du einen klaren Einstieg. HookAI Civic zeigt, wie du Anliegen sortierst, Meldungen vorbereitest und mitwirken kannst.“

**Visual-Briefing**

| Aspekt | Vorgabe |
|--------|---------|
| **Filmgefühl** | Cold Open — leicht abgedunkelt, cinematic reveal |
| **Hauptvisual** | Unscharfe, überlagerte App-Motive: Rathaus-Silhouette, Dokumente, Meldung, Kalender, Beteiligung |
| **Clara** | Lavendel-Punkt / sanfter Lichtakzent als Orientierung — kein Chatbot-Gimmick |
| **App-Quelle** | Statische Komposition aus echten 390px-Screenshots, kein Live-Embed |
| **390px Pflicht** | Claim + Button vollständig sichtbar, kein Logo-Abschnitt |
| **Nicht zeigen** | Düsterer Thriller, Rot/Alarm, politische Symbole, Personenfotos |

---

### Screen 1 — `alltag-chaos`

| Feld | Inhalt |
|------|--------|
| **Titel** | Wo fange ich an? |
| **Haupttext** | Ob Ausweis, Umzug, Kita, Jobverlust oder Schaden im Ort: Oft ist der nächste Schritt nicht sofort klar. HookAI Civic hilft dir, dein Anliegen zu sortieren. |
| **Button** | Weiter |
| **Emotionale Funktion** | Wiedererkennung — „Das bin ich“ |
| **Getriggertes Problem** | Zuständigkeitschaos, Überforderung |
| **Gelöste Unsicherheit** | „Mein Thema ist hier willkommen“ |
| **No-Go-Claims** | Keine konkreten Skandale, keine Parteien, kein „System ist kaputt“ |

**Copy Variante A:**  
„Zu viele Wege, zu wenig Orientierung. Hier beginnt die Sortierung.“

**Copy Variante B:**  
„Ob Kita, Umzug oder etwas im Ort: Du musst nicht alles allein enträtseln.“

**Visual-Briefing**

| Aspekt | Vorgabe |
|--------|---------|
| **Filmgefühl** | Close-up auf Alltags-Anliegen — leichte Unschärfe am Rand |
| **Hauptvisual** | App-Shell mit kleinen Anliegen-Cards: Ausweis, Umzug, Kita, Jobverlust, Schaden melden |
| **App-Quelle** | Statischer Screenshot Start/Wegweiser-Übersicht oder gestaltete Card-Reihe aus echten UI-Komponenten |
| **390px Pflicht** | Mind. 3 Cards lesbar, Bottom-Nav sichtbar |
| **Nicht zeigen** | Panik-UI, rote Fehlerbanner, überladene Listen |

---

### Screen 2 — `clara-wegweiserin`

| Feld | Inhalt |
|------|--------|
| **Titel** | Clara bringt Ordnung rein. |
| **Haupttext** | Clara ist deine Wegweiserin. Sie hilft beim Sortieren und Vorbereiten — aber sie entscheidet nicht und ersetzt keine Behörde. |
| **Button** | Weiter |
| **Emotionale Funktion** | Vertrauen, ruhige Führung |
| **Getriggertes Problem** | „KI / App — kann ich dem trauen?“ |
| **Gelöste Unsicherheit** | „Clara begleitet, entscheidet nicht“ |
| **No-Go-Claims** | Keine „KI-Entscheidung“, keine Frist-/Leistungszusage |

**Copy Variante A:**  
„Clara sortiert mit — nicht statt der Verwaltung.“

**Copy Variante B:**  
„In eigenen Worten starten. Clara macht daraus einen verständlichen nächsten Schritt.“

**Visual-Briefing**

| Aspekt | Vorgabe |
|--------|---------|
| **Filmgefühl** | Calm reveal — Clara tritt aus dem „Chaos“ in den Fokus |
| **Hauptvisual** | Clara-Dock in **Lavendel** neben Wegweiser-Textarea (echter Ausschnitt) |
| **App-Quelle** | Screenshot Wegweiser + Clara-Pill, neutraler Beispieltext (Kita/Umzug, kein Baby-Spezialfall) |
| **390px Pflicht** | Clara-Pill + Textarea; Dock **überlappt Melden-Button nicht** (UX-003) |
| **Nicht zeigen** | Robotergesicht, Sci-Fi-Glow, Navy/Mint/Teal-Restyling |

---

### Screen 3 — `wegweiser-plan`

| Feld | Inhalt |
|------|--------|
| **Titel** | Aus Unsicherheit wird ein nächster Schritt. |
| **Haupttext** | Du beschreibst dein Anliegen. Der Wegweiser zeigt, welche Stelle passen könnte, was vorzubereiten ist und worauf du achten solltest. |
| **Button** | Wegweiser ansehen |
| **Emotionale Funktion** | Erleichterung — Plan statt Nebel |
| **Getriggertes Problem** | „Ich weiß nicht, was als Nächstes kommt“ |
| **Gelöste Unsicherheit** | „Es gibt einen nachvollziehbaren Fahrplan“ |
| **No-Go-Claims** | Kein „Antrag eingereicht“, keine erfundenen Fristen |

**Copy Variante A:**  
„Ein Anliegen. Ein Plan. Ein nächster Schritt.“

**Copy Variante B:**  
„Schritte, Unterlagen, Orientierung — ohne Behördenjargon.“

**Visual-Briefing**

| Aspekt | Vorgabe |
|--------|---------|
| **Filmgefühl** | Reveal — Plan-Karte löst Unschärfe auf |
| **Hauptvisual** | Behördenfahrplan / Klärungsdialog mit nächsten Schritten, Unterlagen, Zuständigkeitshinweis |
| **App-Quelle** | Echter Wegweiser-Screenshot (Plan-Result oder Chat-Flow) |
| **390px Pflicht** | Plan-Titel + erster Schritt ohne Scroll; CTA „Behördenfahrplan erstellen“ erkennbar |
| **Nicht zeigen** | Vollständigkeitsversprechen, „sofort bewilligt“ |

---

### Screen 4 — `melden-sichtbar`

| Feld | Inhalt |
|------|--------|
| **Titel** | Wenn etwas nicht stimmt, soll es sichtbar werden. |
| **Haupttext** | Du kannst eine Meldung vorbereiten — zum Beispiel zu Müll, Schäden, Spielplatz oder Ratten. Die Demo zeigt den Ablauf, ohne echte Vorgänge zu versenden. |
| **Button** | Melden entdecken |
| **Emotionale Funktion** | Selbstwirksamkeit — „Ich kann etwas tun“ |
| **Getriggertes Problem** | „Probleme im Ort werden übersehen“ |
| **Gelöste Unsicherheit** | „Meldung ist vorbereitbar und nachvollziehbar“ |
| **No-Go-Claims** | Kein Skandal, keine echte Übermittlung, kein „sofort erledigt“ |

**Copy Variante A:**  
„Sichtbar machen — klar beschrieben, gut vorbereitet.“

**Copy Variante B:**  
„Du musst nicht wissen, welches Amt zuerst zuständig ist. Du startest hier.“

**Visual-Briefing**

| Aspekt | Vorgabe |
|--------|---------|
| **Filmgefühl** | Action moment — sanft, nicht alarmistisch |
| **Hauptvisual** | Melden-Modul mit kommunalem Alltagsbeispiel (Spielplatz, Schaden, Müll) |
| **App-Quelle** | Screenshot Meldungen-Liste oder -Detail |
| **390px Pflicht** | Bottom-Nav „Melden“ aktiv; CTA nicht von Nav verdeckt |
| **Nicht zeigen** | Dramatische Schadensfotos, Skandal-Headlines, konkrete Vorwürfe |

---

### Screen 5 — `mitwirken`

| Feld | Inhalt |
|------|--------|
| **Titel** | Mitreden beginnt mit Verstehen. |
| **Haupttext** | HookAI Civic zeigt Beteiligung, Termine und neutrale Informationen — damit du nicht nur zuschaust. |
| **Button** | Weiter |
| **Emotionale Funktion** | Demokratiegefühl, Mitwirkung |
| **Getriggertes Problem** | „Beteiligung ist versteckt / zu kompliziert“ |
| **Gelöste Unsicherheit** | „Ich finde Wege zum Mitreden“ |
| **No-Go-Claims** | Keine Wahlbeeinflussung, keine echte Stimmabgabe, kein Live-Claim |

**Copy Variante A:**  
„Beteiligen, Termine, Wahlen verstehen — an einem Ort.“

**Copy Variante B:**  
„Was in deiner Region relevant ist, soll erreichbar sein — informiert und neutral.“

**Hinweis Postfach (ein Satz, kein eigener Screen):**  
„Rückfragen können später im Postfach nachverfolgt werden — in dieser Demo nur als Vorschau.“

**Visual-Briefing**

| Aspekt | Vorgabe |
|--------|---------|
| **Filmgefühl** | Split-screen / montage — drei Wege einer Idee |
| **Hauptvisual** | Filmischer Split: Beteiligen + Wahlvorschau + Kalender |
| **App-Quelle** | Drei statische Screenshots, composited — kein fragiles Live-Embed |
| **390px Pflicht** | Pro Segment mind. Titel + ein Datum/Abstimmungsname lesbar |
| **Nicht zeigen** | Partei-Logos, Kandidatenempfehlungen, „Stimme für X“ |

---

### Screen 6 — `vertrauen-start`

| Feld | Inhalt |
|------|--------|
| **Titel** | Bereit für den nächsten Schritt. |
| **Haupttext** | Diese Demo bereitet vor — sie entscheidet nicht. Offizielle Stellen bleiben maßgeblich. Echte Anträge werden hier nicht versendet. |
| **Button** | Direkt zur App |
| **Emotionale Funktion** | Sicherheit + Aktivierung |
| **Getriggertes Problem** | „Darf ich das nutzen? Ist das echt?“ |
| **Gelöste Unsicherheit** | „Grenzen sind klar — ich kann starten“ |
| **No-Go-Claims** | Kein Live-Betrieb, kein Vollständigkeitsanspruch |

**Copy Variante A:**  
„Du behältst die Kontrolle. Clara unterstützt — die Verwaltung entscheidet.“

**Copy Variante B:**  
„Jetzt selbst ausprobieren. Alles hier ist Demo — zum Verstehen, nicht zum offiziellen Einreichen.“

**Visual-Briefing**

| Aspekt | Vorgabe |
|--------|---------|
| **Filmgefühl** | Calm trust — helle Auflösung, Ausklang |
| **Hauptvisual** | Helle App-Übersicht: Logo, Bottom-Nav, dezentes „Demo · Kirkel“, Clara-Lavendel als Wiedererkennung |
| **App-Quelle** | Shell-Screenshot nach Intro-Schließen-Vorschau |
| **390px Pflicht** | „Direkt zur App“ vollständig sichtbar; Navigation nicht verdeckt |
| **Nicht zeigen** | Überladene Feature-Liste, Käufer-Texte, Technik-Badges |

**Leitmotiv optional als Abschlusszeile:**  
„Verstehen. Vorbereiten. Melden. Mitwirken.“

---

## 9. Empfohlene Screen-Reihenfolge

1. `cold-open` — Elevator / Claim  
2. `alltag-chaos` — Problem erkennen  
3. `clara-wegweiserin` — Begleitung einführen  
4. `wegweiser-plan` — Nutzen zeigen  
5. `melden-sichtbar` — Handlung im Ort  
6. `mitwirken` — Civic über Service hinaus  
7. `vertrauen-start` — Grenzen + Start

---

## 10. Screenshot- und Asset-Vorgaben (global)

- **Echte/statische Screenshots** oder bestehende App-Ausschnitte — **kein fragiles Live-Embed** in v2
- Keine externen Bilder, keine großen neuen Assets
- **Mobile-first 390px**; Desktop als sekundäre Referenz
- Kein horizontaler Scroll, kein Logo-Abschneiden, keine verdeckte Navigation
- **Clara-Farbe Lavendel** respektieren — kein Navy/Mint/Teal-Restyling
- Produktion aus `npm run dev:clean` @ 390px; QA-Referenz: `acceptance-390px-qa`

---

## 11. Governance-Grenzen (verbindlich)

- Clara trifft **keine** Verwaltungsentscheidung.
- Clara **ersetzt keine** Behörde.
- **Keine echten Anträge** werden im Intro versendet.
- **Offizielle Stellen** bleiben maßgeblich.
- **Keine Wahlbeeinflussung.**
- **Kein Live-Claim.**
- **Kein Anspruch auf Vollständigkeit** in der Demo.
- **Keine konkreten politischen Vorwürfe**, Personennamen, Parteien oder Firmen.
- Keine technischen Begriffe (PVOG, XZuFi, GovService) im Bürger-Intro.

---

## 12. Abgrenzung zu v1

Das Ist-Intro (`DemoIntroWalkthrough`) ist lang und erklärend. **v2** ist:

- **filmischer**, emotional geführt, mit Cold Open
- **kürzer** (7 fokussierte Screens statt ~12+ Szenen)
- **claim-getrieben** („Du bist nicht nur Zuschauer“)
- **statisch-visual** statt embed-lastig
- **ohne** Baby-Spezialfall, Prämien-Wallet, Ökosystem-Finale im Pflichtbogen

---

## 13. Nicht sichtbar im Intro — nur interner Demo-Kommentar

*Für institutionelle Demos / Gespräche nach dem Intro — **nicht** in Copy oder Visuals des Bürger:innen-Intros.*

| Interner Nutzen | Kurzbeschreibung |
|-----------------|------------------|
| Weniger Rückfragen | Bürger:innen kommen vorbereilter in offizielle Kanäle |
| Vollständigere Vorgänge | Strukturierte Vorbereitung vor dem echten Antrag |
| Bessere Anschlussfähigkeit | Vorbereitungs- und Wegweiser-Schicht, keine Parallelverwaltung |
| Klare Abgrenzung | Keine Schattenverwaltung, keine automatische Entscheidung |
| Compliance | Transparente Demo-Grenzen, respektvolle Anrede |

---

## 14. Was das Intro in Sekunden vermitteln muss

| Frage | Antwort im Intro |
|-------|------------------|
| Was ist HookAI Civic? | Moderne Civic-App für Verstehen, Vorbereiten, Melden, Mitwirken |
| Warum brauche ich das? | Weil Zuständigkeiten und Beteiligung oft unklar wirken |
| Welches Problem löst es emotional? | Ohnmacht → Orientierung → Handlung |
| Was kann ich danach tun? | Wegweiser, Melden, Beteiligen, Wahlen/Kalender nutzen |
| Warum Clara vertrauen? | Wegweiserin, keine Entscheiderin, Grenzen klar |
| Warum nicht nur Zuschauer? | Claim + Mitwirkungs-Screen |

---

## 15. Offene Entscheidungen vor Umsetzung

1. **Anrede-Umschaltung:** Nur in Settings vs. dezenter Toggle nach Screen 0?
2. **Cold-Open-Motion:** Statisches Composite vs. leichte Ken-Burns/Blur-Reveal (Performance 390px)?
3. **Wegweiser-Beispiel:** Kita, Umzug oder Jobverlust als Hero-Case?
4. **Postfach:** Ein Satz in Screen 5 oder ganz weglassen?
5. **TTS:** Intro-Voice nach UX-002-Fix auf lr65 — ja/nein für v2?
6. **„Zeig mir, wie“ vs. „Weiter“:** Einheitliche Button-Sprache über alle Screens?
7. **Skip:** „Direkt zur App“ ab Screen 2 erlauben?

---

## 16. Empfehlung nächster Schritt

**Ja — Code-Prompt für Intro-v2 kann gestartet werden**, sobald offene Punkte 1, 3 und 6 geklärt sind (Anrede-Flow, Wegweiser-Beispiel, Button-Sprache).

**Vorgeschlagener PR-Scope (separater Prompt):**

- Neue Step-Config (7 Screens)
- Copy aus freigegebener Variante A oder B
- Statische Screenshot-Composites gemäß Visual-Briefing
- Keine Governance-, Auth-, TTS-, Demo-Daten-Änderungen
- Regression: `acceptance-390px-qa` + UX-003 Nav

---

## Referenzen

- QA-Baseline: `main` @ `98447fe`, acceptance 35/35
- Deployment-Audio: `docs/demo-audio-tts-deployment.md`
- Ist-Intro: `components/Intro/DemoIntroWalkthrough.tsx`, `data/introOverlayMarketing.ts`
