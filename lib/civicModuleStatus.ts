/**
 * Zentrale Demo-/Governance-Kennzeichnung der Kernmodule.
 * Nur Klarheit für Audits und spätere Control-Plane — keine Routing- oder UI-Logik.
 *
 * Abgleich GovTech: CONNECTOR-READINESS-MATRIX.md (Adapter offen/demo);
 * Kirkel-Zuordnung: lib/kirkelServiceResolver.ts (lokaler Demo-Katalog, kein FIM/PVOG-Live).
 */
import type { CivicModuleKey, CivicModuleStatusEntry } from '@/types/governance';

export const CIVIC_MODULE_STATUS: Record<CivicModuleKey, CivicModuleStatusEntry> = {
  wegweiser: {
    mode: 'demo',
    sourceType: 'demo',
    disclaimer:
      'Vorbereitungscockpit — Clara strukturiert Fälle vor offiziellen Anträgen. Keine Anspruchsprüfung, keine Behördenübermittlung, keine zweite Verwaltung.',
    adapterStatus: 'mock_ready',
    sectionKey: 'fuermich',
  },
  meldungen: {
    mode: 'demo',
    sourceType: 'mock',
    disclaimer: 'Meldungen werden in der Demo lokal erfasst — kein Versand an die Kommune.',
    adapterStatus: 'not_started',
    sectionKey: 'meldungen',
  },
  abstimmungen: {
    mode: 'demo',
    sourceType: 'demo',
    disclaimer:
      'Beteiligung zur Information — Punkte für Mitwirkung, nicht für eine bestimmte Meinung.',
    sectionKey: 'live',
  },
  wahlen: {
    mode: 'demo',
    sourceType: 'demo',
    disclaimer: 'Wahlvorschau — keine echte Stimmabgabe, keine Empfehlung, keine Wirkung.',
    adapterStatus: 'not_started',
    sectionKey: 'wahlen',
  },
  kalender: {
    mode: 'demo',
    sourceType: 'demo',
    disclaimer: 'Kuratierte Demo-Termine und Fristen — keine amtliche Fristenübernahme.',
    sectionKey: 'kalender',
  },
  postfach: {
    mode: 'demo',
    sourceType: 'mock',
    disclaimer: 'Beispielhafte Vorschau — keine echte Zustellung oder Behördenanbindung.',
    adapterStatus: 'not_started',
    sectionKey: 'postfach',
  },
  praemien: {
    mode: 'demo',
    sourceType: 'demo',
    disclaimer:
      'Freiwillige lokale Anerkennung fürs Mitmachen — unabhängig von Entscheidung, Partei oder Stimme.',
    adapterStatus: 'mock_ready',
    /** Interner Routing-Key bleibt `leaderboard`; sichtbares Label: „Prämien“. */
    sectionKey: 'leaderboard',
  },
  clara: {
    mode: 'demo',
    sourceType: 'external',
    disclaimer: 'KI-Orientierung — keine rechtsverbindliche Entscheidung, keine Behördenauskunft.',
    adapterStatus: 'adapter_ready',
  },
  eid_wallet: {
    mode: 'external-adapter-ready',
    sourceType: 'external',
    disclaimer: 'Perspektivische Zugangsdemo — kein produktiver BundID-/EUDI-Wallet-Anschluss.',
    adapterStatus: 'not_started',
  },
};

export function civicModuleStatus(key: CivicModuleKey): CivicModuleStatusEntry {
  return CIVIC_MODULE_STATUS[key];
}

/** Sichtbare Modulnamen im Trust Center (read-only). */
export const CIVIC_MODULE_UI_LABELS: Record<CivicModuleKey, string> = {
  wegweiser: 'Wegweiser',
  meldungen: 'Meldungen',
  abstimmungen: 'Beteiligen',
  wahlen: 'Wahlen',
  kalender: 'Kalender',
  postfach: 'Postfach',
  praemien: 'Prämien',
  clara: 'Clara',
  eid_wallet: 'eID / Wallet',
};

export const CIVIC_MODULE_KEYS = Object.keys(CIVIC_MODULE_STATUS) as CivicModuleKey[];
