import { isTrustedEvidenceUrl, sanitizeEvidenceSources } from '@/lib/clara-evidence';

describe('clara evidence helpers', () => {
  it('accepts trusted host urls', () => {
    expect(isTrustedEvidenceUrl('https://www.bundestag.de/suche')).toBe(true);
    expect(isTrustedEvidenceUrl('https://www.gesetze-im-internet.de/bwahlg/')).toBe(true);
  });

  it('rejects untrusted host urls', () => {
    expect(isTrustedEvidenceUrl('https://example.com/foo')).toBe(false);
    expect(isTrustedEvidenceUrl('invalid-url')).toBe(false);
  });

  it('adds missing evidence marker for empty sources', () => {
    expect(sanitizeEvidenceSources([])).toEqual([
      'Evidenzstatus: missing – keine verifizierte Primärquelle hinterlegt',
    ]);
  });

  it('keeps provided sources', () => {
    expect(sanitizeEvidenceSources(['  Quelle A  ', 'https://www.bpb.de'])).toEqual([
      'Quelle A',
      'https://www.bpb.de',
    ]);
  });
});

