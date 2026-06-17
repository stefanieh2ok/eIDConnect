/**
 * Civic journey template types and mastercase registry.
 */
import { MASTERCASE_JOURNEY_MATRIX } from '@/lib/civic/mastercaseJourneyMatrix';

export type CivicJourneyId =
  | 'child_birth_kita'
  | 'moving_with_children'
  | 'housing_support'
  | 'childcare_school'
  | 'family_care'
  | 'id_passport'
  | 'separation_support'
  | 'unemployment_training'
  | 'pension_retirement'
  | 'death_case'
  | 'marriage_name_change'
  | 'vehicle_registration'
  | 'business_registration'
  | 'self_employed_start'
  | 'company_foundation'
  | 'employer_onboarding'
  | 'craft_business_start'
  | 'gastronomy_permit'
  | 'business_change_deregister'
  | 'funding_startup'
  | 'building_use_change'
  | 'event_special_use'
  | 'ecommerce_start'
  | 'public_procurement_readiness';

export type CivicJourneyDomain = 'private' | 'business' | 'both';
export type CivicJourneyPriority = 'mvp' | 'next' | 'later';

export type CivicJourneyTemplate = {
  id: CivicJourneyId;
  title: string;
  domain: CivicJourneyDomain;
  priority: CivicJourneyPriority;
  triggerPhrases: string[];
  defaultMode: 'private' | 'business' | 'unsure';
  quickStartLabel?: string;
  quickStartText: string;
  knownContextUse: string[];
  topicLabels: string[];
  orderedSteps: string[];
  suggestedAuthorities: string[];
  requiredDocuments: string[];
  sourceKeywords: string[];
  relevantServiceKeywords: string[];
  catalogServiceIds: string[];
  uncataloguedStepLabels: string[];
  missingQuestionTemplates: {
    id: string;
    questionDu: string;
    questionSie: string;
    skipIfTextMatches?: RegExp;
  }[];
  situationSummaryDu: string;
  situationSummarySie: string;
  outputToneHint?: string;
};

export const CIVIC_JOURNEY_TEMPLATES: CivicJourneyTemplate[] = MASTERCASE_JOURNEY_MATRIX;

export function getJourneyTemplateById(id: CivicJourneyId): CivicJourneyTemplate | undefined {
  return CIVIC_JOURNEY_TEMPLATES.find((t) => t.id === id);
}

export function getJourneyDomainLabel(id: CivicJourneyId, du = true): string | null {
  const t = getJourneyTemplateById(id);
  if (!t) return null;
  if (t.domain === 'business') return 'Unternehmen';
  if (t.domain === 'both') return du ? 'Privat & Unternehmen' : 'Privat & Unternehmen';
  return du ? 'Privat' : 'Privat';
}

export const QUICK_START_JOURNEY_IDS: CivicJourneyId[] = [
  'child_birth_kita',
  'moving_with_children',
  'housing_support',
  'family_care',
  'id_passport',
  'business_registration',
  'employer_onboarding',
];
