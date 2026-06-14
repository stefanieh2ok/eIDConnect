import { CIVIC_MODULE_STATUS, civicModuleStatus, CIVIC_MODULE_KEYS, CIVIC_MODULE_UI_LABELS } from '@/lib/civicModuleStatus';
import { SECTION_PRODUCT_LABELS } from '@/lib/sectionProductLabels';

describe('civicModuleStatus', () => {
  it('definiert alle Kernmodule mit DemoMode und Disclaimer', () => {
    const keys = [
      'wegweiser',
      'meldungen',
      'abstimmungen',
      'wahlen',
      'kalender',
      'postfach',
      'praemien',
      'clara',
      'eid_wallet',
    ] as const;

    for (const key of keys) {
      const entry = civicModuleStatus(key);
      expect(entry.mode).toBeTruthy();
      expect(entry.disclaimer.length).toBeGreaterThan(10);
      expect(entry.sourceType).toBeTruthy();
    }
  });

  it('kennzeichnet Prämien mit internem Section-Key leaderboard', () => {
    expect(CIVIC_MODULE_STATUS.praemien.sectionKey).toBe('leaderboard');
    expect(CIVIC_MODULE_STATUS.praemien.disclaimer).toMatch(/unabhängig/i);
  });

  it('kennzeichnet Wahlen ohne echte Stimmabgabe', () => {
    expect(CIVIC_MODULE_STATUS.wahlen.disclaimer).toMatch(/keine echte Stimmabgabe/i);
  });

  it('definiert UI-Labels für alle Module', () => {
    expect(CIVIC_MODULE_KEYS).toHaveLength(9);
    expect(CIVIC_MODULE_UI_LABELS.praemien).toBe('Prämien');
    expect(CIVIC_MODULE_UI_LABELS.eid_wallet).toMatch(/eID/i);
  });
});

describe('sectionProductLabels', () => {
  it('mappt leaderboard auf sichtbares Label Prämien', () => {
    expect(SECTION_PRODUCT_LABELS.leaderboard).toBe('Prämien');
  });
});
