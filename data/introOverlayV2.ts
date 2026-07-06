/**
 * Intro Overlay v3 — calm Gov-App film flow (9 screens).
 * @see docs/intro-overlay-v2-brief.md
 */

export const INTRO_OVERLAY_V2_ENABLED = true;

export const INTRO_V2_CLAIM_DU = 'Dein Bürgerweg. Sicher vorbereitet.';
export const INTRO_V2_CLAIM_SIE = 'Ihr Bürgerweg. Sicher vorbereitet.';
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
  'Politikbarometer',
] as const;

export type IntroOverlayV2StepId =
  | 'ruhiger-einstieg'
  | 'melden-foto'
  | 'postfach-status'
  | 'wegweiser-clara'
  | 'beteiligen-punkte'
  | 'praemien-auswahl'
  | 'praemien-wallet-qr'
  | 'eid-trust'
  | 'abschluss';

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
    id: 'ruhiger-einstieg',
    titleDu: INTRO_V2_CLAIM_DU,
    titleSie: INTRO_V2_CLAIM_SIE,
    bodyDu:
      'HookAI Civic hilft dir, Anliegen zu ordnen, Meldungen vorzubereiten und Beteiligung nachvollziehbar zu machen.',
    bodySie:
      'HookAI Civic hilft Ihnen, Anliegen zu ordnen, Meldungen vorzubereiten und Beteiligung nachvollziehbar zu machen.',
    navLabel: 'Einstieg',
    filmBeat: 'calm-entry',
  },
  {
    id: 'melden-foto',
    titleDu: 'Wenn vor Ort etwas nicht stimmt.',
    titleSie: 'Wenn vor Ort etwas nicht stimmt.',
    bodyDu:
      'Ein Foto reicht als Einstieg. HookAI Civic hilft, daraus eine strukturierte Meldung vorzubereiten.',
    bodySie:
      'Ein Foto reicht als Einstieg. HookAI Civic hilft, daraus eine strukturierte Meldung vorzubereiten.',
    navLabel: 'Melden',
    filmBeat: 'melden-flow',
  },
  {
    id: 'postfach-status',
    titleDu: 'Alles bleibt nachvollziehbar.',
    titleSie: 'Alles bleibt nachvollziehbar.',
    bodyDu: 'Hinweise, Rückfragen und Statusmeldungen erscheinen an einem Ort.',
    bodySie: 'Hinweise, Rückfragen und Statusmeldungen erscheinen an einem Ort.',
    navLabel: 'Postfach',
    filmBeat: 'status-loop',
  },
  {
    id: 'wegweiser-clara',
    titleDu: 'Aus Unsicherheit wird ein nächster Schritt.',
    titleSie: 'Aus Unsicherheit wird ein nächster Schritt.',
    bodyDu: 'Clara hilft beim Sortieren und Vorbereiten — entscheidet aber nicht.',
    bodySie: 'Clara hilft beim Sortieren und Vorbereiten — entscheidet aber nicht.',
    navLabel: 'Wegweiser',
    filmBeat: 'clara-guide',
  },
  {
    id: 'beteiligen-punkte',
    titleDu: 'Mitreden beginnt mit Verstehen.',
    titleSie: 'Mitreden beginnt mit Verstehen.',
    bodyDu: 'Quellen, Pro und Contra helfen dir, neutral informiert mitzuwirken.',
    bodySie: 'Quellen, Pro und Contra helfen Ihnen, neutral informiert mitzuwirken.',
    navLabel: 'Beteiligen',
    filmBeat: 'participation-points',
  },
  {
    id: 'praemien-auswahl',
    titleDu: 'Mitwirkung darf sichtbar werden.',
    titleSie: 'Mitwirkung darf sichtbar werden.',
    bodyDu:
      'Lokale Prämien zeigen Anerkennung für Beteiligung — unabhängig von deiner Entscheidung.',
    bodySie:
      'Lokale Prämien zeigen Anerkennung für Beteiligung — unabhängig von Ihrer Entscheidung.',
    navLabel: 'Prämien',
    filmBeat: 'rewards-list',
  },
  {
    id: 'praemien-wallet-qr',
    titleDu: 'Dein Gutschein liegt bereit.',
    titleSie: 'Ihr Gutschein liegt bereit.',
    bodyDu:
      'Der QR-Code kann vor Ort eingelöst und perspektivisch im Wallet gespeichert werden.',
    bodySie:
      'Der QR-Code kann vor Ort eingelöst und perspektivisch im Wallet gespeichert werden.',
    navLabel: 'Wallet',
    filmBeat: 'qr-wallet',
  },
  {
    id: 'eid-trust',
    titleDu: 'Sicherer Zugang, wenn es darauf ankommt.',
    titleSie: 'Sicherer Zugang, wenn es darauf ankommt.',
    bodyDu:
      'Für echte Vorgänge kann der Zugang über eID oder die EU Digital Identity Wallet bestätigt werden.',
    bodySie:
      'Für echte Vorgänge kann der Zugang über eID oder die EU Digital Identity Wallet bestätigt werden.',
    navLabel: 'Vertrauen',
    filmBeat: 'identity-seal',
  },
  {
    id: 'abschluss',
    titleDu: 'Bereit für den nächsten Schritt.',
    titleSie: 'Bereit für den nächsten Schritt.',
    bodyDu: 'Melden, vorbereiten, beteiligen und Prämien verwalten — an einem Ort.',
    bodySie: 'Melden, vorbereiten, beteiligen und Prämien verwalten — an einem Ort.',
    navLabel: 'Start',
    filmBeat: 'finale',
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
