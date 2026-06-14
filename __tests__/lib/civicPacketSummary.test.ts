import { buildPacketSummary, hasMappedCivicService } from '@/lib/civicPacketSummary';
import { LEISTUNG_KEY_TO_SERVICE_ID } from '@/lib/civicRegistryIndex';

describe('civicPacketSummary', () => {
  const mappedKeys = Object.keys(LEISTUNG_KEY_TO_SERVICE_ID);

  it.each(mappedKeys)('liefert Summary für %s', (leistungKey) => {
    expect(hasMappedCivicService(leistungKey)).toBe(true);
    const summary = buildPacketSummary(leistungKey, true);
    expect(summary).not.toBeNull();
    expect(summary!.filledCount).toBeGreaterThan(0);
    expect(summary!.documentCount).toBeGreaterThan(0);
    expect(summary!.isDemo).toBe(true);
  });

  it('Personalausweis zeigt Bürgeramt Kirkel', () => {
    const summary = buildPacketSummary('personalausweis-eid', true);
    expect(summary?.authorityName).toMatch(/Bürgeramt Kirkel/i);
    expect(summary?.location).toMatch(/66459/);
  });

  it('Kfz zeigt Saarpfalz-Kreis / Homburg', () => {
    const summary = buildPacketSummary('kfz-ummeldung', true);
    expect(summary?.authorityName).toMatch(/Kfz-Zulassungsstelle Saarpfalz-Kreis/i);
    expect(summary?.location).toMatch(/Homburg/);
  });

  it('Bürgergeld zeigt Jobcenter Homburg', () => {
    const summary = buildPacketSummary('buergergeld-orientierung', true);
    expect(summary?.authorityName).toMatch(/Jobcenter Saarpfalz-Kreis/i);
    expect(summary?.location).toMatch(/Homburg/);
  });

  it('ALG I zeigt Agentur für Arbeit Saarland', () => {
    const summary = buildPacketSummary('arbeitssuche-jobcenter', true);
    expect(summary?.authorityName).toMatch(/Agentur für Arbeit Saarland/i);
    expect(summary?.serviceId).toBe('alg1-orientierung');
  });

  it('ohne Demo-Stammdaten weniger vorausgefüllte Felder', () => {
    const withDemo = buildPacketSummary('personalausweis-eid', true);
    const withoutDemo = buildPacketSummary('personalausweis-eid', false);
    expect(withDemo!.filledCount).toBeGreaterThan(withoutDemo!.filledCount);
  });
});
