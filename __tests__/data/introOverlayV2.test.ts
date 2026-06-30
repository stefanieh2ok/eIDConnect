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
    expect(last.bodyDu).toMatch(/keine echten Anträge/i);
  });

  it('referenziert Jobverlust im Wegweiser-Screen-Kontext', () => {
    const wegweiserScreen = INTRO_OVERLAY_V2_STEPS.find((s) => s.id === 'clara-wegweiserin');
    expect(wegweiserScreen?.titleDu).toBe('Wo fange ich an?');
    const planScreen = INTRO_OVERLAY_V2_STEPS.find((s) => s.id === 'wegweiser-plan');
    expect(planScreen?.bodyDu).toMatch(/vorzubereiten/i);
  });

  it('enthält Postfach- und Melde-Screens in der Trailer-Reihenfolge', () => {
    expect(INTRO_OVERLAY_V2_STEPS.map((s) => s.id)).toEqual([
      'cold-open',
      'clara-wegweiserin',
      'melden-sichtbar',
      'wegweiser-plan',
      'postfach-status',
      'wahlen-vorschau',
      'vertrauen-start',
    ]);
  });

  it('enthält keinen verbotenen Begriff im sichtbaren Copy', () => {
    const forbidden = findForbiddenIntroV2Terms(collectIntroV2VisibleCopy(true));
    expect(forbidden).toEqual([]);
  });
});
