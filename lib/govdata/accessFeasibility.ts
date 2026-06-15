/**
 * PVOG/XZuFi and Bundesportal access checkpoints for buyers and developers.
 */
export type AccessFeasibilityItem = {
  id: string;
  label: string;
  status: 'mock' | 'pending' | 'verified';
  note: string;
};

export const GOVDATA_ACCESS_FEASIBILITY: AccessFeasibilityItem[] = [
  {
    id: 'pvog',
    label: 'PVOG / Portalverbund',
    status: 'mock',
    note: 'Keine Live-API. Metadatenfeed und Mandantenvereinbarung vor Produktion prüfen.',
  },
  {
    id: 'xzufi',
    label: 'XZuFi-Leistungsverzeichnis',
    status: 'pending',
    note: 'Schema vorbereitet; Zugriff über offizielle Kanäle noch nicht verifiziert.',
  },
  {
    id: 'bundesportal',
    label: 'Bundesportal / verwaltung.bund.de',
    status: 'mock',
    note: 'Deep-Links in Demo-Daten — keine automatische Synchronisation.',
  },
];
