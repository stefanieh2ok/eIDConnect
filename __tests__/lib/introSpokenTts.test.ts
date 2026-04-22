import { introAnredeGateSpoken, introEidLoginSpoken } from '@/lib/introSpokenTts';

describe('introSpokenTts', () => {
  it('Anrede: Du- und Sie-Öffnung unterscheidet sich', () => {
    expect(introAnredeGateSpoken(true)).toContain('Möchtest du per Du');
    expect(introAnredeGateSpoken(false)).toContain('Wie möchten Sie angesprochen');
  });

  it('eID-Login: Du vs. Sie Abschlusssatz', () => {
    expect(introEidLoginSpoken(true, 'eID Demo Connect')).toContain('Du meldest dich');
    expect(introEidLoginSpoken(false, 'eID Demo Connect')).toContain('Sie melden sich');
  });
});
