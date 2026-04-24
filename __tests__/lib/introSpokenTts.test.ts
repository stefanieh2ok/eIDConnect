import { introAnredeGateSpoken, introEidLoginSpoken } from '@/lib/introSpokenTts';

describe('introSpokenTts', () => {
  it('Anrede: Clara (Spoken) — kurze Sätze, Ansprache, kein UI-Fließtext', () => {
    const duT = introAnredeGateSpoken(true);
    expect(duT).toContain('Willkommen');
    expect(duT).toContain('Clara');
    expect(duT).toMatch(/geduzt|gesiezt/);
    const sieT = introAnredeGateSpoken(false);
    expect(sieT).toContain('Willkommen');
    expect(sieT).toContain('Clara');
    expect(sieT).toMatch(/geduzt|gesiezt/);
  });

  it('eID-Login: Spoken — Zugang, eID, Kommune/Wahlbezirk, Kirkel, ohne alte Floskeln', () => {
    const du = introEidLoginSpoken(true);
    expect(du).toMatch(/sicher|Zugang/);
    expect(du).toMatch(/eID/);
    expect(du).toMatch(/Kirkel|Kommune/);
    expect(du).not.toMatch(/passgenaue|Reibung|wo sie hingehören/);
    expect(du).not.toMatch(/eID Demo Connect/);
    expect(du).not.toMatch(/Demo-eID/);
  });
});
