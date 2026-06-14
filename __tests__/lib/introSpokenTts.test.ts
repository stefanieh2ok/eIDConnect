import { introAnredeGateSpoken, introEidLoginSpoken } from '@/lib/introSpokenTts';

describe('introSpokenTts', () => {
  it('Anrede: Clara (Spoken) — HookAI Civic, vor Wahl Sie, nach Du-Wechsel per Du', () => {
    const duT = introAnredeGateSpoken(true);
    expect(duT).toContain('HookAI Civic');
    expect(duT).toContain('Clara');
    expect(duT).toMatch(/Wie darf ich Sie ansprechen/);
    expect(duT).toMatch(/begleite Sie|Wie darf ich Sie/);
    expect(duT).toMatch(/beim Du|Schritt für Schritt/);
    expect(duT).not.toMatch(/deine KI-Agentin/);
    const sieT = introAnredeGateSpoken(false);
    expect(sieT).toContain('HookAI Civic');
    expect(sieT).toContain('Clara');
    expect(sieT).toMatch(/Sie-Form/);
    expect(sieT).toMatch(/Orientierung|Überblick/);
  });

  it('eID-Login: Spoken — Zugang, eID, Zuständigkeit/Berechtigung, ohne alte Floskeln', () => {
    const du = introEidLoginSpoken(true);
    expect(du).toMatch(/sicher|Bürgerzugang/);
    expect(du).toMatch(/eID/);
    expect(du).toMatch(/Zuständigkeit|Berechtigung|berechtigt/);
    expect(du).not.toMatch(/passgenaue|Reibung|wo sie hingehören/);
    expect(du).not.toMatch(/Demo-eID/);
  });
});
