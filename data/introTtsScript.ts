/**
 * Vollständige TTS-Texte der Einführung — gebündelt zu Review/Export/Tests.
 * Soll die Logik in AnredeGate, LoginScreen, DemoIntroWalkthrough widerspiegeln.
 */
import { claraBlockForStep } from '@/data/introWalkthroughClara';
import { introAnredeGateSpoken, introEidLoginSpoken } from '@/lib/introSpokenTts';
import {
  INTRO_CLOSING_SPOKEN_SEGMENTS_DU,
  INTRO_CLOSING_SPOKEN_SEGMENTS_SIE,
  INTRO_OVERLAY_STEPS,
  INTRO_TOTAL_STEPS,
  type IntroOverlayStepId,
} from '@/data/introOverlayMarketing';

export type IntroTtsId = 'anrede' | 'eid' | IntroOverlayStepId;

export type IntroTtsEntry = {
  /** Fortlaufende Position in der Einführung (1=Anrede … 8=Politikbarometer); TTS-Texte ohne laufende Nummern. */
  step: number;
  id: IntroTtsId;
  title: string;
  tts: string;
};

function shortWalkthroughTitle(t: string): string {
  return t.replace(/^\d+\)\s*/, '').trim();
}

/** Entspricht der Vorlese-Logik in `DemoIntroWalkthrough`: pro Screen Segmente, am Ende + Abschluss-Segmente. */
function buildWalkthroughTts(du: boolean, index: number): string {
  const step = INTRO_OVERLAY_STEPS[index];
  const isLast = index === INTRO_OVERLAY_STEPS.length - 1;
  const { line10s, speakSegments } = claraBlockForStep(step.id, du);
  const parts = [line10s, ...speakSegments];
  if (isLast) {
    parts.push(...(du ? INTRO_CLOSING_SPOKEN_SEGMENTS_DU : INTRO_CLOSING_SPOKEN_SEGMENTS_SIE));
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export function buildIntroTtsManifest(du: boolean): IntroTtsEntry[] {
  const anredeTts = introAnredeGateSpoken(du);

  const eidTts = introEidLoginSpoken(du);

  const walk: IntroTtsEntry[] = INTRO_OVERLAY_STEPS.map((s, i) => ({
    step: i + 3,
    id: s.id,
    title: shortWalkthroughTitle(s.title),
    tts: buildWalkthroughTts(du, i),
  }));

  return [
    { step: 1, id: 'anrede', title: 'Willkommen', tts: anredeTts },
    { step: 2, id: 'eid', title: 'eID anmelden', tts: eidTts },
    ...walk,
  ];
}
