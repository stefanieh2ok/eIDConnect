import type { CivicExternalAdapterDefinition } from '@/lib/adapters/types';

/** FIM / LeiKa — Leistungsschlüssel und Behördenweg-Mapping. */
export const FIM_LEIKA_ADAPTER: CivicExternalAdapterDefinition = {
  id: 'fim_leika',
  name: 'FIM / LeiKa',
  purpose: 'Normierter Leistungskatalog, Leistungsschlüssel und Zuständigkeitsregeln für den Behördenweg.',
  currentStatus: 'mock_ready',
  demoBoundary:
    'lib/kirkelServiceResolver.ts und data/kirkel-service-catalog.json — Demo-Mapping, kein FIM-Live-Export.',
  futureIntegrationNotes:
    'FIM-LeiKa-Schnittstelle oder Export vor Käufergespräch offiziell verifizieren; Mapping leistung_key ↔ FIM-ID mit Redaktionsworkflow.',
  requiredSecrets: ['FIM_API_CREDENTIALS (mandantenspezifisch)'],
  officialDocsToVerify: ['FIM-LeiKa-Schnittstelle', 'Leistungsverzeichnis-Aktualisierung'],
  noLiveCalls: true,
};
