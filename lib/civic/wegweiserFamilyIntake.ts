/**
 * Birth/Kita clarification options and journey routing from intake answers.
 */
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';
import type { IntakeAnswerMap, IntakeQuestion } from '@/lib/civic/civicGuidedIntake';

const NOT_SURE = { value: 'not_sure', label: 'Weiß ich nicht' };

export function isKitaFocusedInput(text: string): boolean {
  const t = text.toLowerCase();
  const kita =
    /kita|kinderbetreuung|krippe|tagesmutter|betreuungsplatz|kindergarten|hort platz|kita-platz|kita platz/.test(
      t,
    );
  const birth = /geburt|schwanger|elterngeld|kindergeld|bekomme ein kind|baby|mutterschaft|neugeboren/.test(
    t,
  );
  return kita && !birth;
}

export function isBirthFocusedInput(text: string): boolean {
  const t = text.toLowerCase();
  return /geburt|schwanger|elterngeld|kindergeld|bekomme ein kind|baby|mutterschaft|neugeboren/.test(t);
}

export function buildBirthKitaClarificationQuestion(du: boolean, inputText: string): IntakeQuestion {
  const kitaFirst = isKitaFocusedInput(inputText);
  const options = kitaFirst
    ? [
        { value: 'kita_search', label: 'Kita-Platz suchen' },
        { value: 'child_expected', label: 'Kind wird erwartet' },
        { value: 'child_born', label: 'Kind ist bereits geboren' },
        { value: 'all_together', label: 'Alles zusammen' },
        NOT_SURE,
      ]
    : [
        { value: 'child_expected', label: 'Kind wird erwartet' },
        { value: 'child_born', label: 'Kind ist bereits geboren' },
        { value: 'kita_search', label: 'Kita-Platz suchen' },
        { value: 'all_together', label: 'Alles zusammen' },
        NOT_SURE,
      ];

  return {
    id: 'family_topic',
    label: du ? 'Worum geht es bei dir gerade?' : 'Worum geht es bei Ihnen gerade?',
    type: 'single_choice',
    options,
    optional: true,
  };
}

export function resolveFamilyJourneyFromAnswers(
  answers: IntakeAnswerMap,
  fallbackJourneyId: CivicJourneyId | null,
  inputText: string,
): CivicJourneyId | null {
  const topic = answers.family_topic;
  if (topic === 'kita_search') return 'childcare_school';
  if (topic === 'child_expected' || topic === 'child_born') return 'child_birth_kita';
  if (topic === 'all_together') return 'child_birth_kita';
  if (isKitaFocusedInput(inputText)) return 'childcare_school';
  if (isBirthFocusedInput(inputText)) return 'child_birth_kita';
  return fallbackJourneyId;
}

export function isKitaFocusedPlanContext(
  journeyId: CivicJourneyId | undefined,
  inputText: string,
  answers?: IntakeAnswerMap,
): boolean {
  if (journeyId === 'childcare_school') return true;
  if (answers?.family_topic === 'kita_search') return true;
  return isKitaFocusedInput(inputText);
}

export function countSelectableClarificationOptions(question: IntakeQuestion): number {
  return (question.options ?? []).filter((opt) => opt.value !== 'skip').length;
}
