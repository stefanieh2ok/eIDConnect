# Walkthrough & Clara: Ablauf, Texte, Audit (Du / Sie)

Dieses Dokument beschreibt den **Ist-Zustand** im Code: wann welche Phase startet, welche Texte woher kommen, und bekannte Lücken (TTS vs. UI, Kürzungen). Verweise zeigen auf Pfade im Repo.

## Zentrale Dateien

| Thema | Pfad |
|--------|------|
| Walkthrough-UI, TTS-Timing, Auto-Weiter | `components/Intro/DemoIntroWalkthrough.tsx` |
| Schritt-Reihenfolge, Framing-Zeilen, Abschluss-TTS, Anrede/eID-Segmente | `data/introOverlayMarketing.ts` |
| Pro-Schritt: `line10s`, `short`, `long`, `speakSegments` | `data/introWalkthroughClara.ts` |
| TTS-Manifest (Export/Review, **kann von Laufzeit abweichen**) | `data/introTtsScript.ts` |
| Anrede-TTS-Zusammenbau | `lib/introSpokenTts.ts` |
| Voice-Open-Zeilen (Mic) | `lib/claraVoiceOpenPrompts.ts` |
| Chat-Erstnachricht Walkthrough | `data/claraChatWelcome.ts` |
| Einstieg Walkthrough `startStepId` | `components/BuergerApp.tsx` |
| Politikbarometer ohne Fließtext im Walkthrough | `components/Intro/PolitikBarometerPanel.tsx` |

---

## 1. Ablauf: Wann startet was?

### A) Vor dem Produkt-Walkthrough (Pre-Login, `LoginScreen`)

| Phase | Inhalt (Kurz) | Clara / Stimme |
|--------|----------------|----------------|
| **Anrede** | Du/Sie wählen | TTS: `introAnredeGateSpokenParts` → vor Wahl `INTRO_ANREDE_GATE_PRE_CHOICE_SPOKEN_SEGMENTS`, nach Wahl nur `INTRO_ANREDE_GATE_AFTER_DU` / `…_SIE` (`lib/introSpokenTts.ts`). Voice-Open: `ANREDE_VOICE_PROMPT` (`lib/claraVoiceOpenPrompts.ts`). |
| **Entry** („Bereit für den Überblick?“) | Kurztexte `INTRO_ENTRY_*` | Voice-Open: `ENTRY_VOICE_PROMPT_DU` / `ENTRY_VOICE_PROMPT_SIE` |
| **eID / Zugang** | Karten, Wallet-Hinweis, Demo-Pfad | Voice-Open: `EID_VOICE_PROMPT_DU` / `EID_VOICE_PROMPT_SIE`; TTS-Segmente `INTRO_SPOKEN_EID_SEGMENTS_DU` / `…_SIE` (`data/introOverlayMarketing.ts`) |

### B) Produkt-Walkthrough (nach Login, wenn Walkthrough gewünscht)

In **`components/BuergerApp.tsx`** wird `DemoIntroWalkthrough` mit **`startStepId="politikbarometer"`** gerendert.

**Reihenfolge** = Array `INTRO_OVERLAY_STEPS` in `data/introOverlayMarketing.ts`:

1. Politikbarometer  
2. Abstimmen  
3. Wahlen  
4. Kalender  
5. Meldungen  
6. Prämien (letzter Schritt → **Abschluss-TTS** wird angehängt)

**Hinweis:** Der Default-Parameter von `DemoIntroWalkthrough` ist `startStepId = 'abstimmen'`. Nur wenn die Komponente **ohne** `startStepId`-Prop eingebunden wird, beginnt der Ablauf dort (Politikbarometer würde fehlen). In der eingeloggten App gilt **`politikbarometer` zuerst**.

---

## 2. Sequenz im Walkthrough: TTS, Auto-Weiter, Clara-Dock

### Schrittwechsel & `SET_ACTIVE_SECTION`

`DemoIntroWalkthrough` setzt pro Schritt `walkthroughSectionForStep` → u. a. `live`, `wahlen`, `kalender`, `meldungen`, `leaderboard` (Prämien).

### Sprache (TTS)

- `readAloud` muss aktiv sein (`useIntroSpeakApi`); sonst keine Intro-Speech-Kette wie beschrieben.
- Nach Schrittwechsel: `speakApi.stopIntroSpeech()`, **950 ms** Pause, dann `speakIntroParts(speakParts, …)`.
- **Gate:** Für **`abstimmen`**, **`meldungen`**, **`wahlen`** startet TTS **erst**, wenn **`nextPulse === true`** (nach Script-Animation).
- **`politikbarometer`:** `nextPulse` wirkt auf den **Auto-Advance** nach Ende der Sprache; der **erste Speech-Effekt** hängt nicht an `nextPulse` → Risiko Überschneidung mit Animation („passt nicht immer“).

### Auto-Weiter nach gesprochenem Text

Wenn die Sprache zu Ende ist (und Bedingungen erfüllt):

1. `setContinuePulse(true)` nach **250 ms**  
2. Nach weiteren **650 ms**: `setIdx(+1)` bzw. letzter Schritt → `onFinish()`  

→ **0,9 s** nach Ende der Wiedergabe bis zum Schrittwechsel.

### Clara-Chat (Walkthrough)

- `ClaraChat` wird mit Key pro Schritt neu gemountet (`components/Clara/ClaraDock.tsx`).
- Erste Nachricht: `claraChatIntroWalkthroughWelcome` → z. B.  
  - Du: *„Ich bin gerade im Bereich: Politikbarometer. Was möchtest du dazu wissen?“*  
  - Sie: *„Ich bin gerade im Bereich: Politikbarometer. Was möchten Sie dazu wissen?“*  
  (`data/claraChatWelcome.ts`)

### Clara-Voice beim Öffnen (Walkthrough)

- `WALKTHROUGH_VOICE_OPEN_LINE_DU`: *„Stelle jetzt eine kurze Frage zu diesem Einführungsschritt. Die Steuerung oben bleibt parallel nutzbar.“*
- `WALKTHROUGH_VOICE_OPEN_LINE_SIE`: *„Stellen Sie jetzt eine kurze Frage zu diesem Einführungsschritt. Die Steuerung oben bleibt parallel nutzbar.“*  
- Kein automatisches TTS beim Öffnen des Mics im Walkthrough (Nutzer spricht zuerst; Kommentar im Code).

---

## 3. Vollständige Texte: Pre-Login & Meta

### 3.1 Clara Willkommen (sichtbar, Zeilen)

**Du — `INTRO_CLARA_WELCOME_LINES_DU`**

1. Hallo, ich bin Clara, die KI-Agentin von HookAI Civic.  
2. Diese Einführung führt dich souverän durch die wichtigsten Bereiche. Am Ende wechselst du in die volle Anwendung.  
3. Mich erreichst du jederzeit über das Clara-Symbol am unteren Rand.

**Sie — `INTRO_CLARA_WELCOME_LINES_SIE`**

1. Hallo, ich bin Clara, die KI-Agentin von HookAI Civic.  
2. Diese Einführung führt Sie souverän durch die wichtigsten Bereiche. Am Ende wechseln Sie in die volle Anwendung.  
3. Mich erreichen Sie jederzeit über das Clara-Symbol am unteren Rand.

### 3.2 Willkommen TTS (segmentiert)

**Du — `INTRO_SPOKEN_WELCOME_SEGMENTS_DU`**

1. Willkommen. Ich bin Clara, die KI-Agentin von HookAI Civic.  
2. Ich begleite dich durch die wichtigsten Bereiche.  
3. Orientierung, Beteiligung und leichte Navigation stehen im Mittelpunkt.  
4. Unten erreichst du mich jederzeit am lila Symbol.

**Sie — `INTRO_SPOKEN_WELCOME_SEGMENTS_SIE`**

1. Willkommen. Ich bin Clara, die KI-Agentin von HookAI Civic.  
2. Ich begleite Sie durch die wichtigsten Bereiche.  
3. Orientierung, Beteiligung und leichte Navigation stehen im Mittelpunkt.  
4. Unten erreichen Sie mich jederzeit am lila Symbol.

### 3.3 Anrede-Gate TTS (vor Du/Sie-Wahl) — `INTRO_ANREDE_GATE_PRE_CHOICE_SPOKEN_SEGMENTS`

*(eine Liste für beide Modi; Du-Form im Elevator-Satz)*

1. Hallo, ich bin Clara. Ich führe dich kurz durch HookAI Civic.  
2. HookAI Civic zeigt dir, wie digitale Beteiligung verständlich werden kann: Du siehst politische Abstimmungen in deiner Gemeinde, verstehst Pro und Contra, erhältst Wahlvorschauen mit Kandidierenden, Programmen und offiziellen Quellen – und kannst Anliegen direkt an deine Gemeinde melden. Sicher, nachvollziehbar und ohne politische Empfehlung.  
3. Bevor wir starten: Möchtest du per Du oder per Sie weitermachen?

**Nach Wahl**

- Du: `INTRO_ANREDE_GATE_AFTER_DU_SPOKEN_SEGMENTS` → *„Alles klar, wir machen in der Du-Form weiter.“*  
- Sie: `INTRO_ANREDE_GATE_AFTER_SIE_SPOKEN_SEGMENTS` → *„Alles klar, wir machen in der Sie-Form weiter.“*

### 3.4 Entry TTS — `INTRO_SPOKEN_ENTRY_DU` / `INTRO_SPOKEN_ENTRY_SIE`

- Du: *„Ich führe dich jetzt kurz durch die wichtigsten Bereiche.“*  
- Sie: *„Ich führe Sie jetzt kurz durch die wichtigsten Bereiche.“*

### 3.5 eID TTS — `INTRO_SPOKEN_EID_SEGMENTS_DU` / `INTRO_SPOKEN_EID_SEGMENTS_SIE`

**Du (alle 5 Segmente)**

1. Hier beginnt dein sicherer Bürgerzugang.  
2. In dieser Vorschau wird der Einstieg beispielhaft über die eID gezeigt. Perspektivisch kann ein solcher Zugang auch über die EU Digital Identity Wallet erfolgen.  
3. Das bedeutet: Du könntest dich künftig digital ausweisen und bestimmte Nachweise kontrolliert teilen — zum Beispiel Wohnort, Kommune oder Teilnahmeberechtigung.  
4. Wichtig ist: Es geht nicht darum, ein politisches Profil zu erstellen. Deine digitale Identität dient nur dazu, Zuständigkeiten und Berechtigungen sicher zu prüfen.  
5. Du entscheidest, welche Daten freigegeben werden. HookAI Civic soll nur die Informationen nutzen, die für den jeweiligen Bürgerdienst wirklich erforderlich sind.

**Sie (alle 5 Segmente)**

1. Hier beginnt Ihr sicherer Bürgerzugang.  
2. In dieser Vorschau wird der Einstieg beispielhaft über die eID gezeigt. Perspektivisch kann ein solcher Zugang auch über die EU Digital Identity Wallet erfolgen.  
3. Das bedeutet: Sie könnten sich künftig digital ausweisen und bestimmte Nachweise kontrolliert teilen — zum Beispiel Wohnort, Kommune oder Teilnahmeberechtigung.  
4. Wichtig ist: Es geht nicht darum, ein politisches Profil zu erstellen. Ihre digitale Identität dient nur dazu, Zuständigkeiten und Berechtigungen sicher zu prüfen.  
5. Sie entscheiden, welche Daten freigegeben werden. HookAI Civic soll nur die Informationen nutzen, die für den jeweiligen Bürgerdienst wirklich erforderlich sind.

### 3.6 Voice-Open (Mic) — `lib/claraVoiceOpenPrompts.ts`

| Konstante | Text |
|-----------|------|
| `ANREDE_VOICE_PROMPT` | Hallo, ich bin Clara. Bitte sagen Sie „Du“ oder „Sie“, damit ich Sie passend anspreche. Alternativ können Sie die Schaltflächen im Fenster nutzen. |
| `ENTRY_VOICE_PROMPT_DU` | Hallo, ich bin Clara. Möchtest du die Einführung starten oder direkt in die App? Sag einfach „Einführung starten“ oder „Direkt zur App“. |
| `ENTRY_VOICE_PROMPT_SIE` | Hallo, ich bin Clara. Möchten Sie die Einführung starten oder direkt in die App? Sagen Sie einfach „Einführung starten“ oder „Direkt zur App“. |
| `EID_VOICE_PROMPT_DU` | Hallo, ich bin Clara. Du kannst hier direkt per Stimme fragen, zum Beispiel zur eID, zur EU Wallet, zu Abstimmungen, Wahlen oder zum Politikbarometer. Ich antworte neutral und Schritt für Schritt. |
| `EID_VOICE_PROMPT_SIE` | Hallo, ich bin Clara. Sie können hier direkt per Stimme fragen, zum Beispiel zur eID, zur EU Wallet, zu Abstimmungen, Wahlen oder zum Politikbarometer. Ich antworte neutral und Schritt für Schritt. |

---

## 4. Walkthrough-Schritte: `line10s`, TTS (`speakSegments`), Langtext

**Laufzeit-TTS** in `DemoIntroWalkthrough`: `speakParts` = nur **`speakSegments`** (ohne **`line10s`**), letzter Schritt + **`INTRO_CLOSING_SPOKEN_SEGMENTS_*`**.

**Export** (`data/introTtsScript.ts` / `buildWalkthroughTts`): **`line10s` + `speakSegments`** → Abweichung zur Laufzeit.

### 4.1 `line10s` (Du = Sie, wo gleich) — werden in Laufzeit-TTS **nicht** vorgelesen

| Schritt | line10sDu / line10sSie |
|---------|-------------------------|
| abstimmen | Kommunales Beispiel: Kirkel im Saarland – beispielhaft, ohne Richtungsvorgabe. |
| wahlen | Wahlvorschau am Beispiel Bundestagswahl – nicht die eigentliche Wahl. |
| kalender | Kalender: Fristen, Abstimmungen und Beteiligung auf mehreren Ebenen. |
| meldungen | Meldung an die Gemeinde Kirkel – nachvollziehbarer Bearbeitungsstand. |
| praemien | Prämien: freiwillig, lokal gedacht – unabhängig vom Abstimmungsverhalten. |
| politikbarometer | Themen markieren – neutral, ohne Empfehlung und ohne Meinungsprofil. |

### 4.2 Kurz- und Langtext + TTS-Segment (Du)

| Schritt | shortDu (= longDu, = speakSegmentsDu[0]) |
|---------|------------------------------------------|
| abstimmen | Hier siehst du ein Beispiel aus Kirkel im Saarland: eine kommunale Abstimmung, etwa zu Schule, Verkehr, Digitalisierung oder öffentlicher Infrastruktur. Die KI bereitet dir Pro und Contra verständlich auf – ohne eine Richtung vorzugeben. Danach entscheidest du selbst. |
| wahlen | Hier siehst du eine Wahlvorschau – nicht die eigentliche Wahl. Am Beispiel einer Bundestagswahl kannst du nachvollziehen, welche Parteien, Kandidierenden, Programme und offiziellen Quellen relevant sind. So bist du besser vorbereitet, bevor du eine Wahlentscheidung triffst. |
| kalender | Im Kalender siehst du relevante Termine an einem Ort – zum Beispiel Fristen, Abstimmungen, Wahltermine und Beteiligungsmöglichkeiten auf kommunaler Ebene, im Saarland oder auf Bundesebene. So geht nichts unter, was für dich wichtig sein könnte. |
| meldungen | Hier meldest du ein Anliegen direkt an die Gemeinde – zum Beispiel ein Problem auf einem Spielplatz, eine defekte Laterne oder eine Gefahrenstelle. Du siehst danach nachvollziehbar, wie der Bearbeitungsstand ist. |
| praemien | Prämien sind freiwillig und lokal gedacht. Wenn du sie aktivierst, können dir nach abgeschlossenen Beteiligungen regionale Vorteile angezeigt werden – unabhängig davon, wie du abgestimmt hast. |
| politikbarometer | Zuerst markierst du, welche Themen dich besonders interessieren – zum Beispiel Digitalisierung, Wirtschaft, Bildung, Verkehr oder Sicherheit. So können später passende Abstimmungen, Termine und Informationen schneller sichtbar werden. Es entsteht keine politische Empfehlung und kein Meinungsprofil. |

### 4.3 Kurz- und Langtext + TTS-Segment (Sie)

| Schritt | shortSie (= longSie, = speakSegmentsSie[0]) |
|---------|---------------------------------------------|
| abstimmen | Hier sehen Sie ein Beispiel aus Kirkel im Saarland: eine kommunale Abstimmung, etwa zu Schule, Verkehr, Digitalisierung oder öffentlicher Infrastruktur. Die KI bereitet Ihnen Pro und Contra verständlich auf – ohne eine Richtung vorzugeben. Danach entscheiden Sie selbst. |
| wahlen | Hier sehen Sie eine Wahlvorschau – nicht die eigentliche Wahl. Am Beispiel einer Bundestagswahl können Sie nachvollziehen, welche Parteien, Kandidierenden, Programme und offiziellen Quellen relevant sind. So sind Sie besser vorbereitet, bevor Sie eine Wahlentscheidung treffen. |
| kalender | Im Kalender sehen Sie relevante Termine an einem Ort – zum Beispiel Fristen, Abstimmungen, Wahltermine und Beteiligungsmöglichkeiten auf kommunaler Ebene, im Saarland oder auf Bundesebene. So geht nichts unter, was für Sie wichtig sein könnte. |
| meldungen | Hier melden Sie ein Anliegen direkt an die Gemeinde – zum Beispiel ein Problem auf einem Spielplatz, eine defekte Laterne oder eine Gefahrenstelle. Sie sehen danach nachvollziehbar, wie der Bearbeitungsstand ist. |
| praemien | Prämien sind freiwillig und lokal gedacht. Wenn Sie sie aktivieren, können Ihnen nach abgeschlossenen Beteiligungen regionale Vorteile angezeigt werden – unabhängig davon, wie Sie abgestimmt haben. |
| politikbarometer | Zuerst markieren Sie, welche Themen Sie besonders interessieren – zum Beispiel Digitalisierung, Wirtschaft, Bildung, Verkehr oder Sicherheit. So können später passende Abstimmungen, Termine und Informationen schneller sichtbar werden. Es entsteht keine politische Empfehlung und kein Meinungsprofil. |

### 4.4 Abschluss-TTS (nur letzter Schritt Prämien)

**Du — `INTRO_CLOSING_SPOKEN_SEGMENTS_DU`**

1. Das war der kurze Überblick.  
2. Du kannst HookAI Civic jetzt selbst erkunden oder Clara gezielt Fragen stellen.  
3. Ich antworte neutral, verständlich und nur auf das, was du wissen möchtest.  
4. Deine Identität wird nur geprüft, damit klar ist, dass du teilnahmeberechtigt bist.  
5. Ziel ist: prüfbare Teilnahme, aber geheime Entscheidung.

**Sie — `INTRO_CLOSING_SPOKEN_SEGMENTS_SIE`**

1. Das war der kurze Überblick.  
2. Sie können HookAI Civic jetzt selbst erkunden oder Clara gezielt Fragen stellen.  
3. Ich antworte neutral, verständlich und nur auf das, was Sie wissen möchten.  
4. Ihre Identität wird nur geprüft, damit klar ist, dass Sie teilnahmeberechtigt sind.  
5. Ziel ist: prüfbare Teilnahme, aber geheime Entscheidung.

### 4.5 Meta-Framing-Zeile pro Screen (`introOverlayFramingLine`)

**Du — `INTRO_OVERLAY_FRAMING_LINES_DU`**

| Schritt | Zeile |
|---------|--------|
| abstimmen | Pro und Contra sichtbar – Orientierung ohne Empfehlung. |
| wahlen | Wahlinformationen gebündelt – ohne Wahlempfehlung. |
| kalender | Termine und Fristen – optional thematisch hervorgehoben. |
| meldungen | Anliegen strukturiert und nachvollziehbar weitergeben. |
| praemien | Prämien nur nach Einwilligung – unabhängig von deiner Abstimmungsentscheidung. |
| politikbarometer | Interessenschwerpunkte für Kalender-Relevanz – freiwillig, neutral. |

**Sie — `INTRO_OVERLAY_FRAMING_LINES_SIE`**

| Schritt | Zeile |
|---------|--------|
| abstimmen | Pro und Contra sichtbar – Orientierung ohne Empfehlung. |
| wahlen | Wahlinformationen gebündelt – ohne Wahlempfehlung. |
| kalender | Termine und Fristen – optional thematisch hervorgehoben. |
| meldungen | Anliegen strukturiert und nachvollziehbar weitergeben. |
| praemien | Prämien nur nach Einwilligung – unabhängig von Ihrer Abstimmungsentscheidung. |
| politikbarometer | Interessenschwerpunkte für Kalender-Relevanz – freiwillig, neutral. |

### 4.6 TTS-Manifest (`buildIntroTtsManifest` in `data/introTtsScript.ts`)

Nummerierung dort: Schritt 1 = Anrede, 2 = eID, 3–8 = Walkthrough-Schritte in Reihenfolge `INTRO_OVERLAY_STEPS`. Pro Walkthrough-Schritt: **`line10s` + gesprochene Segmente** (+ Abschluss am letzten Schritt).

---

## 5. Audit: Warum wirkt Inhalt „gekürzt“?

| Befund | Details |
|--------|---------|
| Politikbarometer ohne Erklärung im Panel | `WalkthroughRealSectionEmbed`: `PolitikBarometerPanel` mit `heroPreview`, `leadDu=""`, `leadSie=""`. Bei `heroPreview` entfallen Überschrift, Lead und Presets – nur Regler-Animation (`PolitikBarometerPanel.tsx`). |
| Kalender nur eingebettet | `CalendarSection` ohne zusätzlichen Walkthrough-Erklärblock; Kontext = Kartenkopf + optional „Mehr anzeigen“. |
| Langer Text eingeklappt | `WalkthroughInfoDetails`: `primaryLong` standardmäßig zu – „Mehr anzeigen“ nötig. |
| TTS ohne `line10s` | `speakParts` in `DemoIntroWalkthrough` ohne Kicker-Zeilen. |
| Manifest ≠ Laufzeit | `introTtsScript.ts` enthält `line10s` in `buildWalkthroughTts`. |
| Auto-Advance sehr knapp | 250 ms + 650 ms nach Ende TTS. |
| Animation vs. Sprache | Unterschiedliche `nextPulse`-Gates je Schritt. |

---

## 6. Empfehlungen (kurz)

1. **Eine Quelle der Wahrheit für TTS:** `speakParts` = `line10s` + `speakSegments` (wie `buildWalkthroughTts`) oder Daten bereinigen.  
2. **Politikbarometer:** mindestens eine sichtbare Zeile im Walkthrough (`DEFAULT_LEAD_*` / `clara.short` / Caption).  
3. **Kalender:** einzeiliger Kontext oder `walkthroughCaption` an `CalendarSection`.  
4. **„Mehr anzeigen“:** Standard geöffnet oder Teaser sichtbar.  
5. **Auto-Advance:** Pausen verlängern oder optional abschalten.  
6. **Externe Copy-Bearbeitung:** ChatGPT mit Zeichen-/Sekunden-Budget und Verknüpfung Politikbarometer ↔ Kalender; anschließend technische Verdrahtung im Repo.

---

## Zusatzstatus: Prämien / QR / Wallet-Vorschau

*(Kurzfassung einer späteren UI-Anpassung; technische Details im Git-Verlauf zu `LeaderboardSection.tsx`.)*

- Geänderte Datei: `components/Leaderboard/LeaderboardSection.tsx`
- Voucher-Modal: QR-Bereich liegt **oben** im Sheet; kein **gesamter** langer Innen-Scroll mehr bis zum QR wie zuvor.
- Wallet: **perspektivisch** (kein SDK, keine Pass-Erzeugung, kein Redirect, keine externe Integration).
- Kein echtes QR-Backend; Gutschein nicht an konkrete Stimmabgabe gekoppelt; kein sichtbares „Demo“-/Post-Wording in diesem UI-Pfad.
- In der betreffenden Umsetzung: `npx tsc --noEmit` erfolgreich; Vercel-Production-Deploy durchgeführt.

---

*Dokument aus dem Code abgeleitet; bei Textänderungen in den genannten Dateien dieses Audit aktualisieren.*
