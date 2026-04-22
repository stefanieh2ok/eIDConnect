import { APP_DISPLAY_NAME } from '@/lib/branding';
import {
  INTRO_ANREDE_LEADIN_DU,
  INTRO_ANREDE_LEADIN_SIE,
  INTRO_ANREDE_SPOKEN_OPENING_DU,
  INTRO_ANREDE_SPOKEN_OPENING_SIE,
  INTRO_EID_FRAMING_SHORT,
  INTRO_EID_SPOKEN_MVP,
} from '@/data/introOverlayMarketing';

/**
 * Vorlesen auf dem Anrede-Gate: Öffnung + Lead-in passen zur Vorschau (Du- vs. Sie-Taste / Fokus).
 */
export function introAnredeGateSpoken(duMode: boolean): string {
  const open = duMode ? INTRO_ANREDE_SPOKEN_OPENING_DU : INTRO_ANREDE_SPOKEN_OPENING_SIE;
  const lead = duMode ? INTRO_ANREDE_LEADIN_DU : INTRO_ANREDE_LEADIN_SIE;
  return `${open} ${lead}`;
}

/**
 * Vorlesen auf dem Login (Schritt 2) nach gewählter Anrede.
 */
export function introEidLoginSpoken(du: boolean, appName: string = APP_DISPLAY_NAME): string {
  const base = `Schritt 2 von 8. ${appName}. Informieren, Mitreden, Mitgestalten. ${INTRO_EID_FRAMING_SHORT} Anmeldung mit eID, Demo. ${INTRO_EID_SPOKEN_MVP}`;
  return du
    ? `${base} Du meldest dich über die Schaltfläche mit der Demo-eID an.`
    : `${base} Sie melden sich über die Schaltfläche mit der Demo-eID an.`;
}
