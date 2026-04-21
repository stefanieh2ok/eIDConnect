/**
 * Texte für die Einführung (eID Demo Connect).
 *
 * Framing-Prinzipien (State Clarity):
 * - Die gesamte Einführung hat 8 Schritte: Ansprache, eID, Abstimmen, Wahlen,
 *   Kalender, Meldungen, Prämien, Politikbarometer.
 * - Ein globaler „EINFÜHRUNG"-Pill steht auf allen Screens als Meta-Ebene.
 * - Pro Schritt genau eine Framing-Zeile (Meta), NIE im Screen-Inhalt selbst.
 * - Wording: „So …" statt „Jetzt …" – signalisiert Vorschau statt Live-Aktion.
 * - Politikbarometer: nicht „Interessen"/„Profiling" – sondern Themenwahl, die
 *   Hinweise auf Abstimmungen und Termine im Kalender auslöst.
 */

/** Einheitliche Hauptzeile auf allen Walkthrough-Folien. */
export const INTRO_OVERLAY_HEADLINE = 'eID Demo Connect im Überblick';

/** Gesamtzahl der Einführungs-Schritte (Anrede + eID + 6 Walkthrough-Schritte). */
export const INTRO_TOTAL_STEPS = 8;

/** Globale Kicker-Zeile, die auf jedem Einführungs-Screen sichtbar ist. */
export const INTRO_GLOBAL_FRAMING = 'Beispielansichten · Die App-Nutzung beginnt danach.';

/** Label des globalen Pills. */
export const INTRO_GLOBAL_PILL_LABEL = 'Einführung';

/** Einstiegs-Erklärung auf Screen 1 (Ansprache) – mit Zeit-Anker. */
export const INTRO_ANREDE_LEADIN_SIE =
  'Vor dem Start der App folgt eine kurze Einführung (ca. 90 Sekunden) anhand von Beispielansichten. Im Anschluss nutzen Sie die App selbstständig.';
export const INTRO_ANREDE_LEADIN_DU =
  'Vor dem Start der App folgt eine kurze Einführung (ca. 90 Sekunden) anhand von Beispielansichten. Im Anschluss nutzt Du die App selbstständig.';

/** Framing-Zeile über Screen 2 (eID). Lange Fassung — wird ausschließlich von
 *  Screenreadern über die aria-live-Region vorgelesen. */
export const INTRO_EID_FRAMING =
  'So funktioniert später der Einstieg per eID — hier nur als Beispiel, ohne echte Datenübertragung.';

/** Sichtbare Kurzfassung von INTRO_EID_FRAMING. Bewusst knapp, damit sie in
 *  den dunklen Meta-Streifen (siehe .intro-meta-strip) passt, ohne zu wirken
 *  wie eine zweite Textebene. Gleicher Font, nur leicht gedimmt (~white/65). */
export const INTRO_EID_FRAMING_SHORT =
  'Beispielansicht der eID — ohne echte Datenübertragung.';

/** Sichtbare Kurzfassung der Politikbarometer-Framing-Zeile.
 *  Ziel: Compliance-sensitive Sichtbarkeit des Nicht-Profiling-Claims,
 *  ohne die volle Satzlänge von INTRO_OVERLAY_FRAMING_LINES.politikbarometer. */
export const INTRO_POLITIKBAROMETER_FRAMING_SHORT =
  'Themen priorisieren für Hinweise & Termine — kein Profiling.';

/** Abschluss-Text (letzter Walkthrough-Screen, oberhalb des Buttons). */
export const INTRO_CLOSING_TEXT_SIE =
  'Das war die Einführung. Jetzt beginnt die eigentliche Nutzung mit echten Inhalten und Ihren eigenen Auswahlmöglichkeiten.';
export const INTRO_CLOSING_TEXT_DU =
  'Das war die Einführung. Jetzt beginnt die eigentliche Nutzung mit echten Inhalten und Deinen eigenen Auswahlmöglichkeiten.';

/** Label der Schluss-CTA auf dem letzten Walkthrough-Screen. */
export const INTRO_FINISH_CTA_LABEL = 'Einführung beenden · App starten';

/** Skip-Link-Label (nur im Walkthrough sichtbar). */
export const INTRO_SKIP_LABEL = 'Einführung überspringen';

/* ──────────────────────────────────────────────────────────────────────────
 * Opt-in-Gate nach Login (Phase B)
 *
 * Nach Login (Schritt 2 eID erfolgreich) fragt die App aktiv nach:
 * „Möchtest Du/Sie jetzt eine kurze Einführung sehen, oder direkt in die App?"
 *
 * Damit ist die State-Clarity maximal deutlich: Tester müssen das Wort
 * „Einführung" nicht aus einer Pill ableiten, sondern entscheiden selbst.
 * Wer die App schon kennt, springt direkt rein.
 * ────────────────────────────────────────────────────────────────────────── */

/** Große Headline des Opt-in-Gates. */
export const INTRO_OPT_IN_TITLE_SIE = 'Kurze App-Einführung ansehen?';
export const INTRO_OPT_IN_TITLE_DU = 'Kurze App-Einführung ansehen?';

/** Einleitender Satz unter der Headline. */
export const INTRO_OPT_IN_LEAD_SIE =
  'In rund 60 Sekunden lernen Sie die wichtigsten Bereiche der App kennen — als Beispielansichten, ohne echte Datenaktion.';
export const INTRO_OPT_IN_LEAD_DU =
  'In rund 60 Sekunden lernst Du die wichtigsten Bereiche der App kennen — als Beispielansichten, ohne echte Datenaktion.';

/** Aufzählung der Bereiche, die im Walkthrough gezeigt werden. */
export const INTRO_OPT_IN_TOPICS = [
  'Abstimmen',
  'Wahlen',
  'Kalender',
  'Meldungen',
  'Prämien',
  'Politikbarometer',
] as const;

/** Primärer Button: startet den Walkthrough (Schritte 3–8). */
export const INTRO_OPT_IN_START_LABEL = 'Einführung starten';
/** Zusatz unter dem Primär-Button: Rahmung in Sekunden/Schritten. */
export const INTRO_OPT_IN_START_SUBLABEL = '6 Schritte · ca. 60 Sek.';

/** Sekundärer Button: direkt in die App. */
export const INTRO_OPT_IN_SKIP_LABEL_SIE = 'Direkt zur App';
export const INTRO_OPT_IN_SKIP_LABEL_DU = 'Direkt zur App';

/** Hinweis unter den Buttons: Einführung bleibt nachträglich zugänglich. */
export const INTRO_OPT_IN_HINT_SIE =
  'Sie können die Einführung später jederzeit über die Einstellungen erneut öffnen.';
export const INTRO_OPT_IN_HINT_DU =
  'Du kannst die Einführung später jederzeit über die Einstellungen erneut öffnen.';

/** @deprecated Nutzen Sie INTRO_OVERLAY_HEADLINE; nur für ältere Imports. */
export const INTRO_OVERVIEW_SHORT_TITLE = INTRO_OVERLAY_HEADLINE;

/** @deprecated Nicht mehr im Intro verwendet. */
export function introOverlayKicker(_du: boolean): string {
  return INTRO_OVERLAY_HEADLINE;
}

export type IntroOverlayStepId =
  | 'abstimmen'
  | 'wahlen'
  | 'kalender'
  | 'meldungen'
  | 'praemien'
  | 'politikbarometer';

export type IntroOverlayStepCopy = {
  id: IntroOverlayStepId;
  title: string;
  body: string;
  bullets: { n: number; title: string; text: string }[];
};

export const INTRO_OVERLAY_STEPS: IntroOverlayStepCopy[] = [
  {
    id: 'abstimmen',
    title: '1) Abstimmen',
    body:
      'Unter „Abstimmen“ sehen Sie politische und kommunale Themen auf einen Blick.\n\n' +
      'Sie erhalten Pro- und Contra-Argumente, können sich Hintergründe von Clara, der neutralen KI-Assistentin, einordnen lassen und anschließend Ihr Meinungsbild abgeben – inklusive der Option „Enthalten“.',
    bullets: [
      { n: 1, title: 'Pro & Contra', text: 'Die wichtigsten Argumente werden verständlich und ausgewogen aufbereitet.' },
      { n: 2, title: 'Clara', text: 'Neutrale Einordnung und verständliche Hintergründe auf Anfrage.' },
      { n: 3, title: 'Meinungsbild', text: 'Positionen können schnell und nachvollziehbar erfasst werden.' },
    ],
  },
  {
    id: 'wahlen',
    title: '2) Wahlen',
    body:
      'Unter „Wahlen“ erleben Sie einen digital unterstützten Wahlprozess mit klarer Nutzerführung.\n\n' +
      'Sie sehen den digitalen Stimmzettel, erhalten Orientierung zu Erst- und Zweitstimme und können Parteiprogramme sowie quellenbasierte Informationen zu Kandidierenden direkt aufrufen.',
    bullets: [
      { n: 1, title: 'Erststimme', text: 'Wahl einer Person im jeweiligen Wahlkreis.' },
      { n: 2, title: 'Zweitstimme', text: 'Stimme für die Landesliste einer Partei.' },
      { n: 3, title: 'Informationen', text: 'Programme und Kandidierendenprofile sind direkt abrufbar.' },
    ],
  },
  {
    id: 'kalender',
    title: '3) Kalender',
    body:
      'Unter „Kalender“ finden Sie Wahlen, Abstimmungen, Fristen und Veranstaltungen an einem Ort.\n\n' +
      'Alle Termine sind übersichtlich gebündelt und lassen sich nach Zeitraum, Thema und Relevanz filtern.',
    bullets: [
      { n: 1, title: 'Übersicht', text: 'Alle relevanten Termine an einem Ort.' },
      { n: 2, title: 'Filter', text: 'Auswahl nach Thema, Zeitraum und Relevanz.' },
      { n: 3, title: 'Orientierung', text: 'Politische und kommunale Ereignisse schnell erfassen.' },
    ],
  },
  {
    id: 'meldungen',
    title: '4) Meldungen',
    body:
      'Unter „Meldungen“ erfassen Sie Hinweise, Mängel und Anliegen direkt für Ihre Kommune.\n\n' +
      'Sie wählen die passende Kategorie, ergänzen Ort, Beschreibung und Fotos und leiten Ihr Anliegen strukturiert an die zuständige Stelle weiter.',
    bullets: [
      { n: 1, title: 'Kategorie', text: 'Die Auswahl unterstützt die richtige Zuordnung in der Verwaltung.' },
      { n: 2, title: 'Nachverfolgung', text: 'Bearbeitungsstände bleiben transparent einsehbar.' },
      { n: 3, title: 'Kommune', text: 'Anliegen werden an die zuständige Stelle weitergeleitet.' },
    ],
  },
  {
    id: 'praemien',
    title: '5) Punkte sammeln und Prämien erhalten',
    body:
      'Die Teilnahme am Prämienprogramm ist freiwillig und wird erst nach Ihrer ausdrücklichen Zustimmung aktiviert.\n\n' +
      'Punkte für aktive Beteiligung werden nur im dafür erforderlichen Umfang verarbeitet.\n\n' +
      'Prämien und Einlöseangebote werden erst angezeigt, wenn Sie dem Programm ausdrücklich zustimmen.',
    bullets: [
      { n: 1, title: 'Freiwillig', text: 'Teilnahme standardmäßig deaktiviert (Privacy by default).' },
      { n: 2, title: 'Datensparsam', text: 'Verarbeitung nur im erforderlichen Umfang.' },
      { n: 3, title: 'Widerrufbar', text: 'Einwilligung jederzeit in den Einstellungen widerrufbar.' },
    ],
  },
  {
    id: 'politikbarometer',
    title: '6) Politikbarometer',
    body:
      'Im „Politikbarometer" legen Sie fest, welche Themen Ihnen wichtig sind.\n\n' +
      'Die App weist Sie anschließend auf passende Abstimmungen hin und trägt relevante Termine in Ihren Kalender ein. Die Nutzung ist freiwillig und jederzeit anpassbar.',
    bullets: [
      { n: 1, title: 'Themen', text: 'Sie priorisieren die Themen, die für Sie relevant sind.' },
      { n: 2, title: 'Hinweise', text: 'Die App macht Sie auf passende Abstimmungen aufmerksam.' },
      { n: 3, title: 'Kalender', text: 'Relevante Termine werden automatisch aufgenommen.' },
    ],
  },
];

/**
 * Eine kurze Framing-Zeile pro Walkthrough-Screen – erscheint als Meta-Ebene
 * in der Overlay-Chrome, nicht als Screen-Content.
 */
export const INTRO_OVERLAY_FRAMING_LINES: Record<IntroOverlayStepId, string> = {
  abstimmen: 'So werden laufende Abstimmungen mit Pro- und Contra-Argumenten dargestellt.',
  wahlen: 'So ist der digitale Stimmzettel mit Programmen und Kandidierenden aufgebaut.',
  kalender: 'So bündelt der Kalender Wahlen, Fristen und Termine an einem Ort.',
  meldungen: 'So übermitteln Sie später strukturierte Anliegen an Ihre Kommune.',
  praemien:
    'So sieht das freiwillige Punkte- und Prämienprogramm aus — aktiv nur nach ausdrücklicher Zustimmung.',
  politikbarometer:
    'Sie legen fest, welche Themen Ihnen wichtig sind — die App weist Sie auf passende Abstimmungen hin und nimmt Termine in Ihren Kalender auf.',
};
