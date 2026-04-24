import { INTRO_WALKTHROUGH_CLARA } from '@/data/introWalkthroughClara';

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
export const INTRO_GLOBAL_FRAMING = 'Orientierung · Beteiligung · digitale Bürgernahe';

/** Label des globalen Pills. */
export const INTRO_GLOBAL_PILL_LABEL = 'Einführung';

/**
 * Clara stellt sich vor, erklärt das Einführungs-Overlay, dann fließt in Schritt 1 (Anrede) über
 * (Stimme = dieselbe freundliche Engine wie im Clara-Dock, nicht „blindes Vorlesen“).
 */
export const INTRO_CLARA_WELCOME_LINES_DU = [
  'Hallo, ich bin Clara, die KI-Agentin dieser App.',
  'Diese Einführung führt dich souverän durch die wichtigsten Bereiche. Am Ende wechselst du in die volle Anwendung.',
  'Mich erreichst du jederzeit über das Clara-Symbol am unteren Rand.',
] as const;

export const INTRO_CLARA_WELCOME_LINES_SIE = [
  'Hallo, ich bin Clara, die KI-Agentin dieser App.',
  'Diese Einführung führt Sie souverän durch die wichtigsten Bereiche. Am Ende wechseln Sie in die volle Anwendung.',
  'Mich erreichen Sie jederzeit über das Clara-Symbol am unteren Rand.',
] as const;

export function introClaraWelcomePlain(du: boolean): string {
  return (du ? INTRO_CLARA_WELCOME_LINES_DU : INTRO_CLARA_WELCOME_LINES_SIE).join(' ');
}

/**
 * Spoken-Texte (TTS) — getrennt von den sichtbaren `INTRO_CLARA_WELCOME_LINES_*` / Lead-ins.
 * Kurze Sätze, ein Gedanke pro Zeile, für segmentierte Wiedergabe.
 */
export const INTRO_SPOKEN_WELCOME_SEGMENTS_DU = [
  'Willkommen. Ich bin Clara, die KI-Agentin dieser App.',
  'Ich begleite dich durch die wichtigsten Bereiche.',
  'Orientierung, Beteiligung und leichte Navigation stehen im Mittelpunkt.',
  'Unten erreichst du mich jederzeit am lila Symbol.',
] as const;

export const INTRO_SPOKEN_WELCOME_SEGMENTS_SIE = [
  'Willkommen. Ich bin Clara, die KI-Agentin dieser App.',
  'Ich begleite Sie durch die wichtigsten Bereiche.',
  'Orientierung, Beteiligung und leichte Navigation stehen im Mittelpunkt.',
  'Unten erreichen Sie mich jederzeit am lila Symbol.',
] as const;

/**
 * @deprecated Ersetzt durch `INTRO_ELEVATOR_SPOKEN_SEGMENTS_*` + `INTRO_SPOKEN_ANREDE_FOLLOW_*` in `introAnredeGateSpokenParts`.
 * Nur noch für Legacy-Tests/Exports.
 */
export const INTRO_SPOKEN_ANREDE_CHOICE_DU: readonly string[] = [
  'Willkommen. Ich bin Clara und begleite dich durch die wichtigsten Bereiche der App.',
  'Bevor wir starten, legen wir kurz die Ansprache fest.',
  'Möchtest du lieber geduzt oder gesiezt werden?',
];
export const INTRO_SPOKEN_ANREDE_CHOICE_SIE: readonly string[] = [
  'Willkommen. Ich bin Clara und begleite Sie durch die wichtigsten Bereiche der App.',
  'Bevor wir starten, legen wir kurz die Ansprache fest.',
  'Möchten Sie lieber geduzt oder gesiezt werden?',
];
export const INTRO_SPOKEN_ANREDE_CHOICE_NEUTRAL: readonly string[] = [
  'Willkommen. Ich bin Clara und begleite Sie durch die wichtigsten Bereiche der App.',
  'Bevor wir starten, legen wir kurz die Ansprache fest.',
  'Bitte wählen Sie unten Ihre bevorzugte Ansprache.',
];

export const INTRO_SPOKEN_ANREDE_OPENING_DU: readonly string[] = [];
export const INTRO_SPOKEN_ANREDE_OPENING_SIE: readonly string[] = [];
export const INTRO_SPOKEN_ANREDE_OPENING_NEUTRAL: readonly string[] = [];

export const INTRO_ANREDE_UI_TITLE_DU = 'Wie möchtest du angesprochen werden?';
export const INTRO_ANREDE_UI_TITLE_SIE = 'Wie möchten Sie angesprochen werden?';

export const INTRO_ANREDE_SHORT_DU = 'Die App passt Ansprache und Begleitung an deine Wahl an.';
export const INTRO_ANREDE_SHORT_SIE = 'Die App passt Ansprache und Begleitung an Ihre Wahl an.';

export const INTRO_ANREDE_DROPDOWN_DU =
  'Wähle einmalig zwischen Du und Sie.\n\nClara, Texte und Hinweise richten sich in dieser Sitzung daran aus.';
export const INTRO_ANREDE_DROPDOWN_SIE =
  'Wählen Sie einmalig zwischen Du und Sie.\n\nClara, Texte und Hinweise richten sich in dieser Sitzung daran aus.';

export const INTRO_ANREDE_DROPDOWN_NEUTRAL = INTRO_ANREDE_DROPDOWN_SIE;

/**
 * 45-Sekunden-Elevator (TTS-segmentiert), danach Ansprache-Follow.
 * Du: Nutzerform. Sie: formelle Form.
 */
export const INTRO_ELEVATOR_SPOKEN_SEGMENTS_DU: readonly string[] = [
  'Willkommen bei eID Demo Connect.',
  'Hier wird politische Teilhabe neu gedacht. Informiert. KI-gestützt. Interaktiv.',
  'Du kannst aktuelle Themen nachvollziehen, politische Entwicklungen im Politikbarometer verfolgen und dich aktiv an Abstimmungen beteiligen.',
  'Außerdem findest du hier Wahlinformationen, Stimmzettel, Parteiprogramme, Ergebnisse aus dem Archiv und relevante Inhalte passend zu deinem Wohnort.',
  'Clara unterstützt dich mit verständlicher Einordnung, nachvollziehbaren Quellen und schneller Orientierung.',
  'So verbindet die App Information, Mitwirkung und digitale Perspektive an einem Ort.',
  'Ich zeige dir jetzt kurz die wichtigsten Bereiche.',
];

export const INTRO_ELEVATOR_SPOKEN_SEGMENTS_SIE: readonly string[] = [
  'Willkommen bei eID Demo Connect.',
  'Hier wird politische Teilhabe neu gedacht. Informiert. KI-gestützt. Interaktiv.',
  'Sie können aktuelle Themen nachvollziehen, politische Entwicklungen im Politikbarometer verfolgen und sich aktiv an Abstimmungen beteiligen.',
  'Außerdem finden Sie hier Wahlinformationen, Stimmzettel, Parteiprogramme, Ergebnisse aus dem Archiv und relevante Inhalte passend zu Ihrem Wohnort.',
  'Clara unterstützt Sie mit verständlicher Einordnung, nachvollziehbaren Quellen und schneller Orientierung.',
  'So verbindet die App Information, Mitwirkung und digitale Perspektive an einem Ort.',
  'Ich zeige Ihnen jetzt kurz die wichtigsten Bereiche.',
];

export const INTRO_SPOKEN_ANREDE_FOLLOW_DU: readonly string[] = [
  'Bevor wir starten, legen wir kurz die Ansprache fest.',
  'Möchtest du lieber geduzt oder gesiezt werden?',
];

export const INTRO_SPOKEN_ANREDE_FOLLOW_SIE: readonly string[] = [
  'Bevor wir starten, legen wir kurz die Ansprache fest.',
  'Möchten Sie lieber geduzt oder gesiezt werden?',
];

export const INTRO_SPOKEN_ANREDE_FOLLOW_NEUTRAL: readonly string[] = [
  'Bevor es weitergeht, wählen Sie unten Ihre bevorzugte Ansprache: Du oder Sie.',
];

export const INTRO_ANREDE_LEADIN_SIE =
  'Kurz die Orientierung, dann sind Sie in der App im gewünschten Modus.';
export const INTRO_ANREDE_LEADIN_DU = 'Kurz die Orientierung, dann bist du in der App im gewünschten Modus.';
export const INTRO_ANREDE_LEADIN_NEUTRAL =
  'Kurz die Orientierung, dann arbeiten Sie in der App im gewählten Modus.';

export const INTRO_ANREDE_SCREEN_LEAD_DU = INTRO_ANREDE_SHORT_DU;
export const INTRO_ANREDE_SCREEN_LEAD_SIE = INTRO_ANREDE_SHORT_SIE;

export const INTRO_ANREDE_QUESTION_DU = INTRO_ANREDE_SHORT_DU;
export const INTRO_ANREDE_QUESTION_SIE = INTRO_ANREDE_SHORT_SIE;

export const INTRO_ENTRY_UI_TITLE = 'Bereit für den Überblick?';

export const INTRO_ENTRY_SHORT_DU =
  'In weniger als einer Minute lernst du die wichtigsten Bereiche der App kennen.';
export const INTRO_ENTRY_SHORT_SIE =
  'In weniger als einer Minute lernen Sie die wichtigsten Bereiche der App kennen.';

export const INTRO_ENTRY_DROPDOWN_DU =
  'Ich zeige dir die zentralen Funktionen für Orientierung, Beteiligung und digitale Kommunikation — klar, schnell und ohne Umwege.';
export const INTRO_ENTRY_DROPDOWN_SIE =
  'Ich zeige Ihnen die zentralen Funktionen für Orientierung, Beteiligung und digitale Kommunikation — klar, schnell und ohne Umwege.';

export const INTRO_SPOKEN_ENTRY_DU: readonly string[] = [
  'Sehr gut.',
  'Ich gebe dir jetzt einen kompakten Überblick über die wichtigsten Bereiche.',
  'So siehst du sofort, wie Information, Beteiligung und digitale Interaktion hier zusammenfinden.',
  'Wenn du bereit bist, starten wir.',
];
export const INTRO_SPOKEN_ENTRY_SIE: readonly string[] = [
  'Sehr gut.',
  'Ich gebe Ihnen jetzt einen kompakten Überblick über die wichtigsten Bereiche.',
  'So sehen Sie sofort, wie Information, Beteiligung und digitale Interaktion hier zusammenfinden.',
  'Wenn Sie bereit sind, starten wir.',
];

/** @deprecated */ export const INTRO_ENTRY_LEAD_DU = INTRO_ENTRY_SHORT_DU;
/** @deprecated */ export const INTRO_ENTRY_LEAD_SIE = INTRO_ENTRY_SHORT_SIE;
export const INTRO_ENTRY_START = 'Einführung starten';
export const INTRO_ENTRY_DIRECT = 'Direkt zur App';

export const INTRO_EID_CARD_TITLE = 'Sicherer Zugang mit eID';

/** Kompakte Metazeile, wo noch eine Ultra-Kurzform gebraucht wird. */
export const INTRO_EID_ULTRA_SHORT =
  'Sichere Anmeldung, eindeutige Identität, Zuordnung zu Kommune oder Wahlbezirk.';

export const INTRO_EID_CARD_BODY_DU =
  'Mit der eID erkennt die App sicher, welcher Kommune oder welchem Wahlbezirk du zugeordnet bist.';

export const INTRO_EID_CARD_BODY_SIE =
  'Mit der eID erkennt die App sicher, welcher Kommune oder welchem Wahlbezirk Sie zugeordnet sind.';

/** Hinweis unter dem Kurztext (Du/Sie im Fließtext identisch vorgegeben). */
export const INTRO_EID_CARD_PRESENTATION_HINT =
  'Für diese Präsentation ist Kirkel als Beispielkommune vorausgewählt.';

/** @deprecated — Nutze `INTRO_EID_CARD_PRESENTATION_HINT`; Details-Text entfiel zugunsten der neuen eID-Struktur. */
export const INTRO_EID_CARD_DETAILS_DU = INTRO_EID_CARD_PRESENTATION_HINT;
/** @deprecated */
export const INTRO_EID_CARD_DETAILS_SIE = INTRO_EID_CARD_PRESENTATION_HINT;

export const INTRO_EID_CTA = 'Mit eID fortfahren';

/** @deprecated */ export const INTRO_EID_SPOKEN_MVP = '';

export const INTRO_SPOKEN_EID_SEGMENTS_DU: readonly string[] = [
  'Hier startet der sichere Zugang zur App.',
  'Mit der eID wird eindeutig erkannt, wer du bist und welcher Kommune oder welchem Wahlbezirk du zugeordnet bist.',
  'Für diese Präsentation ist Kirkel als Beispielkommune vorausgewählt.',
  'So werden dir genau die Abstimmungen, Wahlen, Termine und Meldungen angezeigt, für die du zur Teilnahme oder Beteiligung berechtigt bist.',
  'Du musst nichts manuell suchen oder auswählen. Die App führt dich direkt zu den Bereichen, in denen du mitwirken kannst.',
];
export const INTRO_SPOKEN_EID_SEGMENTS_SIE: readonly string[] = [
  'Hier startet der sichere Zugang zur App.',
  'Mit der eID wird eindeutig erkannt, wer Sie sind und welcher Kommune oder welchem Wahlbezirk Sie zugeordnet sind.',
  'Für diese Präsentation ist Kirkel als Beispielkommune vorausgewählt.',
  'So werden Ihnen genau die Abstimmungen, Wahlen, Termine und Meldungen angezeigt, für die Sie zur Teilnahme oder Beteiligung berechtigt sind.',
  'Sie müssen nichts manuell suchen oder auswählen. Die App führt Sie direkt zu den Bereichen, in denen Sie mitwirken können.',
];

export const INTRO_EID_FRAMING =
  'eID: sichere Anmeldung, eindeutige Identität, Zuordnung zu Kommune oder Wahlbezirk, autorisierte Bereiche.';

export const INTRO_EID_FRAMING_SHORT = 'Sicherer Zugang · eID-basiert';

/** Sichtbare Kurzfassung der Politikbarometer-Framing-Zeile.
 *  Ziel: Compliance-sensitive Sichtbarkeit des Nicht-Profiling-Claims,
 *  ohne die volle Satzlänge von INTRO_OVERLAY_FRAMING_LINES_SIE.politikbarometer. */
export const INTRO_POLITIKBAROMETER_FRAMING_SHORT =
  'Themen priorisieren für Hinweise & Termine — kein Profiling.';

export const INTRO_OUTRO_LABEL = 'Bereit für die App';

export const INTRO_OUTRO_SHORT_DU = 'Du kennst jetzt die wichtigsten Bereiche und kannst direkt weitergehen.';

export const INTRO_OUTRO_SHORT_SIE = 'Sie kennen jetzt die wichtigsten Bereiche und können direkt weitergehen.';

export const INTRO_OUTRO_DROPDOWN_DU =
  'Von hier aus kannst du die App selbst erkunden, Inhalte aufrufen und dich gezielt in den Bereichen bewegen, die für dich relevant sind.\n\nClara bleibt dabei weiterhin erreichbar, wenn du Orientierung oder zusätzliche Informationen brauchst.';

export const INTRO_OUTRO_DROPDOWN_SIE =
  'Von hier aus können Sie die App selbst erkunden, Inhalte aufrufen und sich gezielt in den Bereichen bewegen, die für Sie relevant sind.\n\nClara bleibt dabei weiterhin erreichbar, wenn Sie Orientierung oder zusätzliche Informationen brauchen.';

export const INTRO_CLOSING_TEXT_SIE = `${INTRO_OUTRO_SHORT_SIE}\n\n${INTRO_OUTRO_DROPDOWN_SIE.split('\n\n')[0]}`;
export const INTRO_CLOSING_TEXT_DU = `${INTRO_OUTRO_SHORT_DU}\n\n${INTRO_OUTRO_DROPDOWN_DU.split('\n\n')[0]}`;

export const INTRO_CLOSING_SPOKEN_SEGMENTS_SIE: readonly string[] = [
  'Damit haben Sie einen kompakten Überblick über die wichtigsten Bereiche erhalten.',
  'Sie können die App jetzt direkt selbst nutzen und sich gezielt weiter vertiefen.',
  'Wenn Sie Unterstützung brauchen, bin ich weiterhin für Sie da.',
];
export const INTRO_CLOSING_SPOKEN_SEGMENTS_DU: readonly string[] = [
  'Damit hast du einen kompakten Überblick über die wichtigsten Bereiche erhalten.',
  'Du kannst die App jetzt direkt selbst nutzen und dich gezielt weiter vertiefen.',
  'Wenn du Unterstützung brauchst, bin ich weiterhin für dich da.',
];

/** Letzter Walkthrough-Schritt (Politikbarometer): bewusst nur zwei Wörter — kein „Einführung beenden & …“. */
export const INTRO_FINISH_CTA_LABEL = 'App starten';

/** Skip-Link-Label (nur im Walkthrough sichtbar). */
export const INTRO_SKIP_LABEL = 'Einführung überspringen';

/* Früheres Opt-in-Gate (zusätzliche Folie) wurde bewusst weggelassen: Begrüßung und
   Schritte 1–2 führen direkt, danach startet der Walkthrough (3–8). */

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
    title: 'Abstimmen',
    body: INTRO_WALKTHROUGH_CLARA.abstimmen.longSie,
    bullets: [
      { n: 1, title: 'Beteiligung', text: 'Strukturierte Wahl, Klartext-Orientierung.' },
      { n: 2, title: 'Kontext', text: 'Clara und vertiefende Inhalte im Ablauf.' },
      { n: 3, title: 'Prämien', text: 'Optional, transparent integriert.' },
    ],
  },
  {
    id: 'wahlen',
    title: 'Wahlen',
    body: INTRO_WALKTHROUGH_CLARA.wahlen.longSie,
    bullets: [
      { n: 1, title: 'Zugang', text: 'Wahlinformationen klar geordnet.' },
      { n: 2, title: 'Tiefe', text: 'Programme, Kandidatinnen, Stimmzettel an einem Ort.' },
      { n: 3, title: 'Ergebnisse', text: 'Wo vorgesehen, einsehbar und einordnbar.' },
    ],
  },
  {
    id: 'kalender',
    title: 'Kalender',
    body: INTRO_WALKTHROUGH_CLARA.kalender.longSie,
    bullets: [
      { n: 1, title: 'Bündelung', text: 'Termine und Fristen im Verlauf.' },
      { n: 2, title: 'Planung', text: 'Rechtzeitig handeln.' },
      { n: 3, title: 'Klarheit', text: 'Weniger Suchen, mehr Orientierung.' },
    ],
  },
  {
    id: 'meldungen',
    title: 'Meldungen',
    body: INTRO_WALKTHROUGH_CLARA.meldungen.longSie,
    bullets: [
      { n: 1, title: 'Erfassung', text: 'Strukturiert und zielgerichtet.' },
      { n: 2, title: 'Prozess', text: 'Nachvollziehbare Weitergabe.' },
      { n: 3, title: 'Service', text: 'Kommunikation transparenter.' },
    ],
  },
  {
    id: 'praemien',
    title: 'Prämien',
    body: INTRO_WALKTHROUGH_CLARA.praemien.longSie,
    bullets: [
      { n: 1, title: 'Optional', text: 'Freiwillig aktivierbar.' },
      { n: 2, title: 'Anerkennung', text: 'Sichtbar, ohne Überfrachtung.' },
      { n: 3, title: 'Kontrolle', text: 'Jederzeit steuerbar.' },
    ],
  },
  {
    id: 'politikbarometer',
    title: 'Politikbarometer',
    body: INTRO_WALKTHROUGH_CLARA.politikbarometer.longSie,
    bullets: [
      { n: 1, title: 'Überblick', text: 'Tendenzen schneller erfassen.' },
      { n: 2, title: 'Kontext', text: 'Zusammenhänge sichtbar machen.' },
      { n: 3, title: 'Freiwillig', text: 'Kein Profiling im Werbesinne.' },
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
    'Aktuelle Themen, klare Stimmabgabe, Kontext per Clara – Beteiligung leicht zugänglich.',
  wahlen:
    'Wahlen und Informationen bündig: Stimmzettel, Programme, Kandidatinnen, Ergebnisse – wo vorgesehen.',
  kalender: 'Termine, Fristen, Beteiligung – im zeitlichen Verlauf geordnet.',
  meldungen: 'Anliegen strukturiert; Weitergabe geordnet und nachvollziehbar.',
  praemien: 'Optionale Anerkennung von Beteiligung – freiwillig, transparent, integriert.',
  politikbarometer: 'Makrotrends und Schwerpunkte schneller erkennbar; freiwillig, ohne Werbe-Profiling.',
};

export const INTRO_OVERLAY_FRAMING_LINES_DU: Record<IntroOverlayStepId, string> = {
  abstimmen:
    'Aktuelle Themen, klare Stimmabgabe, Kontext per Clara – Beteiligung leicht zugänglich.',
  wahlen:
    'Wahlen und Informationen bündig: Stimmzettel, Programme, Kandidatinnen, Ergebnisse – wo vorgesehen.',
  kalender: 'Termine, Fristen, Beteiligung – im zeitlichen Verlauf geordnet.',
  meldungen: 'Anliegen strukturiert; Weitergabe geordnet und nachvollziehbar.',
  praemien: 'Optionale Anerkennung von Beteiligung – freiwillig, transparent, integriert.',
  politikbarometer: 'Makrotrends und Schwerpunkte schneller erkennbar; freiwillig, ohne Werbe-Profiling.',
};

export function introOverlayFramingLine(id: IntroOverlayStepId, du: boolean): string {
  return du ? INTRO_OVERLAY_FRAMING_LINES_DU[id] : INTRO_OVERLAY_FRAMING_LINES_SIE[id];
}

/** @deprecated Verwenden Sie introOverlayFramingLine(id, du) — dies ist die Sie-Variante. */
export const INTRO_OVERLAY_FRAMING_LINES = INTRO_OVERLAY_FRAMING_LINES_SIE;
