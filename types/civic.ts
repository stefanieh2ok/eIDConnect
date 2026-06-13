/** Civic Trust data model — source-locked demo registries (Kirkel / Saarpfalz). */

export type CivicConfidenceLevel = 'verified' | 'demo' | 'needs_verification' | 'reference_only';

export type CivicAuthorityType =
  | 'municipality'
  | 'county'
  | 'jobcenter'
  | 'federal_agency';

export type CivicFormType = 'official_reference' | 'demo_preview' | 'generated_packet';

export type CivicPrefillRisk = 'low' | 'medium' | 'high';

export type CivicSourceRef = {
  label: string;
  url: string;
  lastVerifiedAt: string;
  confidenceLevel: CivicConfidenceLevel;
  legalDisclaimer: string;
};

export type CivicAuthority = {
  authorityId: string;
  name: string;
  type: CivicAuthorityType;
  jurisdiction: string[];
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  openingHoursSummary?: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  confidenceLevel: CivicConfidenceLevel;
  legalDisclaimer: string;
  services: string[];
  /** Optional context notes (e.g. BA post address Saarbrücken). */
  contextNotes?: string[];
};

export type CivicDocumentRequirement = {
  id: string;
  label: string;
  required: boolean;
  hint?: string;
};

export type CivicService = {
  serviceId: string;
  title: string;
  category: string;
  authorityId: string;
  description: string;
  requiredDocuments: CivicDocumentRequirement[];
  optionalDocuments?: CivicDocumentRequirement[];
  forms: string[];
  appointmentRequired: boolean;
  onlineOption?: string;
  prefillFields?: string[];
  missingFields?: string[];
  reviewRequired: boolean;
  prefillRisk?: CivicPrefillRisk;
  noSubmission: true;
  sourceUrl: string;
  lastVerifiedAt: string;
  confidenceLevel: CivicConfidenceLevel;
  legalDisclaimer: string;
  disclaimer: string;
};

export type CivicFormField = {
  fieldId: string;
  label: string;
  required: boolean;
  sensitive?: boolean;
};

export type CivicForm = {
  formId: string;
  title: string;
  authorityId: string;
  serviceId: string;
  formType: CivicFormType;
  sourceUrl: string;
  demoPreviewPath?: string;
  fields: CivicFormField[];
  prefillMapping: Record<string, string>;
  requiresUserReview: boolean;
  canGenerateDemoPdf: boolean;
  lastVerifiedAt: string;
  confidenceLevel: CivicConfidenceLevel;
  legalDisclaimer: string;
};

export type CivicDemoProfile = {
  profileId: string;
  isDemoData: true;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
  };
  email: string;
  phone: string;
  municipality: string;
  county: string;
  federalState: string;
  employmentStatus: string;
  vehicleOwner: boolean;
  demoNotice: string;
};

export type CivicPrefillField = {
  fieldId: string;
  label: string;
  value: string;
  source: 'profile' | 'demo_profile';
  requiresReview: boolean;
};

export type CivicMissingField = {
  fieldId: string;
  label: string;
  reason: string;
  sensitive?: boolean;
};

export type CivicReviewField = {
  fieldId: string;
  label: string;
  note: string;
};

export type CivicPrefillPacket = {
  serviceId: string;
  authorityId: string;
  filledFields: CivicPrefillField[];
  missingFields: CivicMissingField[];
  reviewFields: CivicReviewField[];
  documentsChecklist: CivicDocumentRequirement[];
  authority: CivicAuthority;
  sourceRefs: CivicSourceRef[];
  disclaimer: string;
  noSubmission: true;
  demoNotice: string;
  appointmentRequired: boolean;
  contextNotes?: string[];
};
