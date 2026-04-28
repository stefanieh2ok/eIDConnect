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
    line10sDu: 'Vor der Entscheidung siehst du beide Seiten.',
    line10sSie: 'Vor der Entscheidung sehen Sie beide Seiten.',
    shortDu: 'Vor der Entscheidung siehst du beide Seiten.',
    shortSie: 'Vor der Entscheidung sehen Sie beide Seiten.',
    longDu:
      'Vor der Entscheidung siehst du beide Seiten.\n\n' +
      'Pro und Contra helfen dir, eine Position einzuordnen.\n\n' +
      'Die App gibt keine Richtung vor.',
    longSie:
      'Vor der Entscheidung sehen Sie beide Seiten.\n\n' +
      'Pro und Contra helfen Ihnen, eine Position einzuordnen.\n\n' +
      'Die App gibt keine Richtung vor.',
    speakSegmentsDu: [
      'Vor der Entscheidung siehst du beide Seiten.',
      'Pro und Contra helfen dir, eine Position einzuordnen.',
      'Die App gibt keine Richtung vor.',
    ],
    speakSegmentsSie: [
      'Vor der Entscheidung sehen Sie beide Seiten.',
      'Pro und Contra helfen Ihnen, eine Position einzuordnen.',
      'Die App gibt keine Richtung vor.',
    ],
  },
  wahlen: {
    label: 'Wahlen',
    line10sDu: 'Hier siehst du eine Wahlvorschau – nicht die eigentliche Wahl.',
    line10sSie: 'Hier sehen Sie eine Wahlvorschau – nicht die eigentliche Wahl.',
    shortDu: 'Hier siehst du eine Wahlvorschau – nicht die eigentliche Wahl.',
    shortSie: 'Hier sehen Sie eine Wahlvorschau – nicht die eigentliche Wahl.',
    longDu:
      'Hier siehst du eine Wahlvorschau – nicht die eigentliche Wahl.\n\n' +
      'Du kannst dich über Kandidierende, Parteien und Programme informieren.\n\n' +
      'Programmquellen werden verlinkt und als offizielle Quelle gekennzeichnet.\n\n' +
      'Perspektivisch kann dieser Bereich um sicheres eVoting ergänzt werden – aber nur mit klarer Trennung von Identität und Entscheidung.',
    longSie:
      'Hier sehen Sie eine Wahlvorschau – nicht die eigentliche Wahl.\n\n' +
      'Sie können sich über Kandidierende, Parteien und Programme informieren.\n\n' +
      'Programmquellen werden verlinkt und als offizielle Quelle gekennzeichnet.\n\n' +
      'Perspektivisch kann dieser Bereich um sicheres eVoting ergänzt werden – aber nur mit klarer Trennung von Identität und Entscheidung.',
    speakSegmentsDu: [
      'Hier siehst du eine Wahlvorschau – nicht die eigentliche Wahl.',
      'Du kannst dich über Kandidierende, Parteien und Programme informieren.',
      'Programmquellen werden verlinkt und als offizielle Quelle gekennzeichnet.',
      'Perspektivisch kann dieser Bereich um sicheres eVoting ergänzt werden – aber nur mit klarer Trennung von Identität und Entscheidung.',
    ],
    speakSegmentsSie: [
      'Hier sehen Sie eine Wahlvorschau – nicht die eigentliche Wahl.',
      'Sie können sich über Kandidierende, Parteien und Programme informieren.',
      'Programmquellen werden verlinkt und als offizielle Quelle gekennzeichnet.',
      'Perspektivisch kann dieser Bereich um sicheres eVoting ergänzt werden – aber nur mit klarer Trennung von Identität und Entscheidung.',
    ],
  },
  kalender: {
    label: 'Kalender',
    line10sDu: 'Termine und Fristen sind in einem Kalender gebündelt.',
    line10sSie: 'Termine und Fristen sind in einem Kalender gebündelt.',
    shortDu: 'Termine und Fristen sind in einem Kalender gebündelt.',
    shortSie: 'Termine und Fristen sind in einem Kalender gebündelt.',
    longDu:
      'Du siehst, was ansteht und bis wann Beteiligung möglich ist.\n\n' +
      'Optional werden passende Termine aus dem Politikbarometer hervorgehoben.',
    longSie:
      'Sie sehen, was ansteht und bis wann Beteiligung möglich ist.\n\n' +
      'Optional werden passende Termine aus dem Politikbarometer hervorgehoben.',
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
    line10sDu: 'Anliegen werden digital erfasst und zuständig weitergeleitet.',
    line10sSie: 'Anliegen werden digital erfasst und zuständig weitergeleitet.',
    shortDu: 'Anliegen werden digital erfasst und zuständig weitergeleitet.',
    shortSie: 'Anliegen werden digital erfasst und zuständig weitergeleitet.',
    longDu:
      'Hinweise und Meldungen werden strukturiert aufgenommen.\n\n' +
      'So kommen sie schneller bei der zuständigen Stelle an und bleiben nachvollziehbar.',
    longSie:
      'Hinweise und Meldungen werden strukturiert aufgenommen.\n\n' +
      'So kommen sie schneller bei der zuständigen Stelle an und bleiben nachvollziehbar.',
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
    label: 'Prämien',
    line10sDu: 'Prämien sind freiwillig und nur mit Einwilligung aktiv.',
    line10sSie: 'Prämien sind freiwillig und nur mit Einwilligung aktiv.',
    shortDu: 'Prämien sind freiwillig und nur mit Einwilligung aktiv.',
    shortSie: 'Prämien sind freiwillig und nur mit Einwilligung aktiv.',
    longDu:
      'Prämien werden nur nach ausdrücklicher Einwilligung angezeigt.\n\n' +
      'Sie sind unabhängig von deiner Abstimmungsrichtung und jederzeit deaktivierbar.',
    longSie:
      'Prämien werden nur nach ausdrücklicher Einwilligung angezeigt.\n\n' +
      'Sie sind unabhängig von Ihrer Abstimmungsrichtung und jederzeit deaktivierbar.',
    speakSegmentsDu: [
      'In diesem Bereich kannst du sehen, ob Prämien für Beteiligung verfügbar sind.',
      'Wichtig ist: Das funktioniert nur, wenn du ausdrücklich einwilligst.',
      'Die Prämien hängen nicht davon ab, wie du abstimmst, sondern nur davon, ob eine Beteiligung oder Rückmeldung abgeschlossen wurde.',
      'Du kannst diese Funktion jederzeit in den Einstellungen deaktivieren.',
    ],
    speakSegmentsSie: [
      'In diesem Bereich können Sie sehen, ob Prämien für Beteiligung verfügbar sind.',
      'Wichtig ist: Das funktioniert nur, wenn Sie ausdrücklich einwilligen.',
      'Die Prämien hängen nicht davon ab, wie Sie abstimmen, sondern nur davon, ob eine Beteiligung oder Rückmeldung abgeschlossen wurde.',
      'Sie können diese Funktion jederzeit in den Einstellungen deaktivieren.',
    ],
  },
  politikbarometer: {
    label: 'Politikbarometer',
    line10sDu: 'Themen markieren, passende Termine im Kalender schneller finden.',
    line10sSie: 'Themen markieren, passende Termine im Kalender schneller finden.',
    shortDu: 'Themen markieren, passende Termine im Kalender schneller finden.',
    shortSie: 'Themen markieren, passende Termine im Kalender schneller finden.',
    longDu:
      'Du markierst Themen wie Bildung oder Digitalisierung für bessere Orientierung.\n\n' +
      'Die App erstellt kein Meinungsprofil und gibt keine Empfehlung.',
    longSie:
      'Sie markieren Themen wie Bildung oder Digitalisierung für bessere Orientierung.\n\n' +
      'Die App erstellt kein Meinungsprofil und gibt keine Empfehlung.',
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
