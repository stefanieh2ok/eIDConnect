import { buildIntroTtsManifest } from '@/data/introTtsScript';
import { INTRO_TOTAL_STEPS, introOverlayFramingLine } from '@/data/introOverlayMarketing';

describe('introOverlayFramingLine', () => {
  it('nutzt Du-Form in Abstimmen-Meta, wenn du=true', () => {
    expect(introOverlayFramingLine('abstimmen', true)).toContain('siehst du');
    expect(introOverlayFramingLine('abstimmen', true)).not.toContain('sehen Sie');
  });

  it('nutzt Sie-Form in Abstimmen-Meta, wenn du=false', () => {
    expect(introOverlayFramingLine('abstimmen', false)).toContain('sehen Sie');
  });
});

describe('buildIntroTtsManifest', () => {
  it('liefert 9 Einträge (1–2, Opt-in, 3–8 Walkthrough)', () => {
    const du = buildIntroTtsManifest(true);
    expect(du).toHaveLength(1 + 1 + 1 + 6);
    expect(du[0].step).toBe(1);
    expect(du[1].step).toBe(2);
    expect(du[2].step).toBeNull();
    expect(du[2].id).toBe('opt_in');
    expect(du[3].step).toBe(3);
    expect(du[du.length - 1].step).toBe(INTRO_TOTAL_STEPS);
  });

  it('Walkthrough: erster TTS-Block (Du) startet mit Schritt 3 von 8 und Du-Meta', () => {
    const du = buildIntroTtsManifest(true);
    expect(du[3].tts).toMatch(/^Schritt 3 von 8/);
    expect(du[3].tts).toContain('Kurz: So siehst du aktuelle Themen');
  });

  it('letzter TTS-Block (Du) enthält Abschlusstext', () => {
    const last = buildIntroTtsManifest(true).find((e) => e.id === 'politikbarometer')!;
    expect(last.tts).toContain('Das war die kurze Einführung');
    expect(last.tts).toContain('Ich unterstütze dich auch während der Nutzung jederzeit');
  });
});
