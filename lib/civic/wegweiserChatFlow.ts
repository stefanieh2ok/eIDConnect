import type { IntakeAnswerMap, IntakeQuestion } from '@/lib/civic/civicGuidedIntake';

export const ILLNESS_NEUTRAL_GUIDANCE_DU =
  'Wenn du tatsächlich arbeitsunfähig bist, kläre das ärztlich und halte die Meldepflichten gegenüber Arbeitgeber, Krankenkasse und Agentur für Arbeit sauber getrennt.';

export const ILLNESS_NEUTRAL_GUIDANCE_SIE =
  'Wenn Sie tatsächlich arbeitsunfähig sind, klären Sie das ärztlich und halten Sie die Meldepflichten gegenüber Arbeitgeber, Krankenkasse und Agentur für Arbeit sauber getrennt.';

export function buildCompactAnsweredSummary(
  answers: IntakeAnswerMap,
  questions: IntakeQuestion[],
  upToExclusiveIndex: number,
): string {
  const parts: string[] = [];
  for (let i = 0; i < upToExclusiveIndex; i++) {
    const q = questions[i];
    if (!q) continue;
    const raw = answers[q.id];
    if (!raw || raw === 'skip') continue;
    const opt = q.options?.find((o) => o.value === raw);
    parts.push(opt?.label ?? raw);
  }
  return parts.join(' · ');
}

export function shouldShowIllnessGuidance(answers: IntakeAnswerMap): boolean {
  return answers.health_aspect === 'ja_ich_bin_krank';
}

export function illnessGuidanceText(du: boolean): string {
  return du ? ILLNESS_NEUTRAL_GUIDANCE_DU : ILLNESS_NEUTRAL_GUIDANCE_SIE;
}
