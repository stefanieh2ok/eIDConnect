/**
 * Official action / form catalogue types for Wegweiser.
 * URLs must come from verified sources — never invented at runtime.
 */
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';

export type OfficialActionLevel = 'federal' | 'state' | 'municipal' | 'agency' | 'mixed';

export type OfficialActionStatus =
  | 'online_service_available'
  | 'online_info_available'
  | 'pdf_form_available'
  | 'appointment_required'
  | 'regional_lookup_required'
  | 'counselling_required'
  | 'catalog_missing';

export type OfficialActionLinkKind =
  | 'online_service'
  | 'info_page'
  | 'pdf_form'
  | 'appointment'
  | 'source_page';

export type OfficialActionLink = {
  label: string;
  url?: string;
  kind: OfficialActionLinkKind;
  sourceOwner: string;
  level: OfficialActionLevel;
  status: OfficialActionStatus;
  requiresBundId?: boolean;
  requiresEid?: boolean;
  regionSpecific?: boolean;
  appliesToFederalState?: string[];
  appliesToMunicipality?: string[];
  lastVerified: string;
  confidence: 'manual_verified' | 'official_source' | 'needs_region_check';
  notes?: string;
};

export type OfficialAction = {
  actionId: string;
  title: string;
  description: string;
  journeyIds: CivicJourneyId[];
  triggerKeywords: string[];
  responsibleBodies: string[];
  requiredDocuments: string[];
  conditionalDocuments?: {
    condition: string;
    documents: string[];
  }[];
  links: OfficialActionLink[];
  sourceRuleIds?: string[];
  safetyNotes?: string[];
};

export type ResolvedOfficialAction = OfficialAction & {
  relevance: 'primary' | 'conditional' | 'optional';
  reason: string;
  availableLinks: OfficialActionLink[];
  missingLinkReason?: string;
  ctaLabel: string;
};

export type ResolvedOfficialActionGroup = {
  groupTitle: string;
  actions: ResolvedOfficialAction[];
};

export type TrainingFundingState =
  | 'training_interest_only'
  | 'training_coupon_to_clarify'
  | 'training_approved';

export const CATALOG_LAST_VERIFIED = '2026-06-01';
