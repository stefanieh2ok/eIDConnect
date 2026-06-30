/**
 * Intro Overlay v2 — interactive civic trailer (8 screens).
 * @see docs/intro-overlay-v2-brief.md
 */

export const INTRO_OVERLAY_V2_ENABLED = true;

export const INTRO_V2_CLAIM_DU = 'Du bist nicht nur Zuschauer.';
export const INTRO_V2_CLAIM_SIE = 'Sie sind nicht nur Zuschauer.';
export const INTRO_V2_LEITMOTIV = 'Verstehen. Vorbereiten. Melden. Mitwirken.';

export const INTRO_V2_FORBIDDEN_VISIBLE_TERMS = [
  'PVOG',
  'XZuFi',
  'GovService',
  'Investor',
  'Käufer',
  'Behördenentlastung',
  'weniger Rückfragen',
  'vollständigere Vorgänge',
  'Skandal',
  'Korruption',
  'ungesühnt',
  'bestrafen',
  'Lobbyisten',
] as const;

export type IntroOverlayV2StepId =
  | 'buergezugang-hook'
  | 'melden-aktion'
  | 'postfach-status'
  | 'beteiligen-mitwirken'
  | 'praemien-wallet'
  | 'wahlen-vorschau'
  | 'wegweiser-plan'
  | 'vertrauen-start';

export type IntroOverlayV2Step = {
  id: IntroOverlayV2StepId;
  titleDu: string;
  titleSie: string;
  bodyDu: string;
  bodySie: string;
  navLabel: string;
  filmBeat: string;
};

export const INTRO_OVERLAY_V2_STEPS: IntroOverlayV2Step[] = [
  {
    id: 'buergezugang-hook',
    titleDu: INTRO_V2_CLAIM_DU,
    titleSie: INTRO_V2_CLAIM_SIE,
    bodyDu:
      'HookAI Civic hilft dir, Behördenwege vorzubereiten, Probleme im Ort sichtbar zu machen und Beteiligung zu finden.',
    bodySie:
      'HookAI Civic hilft Ihnen, Behördenwege vorzubereiten, Probleme im Ort sichtbar zu machen und Beteiligung zu finden.',
    navLabel: 'Einstieg',
    filmBeat: 'cold-open',
  },
  {
    id: 'melden-aktion',
    titleDu: 'Wenn etwas nicht stimmt, soll es sichtbar werden.',
    titleSie: 'Wenn etwas nicht stimmt, soll es sichtbar werden.',
    bodyDu: 'Foto, Kategorie, Beschreibung — aus einem Problem wird eine vorbereitete Meldung.',
    bodySie: 'Foto, Kategorie, Beschreibung — aus einem Problem wird eine vorbereitete Meldung.',
    navLabel: 'Melden',
    filmBeat: 'action-moment',
  },
  {
    id: 'postfach-status',
    titleDu: 'Was du vorbereitest, bleibt nachvollziehbar.',
    titleSie: 'Was Sie vorbereiten, bleibt nachvollziehbar.',
    bodyDu: 'Hinweise, Rückfragen und Statusmeldungen erscheinen an einem Ort.',
    bodySie: 'Hinweise, Rückfragen und Statusmeldungen erscheinen an einem Ort.',
    navLabel: 'Postfach',
    filmBeat: 'status-loop',
  },
  {
    id: 'beteiligen-mitwirken',
    titleDu: 'Mitreden beginnt mit Verstehen.',
    titleSie: 'Mitreden beginnt mit Verstehen.',
    bodyDu:
      'Quellen, Pro und Contra helfen dir, neutral informiert mitzuwirken.',
    bodySie:
      'Quellen, Pro und Contra helfen Ihnen, neutral informiert mitzuwirken.',
    navLabel: 'Beteiligen',
    filmBeat: 'participation',
  },
  {
    id: 'praemien-wallet',
    titleDu: 'Mitwirkung darf sichtbar werden.',
    titleSie: 'Mitwirkung darf sichtbar werden.',
    bodyDu:
      'Lokale Prämien und Anerkennung — unabhängig von deiner Entscheidung.',
    bodySie:
      'Lokale Prämien und Anerkennung — unabhängig von Ihrer Entscheidung.',
    navLabel: 'Prämien',
    filmBeat: 'reward-reveal',
  },
  {
    id: 'wahlen-vorschau',
    titleDu: 'Neutral informiert bleiben.',
    titleSie: 'Neutral informiert bleiben.',
    bodyDu:
      'Wahlvorschau, Termine und verifizierte Quellen helfen dir, neutral informiert zu bleiben.',
    bodySie:
      'Wahlvorschau, Termine und verifizierte Quellen helfen Ihnen, neutral informiert zu bleiben.',
    navLabel: 'Wahlen',
    filmBeat: 'montage',
  },
  {
    id: 'wegweiser-plan',
    titleDu: 'Aus Unsicherheit wird ein nächster Schritt.',
    titleSie: 'Aus Unsicherheit wird ein nächster Schritt.',
    bodyDu:
      'Clara hilft beim Sortieren und Vorbereiten — aber sie entscheidet nicht.',
    bodySie:
      'Clara hilft beim Sortieren und Vorbereiten — aber sie entscheidet nicht.',
    navLabel: 'Wegweiser',
    filmBeat: 'reveal',
  },
  {
    id: 'vertrauen-start',
    titleDu: 'Bereit für den nächsten Schritt.',
    titleSie: 'Bereit für den nächsten Schritt.',
    bodyDu:
      'Diese Demo bereitet vor — sie entscheidet nicht. Offizielle Stellen bleiben maßgeblich. Echte Anträge werden hier nicht versendet.',
    bodySie:
      'Diese Demo bereitet vor — sie entscheidet nicht. Offizielle Stellen bleiben maßgeblich. Echte Anträge werden hier nicht versendet.',
    navLabel: 'Start',
    filmBeat: 'calm-trust',
  },
];

export function introV2PrimaryButton(stepIndex: number, du: boolean): string {
  if (stepIndex === 0) return 'Zeig mir, wie';
  if (stepIndex === INTRO_OVERLAY_V2_STEPS.length - 1) {
    return du ? 'Direkt zur App' : 'Direkt zur App';
  }
  return 'Weiter';
}

export function introV2StepTitle(step: IntroOverlayV2Step, du: boolean): string {
  return du ? step.titleDu : step.titleSie;
}

export function introV2StepBody(step: IntroOverlayV2Step, du: boolean): string {
  return du ? step.bodyDu : step.bodySie;
}

export function collectIntroV2VisibleCopy(du: boolean): string {
  const parts = [du ? INTRO_V2_CLAIM_DU : INTRO_V2_CLAIM_SIE, INTRO_V2_LEITMOTIV];
  for (const step of INTRO_OVERLAY_V2_STEPS) {
    parts.push(introV2StepTitle(step, du), introV2StepBody(step, du));
  }
  return parts.join(' ');
}

export function findForbiddenIntroV2Terms(text: string): string[] {
  const lower = text.toLowerCase();
  return INTRO_V2_FORBIDDEN_VISIBLE_TERMS.filter((term) =>
    lower.includes(term.toLowerCase()),
  );
}
