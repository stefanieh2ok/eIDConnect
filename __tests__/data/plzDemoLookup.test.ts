import {
  formatDemoAddressLine,
  normalizePlz,
  parseLegacyDemoAddress,
  resolveDemoLocation,
  suggestCityFromPlz,
} from '@/data/plzDemoLookup';

describe('normalizePlz', () => {
  it('behält nur Ziffern und max. fünf Stellen', () => {
    expect(normalizePlz('D-66 459')).toBe('66459');
    expect(normalizePlz('123456')).toBe('12345');
  });
});

describe('suggestCityFromPlz', () => {
  it('liefert Kirkel für 66459', () => {
    expect(suggestCityFromPlz('66459')).toBe('Kirkel');
  });
  it('liefert Ort für Präfix (z. B. 681xx → Mannheim)', () => {
    expect(suggestCityFromPlz('68199')).toBe('Mannheim');
  });
  it('gibt null bei unbekannter PLZ', () => {
    expect(suggestCityFromPlz('99999')).toBeNull();
  });
  it('gibt null bei zu kurzer PLZ', () => {
    expect(suggestCityFromPlz('6645')).toBeNull();
  });
});

describe('resolveDemoLocation', () => {
  it('erkennt Kirkel über PLZ (auch ohne Ortsname)', () => {
    expect(resolveDemoLocation('66459', 'Kirkel')).toBe('kirkel');
    expect(resolveDemoLocation('66459', '')).toBe('kirkel');
  });
  it('Saarpfalz-Kreis ohne Kirkel', () => {
    expect(resolveDemoLocation('66424', 'Homburg')).toBe('saarpfalz');
  });
  it('Frankfurt über PLZ-Bereich', () => {
    expect(resolveDemoLocation('60311', '')).toBe('frankfurt');
  });
  it('Heidelberg (691xx) → eigener Demo-Standort', () => {
    expect(resolveDemoLocation('69115', 'Heidelberg')).toBe('heidelberg');
  });
  it('leer → bundesweit', () => {
    expect(resolveDemoLocation('', '')).toBe('bundesweit');
  });
  it('unbekannte PLZ (NRW) → deutschland (Grobregion)', () => {
    expect(resolveDemoLocation('50123', '')).toBe('deutschland');
  });
  it('unbekannte PLZ (Bayern) → bayern', () => {
    expect(resolveDemoLocation('86720', '')).toBe('bayern');
  });
  it('Bodensee PLZ 88xxx → deutschland (BW)', () => {
    expect(resolveDemoLocation('88085', '')).toBe('deutschland');
  });
  it('Nürnberg als Ortsname → bayern', () => {
    expect(resolveDemoLocation('', 'Nürnberg')).toBe('bayern');
  });
  it('Stuttgart als Ortsname → deutschland', () => {
    expect(resolveDemoLocation('', 'Stuttgart')).toBe('deutschland');
  });
});

describe('formatDemoAddressLine', () => {
  it('setzt Straße und PLZ Ort zusammen', () => {
    expect(formatDemoAddressLine('Hauptstraße 1', '66459', 'Kirkel')).toBe('Hauptstraße 1, 66459 Kirkel');
  });
  it('liefert leerstring wenn alles leer', () => {
    expect(formatDemoAddressLine('', '', '')).toBe('');
  });
});

describe('parseLegacyDemoAddress', () => {
  it('parst „Str, PLZ Ort“', () => {
    expect(parseLegacyDemoAddress('Hauptstraße 1, 66459 Kirkel')).toEqual({
      street: 'Hauptstraße 1',
      plz: '66459',
      city: 'Kirkel',
    });
  });
  it('parst PLZ im Freitext', () => {
    const r = parseLegacyDemoAddress('66459 Mannheim');
    expect(r.plz).toBe('66459');
    expect(r.city).toContain('Mannheim');
  });
});
