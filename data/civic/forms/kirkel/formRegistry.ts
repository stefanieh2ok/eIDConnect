import type { CivicForm } from '@/types/civic';

const VERIFIED_AT = '2026-06-13';
const DEMO_DISCLAIMER =
  'Demo / nicht amtlich. Kein echter Antrag. Offizielle Formulare nur per Quellenlink referenziert.';

export const KIRKEL_CIVIC_FORMS: CivicForm[] = [
  {
    formId: 'vollmacht-abholung-passdokument',
    title: 'Vollmacht zur Abholung eines Passdokuments',
    authorityId: 'kirkel-buergeramt',
    serviceId: 'personalausweis-eid',
    formType: 'official_reference',
    sourceUrl:
      'https://www.kirkel.de/buergerservice-und-verwaltung/buergeramt/personalausweis/',
    fields: [
      { fieldId: 'firstName', label: 'Vorname', required: true },
      { fieldId: 'lastName', label: 'Nachname', required: true },
      { fieldId: 'address', label: 'Anschrift', required: true },
    ],
    prefillMapping: {
      firstName: 'firstName',
      lastName: 'lastName',
      address: 'address',
    },
    requiresUserReview: true,
    canGenerateDemoPdf: false,
    lastVerifiedAt: VERIFIED_AT,
    confidenceLevel: 'reference_only',
    legalDisclaimer: DEMO_DISCLAIMER,
  },
  {
    formId: 'einverstaendnis-gesetzliche-vertreter',
    title: 'Einverständniserklärung gesetzliche Vertreter',
    authorityId: 'kirkel-buergeramt',
    serviceId: 'personalausweis-eid',
    formType: 'official_reference',
    sourceUrl:
      'https://www.kirkel.de/buergerservice-und-verwaltung/buergeramt/personalausweis/',
    fields: [
      { fieldId: 'firstName', label: 'Vorname des Minderjährigen', required: true },
      { fieldId: 'dateOfBirth', label: 'Geburtsdatum', required: true },
    ],
    prefillMapping: {
      firstName: 'firstName',
      dateOfBirth: 'dateOfBirth',
    },
    requiresUserReview: true,
    canGenerateDemoPdf: false,
    lastVerifiedAt: VERIFIED_AT,
    confidenceLevel: 'reference_only',
    legalDisclaimer: DEMO_DISCLAIMER,
  },
  {
    formId: 'kfz-ummeldung-demo-preview',
    title: 'Kfz-Ummeldung — Demo-Vorschau',
    authorityId: 'saarpfalz-kfz-homburg',
    serviceId: 'kfz-ummeldung',
    formType: 'demo_preview',
    sourceUrl:
      'https://www.saarpfalz-kreis.de/verwaltung-politik/behoerden/kfz-zulassungsstelle/',
    demoPreviewPath: '/demo-documents/kfz-ummeldung-preview.pdf',
    fields: [
      { fieldId: 'firstName', label: 'Vorname', required: true },
      { fieldId: 'lastName', label: 'Nachname', required: true },
      { fieldId: 'evb-nummer', label: 'eVB-Nummer', required: true, sensitive: true },
    ],
    prefillMapping: {
      firstName: 'firstName',
      lastName: 'lastName',
    },
    requiresUserReview: true,
    canGenerateDemoPdf: true,
    lastVerifiedAt: VERIFIED_AT,
    confidenceLevel: 'demo',
    legalDisclaimer: DEMO_DISCLAIMER,
  },
  {
    formId: 'buergergeld-erstantrag-demo-preview',
    title: 'Bürgergeld Erstantrag — Demo-Vorschau',
    authorityId: 'jobcenter-saarpfalz-homburg',
    serviceId: 'buergergeld-erstantrag',
    formType: 'demo_preview',
    sourceUrl: 'https://www.saarpfalz-kreis.de/buergerservice/jobcenter/',
    demoPreviewPath: '/demo-documents/buergergeld-erstantrag-preview.pdf',
    fields: [
      { fieldId: 'firstName', label: 'Vorname', required: true },
      { fieldId: 'lastName', label: 'Nachname', required: true },
      { fieldId: 'address', label: 'Anschrift', required: true },
    ],
    prefillMapping: {
      firstName: 'firstName',
      lastName: 'lastName',
      address: 'address',
    },
    requiresUserReview: true,
    canGenerateDemoPdf: true,
    lastVerifiedAt: VERIFIED_AT,
    confidenceLevel: 'demo',
    legalDisclaimer: DEMO_DISCLAIMER,
  },
  {
    formId: 'alg1-orientierung-demo-preview',
    title: 'ALG I Orientierung — Demo-Vorschau',
    authorityId: 'arbeitsagentur-saarland-homburg-context',
    serviceId: 'alg1-orientierung',
    formType: 'generated_packet',
    sourceUrl: 'https://www.arbeitsagentur.de/vor-ort/jobcenter/jobcenter-saarland',
    demoPreviewPath: '/demo-documents/alg1-orientierung-preview.pdf',
    fields: [
      { fieldId: 'firstName', label: 'Vorname', required: true },
      { fieldId: 'lastName', label: 'Nachname', required: true },
      { fieldId: 'sozialversicherungsnummer', label: 'Sozialversicherungsnummer', required: true, sensitive: true },
    ],
    prefillMapping: {
      firstName: 'firstName',
      lastName: 'lastName',
    },
    requiresUserReview: true,
    canGenerateDemoPdf: true,
    lastVerifiedAt: VERIFIED_AT,
    confidenceLevel: 'demo',
    legalDisclaimer: DEMO_DISCLAIMER,
  },
];

export const KIRKEL_CIVIC_FORM_BY_ID: Record<string, CivicForm> = Object.fromEntries(
  KIRKEL_CIVIC_FORMS.map((f) => [f.formId, f]),
);

export function getFormsForService(serviceId: string): CivicForm[] {
  return KIRKEL_CIVIC_FORMS.filter((f) => f.serviceId === serviceId);
}
