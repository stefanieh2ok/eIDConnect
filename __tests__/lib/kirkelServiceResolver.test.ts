import {
  resolveServicesForSituation,
  canOpenExternal,
  getAgeGuidanceNotice,
  ALL_KIRKEL_SERVICES,
} from '@/lib/kirkelServiceResolver';

describe('resolveServicesForSituation', () => {
  it('liefert für „Wir ziehen um“ Ummeldung und Wohnungsgeberbestätigung', () => {
    const result = resolveServicesForSituation({ selectedLifeEvents: ['moving'] });
    const keys = result.matchedServices.map((s) => s.leistung_key);
    expect(keys).toContain('ummeldung');
    expect(keys).toContain('wohnungsgeberbestaetigung');
  });

  it('liefert für „Mobilität & Führerschein“ Führerschein und BF17', () => {
    const result = resolveServicesForSituation({ selectedLifeEvents: ['mobility'] });
    const keys = result.matchedServices.map((s) => s.leistung_key);
    expect(keys).toContain('fuehrerschein');
    expect(keys).toContain('begleitetes-fahren-bf17');
    expect(keys).toContain('personalausweis-eid');
  });

  it('liefert ohne Auswahl keine Ergebnisse', () => {
    const result = resolveServicesForSituation({ selectedLifeEvents: [] });
    expect(result.matchedServices).toEqual([]);
    expect(result.nextSteps).toEqual([]);
    expect(result.evidenceChips).toEqual([]);
  });

  it('dedupliziert mögliche Nachweise', () => {
    const result = resolveServicesForSituation({
      selectedLifeEvents: ['newborn', 'moving', 'daily_support'],
    });
    const unique = new Set(result.evidenceChips);
    expect(result.evidenceChips.length).toBe(unique.size);
    expect(result.evidenceChips.length).toBeGreaterThan(0);
  });

  it('dedupliziert zuständige Stellen', () => {
    const result = resolveServicesForSituation({
      selectedLifeEvents: ['newborn', 'job_search', 'daily_support'],
    });
    const unique = new Set(result.offices);
    expect(result.offices.length).toBe(unique.size);
    expect(result.offices.length).toBeGreaterThan(0);
  });

  it('priorisiert maximal drei nächste Schritte', () => {
    const result = resolveServicesForSituation({ selectedLifeEvents: ['moving'] });
    expect(result.nextSteps.length).toBeLessThanOrEqual(3);
    expect(result.matchedServices.length).toBe(
      result.nextSteps.length + result.furtherServices.length,
    );
  });

  it('liefert für fehlende externe Links eine fallback_message', () => {
    const result = resolveServicesForSituation({ selectedLifeEvents: ['moving'] });
    expect(result.missingLinks.length).toBeGreaterThan(0);
    for (const service of result.missingLinks) {
      expect(typeof service.fallback_message).toBe('string');
      expect(service.fallback_message.length).toBeGreaterThan(0);
    }
    expect(result.fallbackMessages.length).toBeGreaterThan(0);
  });
});

describe('canOpenExternal', () => {
  it('öffnet keinen Service mit source_status „needs_verification“ direkt extern', () => {
    const needsVerification = ALL_KIRKEL_SERVICES.filter(
      (s) => s.source_status === 'needs_verification',
    );
    expect(needsVerification.length).toBeGreaterThan(0);
    for (const service of needsVerification) {
      expect(canOpenExternal(service)).toBe(false);
    }
  });

  it('öffnet nur geprüfte Quellen mit hinterlegter URL', () => {
    for (const service of ALL_KIRKEL_SERVICES) {
      if (service.source_status !== 'verified') {
        expect(canOpenExternal(service)).toBe(false);
      }
    }
  });
});

describe('getAgeGuidanceNotice', () => {
  it('zeigt unter 16 einen Sorgeberechtigten-Hinweis', () => {
    const notice = getAgeGuidanceNotice('under_16');
    expect(notice).not.toBeNull();
    expect(notice?.tone).toBe('minor_under_16');
    expect(notice?.text).toContain('Sorgeberechtigten');
  });

  it('zeigt für 16–17 einen Zustimmungshinweis', () => {
    const notice = getAgeGuidanceNotice('16_17');
    expect(notice?.tone).toBe('consent_16_17');
    expect(notice?.text).toContain('Zustimmung');
  });

  it('formuliert für 18+ du/sie korrekt ohne Anspruchsaussage', () => {
    expect(getAgeGuidanceNotice('18_plus', false)?.text).toContain('Sie können');
    expect(getAgeGuidanceNotice('18_plus', true)?.text).toContain('Du kannst');
  });

  it('liefert ohne Altersgruppe keinen Hinweis', () => {
    expect(getAgeGuidanceNotice('')).toBeNull();
    expect(getAgeGuidanceNotice(undefined)).toBeNull();
  });
});

describe('Resolver-Output enthält keine Anspruchsformulierungen', () => {
  const FORBIDDEN = [
    'Anspruch auf',
    'steht zu',
    'erfüllen die Voraussetzungen',
    'wird bewilligt',
    'Sie bekommen',
    'Wahrscheinlichkeit',
  ];

  it('weder in Texten der Leistungen noch in Aggregaten', () => {
    const result = resolveServicesForSituation({
      selectedLifeEvents: [
        'expecting_child',
        'newborn',
        'education',
        'coming_of_age',
        'mobility',
        'moving',
        'job_search',
        'founding',
        'caregiving',
        'retirement',
        'bereavement',
        'daily_support',
      ],
    });
    const haystack = [
      ...result.matchedServices.flatMap((s) => [
        s.titel,
        s.kurzbeschreibung,
        s.zustaendige_stelle,
        s.fallback_message,
        s.demo_notice,
        s.source_label,
        ...s.moegliche_nachweise,
      ]),
      ...result.evidenceChips,
      ...result.offices,
      ...result.fallbackMessages,
    ].join(' \n ');

    for (const phrase of FORBIDDEN) {
      expect(haystack).not.toContain(phrase);
    }
  });
});
