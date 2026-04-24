import { INTRO_WALKTHROUGH_CLARA } from '@/data/introWalkthroughClara';
import { INTRO_OVERLAY_STEPS } from '@/data/introOverlayMarketing';

type StepId = (typeof INTRO_OVERLAY_STEPS)[number]['id'];

/**
 * Baut die Du-Variante der festen Intro-`body`-Texte (parallel zu `longDu` in `INTRO_WALKTHROUGH_CLARA`).
 */
export function adaptIntroAddress(text: string, du: boolean): string {
  if (!du) return text;

  for (const s of INTRO_OVERLAY_STEPS) {
    if (text === s.body) {
      return INTRO_WALKTHROUGH_CLARA[s.id as StepId].longDu;
    }
  }
  return text;
}
