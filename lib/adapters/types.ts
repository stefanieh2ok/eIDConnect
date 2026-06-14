/**
 * Externe GovTech-Adapter — Typen und Registry-Kontrakt.
 * Keine Live-Calls; Architektur-Sichtbarkeit für Due Diligence und Control Plane.
 */
import type { ExternalAdapterStatus } from '@/types/governance';

export type CivicExternalAdapterDefinition = {
  id: string;
  name: string;
  purpose: string;
  currentStatus: ExternalAdapterStatus;
  demoBoundary: string;
  futureIntegrationNotes: string;
  requiredSecrets?: string[];
  officialDocsToVerify?: string[];
  /** Immer true — keine produktiven API-Aufrufe in dieser Demo. */
  noLiveCalls: true;
};
