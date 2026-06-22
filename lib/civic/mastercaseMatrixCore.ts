/**
 * Core types and builders for the Wegweiser mastercase matrix.
 */
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';

export type MastercaseDomain = 'private' | 'business' | 'employer' | 'mixed';
export type MastercasePriority = 'mvp' | 'important' | 'later';
export type MastercaseSourceStatus =
  | 'verified_catalog'
  | 'regional_lookup_required'
  | 'catalog_missing'
  | 'template_only';
export type MastercaseActionStatus = 'required' | 'optional' | 'conditional' | 'advisory';
export type MastercaseSourceRequirement = 'verified' | 'regional' | 'missing' | 'template';

export type MastercaseAction = {
  title: string;
  timing?: string;
  authority: string;
  documents?: string[];
  officialActionId?: string;
  status: MastercaseActionStatus;
  sourceRequirement: MastercaseSourceRequirement;
  notes?: string;
};

export type MastercaseDefinition = {
  id: string;
  title: string;
  domain: MastercaseDomain;
  category: string;
  priority: MastercasePriority;
  journeyId?: CivicJourneyId;
  triggerPhrases: string[];
  userIntentExamples: string[];
  knownContextUsage: string[];
  responsibleAuthorities: string[];
  orderedActions: MastercaseAction[];
  requiredDocuments: string[];
  optionalDocuments: string[];
  officialActionIds: string[];
  regionalLookupRequired: boolean;
  sourceStatus: MastercaseSourceStatus;
  missingQuestions: string[];
  safetyNotes: string[];
  governanceNotes: string[];
  testInputs: string[];
};

export const GOVERNANCE_DEFAULT = [
  'Clara unterstützt bei der Vorbereitung — keine Rechtsberatung, keine Antragstellung.',
  'Verbindlich entscheidet die zuständige Stelle.',
];

export const REGIONAL_NOTE = 'Zuständige Stelle suchen — kein erfundener Kommunal-Link.';

export function action(
  title: string,
  authority: string,
  opts: Partial<MastercaseAction> & { status: MastercaseActionStatus; sourceRequirement: MastercaseSourceRequirement },
): MastercaseAction {
  return { title, authority, ...opts };
}

export function mastercase(
  config: Omit<MastercaseDefinition, 'governanceNotes'> & { governanceNotes?: string[] },
): MastercaseDefinition {
  return {
    ...config,
    governanceNotes: config.governanceNotes ?? GOVERNANCE_DEFAULT,
  };
}
