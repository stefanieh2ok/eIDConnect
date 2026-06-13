import type { CivicService } from '@/types/civic';

const VERIFIED_AT = '2026-06-13';
const BASE_DISCLAIMER =
  'Diese Übersicht bereitet deinen Behördengang vor. Demo / nicht amtlich. Verbindlich entscheidet die zuständige Stelle. Kontakt- und Postlogik bitte auf der offiziellen BA-Seite prüfen. Keine Einreichung über diese App.';

export const ALG1_ORIENTIERUNG: CivicService = {
  serviceId: 'alg1-orientierung',
  title: 'Arbeitslosmeldung / ALG I (Orientierung)',
  category: 'arbeitsagentur',
  authorityId: 'arbeitsagentur-saarland-homburg-context',
  description:
    'Orientierung zur Arbeitslosmeldung und ALG I. Online-Services der Bundesagentur für Arbeit. Homburg-Kontext — physische Vorgänge ggf. zentral in Saarbrücken.',
  requiredDocuments: [
    { id: 'personalausweis', label: 'Personalausweis', required: true },
    {
      id: 'kuendigung-arbeitsvertrag',
      label: 'Kündigung / Arbeitsvertrag / Beschäftigungsnachweise',
      required: true,
    },
    {
      id: 'sozialversicherungsnummer',
      label: 'Sozialversicherungsnummer',
      required: true,
      hint: 'Wird nicht automatisch vorausgefüllt.',
    },
    { id: 'lebenslauf', label: 'Lebenslauf', required: false },
  ],
  forms: ['alg1-orientierung-demo-preview'],
  appointmentRequired: false,
  onlineOption: 'Online-Services der Bundesagentur für Arbeit (Demo-Hinweis).',
  prefillFields: ['firstName', 'lastName', 'address', 'email', 'phone'],
  missingFields: ['sozialversicherungsnummer', 'kuendigung-arbeitsvertrag'],
  reviewRequired: true,
  prefillRisk: 'high',
  noSubmission: true,
  sourceUrl: 'https://www.arbeitsagentur.de/vor-ort/jobcenter/jobcenter-saarland',
  lastVerifiedAt: VERIFIED_AT,
  confidenceLevel: 'reference_only',
  legalDisclaimer: BASE_DISCLAIMER,
  disclaimer: BASE_DISCLAIMER,
};

export const ARBEITSAGENTUR_SERVICES: CivicService[] = [ALG1_ORIENTIERUNG];
