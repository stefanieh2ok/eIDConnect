import { INTRO_FINISH_CTA_LABEL } from '@/data/introOverlayMarketing';

describe('introOverlayMarketing', () => {
  it('walkthrough finish CTA bleibt kurz (nur „App starten“)', () => {
    expect(INTRO_FINISH_CTA_LABEL).toBe('App starten');
    expect(INTRO_FINISH_CTA_LABEL).not.toMatch(/beenden/i);
    expect(INTRO_FINISH_CTA_LABEL).not.toContain('&');
  });
});
