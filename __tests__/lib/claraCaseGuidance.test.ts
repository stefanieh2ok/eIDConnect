import {
  CLARA_CASE_DISCLAIMER,
  CLARA_CONFIDENCE_LABELS,
  CLARA_DEMO_DATA_NOTICE,
  CLARA_FORBIDDEN_PHRASES,
  CLARA_OFFICIAL_SOURCE_NOTICE,
  CLARA_MULTI_AUTHORITY_EXAMPLES,
  claraCasePreparationInstructionBlock,
  containsForbiddenClaraLanguage,
  containsMandatoryCaseDisclaimer,
} from '@/lib/claraCaseGuidance';

describe('claraCaseGuidance', () => {
  it('exposes mandatory disclaimer and source notice verbatim', () => {
    expect(CLARA_CASE_DISCLAIMER).toContain('Clara unterstützt bei Orientierung und Vorbereitung');
    expect(CLARA_OFFICIAL_SOURCE_NOTICE).toContain('ausschließlich über die zuständige Stelle');
    expect(CLARA_DEMO_DATA_NOTICE).toContain('Demo-Daten');
    expect(CLARA_DEMO_DATA_NOTICE).toContain('PVOG/XZuFi');
  });

  it('defines the three confidence labels', () => {
    expect(CLARA_CONFIDENCE_LABELS.high).toBe('Sehr wahrscheinlich relevant');
    expect(CLARA_CONFIDENCE_LABELS.medium).toBe('Möglicherweise relevant');
    expect(CLARA_CONFIDENCE_LABELS.low).toBe('Nur prüfen, falls zutreffend');
  });

  it('lists multi-authority examples for cross-agency orchestration', () => {
    expect(CLARA_MULTI_AUTHORITY_EXAMPLES).toEqual(
      expect.arrayContaining(['Bürgerbüro', 'Jobcenter', 'Finanzamt', 'Gewerbeamt']),
    );
  });

  it('embeds forbidden phrases and mandatory notices in instruction block', () => {
    const block = claraCasePreparationInstructionBlock();
    for (const phrase of CLARA_FORBIDDEN_PHRASES.slice(0, 5)) {
      expect(block).toContain(phrase);
    }
    expect(block).toContain(CLARA_CASE_DISCLAIMER);
    expect(block).toContain(CLARA_OFFICIAL_SOURCE_NOTICE);
    expect(block).toContain('Cross-Agency-Orchestrierung');
  });

  it('detects forbidden entitlement language', () => {
    expect(containsForbiddenClaraLanguage('Du hast Anspruch auf Wohngeld.')).toBe('du hast Anspruch auf');
    expect(containsForbiddenClaraLanguage('Wir reichen Ihren Antrag ein.')).toBe('wir reichen Ihren Antrag ein');
    expect(containsForbiddenClaraLanguage('Könnte relevant sein — bitte prüfen.')).toBeNull();
  });

  it('detects mandatory disclaimer presence', () => {
    expect(containsMandatoryCaseDisclaimer(CLARA_CASE_DISCLAIMER)).toBe(true);
    expect(containsMandatoryCaseDisclaimer('Nur Orientierung ohne Disclaimer')).toBe(false);
  });
});
