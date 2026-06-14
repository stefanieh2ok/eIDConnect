import type { CivicExternalAdapterDefinition } from '@/lib/adapters/types';

/** PVOG / XZuFi — Verwaltungsleistungen, zuständige Stellen, Wegweiser-Perspektive. */
export const PVOG_ADAPTER: CivicExternalAdapterDefinition = {
  id: 'pvog',
  name: 'PVOG / XZuFi',
  purpose: 'Verwaltungsleistungen, zuständige Stellen und Übergabe an Online-Dienste (Wegweiser-Perspektive).',
  currentStatus: 'not_started',
  demoBoundary:
    'Keine Portalverbund-Anbindung. Wegweiser nutzt lokalen Demo-Katalog und manuelle Deep-Links — keine verified_submission_channel.',
  futureIntegrationNotes:
    'PVOG-Metadatenfeed und URL-Validierung vor Käufergespräch offiziell verifizieren; Anzeige nur bei verified Status.',
  requiredSecrets: ['PVOG_API_KEY (falls mandantenspezifisch)'],
  officialDocsToVerify: ['PVOG-Metadaten', 'XZuFi-Leistungsverzeichnis'],
  noLiveCalls: true,
};
