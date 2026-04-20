import {
  ensureStructuredClaraResponse,
  isStructuredClaraResponse,
  parseClaraStructuredResponse,
} from '@/lib/clara-response-format';

describe('clara response format compliance', () => {
  it('keeps already structured responses unchanged', () => {
    const structured = [
      '1) Kontext',
      'Klarer Kontext.',
      '',
      '2) Sachliche Information / Verfahrenserklaerung',
      'Neutrale Information.',
      '',
      '3) Beteiligungsmoeglichkeit',
      'Beschreibend.',
      '',
      '4) Quellenhinweis',
      'laut Bundeswahlleiter',
      '',
      '5) Transparenzhinweis',
      'Dies ist eine KI-gestuetzte Zusammenfassung auf Basis offizieller Informationen.',
    ].join('\n');

    expect(isStructuredClaraResponse(structured)).toBe(true);
    expect(ensureStructuredClaraResponse(structured, 'du')).toBe(structured);
  });

  it('formats unstructured answer into required five blocks', () => {
    const raw = 'Die Bundestagswahl folgt den Regeln des Bundeswahlgesetzes.';
    const formatted = ensureStructuredClaraResponse(raw, 'sie');

    expect(formatted).toMatch(/1\)\s*Kontext/);
    expect(formatted).toMatch(/2\)\s*Sachliche Information/);
    expect(formatted).toMatch(/3\)\s*Beteiligungsmoeglichkeit/);
    expect(formatted).toMatch(/4\)\s*Quellenhinweis/);
    expect(formatted).toMatch(/5\)\s*Transparenzhinweis/);
  });

  it('uses official-info fallback when source is missing', () => {
    const formatted = ensureStructuredClaraResponse('Unklare Aussage ohne Quelle.', 'du');
    expect(formatted).toContain('Dazu liegen mir keine gesicherten offiziellen Informationen vor.');
  });

  it('parseClaraStructuredResponse splits five blocks', () => {
    const text = [
      '1) Kontext',
      'X',
      '',
      '2) Sachliche Information',
      'Y',
      '',
      '3) Beteiligungsmoeglichkeit',
      'Z',
      '',
      '4) Quellenhinweis',
      'laut Amt',
      '',
      '5) Transparenzhinweis',
      'KI',
    ].join('\n');
    const p = parseClaraStructuredResponse(text);
    expect(p?.length).toBe(5);
    expect(p?.[0].id).toBe(1);
    expect(p?.[4].title).toMatch(/Transparenz/);
  });
});
