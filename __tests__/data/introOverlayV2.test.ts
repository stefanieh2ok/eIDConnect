import {
  INTRO_OVERLAY_V2_STEPS,
  INTRO_V2_CLAIM_DU,
  INTRO_V2_LEITMOTIV,
  collectIntroV2VisibleCopy,
  findForbiddenIntroV2Terms,
  introV2PrimaryButton,
  introV2StepIndexFromParam,
} from '@/data/introOverlayV2';

describe('introOverlayV2', () => {
  it('definiert genau 9 Trailer-Screens (Intro v3)', () => {
    expect(INTRO_OVERLAY_V2_STEPS).toHaveLength(9);
  });

  it('enthält ruhigen Einstieg auf Screen 0 ohne Collage-ID', () => {
    expect(INTRO_OVERLAY_V2_STEPS[0].id).toBe('ruhiger-einstieg');
    expect(INTRO_OVERLAY_V2_STEPS[0].titleDu).toBe(INTRO_V2_CLAIM_DU);
    expect(INTRO_OVERLAY_V2_STEPS[0].bodyDu).toMatch(/Anliegen zu ordnen/i);
  });

  it('enthält Leitmotiv als Konstante', () => {
    expect(INTRO_V2_LEITMOTIV).toBe('Verstehen. Vorbereiten. Melden. Mitwirken.');
  });

  it('nutzt vorgeschriebene Button-Sprache', () => {
    expect(introV2PrimaryButton(0, true)).toBe('Zeig mir, wie');
    expect(introV2PrimaryButton(3, true)).toBe('Weiter');
    expect(introV2PrimaryButton(8, true)).toBe('Direkt zur App');
  });

  it('enthält eID/EU-Wallet-Szene vor dem Abschluss', () => {
    const eid = INTRO_OVERLAY_V2_STEPS.find((s) => s.id === 'eid-trust');
    expect(eid?.bodyDu).toMatch(/eID/i);
    expect(eid?.bodyDu).toMatch(/EU Digital Identity Wallet/i);
    expect(INTRO_OVERLAY_V2_STEPS[8].id).toBe('abschluss');
  });

  it('enthält keine Wahlen- und keine Politikbarometer-Szene', () => {
    const ids = INTRO_OVERLAY_V2_STEPS.map((s) => s.id);
    expect(ids).not.toContain('wahlen-vorschau');
    expect(collectIntroV2VisibleCopy(true).toLowerCase()).not.toMatch(/politikbarometer/);
  });

  it('enthält v3 Szenenreihenfolge', () => {
    expect(INTRO_OVERLAY_V2_STEPS.map((s) => s.id)).toEqual([
      'ruhiger-einstieg',
      'melden-foto',
      'postfach-status',
      'wegweiser-clara',
      'beteiligen-punkte',
      'praemien-auswahl',
      'praemien-wallet-qr',
      'eid-trust',
      'abschluss',
    ]);
  });

  it('enthält keinen verbotenen Begriff im sichtbaren Copy', () => {
    const forbidden = findForbiddenIntroV2Terms(collectIntroV2VisibleCopy(true));
    expect(forbidden).toEqual([]);
  });

  it('parst introStep Query-Parameter (1-basiert)', () => {
    expect(introV2StepIndexFromParam('2')).toBe(1);
    expect(introV2StepIndexFromParam('9')).toBe(8);
    expect(introV2StepIndexFromParam('0')).toBe(0);
    expect(introV2StepIndexFromParam('99')).toBeNull();
    expect(introV2StepIndexFromParam(null)).toBeNull();
  });
});
