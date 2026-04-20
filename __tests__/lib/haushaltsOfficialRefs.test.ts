import {
  haushaltScopeFromVotingCardId,
  buildHaushaltKontextFuerPrompt,
  HAUSHALT_OFFIZIELL,
} from '@/data/haushaltsOfficialRefs';

describe('haushaltsOfficialRefs', () => {
  it('maps voting card id prefixes to scope', () => {
    expect(haushaltScopeFromVotingCardId('bund-1')).toBe('bund');
    expect(haushaltScopeFromVotingCardId('land-1')).toBe('land_saarland');
    expect(haushaltScopeFromVotingCardId('kreis-1')).toBe('kreis_saarpfalz');
    expect(haushaltScopeFromVotingCardId('kirkel-1')).toBe('kommune_kirkel');
    expect(haushaltScopeFromVotingCardId('unknown')).toBe('bund');
  });

  it('includes 2026 verifizierte Hinweise for Bund (BMF + Bundestag)', () => {
    expect(HAUSHALT_OFFIZIELL.bund.verifizierteHinweise.length).toBe(2);
    expect(HAUSHALT_OFFIZIELL.bund.verifizierteHinweise[0].haushaltsjahr).toBe(2026);
    expect(HAUSHALT_OFFIZIELL.bund.verifizierteHinweise[0].quelleUrl).toContain('bundesfinanzministerium.de');
    expect(HAUSHALT_OFFIZIELL.bund.verifizierteHinweise[1].nachweisart).toBe('parlament');
    expect(HAUSHALT_OFFIZIELL.bund.verifizierteHinweise[1].quelleUrl).toContain('bundestag.de');
  });

  it('has 2026 Land and Kirkel entries', () => {
    expect(HAUSHALT_OFFIZIELL.land_saarland.verifizierteHinweise[0].haushaltsjahr).toBe(2026);
    expect(HAUSHALT_OFFIZIELL.kommune_kirkel.verifizierteHinweise[0].nachweisart).toBe('presse');
  });

  it('buildHaushaltKontextFuerPrompt contains portal links and anti-hallucination rule', () => {
    const t = buildHaushaltKontextFuerPrompt('kommune_kirkel');
    expect(t).toContain('ratsinfoservice.de');
    expect(t).toContain('VERBOT');
    expect(t).toContain('kirkel.de');
  });
});
