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

/**
 * Kurze Begrüßung durch Clara (eine Einführung, optional Vorlesen = gleiche Stimme/Engine).
 * Sichtbar im Opt-in-Gate; nicht als zweiter, separater „Clara-Modus“.
 */
export const INTRO_CLARA_WELCOME_LINES_DU = [
  'Hallo, ich bin Clara.',
  'Ich zeige dir kurz, wie diese Demo aufgebaut ist.',
  'Du bekommst einen Überblick über die wichtigsten Funktionen und kannst danach alles selbst erkunden.',
  'Wenn du möchtest, begleite ich dich Schritt für Schritt durch die App.',
] as const;

export const INTRO_CLARA_WELCOME_LINES_SIE = [
  'Hallo, ich bin Clara.',
  'Ich zeige Ihnen kurz, wie diese Demo aufgebaut ist.',
  'Sie bekommen einen Überblick über die wichtigsten Funktionen und können danach alles selbst erkunden.',
  'Wenn Sie möchten, begleite ich Sie Schritt für Schritt durch die App.',
] as const;

export function introClaraWelcomePlain(du: boolean): string {
  return (du ? INTRO_CLARA_WELCOME_LINES_DU : INTRO_CLARA_WELCOME_LINES_SIE).join(' ');
}

/** Einstiegs-Erklärung auf Screen 1 (Ansprache) – mit Zeit-Anker. */
export const INTRO_ANREDE_LEADIN_SIE =
  'Vor dem Start der App folgt eine kurze Einführung (ca. 90 Sekunden) anhand von Beispielansichten. Im Anschluss nutzen Sie die App selbstständig.';
export const INTRO_ANREDE_LEADIN_DU =
  'Vor dem Start der App folgt eine kurze Einführung (ca. 90 Sekunden) anhand von Beispielansichten. Im Anschluss nutzt Du die App selbstständig.';

/** TTS-Öffnung Schritt 1 (Anrede) — hängt von der Fokus-/Vorschau-Auswahl (Du vs. Sie) ab. */
export const INTRO_ANREDE_SPOKEN_OPENING_SIE =
  'Schritt 1 von 8. Wie möchten Sie angesprochen werden? Bitte wählen Sie einmalig Sie oder Du. Das Intro passt sich an.';
export const INTRO_ANREDE_SPOKEN_OPENING_DU =
  'Schritt 1 von 8. Möchtest du per Du oder per Sie angesprochen werden? Wähle bitte einmalig. Das Intro passt sich an.';

/** MVP-Hinweis für Vorlesen auf dem Login (Schritt 2) — sachlich, gleich in beiden Anreden. */
export const INTRO_EID_SPOKEN_MVP =
  'M V P Ablauf: eID setzt automatisch Kirkel, Postleitzahl sechs sechs vier fünf neun. Keine manuelle Adresseingabe nötig.';

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
 *  ohne die volle Satzlänge von INTRO_OVERLAY_FRAMING_LINES_SIE.politikbarometer. */
export const INTRO_POLITIKBAROMETER_FRAMING_SHORT =
  'Themen priorisieren für Hinweise & Termine — kein Profiling.';

/** Abschluss-Text (letzter Walkthrough-Screen, oberhalb des Buttons). */
export const INTRO_CLOSING_TEXT_SIE =
  'Das war die kurze Einführung.\n\n' +
  'Sie können jetzt alle Bereiche der App selbst erkunden.\n\n' +
  'Wenn Sie möchten, können Sie die Einführung jederzeit erneut starten.\n\n' +
  'Ich unterstütze Sie auch während der Nutzung jederzeit.';
export const INTRO_CLOSING_TEXT_DU =
  'Das war die kurze Einführung.\n\n' +
  'Du kannst jetzt alle Bereiche der App selbst erkunden.\n\n' +
  'Wenn du möchtest, kannst du die Einführung jederzeit erneut starten.\n\n' +
  'Ich unterstütze dich auch während der Nutzung jederzeit.';

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
      'Hier können Sie aktuelle Themen ansehen und Ihre Meinung abgeben.\n\n' +
      'Sie können zwischen „Dafür“, „Dagegen“ oder „Enthaltung“ wählen.\n\n' +
      'Zu jedem Thema finden Sie zusätzliche Informationen zur Orientierung.\n\n' +
      'Wenn Sie am Prämiensystem teilnehmen, erhalten Sie für jede Teilnahme Punkte.',
    bullets: [
      { n: 1, title: 'Position wählen', text: 'Dafür, Dagegen oder Enthaltung — je nach Ihrer Einschätzung.' },
      { n: 2, title: 'Zusatzinfos', text: 'Pro Thema gibt es weiterführende Informationen zur Einordnung.' },
      { n: 3, title: 'Prämiensystem (freiwillig)', text: 'Bei aktivierter Teilnahme: Punkte für Ihre Beiträge.' },
    ],
  },
  {
    id: 'wahlen',
    title: '2) Wahlen',
    body:
      'In diesem Bereich finden Sie verschiedene Wahlen.\n\n' +
      'Sie können sich Stimmzettel ansehen sowie Informationen zu Kandidaten und Programmen abrufen.\n\n' +
      'Die angezeigten Ergebnisse dienen in dieser Demo zur Veranschaulichung.\n\n' +
      'Sie ersetzen keine offiziellen Wahlergebnisse.',
    bullets: [
      { n: 1, title: 'Wahlen & Stimmzettel', text: 'Verschiedene Wahlen und digitale Stimmzettel in einem Bereich.' },
      { n: 2, title: 'Kandidaten & Programme', text: 'Informationen zum Nachlesen, wo die Demo sie bereitstellt.' },
      { n: 3, title: 'Hinweis', text: 'Dargestellte Ergebnisse: nur Veranschaulichung, keine offizielle Wahlquelle.' },
    ],
  },
  {
    id: 'kalender',
    title: '3) Kalender',
    body:
      'Im Kalender sehen Sie anstehende Wahlen und Abstimmungen auf einen Blick.\n\n' +
      'Sie können nach Bereichen und Zeiträumen filtern.\n\n' +
      'So behalten Sie den Überblick über relevante Termine.',
    bullets: [
      { n: 1, title: 'Auf einen Blick', text: 'Anstehende Wahlen und Abstimmungen zentral sichtbar.' },
      { n: 2, title: 'Filter', text: 'Einschränkung nach Bereich und Zeitraum.' },
      { n: 3, title: 'Überblick', text: 'Relevante Termine bleiben greifbar.' },
    ],
  },
  {
    id: 'meldungen',
    title: '4) Meldungen',
    body:
      'Hier können Sie Anliegen, Hinweise oder Probleme digital melden.\n\n' +
      'Ihre Meldung wird strukturiert erfasst und an die zuständige Stelle weitergeleitet.\n\n' +
      'Sie können jederzeit nachvollziehen, was mit Ihrer Meldung passiert.',
    bullets: [
      { n: 1, title: 'Digital melden', text: 'Anliegen, Hinweise oder Mängel strukturiert erfassen.' },
      { n: 2, title: 'Weiterleitung', text: 'Zuständige Stelle erhält die Angaben in geordneter Form.' },
      { n: 3, title: 'Nachvollziehbar', text: 'Status und Fortschritt der Meldung bleiben einsehbar.' },
    ],
  },
  {
    id: 'praemien',
    title: '5) Punkte sammeln und Prämien erhalten',
    body:
      'Sie können freiwillig am Prämiensystem teilnehmen.\n\n' +
      'Für bestimmte Aktionen, wie zum Beispiel Abstimmungen, erhalten Sie Punkte.\n\n' +
      'Die Teilnahme ist optional und kann jederzeit aktiviert oder deaktiviert werden.\n\n' +
      'Gesammelte Punkte können Sie im jeweiligen Bereich für lokale Prämien einsetzen.',
    bullets: [
      { n: 1, title: 'Freiwillig', text: 'Prämiensystem optional — ohne Verpflichtung nutzbar.' },
      { n: 2, title: 'Punkte', text: 'Bei definierten Aktionen (z. B. Abstimmungen) Punkte sammeln.' },
      { n: 3, title: 'Steuerung & Einlösen', text: 'Jederzeit aktivieren oder deaktivieren; Punkte für lokale Prämien einsetzen.' },
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
 * Abstimmen & Politikbarometer: getrennte Du/Sie-Varianten; übrige Schritte neutral.
 */
export const INTRO_OVERLAY_FRAMING_LINES_SIE: Record<IntroOverlayStepId, string> = {
  abstimmen:
    'So sehen Sie aktuelle Themen, wählen eine Position (Dafür, Dagegen, Enthaltung) und finden dazu weitere Informationen.',
  wahlen:
    'Stimmzettel und Kandidateninfos in der Demo — Ergebnisanzeigen nur beispielhaft, nicht rechtsverbindlich.',
  kalender: 'Wahlen und Abstimmungen im Kalender — filtern und relevante Termine im Blick behalten.',
  meldungen: 'Meldung erfassen, an die zuständige Stelle leiten, Bearbeitung nachvollziehen.',
  praemien: 'Freiwilliges Prämiensystem — Punkte bei Aktionen, jederzeit einstellbar, Einlösung im jeweiligen Bereich.',
  politikbarometer:
    'Sie legen fest, welche Themen Ihnen wichtig sind — die App weist Sie auf passende Abstimmungen hin und nimmt Termine in Ihren Kalender auf.',
};

export const INTRO_OVERLAY_FRAMING_LINES_DU: Record<IntroOverlayStepId, string> = {
  abstimmen:
    'So siehst du aktuelle Themen, wählst eine Position (Dafür, Dagegen, Enthaltung) und findest dazu weitere Informationen.',
  wahlen:
    'Stimmzettel und Kandidateninfos in der Demo — Ergebnisanzeigen nur beispielhaft, nicht rechtsverbindlich.',
  kalender: 'Wahlen und Abstimmungen im Kalender — filtern und relevante Termine im Blick behalten.',
  meldungen: 'Meldung erfassen, an die zuständige Stelle leiten, Bearbeitung nachvollziehen.',
  praemien: 'Freiwilliges Prämiensystem — Punkte bei Aktionen, jederzeit einstellbar, Einlösung im jeweiligen Bereich.',
  politikbarometer:
    'Du legst fest, welche Themen dir wichtig sind — die App weist dich auf passende Abstimmungen hin und übernimmt relevante Termine in deinen Kalender.',
};

export function introOverlayFramingLine(id: IntroOverlayStepId, du: boolean): string {
  return du ? INTRO_OVERLAY_FRAMING_LINES_DU[id] : INTRO_OVERLAY_FRAMING_LINES_SIE[id];
}

/** @deprecated Verwenden Sie introOverlayFramingLine(id, du) — dies ist die Sie-Variante. */
export const INTRO_OVERLAY_FRAMING_LINES = INTRO_OVERLAY_FRAMING_LINES_SIE;
