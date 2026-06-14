import type { CivicExternalAdapterDefinition } from '@/lib/adapters/types';

/** OParl — kommunale Vorlagen, Sitzungen, Transparenz. */
export const OPARL_ADAPTER: CivicExternalAdapterDefinition = {
  id: 'oparl',
  name: 'OParl',
  purpose: 'Kommunale Vorlagen, Sitzungen und Abstimmungsthemen (Transparenz, readonly).',
  currentStatus: 'mock_ready',
  demoBoundary:
    'Regionale Demo-Daten und kuratierte Inhalte — kein OParl-Endpoint, kein Live-Sync.',
  futureIntegrationNotes:
    'Mandanten-OParl-URL, readonly Sync und Cache-Strategie vor Käufergespräch offiziell verifizieren.',
  officialDocsToVerify: ['OParl 1.0/1.1 Spezifikation', 'Mandanten-OParl-Endpoint'],
  noLiveCalls: true,
};
