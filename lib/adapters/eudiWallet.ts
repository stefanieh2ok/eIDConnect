import type { CivicExternalAdapterDefinition } from '@/lib/adapters/types';

/** EUDI Wallet — perspektivische Nachweis-Wiederverwendung. */
export const EUDI_WALLET_ADAPTER: CivicExternalAdapterDefinition = {
  id: 'eudi_wallet',
  name: 'EUDI Wallet',
  purpose: 'Perspektivische portable Identitäts- und Nachweis-Claims (EU Digital Identity Wallet).',
  currentStatus: 'not_started',
  demoBoundary:
    'Textuelle Erwähnung in Intro/TTS — kein Wallet-Connector, keine Roh-Claims in Clara-Prompts.',
  futureIntegrationNotes:
    'EUDI-Pilotzugang und Trust-Framework-Mapping vor Käufergespräch offiziell verifizieren; gleiche VerifiedIdentity-Schicht wie eID.',
  officialDocsToVerify: ['EU Digital Identity Wallet ARF', 'EUDI-Pilot-Dokumentation'],
  noLiveCalls: true,
};
