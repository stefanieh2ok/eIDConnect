import { FUER_MICH_LIFE_EVENTS } from '@/data/fuerMichLifeEvents';
import { FUER_MICH_LIFE_EVENT_CLUSTERS } from '@/data/fuerMichLifeEventClusters';

describe('Für Mich Lebenslagen-Cluster', () => {
  it('deckt alle Lebenslagen in Clustern ab', () => {
    const clustered = new Set(
      FUER_MICH_LIFE_EVENT_CLUSTERS.flatMap((c) => c.eventIds),
    );
    for (const event of FUER_MICH_LIFE_EVENTS) {
      expect(clustered.has(event.id)).toBe(true);
    }
    expect(clustered.size).toBe(FUER_MICH_LIFE_EVENTS.length);
  });

  it('enthält die geforderten Cluster-Titel', () => {
    const titles = FUER_MICH_LIFE_EVENT_CLUSTERS.map((c) => c.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        'Familie',
        'Ausweis & Zugang',
        'Ausbildung',
        'Wohnen & Umzug',
        'Mobilität',
        'Arbeit & Gründung',
        'Pflege & Unterstützung',
        'Ruhestand',
      ]),
    );
  });
});
