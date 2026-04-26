import type { IntroOverlayStepId } from '@/data/introOverlayMarketing';

/**
 * Pro Walkthrough-Screen: UI (short/long) und **Spoken** (`speakSegments*`) getrennt.
 * HookAI Civic Demo — GovTech-Ton, keine Gamification, kein Stimmungsbarometer.
 */
export type WalkthroughClaraBlock = {
  label: string;
  /** 10s-Kicker, sichtbar oben, vor der Vorschau. */
  line10sDu: string;
  line10sSie: string;
  shortDu: string;
  shortSie: string;
  longDu: string;
  longSie: string;
  speakSegmentsDu: readonly string[];
  speakSegmentsSie: readonly string[];
};

export const INTRO_WALKTHROUGH_CLARA: Record<IntroOverlayStepId, WalkthroughClaraBlock> = {
  abstimmen: {
    label: 'Abstimmen',
    line10sDu: 'Beteiligungen werden verständlich eingeordnet – mit Pro, Contra und neutralem Kontext.',
    line10sSie: 'Beteiligungen werden verständlich eingeordnet – mit Pro, Contra und neutralem Kontext.',
    shortDu: 'Beteiligungen werden verständlich eingeordnet – mit Pro, Contra und neutralem Kontext.',
    shortSie: 'Beteiligungen werden verständlich eingeordnet – mit Pro, Contra und neutralem Kontext.',
    longDu:
      'In diesem Bereich sehen Nutzerinnen und Nutzer aktuelle Beteiligungen und Abstimmungen.\n\n' +
      'Die Entscheidung erfolgt bewusst über sichtbare Daumen-Buttons, nicht durch Wischen am Bildschirm. Pro- und Contra-Argumente bleiben sichtbar, um Orientierung zu geben — ohne Empfehlung oder Richtungsvorgabe.',
    longSie:
      'In diesem Bereich sehen Nutzerinnen und Nutzer aktuelle Beteiligungen und Abstimmungen.\n\n' +
      'Die Entscheidung erfolgt bewusst über sichtbare Daumen-Buttons, nicht durch Wischen am Bildschirm. Pro- und Contra-Argumente bleiben sichtbar, um Orientierung zu geben — ohne Empfehlung oder Richtungsvorgabe.',
    speakSegmentsDu: [
      'In diesem Bereich siehst du aktuelle Beteiligungen und Abstimmungen. Die Entscheidung erfolgt bewusst über die Daumen-Buttons, nicht durch Wischen am Bildschirm.',
      'Vorher helfen dir Pro- und Contra-Argumente, die Positionen besser einzuordnen.',
      'Die App gibt dir keine Richtung vor.',
    ],
    speakSegmentsSie: [
      'In diesem Bereich sehen Sie aktuelle Beteiligungen und Abstimmungen. Die Entscheidung erfolgt bewusst über die Daumen-Buttons, nicht durch Wischen am Bildschirm.',
      'Vorher helfen Ihnen Pro- und Contra-Argumente, die Positionen besser einzuordnen.',
      'Die App gibt Ihnen keine Richtung vor.',
    ],
  },
  wahlen: {
    label: 'Wahlen',
    line10sDu: 'Wahlen, Stimmzettel und Programme werden strukturiert zugänglich gemacht.',
    line10sSie: 'Wahlen, Stimmzettel und Programme werden strukturiert zugänglich gemacht.',
    shortDu: 'Wahlen, Stimmzettel und Programme werden strukturiert zugänglich gemacht.',
    shortSie: 'Wahlen, Stimmzettel und Programme werden strukturiert zugänglich gemacht.',
    longDu:
      'Dieser Bereich bündelt Informationen zu Wahlen, Stimmzetteln, Kandidierenden und Programmen.\n\n' +
      'Die Darstellung soll Orientierung erleichtern, ohne politische Bewertungen oder Wahlempfehlungen zu erzeugen.\n\n' +
      'Wo vorgesehen, können Ergebnisse und weiterführende Informationen nachvollziehbar eingesehen werden.',
    longSie:
      'Dieser Bereich bündelt Informationen zu Wahlen, Stimmzetteln, Kandidierenden und Programmen.\n\n' +
      'Die Darstellung soll Orientierung erleichtern, ohne politische Bewertungen oder Wahlempfehlungen zu erzeugen.\n\n' +
      'Wo vorgesehen, können Ergebnisse und weiterführende Informationen nachvollziehbar eingesehen werden.',
    speakSegmentsDu: [
      'Der Wahlbereich bündelt Informationen, die sonst oft an verschiedenen Stellen liegen: Stimmzettel, Programme, Kandidierende und Ergebnisse.',
      'Clara kann Begriffe erklären oder Inhalte verständlich zusammenfassen.',
      'Eine Wahlempfehlung gibt die App aber nicht.',
    ],
    speakSegmentsSie: [
      'Der Wahlbereich bündelt Informationen, die sonst oft an verschiedenen Stellen liegen: Stimmzettel, Programme, Kandidierende und Ergebnisse.',
      'Clara kann Begriffe erklären oder Inhalte verständlich zusammenfassen.',
      'Eine Wahlempfehlung gibt die App aber nicht.',
    ],
  },
  kalender: {
    label: 'Kalender',
    line10sDu: 'Termine, Fristen und Beteiligungen werden an einem Ort gebündelt.',
    line10sSie: 'Termine, Fristen und Beteiligungen werden an einem Ort gebündelt.',
    shortDu: 'Termine, Fristen und Beteiligungen werden an einem Ort gebündelt.',
    shortSie: 'Termine, Fristen und Beteiligungen werden an einem Ort gebündelt.',
    longDu:
      'Der Kalender zeigt relevante Termine rund um Wahlen, Abstimmungen und Beteiligungsverfahren.\n\n' +
      'So wird sichtbar, was ansteht, welche Fristen gelten und wann Mitwirkung möglich ist.\n\n' +
      'Wenn Interessenschwerpunkte gesetzt wurden, können passende Termine dezent hervorgehoben werden – ohne politische Empfehlung.',
    longSie:
      'Der Kalender zeigt relevante Termine rund um Wahlen, Abstimmungen und Beteiligungsverfahren.\n\n' +
      'So wird sichtbar, was ansteht, welche Fristen gelten und wann Mitwirkung möglich ist.\n\n' +
      'Wenn Interessenschwerpunkte gesetzt wurden, können passende Termine dezent hervorgehoben werden – ohne politische Empfehlung.',
    speakSegmentsDu: [
      'Der Kalender zeigt dir, welche Termine, Fristen und Beteiligungen anstehen.',
      'Wenn du im Politikbarometer Themen wie Digitalisierung oder Umwelt und Energie markierst, können passende Termine hier hervorgehoben werden.',
      'Das ist keine Empfehlung, sondern nur ein Hinweis auf thematische Relevanz.',
    ],
    speakSegmentsSie: [
      'Der Kalender zeigt Ihnen, welche Termine, Fristen und Beteiligungen anstehen.',
      'Wenn Sie im Politikbarometer Themen wie Digitalisierung oder Umwelt und Energie markieren, können passende Termine hier hervorgehoben werden.',
      'Das ist keine Empfehlung, sondern nur ein Hinweis auf thematische Relevanz.',
    ],
  },
  meldungen: {
    label: 'Meldungen',
    line10sDu: 'Anliegen können digital, strukturiert und nachvollziehbar weitergegeben werden.',
    line10sSie: 'Anliegen können digital, strukturiert und nachvollziehbar weitergegeben werden.',
    shortDu: 'Anliegen können digital, strukturiert und nachvollziehbar weitergegeben werden.',
    shortSie: 'Anliegen können digital, strukturiert und nachvollziehbar weitergegeben werden.',
    longDu:
      'Über diesen Bereich lassen sich Hinweise, Anliegen oder konkrete Meldungen geordnet erfassen.\n\n' +
      'Die Informationen werden so vorbereitet, dass sie schneller an der richtigen Stelle ankommen und nachvollziehbar bearbeitet werden können.\n\n' +
      'Das macht Bürgerkommunikation klarer, einfacher und effizienter.',
    longSie:
      'Über diesen Bereich lassen sich Hinweise, Anliegen oder konkrete Meldungen geordnet erfassen.\n\n' +
      'Die Informationen werden so vorbereitet, dass sie schneller an der richtigen Stelle ankommen und nachvollziehbar bearbeitet werden können.\n\n' +
      'Das macht Bürgerkommunikation klarer, einfacher und effizienter.',
    speakSegmentsDu: [
      'Im Bereich Meldungen kannst du Anliegen strukturiert erfassen — zum Beispiel Hinweise aus deiner Kommune.',
      'Die App hilft dabei, Informationen so aufzubereiten, dass sie verständlich und zuständigkeitsnah weitergegeben werden können.',
      'So wird Bürgerkommunikation klarer und nachvollziehbarer.',
    ],
    speakSegmentsSie: [
      'Im Bereich Meldungen können Sie Anliegen strukturiert erfassen — zum Beispiel Hinweise aus Ihrer Kommune.',
      'Die App hilft dabei, Informationen so aufzubereiten, dass sie verständlich und zuständigkeitsnah weitergegeben werden können.',
      'So wird Bürgerkommunikation klarer und nachvollziehbarer.',
    ],
  },
  praemien: {
    label: 'Beteiligungsstatus',
    line10sDu: 'Eigene Beiträge und Rückmeldungen werden transparent nachvollziehbar.',
    line10sSie: 'Eigene Beiträge und Rückmeldungen werden transparent nachvollziehbar.',
    shortDu: 'Eigene Beiträge und Rückmeldungen werden transparent nachvollziehbar.',
    shortSie: 'Eigene Beiträge und Rückmeldungen werden transparent nachvollziehbar.',
    longDu:
      'Dieser Bereich zeigt, welche Beiträge, Meldungen oder Beteiligungen bereits eingereicht wurden.\n\n' +
      'Der Fokus liegt auf Transparenz: Was wurde übermittelt, was ist bestätigt und was ist noch offen?\n\n' +
      'So bleibt Beteiligung nachvollziehbar, ohne Druck, Gamification oder politische Steuerungslogik.',
    longSie:
      'Dieser Bereich zeigt, welche Beiträge, Meldungen oder Beteiligungen bereits eingereicht wurden.\n\n' +
      'Der Fokus liegt auf Transparenz: Was wurde übermittelt, was ist bestätigt und was ist noch offen?\n\n' +
      'So bleibt Beteiligung nachvollziehbar, ohne Druck, Gamification oder politische Steuerungslogik.',
    speakSegmentsDu: [
      'Dieser Bereich zeigt dir, welche Beiträge oder Meldungen du bereits eingereicht hast und welchen Status sie haben.',
      'Es geht um Nachvollziehbarkeit und klare Statusinformationen.',
      'Du sollst sehen können, was offen, bestätigt oder abgeschlossen ist.',
    ],
    speakSegmentsSie: [
      'Dieser Bereich zeigt Ihnen, welche Beiträge oder Meldungen Sie bereits eingereicht haben und welchen Status sie haben.',
      'Es geht um Nachvollziehbarkeit und klare Statusinformationen.',
      'Sie sollen sehen können, was offen, bestätigt oder abgeschlossen ist.',
    ],
  },
  politikbarometer: {
    label: 'Politikbarometer',
    line10sDu: 'Interessenschwerpunkte helfen, passende Beteiligungen im Kalender schneller zu erkennen.',
    line10sSie: 'Interessenschwerpunkte helfen, passende Beteiligungen im Kalender schneller zu erkennen.',
    shortDu: 'Interessenschwerpunkte helfen, passende Beteiligungen im Kalender schneller zu erkennen.',
    shortSie: 'Interessenschwerpunkte helfen, passende Beteiligungen im Kalender schneller zu erkennen.',
    longDu:
      'Das Politikbarometer zeigt keine politische Bewertung und erstellt kein Meinungsprofil.\n\n' +
      'Nutzerinnen und Nutzer können selbst Themen markieren, die ihnen besonders wichtig sind – zum Beispiel Digitalisierung, Umwelt und Energie oder Bildung.\n\n' +
      'Passende Termine und Beteiligungen können dadurch im Kalender hervorgehoben werden. Das ist keine Empfehlung, sondern nur thematische Relevanz.',
    longSie:
      'Das Politikbarometer zeigt keine politische Bewertung und erstellt kein Meinungsprofil.\n\n' +
      'Nutzerinnen und Nutzer können selbst Themen markieren, die ihnen besonders wichtig sind – zum Beispiel Digitalisierung, Umwelt und Energie oder Bildung.\n\n' +
      'Passende Termine und Beteiligungen können dadurch im Kalender hervorgehoben werden. Das ist keine Empfehlung, sondern nur thematische Relevanz.',
    speakSegmentsDu: [
      'Das Politikbarometer hilft dir, Themen zu markieren, die dir besonders wichtig sind.',
      'Wenn du zum Beispiel Digitalisierung, Umwelt und Energie oder Bildung auswählst, kann der Kalender passende Termine und Beteiligungen hervorheben.',
      'Wichtig ist: Die App bewertet nicht deine Meinung und leitet nichts aus deinem Verhalten ab.',
      'Du kannst diese Auswahl später jederzeit in den Einstellungen ändern.',
    ],
    speakSegmentsSie: [
      'Das Politikbarometer hilft Ihnen, Themen zu markieren, die Ihnen besonders wichtig sind.',
      'Wenn Sie zum Beispiel Digitalisierung, Umwelt und Energie oder Bildung auswählen, kann der Kalender passende Termine und Beteiligungen hervorheben.',
      'Wichtig ist: Die App bewertet nicht Ihre Meinung und leitet nichts aus Ihrem Verhalten ab.',
      'Sie können diese Auswahl später jederzeit in den Einstellungen ändern.',
    ],
  },
};

export function claraBlockForStep(
  id: IntroOverlayStepId,
  du: boolean,
): {
  label: string;
  line10s: string;
  short: string;
  long: string;
  speak: string;
  speakSegments: string[];
} {
  const b = INTRO_WALKTHROUGH_CLARA[id];
  const body = du ? b.longDu : b.longSie;
  const speakSegments = du ? [...b.speakSegmentsDu] : [...b.speakSegmentsSie];
  const line10s = du ? b.line10sDu : b.line10sSie;
  return {
    label: b.label,
    line10s,
    short: du ? b.shortDu : b.shortSie,
    long: body,
    speak: [line10s, ...speakSegments].join(' '),
    speakSegments,
  };
}
