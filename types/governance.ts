/**
 * Governance-Typen — getrennte Konzepte für Modul-Reifegrad vs. externe Adapter.
 * Keine Verhaltenslogik; nur Typisierung für Status-Maps und spätere Control-Plane.
 *
 * CivicConfidenceLevel (types/civic.ts) bleibt unangetastet — beschreibt Datenquellen,
 * nicht den Modul-Betriebsmodus.
 */

/** Reifegrad eines App-Moduls in der Demo/Produktionsreise. */
export type DemoMode = 'mock' | 'demo' | 'staged' | 'live' | 'external-adapter-ready';

/** Reifegrad eines externen GovTech-/API-Adapters (nicht gleich DemoMode). */
export type ExternalAdapterStatus =
  | 'not_started'
  | 'mock_ready'
  | 'adapter_ready'
  | 'sandbox_ready'
  | 'production_ready';

/** Herkunft der Daten/Funktion eines Moduls. */
export type CivicModuleSourceType = 'demo' | 'mock' | 'live' | 'external';

/** Schlüssel der zentralen Bürger-Module (nicht identisch mit Section-Routing). */
export type CivicModuleKey =
  | 'wegweiser'
  | 'meldungen'
  | 'abstimmungen'
  | 'wahlen'
  | 'kalender'
  | 'postfach'
  | 'praemien'
  | 'clara'
  | 'eid_wallet';

export type CivicModuleStatusEntry = {
  mode: DemoMode;
  disclaimer: string;
  sourceType: CivicModuleSourceType;
  /** Optional: Reifegrad des zugehörigen externen Adapters, falls relevant. */
  adapterStatus?: ExternalAdapterStatus;
  /** Interner Section-Key, falls abweichend vom Modul-Key (z. B. Prämien). */
  sectionKey?: string;
};
