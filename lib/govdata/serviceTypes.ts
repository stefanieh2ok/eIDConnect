/**
 * Normalized government service schema — UI-ready, adapter-agnostic.
 * PVOG/XZuFi live feeds map into this shape via serviceNormalizer.
 */

export type GovServiceSourceSystem =
  | 'PVOG'
  | 'Bundesportal'
  | 'ManualDemo'
  | 'VerifiedCatalog'
  | 'Unknown';

export type GovServiceConfidence = 'high' | 'medium' | 'low';

export type GovSituationType = 'private' | 'business' | 'both';

export type GovService = {
  serviceId: string;
  leikaKey?: string;
  title: string;
  shortDescription: string;
  category: string;
  situationType: GovSituationType;
  lifeSituation?: string;
  businessSituation?: string;
  prerequisites?: string[];
  requiredDocuments?: string[];
  fees?: string;
  deadlines?: string;
  responsibleAuthority?: string;
  regionRequired?: boolean;
  regionHint?: string;
  onlineServiceUrl?: string;
  formUrl?: string;
  officialSourceUrl?: string;
  sourceSystem: GovServiceSourceSystem;
  lastUpdated?: string;
  confidence?: GovServiceConfidence;
  /** Manually verified catalogue metadata */
  sourceLabel?: string;
  sourceVerifiedAt?: string;
  sourceOwner?: string;
  /** Keyword hints for deterministic matcher */
  matchKeywords?: string[];
};

export type DocumentReadinessItem = {
  id: string;
  label: string;
  readiness: 'likely' | 'possible' | 'regional';
  checked?: boolean;
};

export type CasePlanRisk = {
  id: string;
  text: string;
};

import type { ExternalLinkStatus } from '@/lib/govdata/externalLinkGate';

export type OfficialHandoverLink = {
  id: string;
  title: string;
  url?: string;
  label: string;
  authority?: string;
  linkStatus?: ExternalLinkStatus;
};

export type CivicCasePlanResult = {
  situationSummary: string;
  topics: string[];
  services: GovService[];
  /** Distinct responsible authorities for cross-agency orchestration */
  touchedAuthorities: string[];
  missingCriticalInfo: string[];
  followUpQuestions: string[];
  documents: DocumentReadinessItem[];
  sequenceSteps: string[];
  risks: CasePlanRisk[];
  handoverLinks: OfficialHandoverLink[];
  mode: 'private' | 'business' | 'unsure';
  isDemoData: boolean;
  sourceNotice?: string | null;
  sourceMode?: 'demo' | 'verified_catalog' | 'pvog_search' | 'pvog_bereitstelldienst';
};

export {
  CLARA_CASE_DISCLAIMER,
  CLARA_OFFICIAL_SOURCE_NOTICE,
  CLARA_DEMO_DATA_NOTICE,
} from '@/lib/claraCaseGuidance';

/** @deprecated Import from @/lib/claraCaseGuidance */
export const CLARA_NO_SUBMISSION_NOTICE =
  'Die Antragstellung erfolgt immer über die zuständige offizielle Stelle.';
