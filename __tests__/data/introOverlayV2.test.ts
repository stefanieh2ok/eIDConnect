import {
  INTRO_OVERLAY_V2_STEPS,
  INTRO_V2_CLAIM_DU,
  INTRO_V2_LEITMOTIV,
  collectIntroV2VisibleCopy,
  findForbiddenIntroV2Terms,
  introV2PrimaryButton,
} from '@/data/introOverlayV2';

describe('introOverlayV2', () => {
  it('definiert genau 8 Trailer-Screens', () => {
    expect(INTRO_OVERLAY_V2_STEPS).toHaveLength(8);
  });

  it('enthält Claim auf Screen 0', () => {
    expect(INTRO_OVERLAY_V2_STEPS[0].id).toBe('buergezugang-hook');
    expect(INTRO_OVERLAY_V2_STEPS[0].titleDu).toBe(INTRO_V2_CLAIM_DU);
    expect(INTRO_OVERLAY_V2_STEPS[0].bodyDu).toMatch(/Behördenwege/i);
  });

  it('enthält Leitmotiv als Konstante', () => {
    expect(INTRO_V2_LEITMOTIV).toBe('Verstehen. Vorbereiten. Melden. Mitwirken.');
  });

  it('nutzt vorgeschriebene Button-Sprache', () => {
    expect(introV2PrimaryButton(0, true)).toBe('Zeig mir, wie');
    expect(introV2PrimaryButton(3, true)).toBe('Weiter');
    expect(introV2PrimaryButton(7, true)).toBe('Direkt zur App');
  });

  it('enthält Governance-Hinweis auf dem letzten Screen', () => {
    const last = INTRO_OVERLAY_V2_STEPS[7];
    expect(last.bodyDu).toMatch(/bereitet vor/i);
    expect(last.bodyDu).toMatch(/nicht versendet/i);
  });

  it('referenziert Wegweiser-Kündigung im Trailer-Flow', () => {
    const wegweiserScreen = INTRO_OVERLAY_V2_STEPS.find((s) => s.id === 'wegweiser-plan');
    expect(wegweiserScreen?.bodyDu).toMatch(/Clara/i);
    expect(wegweiserScreen?.bodyDu).toMatch(/entscheidet nicht/i);
  });

  it('enthält interaktive Trailer-Reihenfolge', () => {
    expect(INTRO_OVERLAY_V2_STEPS.map((s) => s.id)).toEqual([
      'buergezugang-hook',
      'melden-aktion',
      'postfach-status',
      'beteiligen-mitwirken',
      'praemien-wallet',
      'wahlen-vorschau',
      'wegweiser-plan',
      'vertrauen-start',
    ]);
  });

  it('enthält keinen verbotenen Begriff im sichtbaren Copy', () => {
    const forbidden = findForbiddenIntroV2Terms(collectIntroV2VisibleCopy(true));
    expect(forbidden).toEqual([]);
  });
});
