import type { CivicExternalAdapterDefinition } from '@/lib/adapters/types';

/** FIT-Connect — perspektivische Einreichung / Submission-Readiness. */
export const FIT_CONNECT_ADAPTER: CivicExternalAdapterDefinition = {
  id: 'fit_connect',
  name: 'FIT-Connect',
  purpose: 'Perspektivische strukturierte Antragseinreichung an Fachverfahren (Submission-Readiness).',
  currentStatus: 'not_started',
  demoBoundary:
    'Behördenweg-Simulation in lib/fuerMichDokumente.ts — keine verbindliche Übermittlung, kein GovTalk/XÖV-Kanal.',
  futureIntegrationNotes:
    'Verfahrens-ID, technischer Konnektor und Empfangsbestätigung vor Käufergespräch offiziell verifizieren.',
  officialDocsToVerify: ['FIT-Connect-Spezifikation', 'Verfahrenssteckbrief / XÖV'],
  noLiveCalls: true,
};
