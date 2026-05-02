import { buildIntroTtsManifest } from '@/data/introTtsScript';
import { INTRO_TOTAL_STEPS, introOverlayFramingLine } from '@/data/introOverlayMarketing';

describe('introOverlayFramingLine', () => {
  it('liefert für Abstimmen in beiden Anreden die gleiche Meta-Zeile (wertorientiert, neutral formuliert)', () => {
    const du = introOverlayFramingLine('abstimmen', true);
    const sie = introOverlayFramingLine('abstimmen', false);
    expect(du).toBe(sie);
    expect(du).toMatch(/Pro und Contra|Orientierung/);
  });
});

describe('buildIntroTtsManifest', () => {
  it('liefert 8 Einträge (1–2 Anrede/eID, 3–8 Walkthrough) ohne Opt-in-Folie', () => {
    const du = buildIntroTtsManifest(true);
    expect(du).toHaveLength(1 + 1 + 6);
    expect(du[0].step).toBe(1);
    expect(du[1].step).toBe(2);
    expect(du[2].step).toBe(3);
    expect(du[2].id).toBe('politikbarometer');
    expect(du[du.length - 1].step).toBe(INTRO_TOTAL_STEPS);
  });

  it('Walkthrough: erster TTS-Block (Du) = Clara-Sprachtext ohne Schritt-Präfix (Politikbarometer)', () => {
    const du = buildIntroTtsManifest(true);
    expect(du[2].tts).not.toMatch(/^Schritt \d+ von/);
    expect(du[2].tts).toMatch(/Zuerst markierst du, welche Themen dich in Kirkel/);
    expect(du[2].tts).toMatch(/keine politische Empfehlung und kein Meinungsprofil/);
  });

  it('letzter TTS-Block (Du) enthält Abschlusstext', () => {
    const last = buildIntroTtsManifest(true).find((e) => e.id === 'praemien')!;
    expect(last.tts).toContain('kurze Überblick');
    expect(last.tts).toMatch(/HookAI Civic.*erkunden|erkunden.*HookAI Civic/);
    expect(last.tts).toMatch(/neutral.*verständlich|verständlich.*neutral/);
  });
});
