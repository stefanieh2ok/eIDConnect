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
    line10sDu: 'Du siehst zuerst die Argumente.',
    line10sSie: 'Sie sehen zuerst die Argumente.',
    shortDu: 'Du siehst zuerst die Argumente.',
    shortSie: 'Sie sehen zuerst die Argumente.',
    longDu:
      'Du siehst zuerst die Argumente.\n\n' +
      'Und kannst dann entscheiden, was für dich passt.',
    longSie:
      'Sie sehen zuerst die Argumente.\n\n' +
      'Und können dann entscheiden, was für Sie passt.',
    speakSegmentsDu: [
      'Du siehst zuerst die Argumente.',
      'Und kannst dann entscheiden, was für dich passt.',
    ],
    speakSegmentsSie: [
      'Sie sehen zuerst die Argumente.',
      'Und können dann entscheiden, was für Sie passt.',
    ],
  },
  wahlen: {
    label: 'Wahlen',
    line10sDu: 'Hier bekommst du eine Vorschau auf Wahlen.',
    line10sSie: 'Hier bekommen Sie eine Vorschau auf Wahlen.',
    shortDu: 'Hier bekommst du eine Vorschau auf Wahlen.',
    shortSie: 'Hier bekommen Sie eine Vorschau auf Wahlen.',
    longDu:
      'Hier bekommst du eine Vorschau auf Wahlen.\n\n' +
      'Mit Kandidierenden, Programmen und offiziellen Quellen.',
    longSie:
      'Hier bekommen Sie eine Vorschau auf Wahlen.\n\n' +
      'Mit Kandidierenden, Programmen und offiziellen Quellen.',
    speakSegmentsDu: [
      'Hier bekommst du eine Vorschau auf Wahlen.',
      'Mit Kandidierenden, Programmen und offiziellen Quellen.',
    ],
    speakSegmentsSie: [
      'Hier bekommen Sie eine Vorschau auf Wahlen.',
      'Mit Kandidierenden, Programmen und offiziellen Quellen.',
    ],
  },
  kalender: {
    label: 'Kalender',
    line10sDu: 'Hier siehst du, was ansteht.',
    line10sSie: 'Hier sehen Sie, was ansteht.',
    shortDu: 'Hier siehst du, was ansteht.',
    shortSie: 'Hier sehen Sie, was ansteht.',
    longDu:
      'Hier siehst du, was ansteht.\n\n' +
      'Und bis wann du dich beteiligen kannst.',
    longSie:
      'Hier sehen Sie, was ansteht.\n\n' +
      'Und bis wann Sie sich beteiligen können.',
    speakSegmentsDu: [
      'Hier siehst du, was ansteht.',
      'Und bis wann du dich beteiligen kannst.',
    ],
    speakSegmentsSie: [
      'Hier sehen Sie, was ansteht.',
      'Und bis wann Sie sich beteiligen können.',
    ],
  },
  meldungen: {
    label: 'Meldungen',
    line10sDu: 'Du kannst hier direkt etwas melden.',
    line10sSie: 'Sie können hier direkt etwas melden.',
    shortDu: 'Du kannst hier direkt etwas melden.',
    shortSie: 'Sie können hier direkt etwas melden.',
    longDu:
      'Du kannst hier direkt etwas melden.\n\n' +
      'Und nachvollziehen, was daraus wird.',
    longSie:
      'Sie können hier direkt etwas melden.\n\n' +
      'Und nachvollziehen, was daraus wird.',
    speakSegmentsDu: [
      'Du kannst hier direkt etwas melden.',
      'Und nachvollziehen, was daraus wird.',
    ],
    speakSegmentsSie: [
      'Sie können hier direkt etwas melden.',
      'Und nachvollziehen, was daraus wird.',
    ],
  },
  praemien: {
    label: 'Prämien',
    line10sDu: 'Prämien sind optional.',
    line10sSie: 'Prämien sind optional.',
    shortDu: 'Prämien sind optional.',
    shortSie: 'Prämien sind optional.',
    longDu:
      'Prämien sind optional.\n\n' +
      'Und unabhängig davon, wie du dich entscheidest.',
    longSie:
      'Prämien sind optional.\n\n' +
      'Und unabhängig davon, wie Sie sich entscheiden.',
    speakSegmentsDu: [
      'Prämien sind optional.',
      'Und unabhängig davon, wie du dich entscheidest.',
    ],
    speakSegmentsSie: [
      'Prämien sind optional.',
      'Und unabhängig davon, wie Sie sich entscheiden.',
    ],
  },
  politikbarometer: {
    label: 'Politikbarometer',
    line10sDu: 'Hier markierst du Themen, die dir wichtig sind.',
    line10sSie: 'Hier markieren Sie Themen, die Ihnen wichtig sind.',
    shortDu: 'Hier markierst du Themen, die dir wichtig sind.',
    shortSie: 'Hier markieren Sie Themen, die Ihnen wichtig sind.',
    longDu:
      'Hier markierst du Themen, die dir wichtig sind.\n\n' +
      'Damit du schneller findest, was relevant ist.',
    longSie:
      'Hier markieren Sie Themen, die Ihnen wichtig sind.\n\n' +
      'Damit Sie schneller finden, was relevant ist.',
    speakSegmentsDu: [
      'Hier markierst du Themen, die dir wichtig sind.',
      'Damit du schneller findest, was relevant ist.',
      'Deine Teilnahme bleibt geschützt.',
      'Und deine Entscheidung wird getrennt verarbeitet.',
    ],
    speakSegmentsSie: [
      'Hier markieren Sie Themen, die Ihnen wichtig sind.',
      'Damit Sie schneller finden, was relevant ist.',
      'Ihre Teilnahme bleibt geschützt.',
      'Und Ihre Entscheidung wird getrennt verarbeitet.',
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
