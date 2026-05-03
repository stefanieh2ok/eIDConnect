import type { IntroOverlayStepId } from '@/data/introOverlayMarketing';

/**
 * Pro Walkthrough-Screen: UI (short/long) und **Spoken** (`speakSegments*`) getrennt.
 * HookAI Civic Demo — klarer, moderner Ton, keine Gamification.
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
    line10sDu: 'Kommunales Beispiel: Kirkel im Saarland – beispielhaft, ohne Richtungsvorgabe.',
    line10sSie: 'Kommunales Beispiel: Kirkel im Saarland – beispielhaft, ohne Richtungsvorgabe.',
    shortDu:
      'So ist eine kommunale Abstimmung aufgebaut: Pro und Contra helfen bei der Einordnung, danach entscheidest du bewusst über die drei Felder. Später siehst du nur das Gesamtergebnis — nicht deine einzelne Stimme.',
    shortSie:
      'So ist eine kommunale Abstimmung aufgebaut: Pro und Contra helfen bei der Einordnung, danach entscheiden Sie bewusst über die drei Felder. Später sehen Sie nur das Gesamtergebnis — nicht Ihre einzelne Stimme.',
    longDu:
      'Jetzt wird’s konkreter: So ist eine kommunale Abstimmung aufgebaut. Pro und Contra helfen dir bei der Einordnung, abgestimmt wird anschließend bewusst über die drei Auswahlfelder darunter. Sichtbar ist später nur das Gesamtergebnis — nicht deine einzelne Entscheidung.',
    longSie:
      'Jetzt wird’s konkreter: So ist eine kommunale Abstimmung aufgebaut. Pro und Contra helfen Ihnen bei der Einordnung, abgestimmt wird anschließend bewusst über die drei Auswahlfelder darunter. Sichtbar ist später nur das Gesamtergebnis — nicht Ihre einzelne Entscheidung.',
    speakSegmentsDu: [
      'Jetzt wird’s konkreter: So ist eine kommunale Abstimmung aufgebaut. Pro und Contra helfen dir bei der Einordnung, abgestimmt wird anschließend bewusst über die drei Auswahlfelder darunter. Sichtbar ist später nur das Gesamtergebnis — nicht deine einzelne Entscheidung.',
    ],
    speakSegmentsSie: [
      'Jetzt wird’s konkreter: So ist eine kommunale Abstimmung aufgebaut. Pro und Contra helfen Ihnen bei der Einordnung, abgestimmt wird anschließend bewusst über die drei Auswahlfelder darunter. Sichtbar ist später nur das Gesamtergebnis — nicht Ihre einzelne Entscheidung.',
    ],
  },
  wahlen: {
    label: 'Wahlen',
    line10sDu: 'Wahlvorschau am Beispiel Bundestagswahl – nicht die eigentliche Wahl.',
    line10sSie: 'Wahlvorschau am Beispiel Bundestagswahl – nicht die eigentliche Wahl.',
    shortDu:
      'Kandidierende, Parteien und verifizierte Quellen liegen gebündelt an einem Ort — zum strukturierten Lesen, ohne schon abzustimmen. Perspektivisch lässt sich daran auch ein sicherer digitaler Wahlzugang vorbereiten.',
    shortSie:
      'Kandidierende, Parteien und verifizierte Quellen liegen gebündelt an einem Ort — zum strukturierten Lesen, ohne schon abzustimmen. Perspektivisch lässt sich daran auch ein sicherer digitaler Wahlzugang vorbereiten.',
    longDu:
      'In der Wahlvorschau findest du Kandidierende, Parteien und verifizierte Quellen gebündelt an einem Ort. So kannst du dich strukturiert vorbereiten, ohne schon eine Stimme abzugeben. Perspektivisch lässt sich so auch ein sicherer digitaler Wahlzugang verständlich vorbereiten.',
    longSie:
      'In der Wahlvorschau finden Sie Kandidierende, Parteien und verifizierte Quellen gebündelt an einem Ort. So können Sie sich strukturiert vorbereiten, ohne schon eine Stimme abzugeben. Perspektivisch lässt sich so auch ein sicherer digitaler Wahlzugang verständlich vorbereiten.',
    speakSegmentsDu: [
      'In der Wahlvorschau findest du Kandidierende, Parteien und verifizierte Quellen gebündelt an einem Ort. So kannst du dich strukturiert vorbereiten, ohne schon eine Stimme abzugeben. Perspektivisch lässt sich so auch ein sicherer digitaler Wahlzugang verständlich vorbereiten.',
    ],
    speakSegmentsSie: [
      'In der Wahlvorschau finden Sie Kandidierende, Parteien und verifizierte Quellen gebündelt an einem Ort. So können Sie sich strukturiert vorbereiten, ohne schon eine Stimme abzugeben. Perspektivisch lässt sich so auch ein sicherer digitaler Wahlzugang verständlich vorbereiten.',
    ],
  },
  kalender: {
    label: 'Kalender',
    line10sDu: 'Kalender: Fristen, Abstimmungen und Beteiligung auf mehreren Ebenen.',
    line10sSie: 'Kalender: Fristen, Abstimmungen und Beteiligung auf mehreren Ebenen.',
    shortDu:
      'Abstimmungen, Fristen und Wahltermine laufen an einem Ort zusammen. Themen, die du im Politikbarometer stärker gewichtet hast, können später gezielter sichtbar werden.',
    shortSie:
      'Abstimmungen, Fristen und Wahltermine laufen an einem Ort zusammen. Themen, die Sie im Politikbarometer stärker gewichtet haben, können später gezielter sichtbar werden.',
    longDu:
      'Im Kalender laufen relevante Termine zusammen — zum Beispiel Abstimmungen, Fristen oder Wahltermine. Themen, die du im Politikbarometer stärker gewichtet hast, können hier später gezielter sichtbar werden.',
    longSie:
      'Im Kalender laufen relevante Termine zusammen — zum Beispiel Abstimmungen, Fristen oder Wahltermine. Themen, die Sie im Politikbarometer stärker gewichtet haben, können hier später gezielter sichtbar werden.',
    speakSegmentsDu: [
      'Im Kalender laufen relevante Termine zusammen — zum Beispiel Abstimmungen, Fristen oder Wahltermine. Themen, die du im Politikbarometer stärker gewichtet hast, können hier später gezielter sichtbar werden.',
    ],
    speakSegmentsSie: [
      'Im Kalender laufen relevante Termine zusammen — zum Beispiel Abstimmungen, Fristen oder Wahltermine. Themen, die Sie im Politikbarometer stärker gewichtet haben, können hier später gezielter sichtbar werden.',
    ],
  },
  meldungen: {
    label: 'Meldungen',
    line10sDu: 'Meldung an die Gemeinde Kirkel – nachvollziehbarer Bearbeitungsstand.',
    line10sSie: 'Meldung an die Gemeinde Kirkel – nachvollziehbarer Bearbeitungsstand.',
    shortDu:
      'Du gibst Anliegen mit Kategorie, Kurztext, Ort und Foto an die Gemeinde weiter — der Bearbeitungsstand bleibt transparent.',
    shortSie:
      'Sie geben Anliegen mit Kategorie, Kurztext, Ort und Foto an die Gemeinde weiter — der Bearbeitungsstand bleibt transparent.',
    longDu:
      'Mit Meldungen gibst du Anliegen direkt an die Gemeinde weiter — mit Kategorie, kurzer Beschreibung, Ort und Foto. Danach bleibt der Bearbeitungsstand transparent nachvollziehbar.',
    longSie:
      'Mit Meldungen geben Sie Anliegen direkt an die Gemeinde weiter — mit Kategorie, kurzer Beschreibung, Ort und Foto. Danach bleibt der Bearbeitungsstand transparent nachvollziehbar.',
    speakSegmentsDu: [
      'Mit Meldungen gibst du Anliegen direkt an die Gemeinde weiter — mit Kategorie, kurzer Beschreibung, Ort und Foto. Danach bleibt der Bearbeitungsstand transparent nachvollziehbar.',
    ],
    speakSegmentsSie: [
      'Mit Meldungen geben Sie Anliegen direkt an die Gemeinde weiter — mit Kategorie, kurzer Beschreibung, Ort und Foto. Danach bleibt der Bearbeitungsstand transparent nachvollziehbar.',
    ],
  },
  praemien: {
    label: 'Prämien',
    line10sDu: 'Prämien: freiwillig, lokal gedacht — unabhängig vom Abstimmungsverhalten.',
    line10sSie: 'Prämien: freiwillig, lokal gedacht — unabhängig vom Abstimmungsverhalten.',
    shortDu:
      'Nach abgeschlossener Beteiligung kann ein Gutschein erscheinen — ein Tap öffnet den QR-Code, perspektivisch auch fürs Apple Wallet. Die Vorschau zeigt gleich den Ablauf.',
    shortSie:
      'Nach abgeschlossener Beteiligung kann ein Gutschein erscheinen — ein Tap öffnet den QR-Code, perspektivisch auch fürs Apple Wallet. Die Vorschau zeigt gleich den Ablauf.',
    longDu:
      'Zum Schluss zeige ich dir, wie freiwillige Prämien funktionieren. Nach einer abgeschlossenen Beteiligung kann zum Beispiel ein Gutschein fürs Naturfreibad erscheinen. Ein Tap öffnet den QR-Code — und perspektivisch lässt sich dieser direkt ins Apple Wallet übernehmen.',
    longSie:
      'Zum Schluss zeige ich Ihnen, wie freiwillige Prämien funktionieren. Nach einer abgeschlossenen Beteiligung kann zum Beispiel ein Gutschein fürs Naturfreibad erscheinen. Ein Tap öffnet den QR-Code — und perspektivisch lässt sich dieser direkt ins Apple Wallet übernehmen.',
    speakSegmentsDu: [
      'Zum Schluss eine kurze, geführte Szene — wie ein Mini-Film ohne Ton: So kann freiwillige Prämie aussehen, wenn nach einer Beteiligung ein Gutschein fürs Naturfreibad freigeschaltet wird.',
      'Auf der Karte tippt ihr gleich symbolisch — dann öffnet sich der Gutschein mit QR-Code, und zum Schluss die Wallet-Vorschau. Alles nur Demonstration, kein echter Wallet-Eintrag.',
    ],
    speakSegmentsSie: [
      'Zum Schluss eine kurze, geführte Szene — wie ein Mini-Film ohne Ton: So kann eine freiwillige Prämie aussehen, wenn nach einer Beteiligung ein Gutschein fürs Naturfreibad freigeschaltet wird.',
      'Auf der Karte tippen Sie gleich symbolisch — dann öffnet sich der Gutschein mit QR-Code, und zum Schluss die Wallet-Vorschau. Alles nur Demonstration, kein echter Wallet-Eintrag.',
    ],
  },
  politikbarometer: {
    label: 'Politikbarometer',
    line10sDu: 'Themen markieren – neutral, ohne Empfehlung und ohne Meinungsprofil.',
    line10sSie: 'Themen markieren – neutral, ohne Empfehlung und ohne Meinungsprofil.',
    shortDu:
      'Du setzt thematische Schwerpunkte — später können passende Termine und Beteiligungen stärker hervortreten, etwa im Kalender. Orientierung, keine politische Empfehlung.',
    shortSie:
      'Sie setzen thematische Schwerpunkte — später können passende Termine und Beteiligungen stärker hervortreten, etwa im Kalender. Orientierung, keine politische Empfehlung.',
    longDu:
      'Am Anfang setzt du deine thematischen Schwerpunkte. Wenn dich zum Beispiel Digitalisierung, Bildung oder Sicherheit besonders interessieren, können passende Termine und Beteiligungen später gezielter hervorgehoben werden — etwa auch im Kalender. Das dient der Orientierung, nicht der politischen Empfehlung.',
    longSie:
      'Am Anfang setzen Sie Ihre thematischen Schwerpunkte. Wenn Sie zum Beispiel Digitalisierung, Bildung oder Sicherheit besonders interessieren, können passende Termine und Beteiligungen später gezielter hervorgehoben werden — etwa auch im Kalender. Das dient der Orientierung, nicht der politischen Empfehlung.',
    speakSegmentsDu: [
      'Am Anfang setzt du deine thematischen Schwerpunkte. Wenn dich zum Beispiel Digitalisierung, Bildung oder Sicherheit besonders interessieren, können passende Termine und Beteiligungen später gezielter hervorgehoben werden — etwa auch im Kalender. Das dient der Orientierung, nicht der politischen Empfehlung.',
    ],
    speakSegmentsSie: [
      'Am Anfang setzen Sie Ihre thematischen Schwerpunkte. Wenn Sie zum Beispiel Digitalisierung, Bildung oder Sicherheit besonders interessieren, können passende Termine und Beteiligungen später gezielter hervorgehoben werden — etwa auch im Kalender. Das dient der Orientierung, nicht der politischen Empfehlung.',
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
