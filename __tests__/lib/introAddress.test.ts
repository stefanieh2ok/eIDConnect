import { INTRO_WALKTHROUGH_CLARA } from '@/data/introWalkthroughClara';
import { INTRO_OVERLAY_STEPS } from '@/data/introOverlayMarketing';
import { adaptIntroAddress } from '@/lib/introAddress';

describe('adaptIntroAddress', () => {
  it('belässt die Sie-Form unverändert, wenn du=false', () => {
    for (const step of INTRO_OVERLAY_STEPS) {
      expect(adaptIntroAddress(step.body, false)).toBe(step.body);
    }
  });

  it('wandelt Abstimmen-Intro in korrekte Du-Form um (longDu)', () => {
    const abstimmenBody = INTRO_OVERLAY_STEPS.find((s) => s.id === 'abstimmen')?.body ?? '';
    const out = adaptIntroAddress(abstimmenBody, true);
    expect(out).toBe(INTRO_WALKTHROUGH_CLARA.abstimmen.longDu);
  });

  it('wandelt Wahlen-Intro in korrekte Du-Form um', () => {
    const wahlenBody = INTRO_OVERLAY_STEPS.find((s) => s.id === 'wahlen')?.body ?? '';
    const out = adaptIntroAddress(wahlenBody, true);
    expect(out).toBe(INTRO_WALKTHROUGH_CLARA.wahlen.longDu);
  });

  it('wandelt Kalender-Intro in korrekte Du-Form um', () => {
    const body = INTRO_OVERLAY_STEPS.find((s) => s.id === 'kalender')?.body ?? '';
    const out = adaptIntroAddress(body, true);
    expect(out).toBe(INTRO_WALKTHROUGH_CLARA.kalender.longDu);
  });

  it('wandelt Meldungen-Intro in korrekte Du-Form um', () => {
    const body = INTRO_OVERLAY_STEPS.find((s) => s.id === 'meldungen')?.body ?? '';
    const out = adaptIntroAddress(body, true);
    expect(out).toBe(INTRO_WALKTHROUGH_CLARA.meldungen.longDu);
  });

  it('wandelt Politikbarometer-Intro in korrekte Du-Form um', () => {
    const body = INTRO_OVERLAY_STEPS.find((s) => s.id === 'politikbarometer')?.body ?? '';
    const out = adaptIntroAddress(body, true);
    expect(out).toBe(INTRO_WALKTHROUGH_CLARA.politikbarometer.longDu);
  });

  it('wandelt Prämien-Intro in korrekte Du-Form um', () => {
    const body = INTRO_OVERLAY_STEPS.find((s) => s.id === 'praemien')?.body ?? '';
    const out = adaptIntroAddress(body, true);
    expect(out).toBe(INTRO_WALKTHROUGH_CLARA.praemien.longDu);
  });
});
