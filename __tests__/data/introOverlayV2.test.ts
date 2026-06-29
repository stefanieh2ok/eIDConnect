import {
  INTRO_OVERLAY_V2_STEPS,
  INTRO_V2_CLAIM_DU,
  INTRO_V2_LEITMOTIV,
  collectIntroV2VisibleCopy,
  findForbiddenIntroV2Terms,
  introV2PrimaryButton,
} from '@/data/introOverlayV2';

describe('introOverlayV2', () => {
  it('definiert genau 7 Screens', () => {
    expect(INTRO_OVERLAY_V2_STEPS).toHaveLength(7);
  });

  it('enthält Elevator Pitch auf Screen 0', () => {
    expect(INTRO_OVERLAY_V2_STEPS[0].id).toBe('cold-open');
    expect(INTRO_OVERLAY_V2_STEPS[0].titleDu).toBe(INTRO_V2_CLAIM_DU);
  });

  it('enthält Leitmotiv als Konstante', () => {
    expect(INTRO_V2_LEITMOTIV).toBe('Verstehen. Vorbereiten. Melden. Mitwirken.');
  });

  it('nutzt vorgeschriebene Button-Sprache', () => {
    expect(introV2PrimaryButton(0, true)).toBe('Zeig mir, wie');
    expect(introV2PrimaryButton(3, true)).toBe('Weiter');
    expect(introV2PrimaryButton(6, true)).toBe('Direkt zur App');
  });

  it('enthält Governance-Hinweis auf dem letzten Screen', () => {
    const last = INTRO_OVERLAY_V2_STEPS[6];
    expect(last.bodyDu).toMatch(/bereitet vor/i);
    expect(last.bodyDu).toMatch(/entscheidet nicht/i);
    expect(last.bodyDu).toMatch(/nicht versendet/i);
  });

  it('enthält keinen verbotenen Begriff im sichtbaren Copy', () => {
    const forbidden = findForbiddenIntroV2Terms(collectIntroV2VisibleCopy(true));
    expect(forbidden).toEqual([]);
  });

  it('referenziert Jobverlust im Wegweiser-Screen-Kontext', () => {
    const chipsScreen = INTRO_OVERLAY_V2_STEPS.find((s) => s.id === 'alltag-chaos');
    expect(chipsScreen?.bodyDu).toMatch(/Jobverlust/i);
  });
});
