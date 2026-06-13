import type { CivicService } from '@/types/civic';

const VERIFIED_AT = '2026-06-13';
const BASE_DISCLAIMER =
  'Diese Übersicht bereitet deinen Behördengang vor. Demo / nicht amtlich. Verbindlich entscheidet die zuständige Stelle. Keine Einreichung über diese App.';

export const PERSONALAUSWEIS_EID: CivicService = {
  serviceId: 'personalausweis-eid',
  title: 'Personalausweis & Online-Ausweis (eID)',
  category: 'buergeramt',
  authorityId: 'kirkel-buergeramt',
  description:
    'Orientierung zum Personalausweis und zur Online-Ausweisfunktion (eID). Persönliche Vorsprache beim Bürgeramt erforderlich.',
  requiredDocuments: [
    { id: 'biometrisches-lichtbild', label: 'Biometrisches Lichtbild', required: true },
    {
      id: 'aktueller-ausweis',
      label: 'Aktueller Personalausweis oder Reisepass',
      required: true,
    },
    {
      id: 'zustimmung-vertreter',
      label: 'Zustimmung gesetzlicher Vertreter (bei Minderjährigen)',
      required: false,
      hint: 'Nur bei Minderjährigen erforderlich.',
    },
  ],
  forms: ['vollmacht-abholung-passdokument', 'einverstaendnis-gesetzliche-vertreter'],
  appointmentRequired: true,
  prefillFields: ['firstName', 'lastName', 'dateOfBirth', 'address', 'email', 'phone'],
  missingFields: ['idDocumentNumber', 'biometrisches-lichtbild', 'aktueller-ausweis'],
  reviewRequired: true,
  prefillRisk: 'medium',
  noSubmission: true,
  sourceUrl: 'https://www.kirkel.de/buergerservice-und-verwaltung/buergeramt/personalausweis/',
  lastVerifiedAt: VERIFIED_AT,
  confidenceLevel: 'demo',
  legalDisclaimer: BASE_DISCLAIMER,
  disclaimer: BASE_DISCLAIMER,
};

export const BUERGERAMT_SERVICES: CivicService[] = [PERSONALAUSWEIS_EID];
