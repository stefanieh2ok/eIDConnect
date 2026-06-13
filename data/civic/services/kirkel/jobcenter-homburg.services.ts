import type { CivicService } from '@/types/civic';

const VERIFIED_AT = '2026-06-13';
const BASE_DISCLAIMER =
  'Diese Übersicht bereitet deinen Behördengang vor. Demo / nicht amtlich. Verbindlich entscheidet die zuständige Stelle. Keine Einreichung über diese App. Keine Anspruchsprüfung.';

export const BUERGERGELD_ERSTANTRAG: CivicService = {
  serviceId: 'buergergeld-erstantrag',
  title: 'Bürgergeld – Erstantrag (Orientierung)',
  category: 'jobcenter',
  authorityId: 'jobcenter-saarpfalz-homburg',
  description:
    'Orientierung zum Erstantrag Bürgergeld. Zuständig: Jobcenter Saarpfalz-Kreis, Dienststelle Homburg. Keine Anspruchsprüfung in dieser Demo.',
  requiredDocuments: [
    { id: 'personalausweis', label: 'Personalausweis', required: true },
    { id: 'mietvertrag', label: 'Mietvertrag', required: true },
    { id: 'kontoauszuege', label: 'Kontoauszüge', required: true },
    { id: 'einkommensnachweise', label: 'Einkommensnachweise', required: true },
    { id: 'krankenversicherung', label: 'Krankenversicherungsnachweis', required: true },
    { id: 'vermoegensnachweise', label: 'Vermögensnachweise', required: true },
  ],
  forms: ['buergergeld-erstantrag-demo-preview'],
  appointmentRequired: true,
  prefillFields: ['firstName', 'lastName', 'address', 'email', 'phone'],
  missingFields: ['mietvertrag', 'kontoauszuege', 'einkommensnachweise', 'vermoegensnachweise'],
  reviewRequired: true,
  prefillRisk: 'high',
  noSubmission: true,
  sourceUrl: 'https://www.saarpfalz-kreis.de/buergerservice/jobcenter/',
  lastVerifiedAt: VERIFIED_AT,
  confidenceLevel: 'demo',
  legalDisclaimer: BASE_DISCLAIMER,
  disclaimer: BASE_DISCLAIMER,
};

export const JOBCENTER_HOMBURG_SERVICES: CivicService[] = [BUERGERGELD_ERSTANTRAG];
