/**
 * Vollständige TTS-Texte der Einführung — gebündelt zu Review/Export/Tests.
 * Spiegelt AnredeGate + DemoIntroWalkthrough (speakSegments pro Szene).
 */
import { claraBlockForStep } from '@/data/introWalkthroughClara';
import { introAnredeGateSpoken } from '@/lib/introSpokenTts';
import {
  INTRO_CLOSING_SPOKEN_SEGMENTS_DU,
  INTRO_CLOSING_SPOKEN_SEGMENTS_SIE,
  INTRO_OVERLAY_STEPS,
  INTRO_TOTAL_STEPS,
  type IntroOverlayStepId,
} from '@/data/introOverlayMarketing';

export type IntroTtsId = 'anrede' | IntroOverlayStepId;

export type IntroTtsEntry = {
  step: number;
  id: IntroTtsId;
  title: string;
  tts: string;
};

function shortWalkthroughTitle(t: string): string {
  return t.replace(/^\d+\)\s*/, '').trim();
}

/** Entspricht DemoIntroWalkthrough: nur speakSegments, am letzten Overlay-Schritt + Abschluss. */
function buildWalkthroughTts(du: boolean, index: number): string {
  const step = INTRO_OVERLAY_STEPS[index];
  const isLast = index === INTRO_OVERLAY_STEPS.length - 1;
  const { speakSegments } = claraBlockForStep(step.id, du);
  const parts = [...speakSegments];
  if (isLast) {
    parts.push(...(du ? INTRO_CLOSING_SPOKEN_SEGMENTS_DU : INTRO_CLOSING_SPOKEN_SEGMENTS_SIE));
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export function buildIntroTtsManifest(du: boolean): IntroTtsEntry[] {
  const anredeTts = introAnredeGateSpoken(du);

  const walk: IntroTtsEntry[] = INTRO_OVERLAY_STEPS.map((s, i) => ({
    step: i + 2,
    id: s.id,
    title: shortWalkthroughTitle(s.title),
    tts: buildWalkthroughTts(du, i),
  }));

  return [{ step: 1, id: 'anrede', title: 'Willkommen', tts: anredeTts }, ...walk];
}

export { INTRO_TOTAL_STEPS };
