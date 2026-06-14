import { INTRO_WALKTHROUGH_CLARA } from '@/data/introWalkthroughClara';

/**
 * Texte für die Einführung (HookAI Civic).
 *
 * Framing-Prinzipien (State Clarity):
 * - Die gesamte Einführung: Anrede + 11 Walkthrough-Szenen (Intro … Ökosystem).
 * - Ein globaler „EINFÜHRUNG"-Pill steht auf allen Screens als Meta-Ebene.
 * - Pro Schritt genau eine Framing-Zeile (Meta), NIE im Screen-Inhalt selbst.
 * - Wording: „So …" statt „Jetzt …" – signalisiert Vorschau statt Live-Aktion.
 * - Politikbarometer: nicht „Interessen"/„Profiling" – sondern Themenwahl, die
 *   Hinweise auf Abstimmungen und Termine im Kalender auslöst.
 */

/** Einheitliche Hauptzeile auf allen Walkthrough-Folien. */
export const INTRO_OVERLAY_HEADLINE = 'HookAI Civic im Überblick';

/** Gesamtzahl der Einführungs-Schritte — wird nach INTRO_OVERLAY_STEPS gesetzt. */

/** Globale Kicker-Zeile (Legacy; aktuell ungenutzt — Zugangsscreen nutzt `INTRO_ACCESS_SCREEN_TAGLINE`). */
export const INTRO_GLOBAL_FRAMING = 'Digitale Identität · Beteiligung · Bürgerzugang';

/** Untertitel auf dem Zugangsscreen (Schritt 2, eID / Wallet / Vorschau) — eine Quelle für Desktop und Mobile. */
export const INTRO_ACCESS_SCREEN_TAGLINE = 'Digitale Identität · Zuständigkeit · Beteiligung';

/** Label des globalen Pills. */
export const INTRO_GLOBAL_PILL_LABEL = 'Einführung';

/**
 * Clara stellt sich vor (Wegweiser-first), erklärt das Einführungs-Overlay, dann Anrede-Gate.
 * Stimme = dieselbe Engine wie im Clara-Dock; TTS segmentiert in `INTRO_SPOKEN_WELCOME_*`.
 */
export const INTRO_CLARA_WELCOME_LINES_DU = [
  'Willkommen bei HookAI Civic. Ich bin Clara.',
  'Diese App soll Verwaltung verständlicher machen. Nicht, indem sie Behörden ersetzt — sondern indem sie dir zeigt, was relevant ist, welche Schritte anstehen und welche Informationen du vorbereiten kannst.',
  'Wir starten mit dem Wegweiser. Dort kannst du freiwillig ein kurzes Profil mit Stammdaten anlegen — zum Beispiel Wohnort, Haushaltssituation oder eine aktuelle Lebenslage. Daraus entsteht keine Bewertung und kein automatischer Bescheid. Deine Angaben helfen nur dabei, Informationen besser zu sortieren.',
  'Der Wegweiser zeigt dir dann, welche Stelle zuständig sein könnte, welche Unterlagen du wahrscheinlich brauchst und welcher nächste Schritt sinnvoll ist. So wird aus einem unübersichtlichen Behördengang ein klarer Ablauf.',
  'Danach zeige ich dir die weiteren Bereiche: Abstimmungen für kommunale Themen, Meldungen an die Gemeinde, den Kalender für Fristen und Beteiligungen, das Postfach für verifizierte Behördenkommunikation und die Einstellungen für dein Profil.',
  'Wichtig: Ich erkläre, strukturiere und verweise auf passende Informationen. Ich entscheide nicht, ich bewerte dich nicht und ich ersetze keine Beratung durch die zuständige Stelle.',
  'Unten erreichst du mich jederzeit am lila Clara-Symbol.',
] as const;

export const INTRO_CLARA_WELCOME_LINES_SIE = [
  'Willkommen bei HookAI Civic. Ich bin Clara.',
  'Diese App soll Verwaltung verständlicher machen. Nicht, indem sie Behörden ersetzt — sondern indem sie Ihnen zeigt, was relevant ist, welche Schritte anstehen und welche Informationen Sie vorbereiten können.',
  'Wir starten mit dem Wegweiser. Dort können Sie freiwillig ein kurzes Profil mit Stammdaten anlegen — zum Beispiel Wohnort, Haushaltssituation oder eine aktuelle Lebenslage. Daraus entsteht keine Bewertung und kein automatischer Bescheid. Ihre Angaben helfen nur dabei, Informationen besser zu sortieren.',
  'Der Wegweiser zeigt Ihnen dann, welche Stelle zuständig sein könnte, welche Unterlagen Sie wahrscheinlich brauchen und welcher nächste Schritt sinnvoll ist. So wird aus einem unübersichtlichen Behördengang ein klarer Ablauf.',
  'Danach zeige ich Ihnen die weiteren Bereiche: Abstimmungen für kommunale Themen, Meldungen an die Gemeinde, den Kalender für Fristen und Beteiligungen, das Postfach für verifizierte Behördenkommunikation und die Einstellungen für Ihr Profil.',
  'Wichtig: Ich erkläre, strukturiere und verweise auf passende Informationen. Ich entscheide nicht, ich bewerte Sie nicht und ich ersetze keine Beratung durch die zuständige Stelle.',
  'Unten erreichen Sie mich jederzeit am lila Clara-Symbol.',
] as const;

export function introClaraWelcomePlain(du: boolean): string {
  return (du ? INTRO_CLARA_WELCOME_LINES_DU : INTRO_CLARA_WELCOME_LINES_SIE).join(' ');
}

/** Kompakter Einstieg im Clara-Panel (erste zwei Absätze). */
export function introClaraWelcomeShort(du: boolean): string {
  const lines = du ? INTRO_CLARA_WELCOME_LINES_DU : INTRO_CLARA_WELCOME_LINES_SIE;
  return `${lines[0]}\n\n${lines[1]}`;
}

/** Ausklappbarer Rest im Clara-Panel. */
export function introClaraWelcomeLong(du: boolean): string {
  const lines = du ? INTRO_CLARA_WELCOME_LINES_DU : INTRO_CLARA_WELCOME_LINES_SIE;
  return lines.slice(2).join('\n\n');
}

/**
 * Spoken-Texte (TTS) — getrennt von den sichtbaren `INTRO_CLARA_WELCOME_LINES_*`.
 * Kurze Sätze, ein Gedanke pro Zeile, für segmentierte Wiedergabe.
 */
export const INTRO_SPOKEN_WELCOME_SEGMENTS_DU = [
  'Willkommen bei HookAI Civic. Ich bin Clara.',
  'Diese App soll Verwaltung verständlicher machen — nicht, indem sie Behörden ersetzt, sondern indem sie dir zeigt, was relevant ist, welche Schritte anstehen und welche Informationen du vorbereiten kannst.',
  'Wir starten mit dem Wegweiser. Dort kannst du freiwillig ein kurzes Profil mit Stammdaten anlegen — zum Beispiel Wohnort, Haushaltssituation oder eine aktuelle Lebenslage.',
  'Daraus entsteht keine Bewertung und kein automatischer Bescheid. Deine Angaben helfen nur dabei, Informationen besser zu sortieren.',
  'Der Wegweiser zeigt dir dann, welche Stelle zuständig sein könnte, welche Unterlagen du wahrscheinlich brauchst und welcher nächste Schritt sinnvoll ist.',
  'So wird aus einem unübersichtlichen Behördengang ein klarer Ablauf.',
  'Danach zeige ich dir die weiteren Bereiche: Abstimmungen für kommunale Themen, Meldungen an die Gemeinde, den Kalender für Fristen und Beteiligungen, das Postfach für verifizierte Behördenkommunikation und die Einstellungen für dein Profil.',
  'Wichtig: Ich erkläre, strukturiere und verweise auf passende Informationen. Ich entscheide nicht, ich bewerte dich nicht und ich ersetze keine Beratung durch die zuständige Stelle.',
  'Unten erreichst du mich jederzeit am lila Clara-Symbol.',
] as const;

export const INTRO_SPOKEN_WELCOME_SEGMENTS_SIE = [
  'Willkommen bei HookAI Civic. Ich bin Clara.',
  'Diese App soll Verwaltung verständlicher machen — nicht, indem sie Behörden ersetzt, sondern indem sie Ihnen zeigt, was relevant ist, welche Schritte anstehen und welche Informationen Sie vorbereiten können.',
  'Wir starten mit dem Wegweiser. Dort können Sie freiwillig ein kurzes Profil mit Stammdaten anlegen — zum Beispiel Wohnort, Haushaltssituation oder eine aktuelle Lebenslage.',
  'Daraus entsteht keine Bewertung und kein automatischer Bescheid. Ihre Angaben helfen nur dabei, Informationen besser zu sortieren.',
  'Der Wegweiser zeigt Ihnen dann, welche Stelle zuständig sein könnte, welche Unterlagen Sie wahrscheinlich brauchen und welcher nächste Schritt sinnvoll ist.',
  'So wird aus einem unübersichtlichen Behördengang ein klarer Ablauf.',
  'Danach zeige ich Ihnen die weiteren Bereiche: Abstimmungen für kommunale Themen, Meldungen an die Gemeinde, den Kalender für Fristen und Beteiligungen, das Postfach für verifizierte Behördenkommunikation und die Einstellungen für Ihr Profil.',
  'Wichtig: Ich erkläre, strukturiere und verweise auf passende Informationen. Ich entscheide nicht, ich bewerte Sie nicht und ich ersetze keine Beratung durch die zuständige Stelle.',
  'Unten erreichen Sie mich jederzeit am lila Clara-Symbol.',
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

export const INTRO_ANREDE_UI_TITLE_DU = 'Willkommen bei HookAI Civic';
export const INTRO_ANREDE_UI_TITLE_SIE = 'Willkommen bei HookAI Civic';

export const INTRO_ANREDE_SHORT_DU = `${INTRO_CLARA_WELCOME_LINES_DU[0]}\n\n${INTRO_CLARA_WELCOME_LINES_DU[1]}`;
export const INTRO_ANREDE_SHORT_SIE = `${INTRO_CLARA_WELCOME_LINES_SIE[0]}\n\n${INTRO_CLARA_WELCOME_LINES_SIE[1]}`;

export const INTRO_ANREDE_DROPDOWN_DU =
  'Wähle einmalig zwischen Du und Sie.\n\nClara, Texte und Hinweise richten sich in dieser Sitzung daran aus.';
export const INTRO_ANREDE_DROPDOWN_SIE =
  'Wählen Sie einmalig zwischen Du und Sie.\n\nClara, Texte und Hinweise richten sich in dieser Sitzung daran aus.';

export const INTRO_ANREDE_DROPDOWN_NEUTRAL = INTRO_ANREDE_DROPDOWN_SIE;

/**
 * Clara vor Anredewahl (TTS) — konsequent Sie-Form, bis die Nutzerin der Nutzer ausdrücklich Du wählt.
 */
export const INTRO_ANREDE_GATE_PRE_CHOICE_SPOKEN_SEGMENTS: readonly string[] = [
  'Hallo, ich bin Clara, die KI-Agentin von HookAI Civic.',
  'Ich begleite Sie gleich durch einen kurzen Überblick: Orientierung, Meldungen, Beteiligung, Wahlvorschau, Kalender, Postfach und lokale Prämien.',
  'Bevor wir starten: Wie darf ich Sie ansprechen?',
];

/** Clara nach Auswahl „Du“. */
export const INTRO_ANREDE_GATE_AFTER_DU_SPOKEN_SEGMENTS: readonly string[] = [
  'Sehr gern.',
  'Dann bleiben wir ab jetzt beim Du.',
  'Ich führe dich jetzt Schritt für Schritt durch den Überblick.',
];

/** Clara nach Auswahl „Sie“. */
export const INTRO_ANREDE_GATE_AFTER_SIE_SPOKEN_SEGMENTS: readonly string[] = [
  'Sehr gern.',
  'Dann bleiben wir bei der Sie-Form.',
  'Ich führe Sie jetzt Schritt für Schritt durch den Überblick.',
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
  'In weniger als einer Minute lernst du den Wegweiser und die wichtigsten Bereiche der App kennen.';
export const INTRO_ENTRY_SHORT_SIE =
  'In weniger als einer Minute lernen Sie den Wegweiser und die wichtigsten Bereiche der App kennen.';

export const INTRO_ENTRY_DROPDOWN_DU =
  'Ich zeige dir zuerst den Wegweiser — dann Abstimmungen, Meldungen, Kalender und Einstellungen. Klar, schnell und ohne Umwege.';
export const INTRO_ENTRY_DROPDOWN_SIE =
  'Ich zeige Ihnen zuerst den Wegweiser — dann Abstimmungen, Meldungen, Kalender und Einstellungen. Klar, schnell und ohne Umwege.';

export const INTRO_SPOKEN_ENTRY_DU: readonly string[] = [
  'Perfekt, dann starten wir mit einem kurzen Überblick.',
  'Du musst jetzt nichts suchen oder selbst herausfinden – ich führe dich einmal flüssig durch die wichtigsten Bereiche.',
];
export const INTRO_SPOKEN_ENTRY_SIE: readonly string[] = [
  'Perfekt, dann starten wir mit einem kurzen Überblick.',
  'Sie müssen jetzt nichts suchen oder selbst herausfinden – ich führe Sie einmal flüssig durch die wichtigsten Bereiche.',
];

/** @deprecated */ export const INTRO_ENTRY_LEAD_DU = INTRO_ENTRY_SHORT_DU;
/** @deprecated */ export const INTRO_ENTRY_LEAD_SIE = INTRO_ENTRY_SHORT_SIE;
/** Antwort auf „Bereit für den Überblick?“ — explizit als Ja wählbar. */
export const INTRO_ENTRY_START = 'Ja, Einführung starten';
export const INTRO_ENTRY_DIRECT = 'Direkt zur App';

export const INTRO_EID_CARD_TITLE = 'Mit eID anmelden';

/** Statuszeile auf der eID-Zugangskarte (Vorschau). */
export const INTRO_EID_CARD_STATUS = 'Heute verfügbar / Vorschau-Zugang';

/** Kompakte Metazeile, wo noch eine Ultra-Kurzform gebraucht wird. */
export const INTRO_EID_ULTRA_SHORT =
  'Sichere Anmeldung, eindeutige Identität, Zuordnung zu Kommune oder Wahlbezirk.';

export const INTRO_EID_CARD_BODY_DU =
  'Für diese Vorschau wird der sichere Zugang beispielhaft über die Online-Ausweisfunktion dargestellt.';

export const INTRO_EID_CARD_BODY_SIE =
  'Für diese Vorschau wird der sichere Zugang beispielhaft über die Online-Ausweisfunktion dargestellt.';

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
  'Die EU Digital Identity Wallet soll digitale Ausweise und Nachweise auf das Smartphone bringen. Bürgerinnen und Bürger sollen selbst kontrollieren können, welche Daten sie für welchen Zweck freigeben.\n\nFür diese Vorschau bedeutet das: Der Bürgerzugang wird heute beispielhaft über eID dargestellt, kann perspektivisch aber wallet-fähig gedacht werden.';
export const INTRO_WALLET_INFO_HINT = 'Konzeptionelle Darstellung · keine produktive Wallet-Integration';

/** Dezente Prozesszeile unter der EU-Wallet-Karte (nur Konzept / Konzeption). */
export const INTRO_WALLET_PROCESS_STEPS: readonly string[] = [
  'Wallet öffnen',
  'Datenfreigabe prüfen',
  'Zuständigkeit bestätigen',
  'Beteiligungen anzeigen',
];

export const INTRO_DEMO_MODE_TITLE = 'Vorschau ohne echte Identifikation starten';
export const INTRO_DEMO_MODE_BODY =
  'Zur Präsentation werden Beispielidentität und Beispieldaten verwendet.';
export const INTRO_DEMO_MODE_CTA = 'Vorschau starten';

export const INTRO_TRUST_HINT_DU =
  'Deine digitale Identität dient nur zur Prüfung von Zuständigkeit und Berechtigung. Politische Meinung, Clara-Fragen oder Abstimmungsverhalten werden daraus nicht abgeleitet.';
export const INTRO_TRUST_HINT_SIE =
  'Die digitale Identität dient nur zur Prüfung von Zuständigkeit und Berechtigung. Politische Meinung, Clara-Fragen oder Abstimmungsverhalten werden daraus nicht abgeleitet.';

/** Kurzer Vertrauens-Kicker auf dem Zugangsscreen (unter den Pfaden). */
export const INTRO_ZUGANG_TRUST_KURZ = 'Heute eID · perspektivisch EU Wallet · freiwillige Datenfreigabe';

/** Clara-Panel auf dem Zugangsscreen (sichtbar). */
export const INTRO_ACCESS_CLARA_PANEL_SHORT_DU =
  'Willkommen bei HookAI Civic. Hier wählst du, wie du die Anwendung betreten möchtest: beispielhaft über eID, über die Vorschau ohne echte Identifikation oder mit einem Blick auf die künftige EU Digital Identity Wallet.';
export const INTRO_ACCESS_CLARA_PANEL_SHORT_SIE =
  'Willkommen bei HookAI Civic. Hier wählen Sie, wie Sie die Anwendung betreten möchten: beispielhaft über eID, über die Vorschau ohne echte Identifikation oder mit einem Blick auf die künftige EU Digital Identity Wallet.';
export const INTRO_ACCESS_CLARA_PANEL_HINT_DU =
  'Über den Lautsprecher erklärt Clara den Zugang Schritt für Schritt.';
export const INTRO_ACCESS_CLARA_PANEL_HINT_SIE =
  'Über den Lautsprecher erklärt Clara den Zugang Schritt für Schritt.';

export const INTRO_ACCESS_CONFIRMED_TITLE = 'Zugang bestätigt';
export const INTRO_ACCESS_CONFIRMED_LEVELS = 'Zuständige Ebenen erkannt: Kirkel · Saarland · Bund';
export const INTRO_ACCESS_CONFIRMED_BODY = 'Relevante Beteiligungen und Termine werden geladen.';

/** @deprecated */ export const INTRO_EID_SPOKEN_MVP = '';

export const INTRO_SPOKEN_EID_SEGMENTS_DU: readonly string[] = [
  'Der erste Schritt ist der sichere Zugang.',
  'Perspektivisch kann geprüft werden, ob du für eine Kommune oder Beteiligung berechtigt bist – zum Beispiel über die eID oder künftig über eine europäische Wallet.',
  'Für diese Vorschau wird nichts Echtes ausgelöst. Wichtig ist nur das Prinzip: Identität und Entscheidung bleiben getrennt.',
];
export const INTRO_SPOKEN_EID_SEGMENTS_SIE: readonly string[] = [
  'Der erste Schritt ist der sichere Zugang.',
  'Perspektivisch kann geprüft werden, ob Sie für eine Kommune oder Beteiligung berechtigt sind – zum Beispiel über die eID oder künftig über eine europäische Wallet.',
  'Für diese Vorschau wird nichts Echtes ausgelöst. Wichtig ist nur das Prinzip: Identität und Entscheidung bleiben getrennt.',
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
  'Damit ist der geführte Überblick abgeschlossen.',
  'Sie können HookAI Civic jetzt selbst erkunden oder Clara gezielt Fragen stellen.',
  'Der Grundgedanke bleibt: Menschen sollen leichter verstehen, einfacher mitwirken und dabei die Kontrolle über ihre Entscheidungen behalten.',
];
export const INTRO_CLOSING_SPOKEN_SEGMENTS_DU: readonly string[] = [
  'Damit ist der geführte Überblick abgeschlossen.',
  'Du kannst HookAI Civic jetzt selbst erkunden oder Clara gezielt Fragen stellen.',
  'Der Grundgedanke bleibt: Menschen sollen leichter verstehen, einfacher mitwirken und dabei die Kontrolle über ihre Entscheidungen behalten.',
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
  | 'intro'
  | 'wegweiser'
  | 'profil'
  | 'behoerdenweg'
  | 'meldungen'
  | 'abstimmen'
  | 'wahlen'
  | 'kalender'
  | 'postfach'
  | 'praemien'
  | 'oekosystem';

export type IntroOverlayStepCopy = {
  id: IntroOverlayStepId;
  title: string;
  body: string;
  bullets: { n: number; title: string; text: string }[];
};

export const INTRO_OVERLAY_STEPS: IntroOverlayStepCopy[] = [
  {
    id: 'intro',
    title: 'HookAI Civic',
    body: INTRO_WALKTHROUGH_CLARA.intro.longSie,
    bullets: [
      { n: 1, title: 'Orientierung', text: 'Verwaltung verständlicher machen.' },
      { n: 2, title: 'Beteiligung', text: 'Einfacher mitwirken.' },
      { n: 3, title: 'Vertrauen', text: 'Kommunikation nachvollziehbar.' },
    ],
  },
  {
    id: 'wegweiser',
    title: 'Wegweiser',
    body: INTRO_WALKTHROUGH_CLARA.wegweiser.longSie,
    bullets: [
      { n: 1, title: 'Lebenslage', text: 'Echtes Beispiel: Baby kommt.' },
      { n: 2, title: 'Nächster Schritt', text: 'Klarer Behördenweg.' },
      { n: 3, title: 'Orientierung', text: 'Keine Anspruchsprüfung.' },
    ],
  },
  {
    id: 'profil',
    title: 'Profil',
    body: INTRO_WALKTHROUGH_CLARA.profil.longSie,
    bullets: [
      { n: 1, title: 'Freiwillig', text: 'Nur zur besseren Sortierung.' },
      { n: 2, title: 'Neutral', text: 'Keine Bewertung.' },
      { n: 3, title: 'Kontrolle', text: 'Jederzeit änderbar.' },
    ],
  },
  {
    id: 'behoerdenweg',
    title: 'Behördenweg',
    body: INTRO_WALKTHROUGH_CLARA.behoerdenweg.longSie,
    bullets: [
      { n: 1, title: 'Checkliste', text: 'Schritte aus der Lebenslage.' },
      { n: 2, title: 'Unterlagen', text: 'Häufig benötigte Dokumente.' },
      { n: 3, title: 'Hinweis', text: 'Beispielhafte Orientierung.' },
    ],
  },
  {
    id: 'meldungen',
    title: 'Meldungen',
    body: INTRO_WALKTHROUGH_CLARA.meldungen.longSie,
    bullets: [
      { n: 1, title: 'Erfassung', text: 'Foto, Ort, Kategorie.' },
      { n: 2, title: 'Beispiel', text: 'Rattenplage Drachenspielplatz.' },
      { n: 3, title: 'Nachvollziehbar', text: 'Transparenter Bearbeitungsstand.' },
    ],
  },
  {
    id: 'abstimmen',
    title: 'Abstimmungen',
    body: INTRO_WALKTHROUGH_CLARA.abstimmen.longSie,
    bullets: [
      { n: 1, title: 'Teilnahme', text: 'Bewusste Entscheidung.' },
      { n: 2, title: 'Feedback', text: 'Kurze Bestätigung nach Mitwirkung.' },
      { n: 3, title: 'Neutral', text: 'Punkte nicht für eine Meinung.' },
    ],
  },
  {
    id: 'wahlen',
    title: 'Wahlen',
    body: INTRO_WALKTHROUGH_CLARA.wahlen.longSie,
    bullets: [
      { n: 1, title: 'Vorschau', text: 'Keine echte Stimmabgabe.' },
      { n: 2, title: 'Information', text: 'Stimmzettel und Programme.' },
      { n: 3, title: 'Neutral', text: 'Keine Wahlempfehlung.' },
    ],
  },
  {
    id: 'kalender',
    title: 'Kalender',
    body: INTRO_WALKTHROUGH_CLARA.kalender.longSie,
    bullets: [
      { n: 1, title: 'Überblick', text: 'Fristen und Termine gebündelt.' },
      { n: 2, title: 'Verknüpfung', text: 'Aus Wegweiser und Beteiligung.' },
      { n: 3, title: 'Klarheit', text: 'Keine politische Empfehlung.' },
    ],
  },
  {
    id: 'postfach',
    title: 'Postfach',
    body: INTRO_WALKTHROUGH_CLARA.postfach.longSie,
    bullets: [
      { n: 1, title: 'Übersicht', text: 'Rückmeldungen und Hinweise gebündelt.' },
      { n: 2, title: 'Vertrauen', text: 'Verifizierte Absenderkennzeichnung als Vorschau.' },
      { n: 3, title: 'Demo', text: 'Keine echte Zustellung oder Behördenanbindung.' },
    ],
  },
  {
    id: 'praemien',
    title: 'Prämien',
    body: INTRO_WALKTHROUGH_CLARA.praemien.longSie,
    bullets: [
      { n: 1, title: 'Freiwillig', text: 'Lokale Anerkennung fürs Mitmachen.' },
      { n: 2, title: 'Unabhängig', text: 'Nicht von der Abstimmungsentscheidung.' },
      { n: 3, title: 'Beispiel', text: 'Naturfreibad Kirkel als QR oder Wallet.' },
    ],
  },
  {
    id: 'oekosystem',
    title: 'Ökosystem',
    body: INTRO_WALKTHROUGH_CLARA.oekosystem.longSie,
    bullets: [
      { n: 1, title: 'Ganzheitlich', text: 'Orientierung bis Anerkennung.' },
      { n: 2, title: 'Vertrauen', text: 'Sichere Kommunikation.' },
      { n: 3, title: 'Clara', text: 'Jederzeit am lila Symbol erreichbar.' },
    ],
  },
];

/** Anrede + alle Walkthrough-Szenen (siehe INTRO_OVERLAY_STEPS). */
export const INTRO_TOTAL_STEPS = 1 + INTRO_OVERLAY_STEPS.length;

/**
 * Eine kurze Framing-Zeile pro Walkthrough-Screen – erscheint als Meta-Ebene
 * in der Overlay-Chrome, nicht als Screen-Content.
 * Abstimmen & Politikbarometer: getrennte Du/Sie-Varianten; übrige Schritte neutral.
 */
export const INTRO_OVERLAY_FRAMING_LINES_SIE: Record<IntroOverlayStepId, string> = {
  intro: 'Verwaltung verständlicher. Beteiligung einfacher. Kommunikation vertrauenswürdiger.',
  wegweiser: 'Aus einer Lebenslage wird ein klarer nächster Schritt.',
  profil: 'Freiwillige Angaben. Keine Bewertung. Keine automatische Entscheidung.',
  behoerdenweg: 'Welche Stelle? Welche Unterlagen? Welcher nächste Schritt?',
  meldungen: 'Aus einem Foto wird eine nachvollziehbare Meldung.',
  abstimmen: 'Punkte für Mitwirkung — nicht für eine bestimmte Meinung.',
  wahlen: 'Wahlvorschau — keine echte Stimmabgabe. Keine Empfehlung.',
  kalender: 'Fristen und Beteiligungen an einem Ort.',
  postfach: 'Verifizierte Hinweise, Rückfragen und Statusmeldungen an einem Ort.',
  praemien: 'Lokale Anerkennung fürs Mitmachen — unabhängig von Ihrer Entscheidung.',
  oekosystem: 'Ein Civic-Ökosystem für Orientierung, Beteiligung und Vertrauen.',
};

export const INTRO_OVERLAY_FRAMING_LINES_DU: Record<IntroOverlayStepId, string> = {
  intro: 'Verwaltung verständlicher. Beteiligung einfacher. Kommunikation vertrauenswürdiger.',
  wegweiser: 'Aus einer Lebenslage wird ein klarer nächster Schritt.',
  profil: 'Freiwillige Angaben. Keine Bewertung. Keine automatische Entscheidung.',
  behoerdenweg: 'Welche Stelle? Welche Unterlagen? Welcher nächste Schritt?',
  meldungen: 'Aus einem Foto wird eine nachvollziehbare Meldung.',
  abstimmen: 'Punkte für Mitwirkung — nicht für eine bestimmte Meinung.',
  wahlen: 'Wahlvorschau — keine echte Stimmabgabe. Keine Empfehlung.',
  kalender: 'Fristen und Beteiligungen an einem Ort.',
  postfach: 'Verifizierte Hinweise, Rückfragen und Statusmeldungen an einem Ort.',
  praemien: 'Lokale Anerkennung fürs Mitmachen — unabhängig von deiner Entscheidung.',
  oekosystem: 'Ein Civic-Ökosystem für Orientierung, Beteiligung und Vertrauen.',
};

export function introOverlayFramingLine(id: IntroOverlayStepId, du: boolean): string {
  return du ? INTRO_OVERLAY_FRAMING_LINES_DU[id] : INTRO_OVERLAY_FRAMING_LINES_SIE[id];
}

/** @deprecated Verwenden Sie introOverlayFramingLine(id, du) — dies ist die Sie-Variante. */
export const INTRO_OVERLAY_FRAMING_LINES = INTRO_OVERLAY_FRAMING_LINES_SIE;
