import {
  INTRO_ELEVATOR_SPOKEN_SEGMENTS_DU,
  INTRO_ELEVATOR_SPOKEN_SEGMENTS_SIE,
  INTRO_SPOKEN_ANREDE_FOLLOW_DU,
  INTRO_SPOKEN_ANREDE_FOLLOW_NEUTRAL,
  INTRO_SPOKEN_ANREDE_FOLLOW_SIE,
  INTRO_SPOKEN_EID_SEGMENTS_DU,
  INTRO_SPOKEN_EID_SEGMENTS_SIE,
} from '@/data/introOverlayMarketing';

/**
 * Anrede: 45s-Elevator (segmentiert) + Ansprache-Follow. Kein separater generischer Mini-Bot.
 */
export function introAnredeGateSpokenParts(choice: 'du' | 'sie' | null): string[] {
  if (choice === 'du') {
    return [...INTRO_ELEVATOR_SPOKEN_SEGMENTS_DU, ...INTRO_SPOKEN_ANREDE_FOLLOW_DU];
  }
  if (choice === 'sie') {
    return [...INTRO_ELEVATOR_SPOKEN_SEGMENTS_SIE, ...INTRO_SPOKEN_ANREDE_FOLLOW_SIE];
  }
  return [...INTRO_ELEVATOR_SPOKEN_SEGMENTS_SIE, ...INTRO_SPOKEN_ANREDE_FOLLOW_NEUTRAL];
}

export function introAnredeGateSpoken(duMode: boolean): string {
  return introAnredeGateSpokenParts(duMode ? 'du' : 'sie').join(' ');
}

export function introAnredeGateSpokenForChoice(choice: 'du' | 'sie' | null): string {
  return introAnredeGateSpokenParts(choice).join(' ');
}

/**
 * eID-Login: Spoken, segmentiert — Fokus Nutzen, ohne Relativierungs-Floskeln.
 */
export function introEidLoginSpokenParts(du: boolean): string[] {
  return du ? [...INTRO_SPOKEN_EID_SEGMENTS_DU] : [...INTRO_SPOKEN_EID_SEGMENTS_SIE];
}

export function introEidLoginSpoken(du: boolean): string {
  return introEidLoginSpokenParts(du).join(' ');
}
