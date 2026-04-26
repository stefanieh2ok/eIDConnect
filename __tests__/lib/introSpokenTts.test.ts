import { APP_DISPLAY_NAME } from '@/lib/branding';
import { introAnredeGateSpoken, introEidLoginSpoken } from '@/lib/introSpokenTts';

describe('introSpokenTts', () => {
  it('Anrede: Clara (Spoken) — HookAI Civic Demo, gewählte Ansprache', () => {
    const duT = introAnredeGateSpoken(true);
    expect(duT).toContain('HookAI Civic Demo');
    expect(duT).toContain('Clara');
    expect(duT).toMatch(/dann sind wir per Du/);
    expect(duT).toMatch(/Ich führe dich/);
    expect(duT).not.toMatch(/Ich führe Sie/);
    expect(duT).not.toMatch(/\bIhnen\b/);
    const sieT = introAnredeGateSpoken(false);
    expect(sieT).toContain('HookAI Civic Demo');
    expect(sieT).toContain('Clara');
    expect(sieT).toMatch(/beim Sie|bleibe ich beim Sie|bleiben wir beim Sie/);
    expect(sieT).toMatch(/Ich führe Sie/);
    expect(sieT).not.toMatch(/Ich führe dich/);
  });

  it('eID-Login: Spoken — Zugang, eID, Kommune, Produktname aus Branding, ohne alte Floskeln', () => {
    const du = introEidLoginSpoken(true);
    expect(du).toMatch(/sicher|Bürgerzugang/);
    expect(du).toMatch(/eID/);
    expect(du).toMatch(/Kommune/);
    expect(du).toContain(APP_DISPLAY_NAME);
    expect(du).not.toMatch(/passgenaue|Reibung|wo sie hingehören/);
    expect(du).not.toMatch(/Demo-eID/);
  });
});
