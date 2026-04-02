/**
 * Texte für das Produkt-Intro (eID Demo Connect).
 * Form: Sie, sachlich, ohne unnötige Fach- oder Versuchsformulierungen in den Fließtexten.
 */

/** Einheitliche Hauptzeile auf allen vier Einführungsfolien. */
export const INTRO_OVERLAY_HEADLINE = 'eID Demo Connect im Überblick';

/** @deprecated Nutzen Sie INTRO_OVERLAY_HEADLINE; nur für ältere Imports. */
export const INTRO_OVERVIEW_SHORT_TITLE = INTRO_OVERLAY_HEADLINE;

/** @deprecated Nicht mehr im Intro verwendet. */
export function introOverlayKicker(_du: boolean): string {
  return INTRO_OVERLAY_HEADLINE;
}

export type IntroOverlayStepCopy = {
  id: 'abstimmen' | 'wahlen' | 'kalender' | 'meldungen' | 'praemien';
  /** z. B. „1) Abstimmen“ – Abschnittskennzeichnung unter der gemeinsamen Hauptzeile */
  title: string;
  /** Absätze durch Leerzeile (\\n\\n) getrennt */
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
      {
        n: 1,
        title: 'Pro & Contra',
        text: 'Die wichtigsten Argumente werden verständlich und ausgewogen aufbereitet.',
      },
      { n: 2, title: 'Clara', text: 'Neutrale Einordnung und verständliche Hintergründe auf Anfrage.' },
      {
        n: 3,
        title: 'Meinungsbild',
        text: 'Positionen können schnell und nachvollziehbar erfasst werden.',
      },
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
      {
        n: 3,
        title: 'Informationen',
        text: 'Programme und Kandidierendenprofile sind direkt abrufbar.',
      },
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
      {
        n: 3,
        title: 'Orientierung',
        text: 'Politische und kommunale Ereignisse schnell erfassen.',
      },
    ],
  },
  {
    id: 'meldungen',
    title: '4) Meldungen',
    body:
      'Unter „Meldungen“ erfassen Sie Hinweise, Mängel und Anliegen direkt für Ihre Kommune.\n\n' +
      'Sie wählen die passende Kategorie, ergänzen Ort, Beschreibung und Fotos und leiten Ihr Anliegen strukturiert an die zuständige Stelle weiter.',
    bullets: [
      {
        n: 1,
        title: 'Kategorie',
        text: 'Die Auswahl unterstützt die richtige Zuordnung in der Verwaltung.',
      },
      {
        n: 2,
        title: 'Nachverfolgung',
        text: 'Bearbeitungsstände bleiben transparent einsehbar.',
      },
      {
        n: 3,
        title: 'Kommune',
        text: 'Anliegen werden an die zuständige Stelle weitergeleitet.',
      },
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
];
