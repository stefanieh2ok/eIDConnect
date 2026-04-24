# Intro-Flow: Analyse (Phase 0)

## Wo wird „Clara“ bzw. TTS heute ausgelöst?

| Ort | Mechanismus | Wann |
|-----|------------|------|
| `AnredeGate` | `useEffect` → `intro.speakIntro(introAnredeGateSpoken(du))` | Dialog offen, bei Du/Si-Wechsel |
| `LoginScreen` | `useEffect` → `introEidLoginSpoken` | Anrede gesetzt, Anrede-Dialog zu |
| `DemoIntroWalkthrough` | `useEffect` pro `idx` | Schritt-Wechsel, generierter String aus Titel+Body+Framing |
| `IntroOverlay` | `speak` aus `useClaraVoice` | Stimm-Engine, **aktuell immer bei Aufruf** (ohne Mute) |

**Lücke / Inkonsistenz:** Es gibt keinen zentralen „eine Fassung = ein Screen“-Build; eID-Texte und Anrede stammen aus `introSpokenTts.ts`, Walkthrough mischt dagegen lange `body` mit „Schritt X von 8“.

## Wo fehlen Erklärungen bzw. wo ist Unklar?

- **Anrede-Screen (sichtbar):** Headline/Fließtext stammen noch aus altem Muster, nicht 1:1 der neue Clara-Einstiegstext; Abgleich sichtbar ↔ gesprochen fehlt, wenn TTS-Text in Marketing länger/kürzer.
- **Walkthrough:** Visuelles = Mini-Screenshot/Preview, gesprochen = oft derselbe generische `body` — nicht zwingend 1:1 das, was im Ausschnitt sichtbar ist.
- **Kontrollfluss:** Kein klarer Schritt **„Einführung starten“ vs. „Direkt zur App“** im UI (wurde früher nur datenseitig erwähnt).
- **Doppel-Systeme:** `aria-live` kündigt Schritte, sichtbarer Text wiederholt teils — wahrgenommen als zwei Kanäle.

## Audio vs. Text — typische Synchronprobleme

- React-`useEffect` + Cleanup stoppt laufend `speechSynthesis` → in Strict Mode/Navigation gelegentlich abgebrochen.
- Lange Sätze vs. kürzere UI-Paragraphen → Nutzer: „sie liest etwas anderes“.
- Kein **Audio-Off-Default** führt dazu, dass Manche TTS wünschen, Andere erschrecken; umgekehrt wünscht GovTech manchmal Opt-in (WCAG: keine Autoplay-Überraschung).

## Kurzliste Probleme

1. Nicht **eine** inhaltliche Quelle pro Schritt (sichtbar / gesprochen / SR).
2. Nummerierung („Schritt 3 von 8“) kollidiert früher mit wahrgenommener Länge; Nutzerwunsch: **keine sichtbaren Schritt-Nummern** im Führungs-UI.
3. Kein expliziter **Opt-in** für Sprache (Dissonanz zu Zielgruppe Regierung/Barrierefreiheit-Dialog).
4. Fehlender **Branch** nach Anrede (volle Führung vs. Abbrechen).
5. **Kein** leichtes Intent-System für „Noch Frage im aktuellen Schritt“ (ohne vollen Chat).

## Verbesserungsvorschläge (Rollen)

**Senior UI Engineer:** Eine `IntroNarration`-Schicht: `claraShort`, `claraLong`, `speakText` (für TTS) pro `stepId`; `speakText` = ein String pro Screen, **kein** doppelter Start (utterance-Key-Ref im Provider).

**UX Designer:** Oben: **Audio standard aus**, klarer Toggle „Vorlesen aktivieren“; darunter kurzer Clara-Text, **„Mehr anzeigen“** für Details; primärer Fokus **großer Sicht-/Screenshot**; danach Einstiegs-Branch, dann eID, dann Führung.

**Accessibility (a11y):** Autoplay-Opt-in; `aria-live` nur knapp, nicht Fließtext 1:1 der Stimme; sichtbarer Fokus auf Toggle und Schritte; Tastatur: Expand „Mehr anzeigen“.

## Umsetzung in diesem Branch (Kern)

- Wieder **Audio-Opt-in** (Default aus) in `IntroOverlay` + Toggle im Meta-Streifen.
- **IntroEntryBranch** nach Anrede: „Einführung starten“ / „Direkt zur App“.
- **Walkthrough:** sichtbare Schrittzahlen entfernt; `ClaraStepPanel` mit Kurz + Lang; Narration pro Schritt (`INTRO_CLARA_WALKTHROUGH` in `introOverlayMarketing`).
- **Kein doppeltes Abspielen:** `IntroOverlay` trackt `lastNarrationKey`, spricht nur bei wechselndem Key.
- **`introVoiceIntents`:** Keyword-Logik für kurze Sprach-Intents (u. a. angebunden an **Clara Voice** / `ClaraVoiceInterface`). Der frühere **zusätzliche** Walkthrough-Button „Kurz per Sprache …“ (`IntroIntentMic`) wurde entfernt — eine Clara-UI unten, keine Überlappung mit Zurück/Weiter.

---

*Stand: an den aktuellen Walkthrough-/ClaraDock-Stand angepasst (ohne `IntroIntentMic`).*
