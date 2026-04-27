import { INTRO_WALKTHROUGH_CLARA } from '@/data/introWalkthroughClara';

/**
 * Texte für die Einführung (HookAI Civic Demo).
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
export const INTRO_OVERLAY_HEADLINE = 'HookAI Civic Demo im Überblick';

/** Gesamtzahl der Einführungs-Schritte (Anrede + eID + 6 Walkthrough-Schritte). */
export const INTRO_TOTAL_STEPS = 8;

/** Globale Kicker-Zeile (Legacy; aktuell ungenutzt — Zugangsscreen nutzt `INTRO_ACCESS_SCREEN_TAGLINE`). */
export const INTRO_GLOBAL_FRAMING = 'Digitale Identität · Beteiligung · Bürgerzugang';

/** Untertitel auf dem Zugangsscreen (Schritt 2, eID / Wallet / Demo) — eine Quelle für Desktop und Mobile. */
export const INTRO_ACCESS_SCREEN_TAGLINE = 'Digitale Identität · Zuständigkeit · Beteiligung';

/** Label des globalen Pills. */
export const INTRO_GLOBAL_PILL_LABEL = 'Einführung';

/**
 * Clara stellt sich vor, erklärt das Einführungs-Overlay, dann fließt in Schritt 1 (Anrede) über
 * (Stimme = dieselbe freundliche Engine wie im Clara-Dock, nicht „blindes Vorlesen“).
 */
export const INTRO_CLARA_WELCOME_LINES_DU = [
  'Hallo, ich bin Clara, die KI-Agentin der HookAI Civic Demo.',
  'Diese Einführung führt dich souverän durch die wichtigsten Bereiche. Am Ende wechselst du in die volle Anwendung.',
  'Mich erreichst du jederzeit über das Clara-Symbol am unteren Rand.',
] as const;

export const INTRO_CLARA_WELCOME_LINES_SIE = [
  'Hallo, ich bin Clara, die KI-Agentin der HookAI Civic Demo.',
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
  'Willkommen. Ich bin Clara, die KI-Agentin der HookAI Civic Demo.',
  'Ich begleite dich durch die wichtigsten Bereiche.',
  'Orientierung, Beteiligung und leichte Navigation stehen im Mittelpunkt.',
  'Unten erreichst du mich jederzeit am lila Symbol.',
] as const;

export const INTRO_SPOKEN_WELCOME_SEGMENTS_SIE = [
  'Willkommen. Ich bin Clara, die KI-Agentin der HookAI Civic Demo.',
  'Ich begleite Sie durch die wichtigsten Bereiche.',
  'Orientierung, Beteiligung und leichte Navigation stehen im Mittelpunkt.',
  'Unten erreichen Sie mich jederzeit am lila Symbol.',
] as const;

/**
 * @deprecated Alte Anrede-TTS; Anrede-Gate nutzt `INTRO_ANREDE_GATE_*_SPOKEN_SEGMENTS` in `introAnredeGateSpokenParts`.
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

export const INTRO_ANREDE_SHORT_DU =
  'Ich führe dich kurz durch die HookAI Civic Demo: sicherer Bürgerzugang, Orientierung und digitale Beteiligung.';
export const INTRO_ANREDE_SHORT_SIE =
  'Ich führe Sie kurz durch die HookAI Civic Demo: sicherer Bürgerzugang, Orientierung und digitale Beteiligung.';

export const INTRO_ANREDE_DROPDOWN_DU =
  'Wähle einmalig zwischen Du und Sie.\n\nClara, Texte und Hinweise richten sich in dieser Sitzung daran aus.';
export const INTRO_ANREDE_DROPDOWN_SIE =
  'Wählen Sie einmalig zwischen Du und Sie.\n\nClara, Texte und Hinweise richten sich in dieser Sitzung daran aus.';

export const INTRO_ANREDE_DROPDOWN_NEUTRAL = INTRO_ANREDE_DROPDOWN_SIE;

/** Clara vor Anredewahl (TTS). */
export const INTRO_ANREDE_GATE_PRE_CHOICE_SPOKEN_SEGMENTS: readonly string[] = [
  'Willkommen in der HookAI Civic Demo.',
  'Ich bin Clara, die neutrale KI-Assistentin dieser Anwendung.',
  'Ich begleite Sie gleich durch die wichtigsten Bereiche und erkläre Schritt für Schritt, was zu sehen ist.',
  'Bevor wir starten, wählen Sie bitte, ob wir per Du oder per Sie weitermachen.',
];

/** Clara nach Auswahl „Du“ (TTS, ohne erneuten Elevator). */
export const INTRO_ANREDE_GATE_AFTER_DU_SPOKEN_SEGMENTS: readonly string[] = [
  'Sehr gut, dann sind wir per Du.',
  'Ich führe dich jetzt kurz durch die HookAI Civic Demo.',
  'Dabei zeige ich dir, wie sicherer Bürgerzugang, Orientierung und digitale Beteiligung zusammenspielen.',
  'Wichtig ist: Diese Demo gibt keine politische Empfehlung. Sie soll verständlich zeigen, wie Beteiligung künftig einfacher, sicherer und nachvollziehbarer funktionieren kann.',
];

/** Clara nach Auswahl „Sie“ (TTS). */
export const INTRO_ANREDE_GATE_AFTER_SIE_SPOKEN_SEGMENTS: readonly string[] = [
  'Sehr gut, dann bleiben wir beim Sie.',
  'Ich führe Sie jetzt kurz durch die HookAI Civic Demo.',
  'Dabei zeige ich Ihnen, wie sicherer Bürgerzugang, Orientierung und digitale Beteiligung zusammenspielen.',
  'Wichtig ist: Diese Demo gibt keine politische Empfehlung. Sie soll verständlich zeigen, wie Beteiligung künftig einfacher, sicherer und nachvollziehbarer funktionieren kann.',
];

/**
 * @deprecated Anrede-Gate nutzt `INTRO_ANREDE_GATE_*_SPOKEN_SEGMENTS` in `introAnredeGateSpokenParts`.
 * Beibehalten für ältere Imports.
 */
export const INTRO_ELEVATOR_SPOKEN_SEGMENTS_DU = INTRO_ANREDE_GATE_AFTER_DU_SPOKEN_SEGMENTS;
/** @deprecated */
export const INTRO_ELEVATOR_SPOKEN_SEGMENTS_SIE = INTRO_ANREDE_GATE_AFTER_SIE_SPOKEN_SEGMENTS;

/** @deprecated */
export const INTRO_SPOKEN_ANREDE_FOLLOW_DU: readonly string[] = [];
/** @deprecated */
export const INTRO_SPOKEN_ANREDE_FOLLOW_SIE: readonly string[] = [];
/** @deprecated */
export const INTRO_SPOKEN_ANREDE_FOLLOW_NEUTRAL: readonly string[] = [];

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
/** Antwort auf „Bereit für den Überblick?“ — explizit als Ja wählbar. */
export const INTRO_ENTRY_START = 'Ja, Einführung starten';
export const INTRO_ENTRY_DIRECT = 'Direkt zur App';

export const INTRO_EID_CARD_TITLE = 'Mit eID anmelden';

/** Statuszeile auf der eID-Zugangskarte (Demo). */
export const INTRO_EID_CARD_STATUS = 'Heute verfügbar / Demo-Zugang';

/** Kompakte Metazeile, wo noch eine Ultra-Kurzform gebraucht wird. */
export const INTRO_EID_ULTRA_SHORT =
  'Sichere Anmeldung, eindeutige Identität, Zuordnung zu Kommune oder Wahlbezirk.';

export const INTRO_EID_CARD_BODY_DU =
  'Für diese Demo wird der sichere Zugang beispielhaft über die Online-Ausweisfunktion dargestellt.';

export const INTRO_EID_CARD_BODY_SIE =
  'Für diese Demo wird der sichere Zugang beispielhaft über die Online-Ausweisfunktion dargestellt.';

/** @deprecated Nutze `INTRO_EID_CARD_STATUS`; früherer Kurzhinweis unter dem eID-Fließtext. */
export const INTRO_EID_CARD_PRESENTATION_HINT =
  'Konzeptionelle Darstellung für den heutigen Zugangspfad.';

/** @deprecated — Nutze `INTRO_EID_CARD_PRESENTATION_HINT`; Details-Text entfiel zugunsten der neuen eID-Struktur. */
export const INTRO_EID_CARD_DETAILS_DU = INTRO_EID_CARD_PRESENTATION_HINT;
/** @deprecated */
export const INTRO_EID_CARD_DETAILS_SIE = INTRO_EID_CARD_PRESENTATION_HINT;

export const INTRO_EID_CTA = 'Mit eID fortfahren';

export const INTRO_WALLET_CARD_TITLE = 'EU Digital Identity Wallet';
/** Kleines Label unter dem visuellen Platzhalter (kein offizielles Produktlogo). */
export const INTRO_WALLET_KONZEPTION_LABEL = 'Konzeptionelle Darstellung';
export const INTRO_WALLET_CARD_BODY =
  'Künftig kann der Bürgerzugang auch über die EU Digital Identity Wallet erfolgen. Damit könnten Bürgerinnen und Bürger Identität und Nachweise kontrolliert teilen — freiwillig, datensparsam und europaweit anschlussfähig an künftige EUDI-Wallet-Infrastrukturen.';
export const INTRO_WALLET_CTA = 'EU Wallet ansehen';
export const INTRO_WALLET_BADGE = 'Konzeptionell · noch keine produktive Integration';
export const INTRO_WALLET_INFO_TEXT =
  'Die EU Digital Identity Wallet soll digitale Ausweise und Nachweise auf das Smartphone bringen. Bürgerinnen und Bürger sollen selbst kontrollieren können, welche Daten sie für welchen Zweck freigeben.\n\nFür diese Demo bedeutet das: Der Bürgerzugang wird heute beispielhaft über eID dargestellt, kann perspektivisch aber wallet-fähig gedacht werden.';
export const INTRO_WALLET_INFO_HINT = 'Konzeptionelle Darstellung · keine produktive Wallet-Integration';

/** Dezente Prozesszeile unter der EU-Wallet-Karte (nur Demo / Konzeption). */
export const INTRO_WALLET_PROCESS_STEPS: readonly string[] = [
  'Wallet öffnen',
  'Datenfreigabe prüfen',
  'Zuständigkeit bestätigen',
  'Beteiligungen anzeigen',
];

export const INTRO_DEMO_MODE_TITLE = 'Demo ohne echte Identifikation starten';
export const INTRO_DEMO_MODE_BODY =
  'Zur Präsentation werden Beispielidentität und Demo-Daten verwendet.';
export const INTRO_DEMO_MODE_CTA = 'Demo-Modus starten';

export const INTRO_TRUST_HINT_DU =
  'Deine digitale Identität dient nur zur Prüfung von Zuständigkeit und Berechtigung. Politische Meinung, Clara-Fragen oder Abstimmungsverhalten werden daraus nicht abgeleitet.';
export const INTRO_TRUST_HINT_SIE =
  'Die digitale Identität dient nur zur Prüfung von Zuständigkeit und Berechtigung. Politische Meinung, Clara-Fragen oder Abstimmungsverhalten werden daraus nicht abgeleitet.';

/** Kurzer Vertrauens-Kicker auf dem Zugangsscreen (unter den Pfaden). */
export const INTRO_ZUGANG_TRUST_KURZ = 'Heute eID · perspektivisch EU Wallet · freiwillige Datenfreigabe';

/** Clara-Panel auf dem Zugangsscreen (sichtbar). */
export const INTRO_ACCESS_CLARA_PANEL_SHORT_DU =
  'Willkommen in der HookAI Civic Demo. Hier wählst du, wie du die Anwendung betreten möchtest: beispielhaft über eID, über den Demo-Modus oder mit einem Blick auf die künftige EU Digital Identity Wallet.';
export const INTRO_ACCESS_CLARA_PANEL_SHORT_SIE =
  'Willkommen in der HookAI Civic Demo. Hier wählen Sie, wie Sie die Anwendung betreten möchten: beispielhaft über eID, über den Demo-Modus oder mit einem Blick auf die künftige EU Digital Identity Wallet.';
export const INTRO_ACCESS_CLARA_PANEL_HINT_DU =
  'Über den Lautsprecher erklärt Clara den Zugang Schritt für Schritt.';
export const INTRO_ACCESS_CLARA_PANEL_HINT_SIE =
  'Über den Lautsprecher erklärt Clara den Zugang Schritt für Schritt.';

export const INTRO_ACCESS_CONFIRMED_TITLE = 'Zugang bestätigt';
export const INTRO_ACCESS_CONFIRMED_LEVELS = 'Zuständige Ebenen erkannt: Kirkel · Saarland · Bund';
export const INTRO_ACCESS_CONFIRMED_BODY = 'Relevante Beteiligungen und Termine werden geladen.';

/** @deprecated */ export const INTRO_EID_SPOKEN_MVP = '';

export const INTRO_SPOKEN_EID_SEGMENTS_DU: readonly string[] = [
  'Hier beginnt dein sicherer Bürgerzugang.',
  'In dieser Demo wird der Einstieg beispielhaft über die eID gezeigt. Perspektivisch kann ein solcher Zugang auch über die EU Digital Identity Wallet erfolgen.',
  'Das bedeutet: Du könntest dich künftig digital ausweisen und bestimmte Nachweise kontrolliert teilen — zum Beispiel Wohnort, Kommune oder Teilnahmeberechtigung.',
  'Wichtig ist: Es geht nicht darum, ein politisches Profil zu erstellen. Deine digitale Identität dient nur dazu, Zuständigkeiten und Berechtigungen sicher zu prüfen.',
  'Du entscheidest, welche Daten freigegeben werden. Die HookAI Civic Demo soll nur die Informationen nutzen, die für den jeweiligen Bürgerdienst wirklich erforderlich sind.',
];
export const INTRO_SPOKEN_EID_SEGMENTS_SIE: readonly string[] = [
  'Hier beginnt Ihr sicherer Bürgerzugang.',
  'In dieser Demo wird der Einstieg beispielhaft über die eID gezeigt. Perspektivisch kann ein solcher Zugang auch über die EU Digital Identity Wallet erfolgen.',
  'Das bedeutet: Sie könnten sich künftig digital ausweisen und bestimmte Nachweise kontrolliert teilen — zum Beispiel Wohnort, Kommune oder Teilnahmeberechtigung.',
  'Wichtig ist: Es geht nicht darum, ein politisches Profil zu erstellen. Ihre digitale Identität dient nur dazu, Zuständigkeiten und Berechtigungen sicher zu prüfen.',
  'Sie entscheiden, welche Daten freigegeben werden. Die HookAI Civic Demo soll nur die Informationen nutzen, die für den jeweiligen Bürgerdienst wirklich erforderlich sind.',
];

export const INTRO_EID_FRAMING =
  'eID: sichere Anmeldung, eindeutige Identität, Zuordnung zu Kommune oder Wahlbezirk, autorisierte Bereiche.';

export const INTRO_EID_FRAMING_SHORT = 'Heute eID · perspektivisch EU Wallet';

/** Sichtbare Kurzfassung der Politikbarometer-Framing-Zeile.
 *  Ziel: Compliance-sensitive Sichtbarkeit des Nicht-Profiling-Claims,
 *  ohne die volle Satzlänge von INTRO_OVERLAY_FRAMING_LINES_SIE.politikbarometer. */
export const INTRO_POLITIKBAROMETER_FRAMING_SHORT =
  'Interessenschwerpunkte für Kalender-Hervorhebung — keine Empfehlung';

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
  'Das war der kurze Überblick.',
  'Sie können die HookAI Civic Demo jetzt selbst erkunden oder Clara gezielt Fragen stellen.',
  'Ich antworte neutral, verständlich und nur auf das, was Sie wissen möchten.',
];
export const INTRO_CLOSING_SPOKEN_SEGMENTS_DU: readonly string[] = [
  'Das war der kurze Überblick.',
  'Du kannst die HookAI Civic Demo jetzt selbst erkunden oder Clara gezielt Fragen stellen.',
  'Ich antworte neutral, verständlich und nur auf das, was du wissen möchtest.',
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
      { n: 1, title: 'Einordnung', text: 'Pro, Contra und neutraler Kontext sichtbar.' },
      { n: 2, title: 'Transparenz', text: 'Keine Empfehlung, nur Orientierung.' },
      { n: 3, title: 'Mitwirkung', text: 'Informierte Beteiligung.' },
    ],
  },
  {
    id: 'wahlen',
    title: 'Wahlen',
    body: INTRO_WALKTHROUGH_CLARA.wahlen.longSie,
    bullets: [
      { n: 1, title: 'Struktur', text: 'Wahlinformationen geordnet.' },
      { n: 2, title: 'Tiefe', text: 'Stimmzettel, Programme, Kandidierende an einem Ort.' },
      { n: 3, title: 'Neutralität', text: 'Keine Wahlempfehlung durch die App.' },
    ],
  },
  {
    id: 'kalender',
    title: 'Kalender',
    body: INTRO_WALKTHROUGH_CLARA.kalender.longSie,
    bullets: [
      { n: 1, title: 'Überblick', text: 'Termine und Fristen gebündelt.' },
      { n: 2, title: 'Relevanz', text: 'Optional thematische Hervorhebung.' },
      { n: 3, title: 'Klarheit', text: 'Keine politische Empfehlung.' },
    ],
  },
  {
    id: 'meldungen',
    title: 'Meldungen',
    body: INTRO_WALKTHROUGH_CLARA.meldungen.longSie,
    bullets: [
      { n: 1, title: 'Erfassung', text: 'Strukturiert und nachvollziehbar.' },
      { n: 2, title: 'Weitergabe', text: 'Zuständigkeitsnah.' },
      { n: 3, title: 'Service', text: 'Klarere Bürgerkommunikation.' },
    ],
  },
  {
    id: 'praemien',
    title: 'Im Überblick · Prämien',
    body: INTRO_WALKTHROUGH_CLARA.praemien.longSie,
    bullets: [
      { n: 1, title: 'Freiwillig', text: 'Prämien nur mit ausdrücklicher Einwilligung.' },
      { n: 2, title: 'Unabhängig', text: 'Nicht von Zustimmung, Ablehnung oder Enthaltung abhängig.' },
      { n: 3, title: 'Nachvollziehbar', text: 'Begründung über abgeschlossene Beteiligung oder Rückmeldung.' },
    ],
  },
  {
    id: 'politikbarometer',
    title: 'Politikbarometer',
    body: INTRO_WALKTHROUGH_CLARA.politikbarometer.longSie,
    bullets: [
      { n: 1, title: 'Themenkompass', text: 'Selbst gewählte Interessenschwerpunkte.' },
      { n: 2, title: 'Kalender', text: 'Thematische Hervorhebung möglich.' },
      { n: 3, title: 'Privatheit', text: 'Keine Ableitung aus Verhalten.' },
    ],
  },
];

/**
 * Eine kurze Framing-Zeile pro Walkthrough-Screen – erscheint als Meta-Ebene
 * in der Overlay-Chrome, nicht als Screen-Content.
 * Abstimmen & Politikbarometer: getrennte Du/Sie-Varianten; übrige Schritte neutral.
 */
export const INTRO_OVERLAY_FRAMING_LINES_SIE: Record<IntroOverlayStepId, string> = {
  abstimmen: 'Pro und Contra sichtbar – Orientierung ohne Empfehlung.',
  wahlen: 'Wahlinformationen gebündelt – ohne Wahlempfehlung.',
  kalender: 'Termine und Fristen – optional thematisch hervorgehoben.',
  meldungen: 'Anliegen strukturiert und nachvollziehbar weitergeben.',
  praemien: 'Prämien nur nach Einwilligung – unabhängig von Ihrer Abstimmungsentscheidung.',
  politikbarometer: 'Interessenschwerpunkte für Kalender-Relevanz – freiwillig, neutral.',
};

export const INTRO_OVERLAY_FRAMING_LINES_DU: Record<IntroOverlayStepId, string> = {
  abstimmen: 'Pro und Contra sichtbar – Orientierung ohne Empfehlung.',
  wahlen: 'Wahlinformationen gebündelt – ohne Wahlempfehlung.',
  kalender: 'Termine und Fristen – optional thematisch hervorgehoben.',
  meldungen: 'Anliegen strukturiert und nachvollziehbar weitergeben.',
  praemien: 'Prämien nur nach Einwilligung – unabhängig von deiner Abstimmungsentscheidung.',
  politikbarometer: 'Interessenschwerpunkte für Kalender-Relevanz – freiwillig, neutral.',
};

export function introOverlayFramingLine(id: IntroOverlayStepId, du: boolean): string {
  return du ? INTRO_OVERLAY_FRAMING_LINES_DU[id] : INTRO_OVERLAY_FRAMING_LINES_SIE[id];
}

/** @deprecated Verwenden Sie introOverlayFramingLine(id, du) — dies ist die Sie-Variante. */
export const INTRO_OVERLAY_FRAMING_LINES = INTRO_OVERLAY_FRAMING_LINES_SIE;
