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
    line10sDu: 'Kommunales Beispiel: Kirkel im Saarland – beispielhaft, ohne Richtungsvorgabe.',
    line10sSie: 'Kommunales Beispiel: Kirkel im Saarland – beispielhaft, ohne Richtungsvorgabe.',
    shortDu:
      'Hier siehst du ein Beispiel aus Kirkel im Saarland: eine kommunale Abstimmung, etwa zu Schule, Verkehr, Digitalisierung oder öffentlicher Infrastruktur. Die KI bereitet dir Pro und Contra verständlich auf – ohne eine Richtung vorzugeben. Danach entscheidest du selbst.',
    shortSie:
      'Hier sehen Sie ein Beispiel aus Kirkel im Saarland: eine kommunale Abstimmung, etwa zu Schule, Verkehr, Digitalisierung oder öffentlicher Infrastruktur. Die KI bereitet Ihnen Pro und Contra verständlich auf – ohne eine Richtung vorzugeben. Danach entscheiden Sie selbst.',
    longDu:
      'Hier siehst du ein Beispiel aus Kirkel im Saarland: eine kommunale Abstimmung, etwa zu Schule, Verkehr, Digitalisierung oder öffentlicher Infrastruktur. Die KI bereitet dir Pro und Contra verständlich auf – ohne eine Richtung vorzugeben. Danach entscheidest du selbst.',
    longSie:
      'Hier sehen Sie ein Beispiel aus Kirkel im Saarland: eine kommunale Abstimmung, etwa zu Schule, Verkehr, Digitalisierung oder öffentlicher Infrastruktur. Die KI bereitet Ihnen Pro und Contra verständlich auf – ohne eine Richtung vorzugeben. Danach entscheiden Sie selbst.',
    speakSegmentsDu: [
      'Hier siehst du ein Beispiel aus Kirkel im Saarland: eine kommunale Abstimmung, etwa zu Schule, Verkehr, Digitalisierung oder öffentlicher Infrastruktur. Die KI bereitet dir Pro und Contra verständlich auf – ohne eine Richtung vorzugeben. Danach entscheidest du selbst.',
    ],
    speakSegmentsSie: [
      'Hier sehen Sie ein Beispiel aus Kirkel im Saarland: eine kommunale Abstimmung, etwa zu Schule, Verkehr, Digitalisierung oder öffentlicher Infrastruktur. Die KI bereitet Ihnen Pro und Contra verständlich auf – ohne eine Richtung vorzugeben. Danach entscheiden Sie selbst.',
    ],
  },
  wahlen: {
    label: 'Wahlen',
    line10sDu: 'Wahlvorschau am Beispiel Bundestagswahl – nicht die eigentliche Wahl.',
    line10sSie: 'Wahlvorschau am Beispiel Bundestagswahl – nicht die eigentliche Wahl.',
    shortDu:
      'Hier siehst du eine Wahlvorschau – nicht die eigentliche Wahl. Am Beispiel einer Bundestagswahl kannst du nachvollziehen, welche Parteien, Kandidierenden, Programme und offiziellen Quellen relevant sind. So bist du besser vorbereitet, bevor du eine Wahlentscheidung triffst.',
    shortSie:
      'Hier sehen Sie eine Wahlvorschau – nicht die eigentliche Wahl. Am Beispiel einer Bundestagswahl können Sie nachvollziehen, welche Parteien, Kandidierenden, Programme und offiziellen Quellen relevant sind. So sind Sie besser vorbereitet, bevor Sie eine Wahlentscheidung treffen.',
    longDu:
      'Hier siehst du eine Wahlvorschau – nicht die eigentliche Wahl. Am Beispiel einer Bundestagswahl kannst du nachvollziehen, welche Parteien, Kandidierenden, Programme und offiziellen Quellen relevant sind. So bist du besser vorbereitet, bevor du eine Wahlentscheidung triffst.',
    longSie:
      'Hier sehen Sie eine Wahlvorschau – nicht die eigentliche Wahl. Am Beispiel einer Bundestagswahl können Sie nachvollziehen, welche Parteien, Kandidierenden, Programme und offiziellen Quellen relevant sind. So sind Sie besser vorbereitet, bevor Sie eine Wahlentscheidung treffen.',
    speakSegmentsDu: [
      'Hier siehst du eine Wahlvorschau – nicht die eigentliche Wahl. Am Beispiel einer Bundestagswahl kannst du nachvollziehen, welche Parteien, Kandidierenden, Programme und offiziellen Quellen relevant sind. So bist du besser vorbereitet, bevor du eine Wahlentscheidung triffst.',
    ],
    speakSegmentsSie: [
      'Hier sehen Sie eine Wahlvorschau – nicht die eigentliche Wahl. Am Beispiel einer Bundestagswahl können Sie nachvollziehen, welche Parteien, Kandidierenden, Programme und offiziellen Quellen relevant sind. So sind Sie besser vorbereitet, bevor Sie eine Wahlentscheidung treffen.',
    ],
  },
  kalender: {
    label: 'Kalender',
    line10sDu: 'Kalender: Fristen, Abstimmungen und Beteiligung auf mehreren Ebenen.',
    line10sSie: 'Kalender: Fristen, Abstimmungen und Beteiligung auf mehreren Ebenen.',
    shortDu:
      'Im Kalender siehst du relevante Termine an einem Ort – zum Beispiel Fristen, Abstimmungen, Wahltermine und Beteiligungsmöglichkeiten auf kommunaler Ebene, im Saarland oder auf Bundesebene. So geht nichts unter, was für dich wichtig sein könnte.',
    shortSie:
      'Im Kalender sehen Sie relevante Termine an einem Ort – zum Beispiel Fristen, Abstimmungen, Wahltermine und Beteiligungsmöglichkeiten auf kommunaler Ebene, im Saarland oder auf Bundesebene. So geht nichts unter, was für Sie wichtig sein könnte.',
    longDu:
      'Im Kalender siehst du relevante Termine an einem Ort – zum Beispiel Fristen, Abstimmungen, Wahltermine und Beteiligungsmöglichkeiten auf kommunaler Ebene, im Saarland oder auf Bundesebene. So geht nichts unter, was für dich wichtig sein könnte.',
    longSie:
      'Im Kalender sehen Sie relevante Termine an einem Ort – zum Beispiel Fristen, Abstimmungen, Wahltermine und Beteiligungsmöglichkeiten auf kommunaler Ebene, im Saarland oder auf Bundesebene. So geht nichts unter, was für Sie wichtig sein könnte.',
    speakSegmentsDu: [
      'Im Kalender siehst du relevante Termine an einem Ort – zum Beispiel Fristen, Abstimmungen, Wahltermine und Beteiligungsmöglichkeiten auf kommunaler Ebene, im Saarland oder auf Bundesebene. So geht nichts unter, was für dich wichtig sein könnte.',
    ],
    speakSegmentsSie: [
      'Im Kalender sehen Sie relevante Termine an einem Ort – zum Beispiel Fristen, Abstimmungen, Wahltermine und Beteiligungsmöglichkeiten auf kommunaler Ebene, im Saarland oder auf Bundesebene. So geht nichts unter, was für Sie wichtig sein könnte.',
    ],
  },
  meldungen: {
    label: 'Meldungen',
    line10sDu: 'Meldung an die Gemeinde Kirkel – nachvollziehbarer Bearbeitungsstand.',
    line10sSie: 'Meldung an die Gemeinde Kirkel – nachvollziehbarer Bearbeitungsstand.',
    shortDu:
      'Hier meldest du ein Anliegen direkt an die Gemeinde – zum Beispiel ein Problem auf einem Spielplatz, eine defekte Laterne oder eine Gefahrenstelle. Du siehst danach nachvollziehbar, wie der Bearbeitungsstand ist.',
    shortSie:
      'Hier melden Sie ein Anliegen direkt an die Gemeinde – zum Beispiel ein Problem auf einem Spielplatz, eine defekte Laterne oder eine Gefahrenstelle. Sie sehen danach nachvollziehbar, wie der Bearbeitungsstand ist.',
    longDu:
      'Hier meldest du ein Anliegen direkt an die Gemeinde – zum Beispiel ein Problem auf einem Spielplatz, eine defekte Laterne oder eine Gefahrenstelle. Du siehst danach nachvollziehbar, wie der Bearbeitungsstand ist.',
    longSie:
      'Hier melden Sie ein Anliegen direkt an die Gemeinde – zum Beispiel ein Problem auf einem Spielplatz, eine defekte Laterne oder eine Gefahrenstelle. Sie sehen danach nachvollziehbar, wie der Bearbeitungsstand ist.',
    speakSegmentsDu: [
      'Hier meldest du ein Anliegen direkt an die Gemeinde – zum Beispiel ein Problem auf einem Spielplatz, eine defekte Laterne oder eine Gefahrenstelle. Du siehst danach nachvollziehbar, wie der Bearbeitungsstand ist.',
    ],
    speakSegmentsSie: [
      'Hier melden Sie ein Anliegen direkt an die Gemeinde – zum Beispiel ein Problem auf einem Spielplatz, eine defekte Laterne oder eine Gefahrenstelle. Sie sehen danach nachvollziehbar, wie der Bearbeitungsstand ist.',
    ],
  },
  praemien: {
    label: 'Prämien',
    line10sDu: 'Prämien: freiwillig, lokal gedacht – unabhängig vom Abstimmungsverhalten.',
    line10sSie: 'Prämien: freiwillig, lokal gedacht – unabhängig vom Abstimmungsverhalten.',
    shortDu:
      'Prämien sind freiwillig und lokal gedacht. Wenn du sie aktivierst, können dir nach abgeschlossenen Beteiligungen regionale Vorteile angezeigt werden – unabhängig davon, wie du abgestimmt hast.',
    shortSie:
      'Prämien sind freiwillig und lokal gedacht. Wenn Sie sie aktivieren, können Ihnen nach abgeschlossenen Beteiligungen regionale Vorteile angezeigt werden – unabhängig davon, wie Sie abgestimmt haben.',
    longDu:
      'Prämien sind freiwillig und lokal gedacht. Wenn du sie aktivierst, können dir nach abgeschlossenen Beteiligungen regionale Vorteile angezeigt werden – unabhängig davon, wie du abgestimmt hast.',
    longSie:
      'Prämien sind freiwillig und lokal gedacht. Wenn Sie sie aktivieren, können Ihnen nach abgeschlossenen Beteiligungen regionale Vorteile angezeigt werden – unabhängig davon, wie Sie abgestimmt haben.',
    speakSegmentsDu: [
      'Prämien sind freiwillig und lokal gedacht. Wenn du sie aktivierst, können dir nach abgeschlossenen Beteiligungen regionale Vorteile angezeigt werden – unabhängig davon, wie du abgestimmt hast.',
    ],
    speakSegmentsSie: [
      'Prämien sind freiwillig und lokal gedacht. Wenn Sie sie aktivieren, können Ihnen nach abgeschlossenen Beteiligungen regionale Vorteile angezeigt werden – unabhängig davon, wie Sie abgestimmt haben.',
    ],
  },
  politikbarometer: {
    label: 'Politikbarometer',
    line10sDu: 'Themen markieren – neutral, ohne Empfehlung und ohne Meinungsprofil.',
    line10sSie: 'Themen markieren – neutral, ohne Empfehlung und ohne Meinungsprofil.',
    shortDu:
      'Zuerst markierst du, welche Themen dich besonders interessieren – zum Beispiel Digitalisierung, Wirtschaft, Bildung, Verkehr oder Sicherheit. So können später passende Abstimmungen, Termine und Informationen schneller sichtbar werden. Es entsteht keine politische Empfehlung und kein Meinungsprofil.',
    shortSie:
      'Zuerst markieren Sie, welche Themen Sie besonders interessieren – zum Beispiel Digitalisierung, Wirtschaft, Bildung, Verkehr oder Sicherheit. So können später passende Abstimmungen, Termine und Informationen schneller sichtbar werden. Es entsteht keine politische Empfehlung und kein Meinungsprofil.',
    longDu:
      'Zuerst markierst du, welche Themen dich besonders interessieren – zum Beispiel Digitalisierung, Wirtschaft, Bildung, Verkehr oder Sicherheit. So können später passende Abstimmungen, Termine und Informationen schneller sichtbar werden. Es entsteht keine politische Empfehlung und kein Meinungsprofil.',
    longSie:
      'Zuerst markieren Sie, welche Themen Sie besonders interessieren – zum Beispiel Digitalisierung, Wirtschaft, Bildung, Verkehr oder Sicherheit. So können später passende Abstimmungen, Termine und Informationen schneller sichtbar werden. Es entsteht keine politische Empfehlung und kein Meinungsprofil.',
    speakSegmentsDu: [
      'Zuerst markierst du, welche Themen dich besonders interessieren – zum Beispiel Digitalisierung, Wirtschaft, Bildung, Verkehr oder Sicherheit. So können später passende Abstimmungen, Termine und Informationen schneller sichtbar werden. Es entsteht keine politische Empfehlung und kein Meinungsprofil.',
    ],
    speakSegmentsSie: [
      'Zuerst markieren Sie, welche Themen Sie besonders interessieren – zum Beispiel Digitalisierung, Wirtschaft, Bildung, Verkehr oder Sicherheit. So können später passende Abstimmungen, Termine und Informationen schneller sichtbar werden. Es entsteht keine politische Empfehlung und kein Meinungsprofil.',
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
