import {
  INTRO_ANREDE_GATE_AFTER_DU_SPOKEN_SEGMENTS,
  INTRO_ANREDE_GATE_AFTER_SIE_SPOKEN_SEGMENTS,
  INTRO_ANREDE_GATE_PRE_CHOICE_SPOKEN_SEGMENTS,
  INTRO_SPOKEN_EID_SEGMENTS_DU,
  INTRO_SPOKEN_EID_SEGMENTS_SIE,
} from '@/data/introOverlayMarketing';

/**
 * Anrede: 45s-Elevator (segmentiert) + Ansprache-Follow. Kein separater generischer Mini-Bot.
 */
export function introAnredeGateSpokenParts(choice: 'du' | 'sie' | null): string[] {
  if (choice === 'du') {
    return [...INTRO_ANREDE_GATE_AFTER_DU_SPOKEN_SEGMENTS];
  }
  if (choice === 'sie') {
    return [...INTRO_ANREDE_GATE_AFTER_SIE_SPOKEN_SEGMENTS];
  }
  return [...INTRO_ANREDE_GATE_PRE_CHOICE_SPOKEN_SEGMENTS];
}

/**
 * Vollständiger Anrede-Gate-Text für Review/Export: neutral vor der Wahl, dann der gewählte Zweig.
 */
export function introAnredeGateSpoken(duMode: boolean): string {
  return [
    ...INTRO_ANREDE_GATE_PRE_CHOICE_SPOKEN_SEGMENTS,
    ...(duMode ? INTRO_ANREDE_GATE_AFTER_DU_SPOKEN_SEGMENTS : INTRO_ANREDE_GATE_AFTER_SIE_SPOKEN_SEGMENTS),
  ]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function introAnredeGateSpokenForChoice(choice: 'du' | 'sie' | null): string {
  return introAnredeGateSpokenParts(choice).join(' ');
}

/**
 * Zugangsschritt (eID / Wallet / Demo): Spoken, segmentiert.
 */
export function introEidLoginSpokenParts(du: boolean): string[] {
  return du ? [...INTRO_SPOKEN_EID_SEGMENTS_DU] : [...INTRO_SPOKEN_EID_SEGMENTS_SIE];
}

export function introEidLoginSpoken(du: boolean): string {
  return introEidLoginSpokenParts(du).join(' ');
}
