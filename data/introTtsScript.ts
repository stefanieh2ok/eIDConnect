/**
 * Vollständige TTS-Texte der Einführung — gebündelt zu Review/Export/Tests.
 * Soll die Logik in AnredeGate, LoginScreen, IntroOptInGate, DemoIntroWalkthrough widerspiegeln.
 */
import { APP_DISPLAY_NAME } from '@/lib/branding';
import { adaptIntroAddress } from '@/lib/introAddress';
import { introAnredeGateSpoken, introEidLoginSpoken } from '@/lib/introSpokenTts';
import {
  INTRO_CLOSING_TEXT_DU,
  INTRO_CLOSING_TEXT_SIE,
  INTRO_OPT_IN_HINT_DU,
  INTRO_OPT_IN_HINT_SIE,
  INTRO_OPT_IN_LEAD_DU,
  INTRO_OPT_IN_LEAD_SIE,
  INTRO_OPT_IN_TITLE_DU,
  INTRO_OPT_IN_TITLE_SIE,
  introOverlayFramingLine,
  INTRO_OVERLAY_STEPS,
  INTRO_TOTAL_STEPS,
  introClaraWelcomePlain,
  type IntroOverlayStepId,
} from '@/data/introOverlayMarketing';

export type IntroTtsId = 'anrede' | 'eid' | 'opt_in' | IntroOverlayStepId;

export type IntroTtsEntry = {
  /** Entspricht &quot;Schritt X von 8&quot;; `null` für das Opt-in-Gate (kein Zähler in der Ansage). */
  step: number | null;
  id: IntroTtsId;
  title: string;
  tts: string;
};

function shortWalkthroughTitle(t: string): string {
  return t.replace(/^\d+\)\s*/, '').trim();
}

function buildWalkthroughTts(du: boolean, index: number): string {
  const step = INTRO_OVERLAY_STEPS[index];
  const isLast = index === INTRO_OVERLAY_STEPS.length - 1;
  const isAbstimmen = step.id === 'abstimmen';
  const globalStepNumber = index + 3;
  const bodyForSpeech = adaptIntroAddress(
    isAbstimmen ? step.body.replace(/\n\n+/g, '\n') : step.body,
    du,
  )
    .replace(/\n+/g, ' ')
    .trim();
  const framingLine = introOverlayFramingLine(step.id, du);
  const meta = framingLine ? ` Kurz: ${framingLine}` : '';
  const closing = (du ? INTRO_CLOSING_TEXT_DU : INTRO_CLOSING_TEXT_SIE).replace(/\n+/g, ' ').trim();
  let text = `Schritt ${globalStepNumber} von ${INTRO_TOTAL_STEPS}. ${step.title}. ${bodyForSpeech}${meta}`;
  if (isLast) {
    text += ` ${closing}`;
  }
  return text;
}

export function buildIntroTtsManifest(du: boolean): IntroTtsEntry[] {
  const optTitle = du ? INTRO_OPT_IN_TITLE_DU : INTRO_OPT_IN_TITLE_SIE;
  const optLead = du ? INTRO_OPT_IN_LEAD_DU : INTRO_OPT_IN_LEAD_SIE;
  const optHint = du ? INTRO_OPT_IN_HINT_DU : INTRO_OPT_IN_HINT_SIE;

  const anredeTts = introAnredeGateSpoken(du);

  const eidTts = introEidLoginSpoken(du, APP_DISPLAY_NAME);

  const optInTts = `${introClaraWelcomePlain(du)} ${optTitle} ${optLead} ${optHint}`;

  const walk: IntroTtsEntry[] = INTRO_OVERLAY_STEPS.map((s, i) => ({
    step: i + 3,
    id: s.id,
    title: shortWalkthroughTitle(s.title),
    tts: buildWalkthroughTts(du, i),
  }));

  return [
    { step: 1, id: 'anrede', title: 'Willkommen', tts: anredeTts },
    { step: 2, id: 'eid', title: 'eID anmelden', tts: eidTts },
    { step: null, id: 'opt_in', title: 'Kurze App-Einführung?', tts: optInTts },
    ...walk,
  ];
}
