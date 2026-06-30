/**
 * Intro Overlay v2 — cinematic civic story (7 screens).
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
  | 'cold-open'
  | 'clara-wegweiserin'
  | 'melden-sichtbar'
  | 'wegweiser-plan'
  | 'postfach-status'
  | 'wahlen-vorschau'
  | 'vertrauen-start';

export type IntroOverlayV2Step = {
  id: IntroOverlayV2StepId;
  titleDu: string;
  titleSie: string;
  bodyDu: string;
  bodySie: string;
  /** Screenreader / Clara context label */
  navLabel: string;
  filmBeat: string;
};

export const INTRO_OVERLAY_V2_STEPS: IntroOverlayV2Step[] = [
  {
    id: 'cold-open',
    titleDu: INTRO_V2_CLAIM_DU,
    titleSie: INTRO_V2_CLAIM_SIE,
    bodyDu:
      'HookAI Civic hilft dir, Anliegen zu verstehen, Probleme sichtbar zu machen und Beteiligung zu finden.',
    bodySie:
      'HookAI Civic hilft Ihnen, Anliegen zu verstehen, Probleme sichtbar zu machen und Beteiligung zu finden.',
    navLabel: 'Einstieg',
    filmBeat: 'cold-open',
  },
  {
    id: 'clara-wegweiserin',
    titleDu: 'Wo fange ich an?',
    titleSie: 'Wo fange ich an?',
    bodyDu:
      'Du beschreibst dein Anliegen. Clara hilft beim Sortieren und Vorbereiten — aber sie entscheidet nicht.',
    bodySie:
      'Sie beschreiben Ihr Anliegen. Clara hilft beim Sortieren und Vorbereiten — aber sie entscheidet nicht.',
    navLabel: 'Wegweiser',
    filmBeat: 'close-up',
  },
  {
    id: 'melden-sichtbar',
    titleDu: 'Wenn etwas nicht stimmt, soll es sichtbar werden.',
    titleSie: 'Wenn etwas nicht stimmt, soll es sichtbar werden.',
    bodyDu:
      'Foto, Kategorie, Beschreibung — aus einem Problem wird eine vorbereitete Meldung.',
    bodySie:
      'Foto, Kategorie, Beschreibung — aus einem Problem wird eine vorbereitete Meldung.',
    navLabel: 'Melden',
    filmBeat: 'action-moment',
  },
  {
    id: 'wegweiser-plan',
    titleDu: 'Aus Unsicherheit wird ein nächster Schritt.',
    titleSie: 'Aus Unsicherheit wird ein nächster Schritt.',
    bodyDu:
      'Der Wegweiser zeigt, was vorzubereiten ist und worauf du achten solltest.',
    bodySie:
      'Der Wegweiser zeigt, was vorzubereiten ist und worauf Sie achten sollten.',
    navLabel: 'Fahrplan',
    filmBeat: 'reveal',
  },
  {
    id: 'postfach-status',
    titleDu: 'Was du vorbereitest, bleibt nachvollziehbar.',
    titleSie: 'Was Sie vorbereiten, bleibt nachvollziehbar.',
    bodyDu:
      'Hinweise, Rückfragen und Statusmeldungen erscheinen an einem Ort.',
    bodySie:
      'Hinweise, Rückfragen und Statusmeldungen erscheinen an einem Ort.',
    navLabel: 'Postfach',
    filmBeat: 'status-loop',
  },
  {
    id: 'wahlen-vorschau',
    titleDu: 'Mitreden beginnt mit Verstehen.',
    titleSie: 'Mitreden beginnt mit Verstehen.',
    bodyDu:
      'Wahlvorschau, Termine und Quellen helfen dir, neutral informiert zu bleiben.',
    bodySie:
      'Wahlvorschau, Termine und Quellen helfen Ihnen, neutral informiert zu bleiben.',
    navLabel: 'Wahlen',
    filmBeat: 'montage',
  },
  {
    id: 'vertrauen-start',
    titleDu: 'Mitwirkung darf sichtbar werden.',
    titleSie: 'Mitwirkung darf sichtbar werden.',
    bodyDu:
      'Anerkennung fürs Mitmachen — unabhängig von deiner Entscheidung. Diese Demo bereitet vor und versendet keine echten Anträge.',
    bodySie:
      'Anerkennung fürs Mitmachen — unabhängig von Ihrer Entscheidung. Diese Demo bereitet vor und versendet keine echten Anträge.',
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
