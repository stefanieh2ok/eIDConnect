import { buildIntroTtsManifest } from '@/data/introTtsScript';
import { INTRO_OVERLAY_STEPS, INTRO_TOTAL_STEPS, introOverlayFramingLine } from '@/data/introOverlayMarketing';

describe('introOverlayFramingLine', () => {
  it('liefert für Abstimmen in beiden Anreden die gleiche Meta-Zeile', () => {
    const du = introOverlayFramingLine('abstimmen', true);
    const sie = introOverlayFramingLine('abstimmen', false);
    expect(du).toBe(sie);
    expect(du).toMatch(/Mitwirkung/);
  });
});

describe('buildIntroTtsManifest', () => {
  it('liefert Anrede + 12 Walkthrough-Szenen', () => {
    const du = buildIntroTtsManifest(true);
    expect(du).toHaveLength(1 + INTRO_OVERLAY_STEPS.length);
    expect(du[0].step).toBe(1);
    expect(du[0].id).toBe('anrede');
    expect(du[1].step).toBe(2);
    expect(du[1].id).toBe('intro');
    expect(du[du.length - 1].step).toBe(INTRO_TOTAL_STEPS);
    expect(du[du.length - 1].id).toBe('oekosystem');
  });

  it('Walkthrough: erster TTS-Block (Du) = Navigation-Intro ohne Schritt-Präfix', () => {
    const du = buildIntroTtsManifest(true);
    expect(du[1].tts).not.toMatch(/^Schritt \d+ von/);
    expect(du[1].tts).toMatch(/Willkommen bei HookAI Civic/);
    expect(du[1].tts).toMatch(/Wegweiser, Melden, Beteiligen und Wählen/);
  });

  it('letzter TTS-Block (Du) enthält Ökosystem- und Abschlusstext', () => {
    const last = buildIntroTtsManifest(true).find((e) => e.id === 'oekosystem')!;
    expect(last.tts).toContain('Civic-Ökosystem');
    expect(last.tts).toContain('Überblick abgeschlossen');
    expect(last.tts).toMatch(/HookAI Civic.*erkunden|erkunden.*HookAI Civic/);
  });
});
