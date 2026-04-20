import { INTRO_OVERLAY_STEPS } from '@/data/introOverlayMarketing';
import { adaptIntroAddress } from '@/lib/introAddress';

describe('adaptIntroAddress', () => {
  it('belässt die Sie-Form unverändert, wenn du=false', () => {
    for (const step of INTRO_OVERLAY_STEPS) {
      expect(adaptIntroAddress(step.body, false)).toBe(step.body);
    }
  });

  it('wandelt bekannte Intro-Sätze in korrekte Du-Form um', () => {
    const meldungenBody = INTRO_OVERLAY_STEPS.find((s) => s.id === 'meldungen')?.body ?? '';
    const out = adaptIntroAddress(meldungenBody, true);

    expect(out).toContain('Unter „Meldungen“ erfasst du');
    expect(out).toContain('für deine Kommune');
    expect(out).toContain('Du wählst die passende Kategorie');
    expect(out).toContain('leitest dein Anliegen');
  });

  it('wandelt Prämien-Einwilligungstexte in Du-Form um', () => {
    const praemienBody = INTRO_OVERLAY_STEPS.find((s) => s.id === 'praemien')?.body ?? '';
    const out = adaptIntroAddress(praemienBody, true);

    expect(out).toContain('nach deiner ausdrücklichen Zustimmung');
    expect(out).toContain('wenn du dem Programm ausdrücklich zustimmst.');
  });
});
