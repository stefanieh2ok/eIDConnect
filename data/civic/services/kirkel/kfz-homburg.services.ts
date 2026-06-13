import type { CivicService } from '@/types/civic';

const VERIFIED_AT = '2026-06-13';
const BASE_DISCLAIMER =
  'Diese Übersicht bereitet deinen Behördengang vor. Demo / nicht amtlich. Verbindlich entscheidet die zuständige Stelle. Keine Einreichung über diese App.';

export const KFZ_UMMELDUNG: CivicService = {
  serviceId: 'kfz-ummeldung',
  title: 'Kfz-Ummeldung',
  category: 'kfz',
  authorityId: 'saarpfalz-kfz-homburg',
  description:
    'Orientierung zur Ummeldung eines Fahrzeugs nach Umzug. Zuständig: Kfz-Zulassungsstelle Saarpfalz-Kreis in Homburg.',
  requiredDocuments: [
    { id: 'personalausweis', label: 'Personalausweis', required: true },
    { id: 'zb-teil-i', label: 'Zulassungsbescheinigung Teil I', required: true },
    { id: 'zb-teil-ii', label: 'Zulassungsbescheinigung Teil II', required: true },
    { id: 'evb-nummer', label: 'eVB-Nummer', required: true, hint: 'Wird nicht automatisch vorausgefüllt.' },
    { id: 'sepa-lastschrift', label: 'SEPA-Lastschriftmandat', required: true },
    { id: 'kennzeichen', label: 'Kennzeichen', required: true },
  ],
  forms: ['kfz-ummeldung-demo-preview'],
  appointmentRequired: true,
  onlineOption: 'i-KFZ möglich, sofern Voraussetzungen erfüllt sind (Demo-Hinweis).',
  prefillFields: ['firstName', 'lastName', 'address'],
  missingFields: ['evb-nummer', 'iban', 'kennzeichen', 'zb-teil-i', 'zb-teil-ii'],
  reviewRequired: true,
  prefillRisk: 'high',
  noSubmission: true,
  sourceUrl: 'https://www.saarpfalz-kreis.de/verwaltung-politik/behoerden/kfz-zulassungsstelle/',
  lastVerifiedAt: VERIFIED_AT,
  confidenceLevel: 'demo',
  legalDisclaimer: BASE_DISCLAIMER,
  disclaimer: BASE_DISCLAIMER,
};

export const KFZ_HOMBURG_SERVICES: CivicService[] = [KFZ_UMMELDUNG];
