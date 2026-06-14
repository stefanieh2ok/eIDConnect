import type { CivicExternalAdapterDefinition } from '@/lib/adapters/types';

/** BundID / eID — perspektivischer sicherer Zugang. */
export const BUNDID_EID_ADAPTER: CivicExternalAdapterDefinition = {
  id: 'bundid_eid',
  name: 'BundID / eID',
  purpose: 'Perspektivischer verifizierter Zugang (Identität, Alter, Wohnort aus Claims).',
  currentStatus: 'not_started',
  demoBoundary:
    'Demo-Profil und Vorschau-Perspektive — kein produktiver eID-Service-Provider, kein Berechtigungszertifikat.',
  futureIntegrationNotes:
    'eID-Service-Provider oder eigener eID-Server (BSI TR-03130) vor Käufergespräch offiziell verifizieren; VerifiedIdentity-Abstraktion.',
  requiredSecrets: ['EID_CLIENT_ID', 'EID_CLIENT_SECRET'],
  officialDocsToVerify: ['BSI TR-03130', 'BundID-Integrationsleitfaden'],
  noLiveCalls: true,
};
