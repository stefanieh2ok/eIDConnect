import type { LifeEventId } from '@/types/fuerMich';

export type LifeEventClusterId =
  | 'familie'
  | 'ausweis'
  | 'ausbildung'
  | 'wohnen'
  | 'mobilitaet'
  | 'arbeit'
  | 'pflege'
  | 'ruhestand';

export type LifeEventCluster = {
  id: LifeEventClusterId;
  title: string;
  eventIds: LifeEventId[];
};

/** Visuelle Gruppierung der Lebenslagen — keine Logikänderung, nur Launcher-Struktur. */
export const FUER_MICH_LIFE_EVENT_CLUSTERS: LifeEventCluster[] = [
  { id: 'familie', title: 'Familie', eventIds: ['expecting_child', 'newborn', 'bereavement'] },
  { id: 'ausweis', title: 'Ausweis & Zugang', eventIds: ['coming_of_age'] },
  { id: 'ausbildung', title: 'Ausbildung', eventIds: ['education'] },
  { id: 'wohnen', title: 'Wohnen & Umzug', eventIds: ['moving'] },
  { id: 'mobilitaet', title: 'Mobilität', eventIds: ['mobility'] },
  { id: 'arbeit', title: 'Arbeit & Gründung', eventIds: ['job_search', 'founding'] },
  { id: 'pflege', title: 'Pflege & Unterstützung', eventIds: ['caregiving', 'daily_support'] },
  { id: 'ruhestand', title: 'Ruhestand', eventIds: ['retirement'] },
];
