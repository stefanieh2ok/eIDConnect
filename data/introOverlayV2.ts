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
  | 'alltag-chaos'
  | 'clara-wegweiserin'
  | 'wegweiser-plan'
  | 'melden-sichtbar'
  | 'mitwirken'
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
    id: 'alltag-chaos',
    titleDu: 'Wo fange ich an?',
    titleSie: 'Wo fange ich an?',
    bodyDu:
      'Ob Ausweis, Umzug, Kita, Jobverlust oder Schaden im Ort: Oft ist der nächste Schritt nicht sofort klar. HookAI Civic hilft dir, dein Anliegen zu sortieren.',
    bodySie:
      'Ob Ausweis, Umzug, Kita, Jobverlust oder Schaden im Ort: Oft ist der nächste Schritt nicht sofort klar. HookAI Civic hilft Ihnen, Ihr Anliegen zu sortieren.',
    navLabel: 'Alltag',
    filmBeat: 'close-up',
  },
  {
    id: 'clara-wegweiserin',
    titleDu: 'Clara bringt Ordnung rein.',
    titleSie: 'Clara bringt Ordnung rein.',
    bodyDu:
      'Clara ist deine Wegweiserin. Sie hilft beim Sortieren und Vorbereiten — aber sie entscheidet nicht und ersetzt keine Behörde.',
    bodySie:
      'Clara ist Ihre Wegweiserin. Sie hilft beim Sortieren und Vorbereiten — aber sie entscheidet nicht und ersetzt keine Behörde.',
    navLabel: 'Clara',
    filmBeat: 'calm-reveal',
  },
  {
    id: 'wegweiser-plan',
    titleDu: 'Aus Unsicherheit wird ein nächster Schritt.',
    titleSie: 'Aus Unsicherheit wird ein nächster Schritt.',
    bodyDu:
      'Du beschreibst dein Anliegen. Der Wegweiser zeigt, welche Stelle passen könnte, was vorzubereiten ist und worauf du achten solltest.',
    bodySie:
      'Sie beschreiben Ihr Anliegen. Der Wegweiser zeigt, welche Stelle passen könnte, was vorzubereiten ist und worauf Sie achten sollten.',
    navLabel: 'Wegweiser',
    filmBeat: 'reveal',
  },
  {
    id: 'melden-sichtbar',
    titleDu: 'Wenn etwas nicht stimmt, soll es sichtbar werden.',
    titleSie: 'Wenn etwas nicht stimmt, soll es sichtbar werden.',
    bodyDu:
      'Du kannst eine Meldung vorbereiten — zum Beispiel zu Müll, Schäden, Spielplatz oder Ratten. Die Demo zeigt den Ablauf, ohne echte Vorgänge zu versenden.',
    bodySie:
      'Sie können eine Meldung vorbereiten — zum Beispiel zu Müll, Schäden, Spielplatz oder Ratten. Die Demo zeigt den Ablauf, ohne echte Vorgänge zu versenden.',
    navLabel: 'Melden',
    filmBeat: 'action-moment',
  },
  {
    id: 'mitwirken',
    titleDu: 'Mitreden beginnt mit Verstehen.',
    titleSie: 'Mitreden beginnt mit Verstehen.',
    bodyDu:
      'HookAI Civic zeigt Beteiligung, Termine und neutrale Informationen — damit du nicht nur zuschaust.',
    bodySie:
      'HookAI Civic zeigt Beteiligung, Termine und neutrale Informationen — damit Sie nicht nur zuschauen.',
    navLabel: 'Mitwirken',
    filmBeat: 'montage',
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
