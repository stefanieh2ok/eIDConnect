import {
  MISSING_FIELD_REASONS,
  NEVER_PREFILL_FIELD_IDS,
  PROFILE_FIELD_LABELS,
} from '@/data/civic/forms/kirkel/fieldMappings';
import type {
  CivicAuthority,
  CivicDemoProfile,
  CivicForm,
  CivicMissingField,
  CivicPrefillField,
  CivicPrefillPacket,
  CivicReviewField,
  CivicService,
  CivicSourceRef,
} from '@/types/civic';

const DEMO_NOTICE = 'Demo / nicht amtlich.';
const BINDING_NOTICE = 'Verbindlich entscheidet die zuständige Stelle.';
const NO_SUBMISSION_NOTICE = 'Keine echte Einreichung über diese App.';

function formatAddress(profile: CivicDemoProfile): string {
  const { street, houseNumber, postalCode, city } = profile.address;
  return `${street} ${houseNumber}, ${postalCode} ${city}`;
}

function profileValue(profile: CivicDemoProfile, fieldId: string): string | null {
  switch (fieldId) {
    case 'firstName':
      return profile.firstName;
    case 'lastName':
      return profile.lastName;
    case 'dateOfBirth':
      return profile.dateOfBirth;
    case 'address':
      return formatAddress(profile);
    case 'email':
      return profile.email;
    case 'phone':
      return profile.phone;
    case 'municipality':
      return profile.municipality;
    case 'county':
      return profile.county;
    default:
      return null;
  }
}

function buildFilledFields(
  profile: CivicDemoProfile,
  service: CivicService,
): CivicPrefillField[] {
  const fieldIds = service.prefillFields ?? [];
  const filled: CivicPrefillField[] = [];

  for (const fieldId of fieldIds) {
    if (NEVER_PREFILL_FIELD_IDS.has(fieldId)) continue;
    const value = profileValue(profile, fieldId);
    if (!value) continue;
    filled.push({
      fieldId,
      label: PROFILE_FIELD_LABELS[fieldId] ?? fieldId,
      value,
      source: 'demo_profile',
      requiresReview: service.reviewRequired,
    });
  }

  return filled;
}

function buildMissingFields(service: CivicService): CivicMissingField[] {
  const ids = new Set<string>();

  for (const doc of service.requiredDocuments) {
    if (doc.required) ids.add(doc.id);
  }
  for (const fieldId of service.missingFields ?? []) {
    ids.add(fieldId);
  }
  if (service.serviceId === 'personalausweis-eid') {
    ids.add('idDocumentNumber');
  }
  if (service.serviceId === 'kfz-ummeldung') {
    ids.add('iban');
  }

  const missing: CivicMissingField[] = [];
  for (const fieldId of Array.from(ids)) {
    if (
      (service.prefillFields ?? []).includes(fieldId) &&
      !NEVER_PREFILL_FIELD_IDS.has(fieldId)
    ) {
      continue;
    }
    const doc = service.requiredDocuments.find((d) => d.id === fieldId);
    missing.push({
      fieldId,
      label: doc?.label ?? PROFILE_FIELD_LABELS[fieldId] ?? fieldId,
      reason:
        MISSING_FIELD_REASONS[fieldId] ??
        doc?.hint ??
        'Nicht im Demo-Profil — wird nicht geraten.',
      sensitive: NEVER_PREFILL_FIELD_IDS.has(fieldId) || fieldId === 'idDocumentNumber',
    });
  }

  const seen = new Set<string>();
  return missing.filter((m) => {
    if (seen.has(m.fieldId)) return false;
    seen.add(m.fieldId);
    return true;
  });
}

function buildReviewFields(
  filledFields: CivicPrefillField[],
  service: CivicService,
  authority: CivicAuthority,
): CivicReviewField[] {
  const reviews: CivicReviewField[] = filledFields
    .filter((f) => f.requiresReview)
    .map((f) => ({
      fieldId: f.fieldId,
      label: f.label,
      note: 'Bitte vor Vorsprache prüfen — Demo-Vorausfüllung.',
    }));

  if (service.serviceId === 'alg1-orientierung' && authority.contextNotes?.length) {
    reviews.push({
      fieldId: 'ba-kontaktlogik',
      label: 'Kontakt- und Postlogik (BA)',
      note: authority.contextNotes.join(' '),
    });
  }

  if (service.serviceId === 'buergergeld-erstantrag') {
    reviews.push({
      fieldId: 'anspruchspruefung',
      label: 'Keine Anspruchsprüfung',
      note: 'Diese Demo prüft keinen Anspruch auf Bürgergeld.',
    });
  }

  return reviews;
}

function buildSourceRefs(service: CivicService, authority: CivicAuthority): CivicSourceRef[] {
  return [
    {
      label: authority.name,
      url: authority.sourceUrl,
      lastVerifiedAt: authority.lastVerifiedAt,
      confidenceLevel: authority.confidenceLevel,
      legalDisclaimer: authority.legalDisclaimer,
    },
    {
      label: service.title,
      url: service.sourceUrl,
      lastVerifiedAt: service.lastVerifiedAt,
      confidenceLevel: service.confidenceLevel,
      legalDisclaimer: service.legalDisclaimer,
    },
  ];
}

function buildDisclaimer(service: CivicService): string {
  return [service.disclaimer, DEMO_NOTICE, BINDING_NOTICE, NO_SUBMISSION_NOTICE].join(' ');
}

/**
 * Builds a source-locked prefill packet for a civic service.
 * Only unambiguous profile fields are prefilled; sensitive data is never guessed.
 */
export function buildPrefillPacket(
  profile: CivicDemoProfile,
  service: CivicService,
  authority: CivicAuthority,
  _forms: CivicForm[],
): CivicPrefillPacket {
  const filledFields = buildFilledFields(profile, service);
  const missingFields = buildMissingFields(service);
  const reviewFields = buildReviewFields(filledFields, service, authority);

  return {
    serviceId: service.serviceId,
    authorityId: authority.authorityId,
    filledFields,
    missingFields,
    reviewFields,
    documentsChecklist: service.requiredDocuments,
    authority,
    sourceRefs: buildSourceRefs(service, authority),
    disclaimer: buildDisclaimer(service),
    noSubmission: true,
    demoNotice: profile.demoNotice,
    appointmentRequired: service.appointmentRequired,
    contextNotes: authority.contextNotes,
  };
}
