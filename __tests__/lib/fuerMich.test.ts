import { matchLeistungen } from '@/lib/fuerMichMatch';
import katalog from '@/data/leistungskatalog-demo.json';
import {
  buildFuerMichClaraPrompt,
  FUER_MICH_CLARA_OPENING,
  FUER_MICH_CLARA_OPENING_DU,
  FUER_MICH_CLARA_CLOSING,
  FUER_MICH_CLARA_CLOSING_DU,
  FUER_MICH_CLARA_NO_INFO,
  FUER_MICH_REGION_DEMO,
  FUER_MICH_AGE_HINT_UNDER_16,
  FUER_MICH_AGE_HINT_16_17,
  FUER_MICH_SENSITIVE_OPENER,
  getFuerMichAgeHint,
  isFuerMichSensitiveContext,
  isSensitiveLifeEvent,
} from '@/lib/fuerMichClaraPrompt';
import {
  CLARA_FORBIDDEN_PHRASES,
  CLARA_OFFICIAL_SOURCE_NOTICE,
  CLARA_DEMO_DATA_NOTICE,
} from '@/lib/claraCaseGuidance';
import { EMPTY_FUER_MICH_PROFILE } from '@/types/fuerMich';

describe('matchLeistungen', () => {
  it('liefert für eine Lebenslage passende Demo-Leistungen', () => {
    const result = matchLeistungen(['moving']);
    const ids = result.map((r) => r.id);
    expect(ids).toContain('ummeldung');
    expect(ids).toContain('kfz-ummeldung');
    // Jedes Ergebnis trägt tatsächlich den gewählten Lebenslagen-Tag.
    for (const eintrag of result) {
      expect(eintrag.lebenslagen).toContain('moving');
    }
  });

  it('liefert ohne Auswahl keine Ergebnisse', () => {
    expect(matchLeistungen([])).toEqual([]);
  });

  it('liefert nur Einträge aus dem lokalen Demo-Katalog (kein Treffer außerhalb)', () => {
    const katalogIds = new Set((katalog.leistungen as { id: string }[]).map((l) => l.id));
    const result = matchLeistungen(['education', 'job_search']);
    expect(result.length).toBeGreaterThan(0);
    for (const eintrag of result) {
      expect(katalogIds.has(eintrag.id)).toBe(true);
      const tags = eintrag.lebenslagen;
      expect(tags.includes('education') || tags.includes('job_search')).toBe(true);
    }
  });
});

describe('buildFuerMichClaraPrompt', () => {
  const ergebnisse = matchLeistungen(['moving']);

  it('enthält Pflicht-Einstieg, Pflicht-Abschluss und NO-INFO-Fallback', () => {
    const prompt = buildFuerMichClaraPrompt({
      lifeEvents: ['moving'],
      profile: EMPTY_FUER_MICH_PROFILE,
      ergebnisse,
    });
    expect(prompt).toContain(FUER_MICH_CLARA_OPENING);
    expect(prompt).toContain(FUER_MICH_CLARA_CLOSING);
    expect(prompt).toContain(FUER_MICH_CLARA_NO_INFO);
  });

  it('verbietet Anspruchsformulierungen und übergibt keine Freitext-PII', () => {
    const prompt = buildFuerMichClaraPrompt({
      lifeEvents: ['moving'],
      profile: {
        ...EMPTY_FUER_MICH_PROFILE,
        plz: '66459',
        // Eindeutiger Freitext-Sentinel (nicht gleich der Demo-Region), um echtes PII-Leck zu prüfen.
        wohnort: 'Geheimwohnort-XYZ',
        bundesland: 'saarland',
      },
      ergebnisse,
    });
    // Verbot ist als Anweisung vorhanden (Schutzregel sichtbar im Prompt).
    expect(prompt).toContain('Verboten:');
    expect(prompt).toContain('Sie haben Anspruch auf');
    // Aber Freitext-PII (PLZ/Wohnort) wird NICHT übergeben.
    expect(prompt).not.toContain('66459');
    expect(prompt).not.toContain('Geheimwohnort-XYZ');
  });

  it('enthält die Demo-Region nur als UI-/Demo-Kontext (keine personenbezogene Angabe)', () => {
    const prompt = buildFuerMichClaraPrompt({
      lifeEvents: ['moving'],
      profile: EMPTY_FUER_MICH_PROFILE,
      ergebnisse,
    });
    expect(prompt).toContain(FUER_MICH_REGION_DEMO);
    expect(prompt).toContain('KEINE personenbezogene Angabe');
  });

  it('nutzt im Du-Modus die Du-Pflichtformulierungen', () => {
    const prompt = buildFuerMichClaraPrompt({
      lifeEvents: ['moving'],
      profile: EMPTY_FUER_MICH_PROFILE,
      ergebnisse,
      addressMode: 'du',
    });
    expect(prompt).toContain(FUER_MICH_CLARA_OPENING_DU);
    expect(prompt).toContain(FUER_MICH_CLARA_CLOSING_DU);
  });

  it('listet alle verbotenen Anspruchsformulierungen als Schutzregel', () => {
    const prompt = buildFuerMichClaraPrompt({
      lifeEvents: ['moving'],
      profile: EMPTY_FUER_MICH_PROFILE,
      ergebnisse,
    });
    for (const phrase of CLARA_FORBIDDEN_PHRASES) {
      expect(prompt).toContain(phrase);
    }
  });

  it('enthält Pflicht-Hinweise für Orientierung, offizielle Wege und Demo-Daten', () => {
    const prompt = buildFuerMichClaraPrompt({
      lifeEvents: ['moving'],
      profile: EMPTY_FUER_MICH_PROFILE,
      ergebnisse,
    });
    expect(prompt).toContain(CLARA_OFFICIAL_SOURCE_NOTICE);
    expect(prompt).toContain(CLARA_DEMO_DATA_NOTICE);
    expect(prompt).toContain('Cross-Agency-Orchestrierung');
  });

  it('bindet keine nicht enthaltene Leistung ein (NO-INFO + Allow-List-Bindung)', () => {
    const prompt = buildFuerMichClaraPrompt({
      lifeEvents: ['moving'],
      profile: EMPTY_FUER_MICH_PROFILE,
      ergebnisse,
    });
    // Bindung an die Liste + sauberer Fallback bei nicht enthaltenen Themen.
    expect(prompt).toContain('Nenne ausschließlich Leistungen');
    expect(prompt).toContain(FUER_MICH_CLARA_NO_INFO);
    expect(prompt).toContain('Erfinde keine Quellen');
  });

  it('erzeugt für Altersgruppe unter 16 einen Sorgeberechtigten-Hinweis', () => {
    const prompt = buildFuerMichClaraPrompt({
      lifeEvents: ['coming_of_age'],
      profile: { ...EMPTY_FUER_MICH_PROFILE, altersgruppe: 'under_16' },
      ergebnisse: matchLeistungen(['coming_of_age']),
    });
    expect(prompt).toContain(FUER_MICH_AGE_HINT_UNDER_16);
    expect(prompt).toContain('Sorgeberechtigten');
  });

  it('erzeugt für Altersgruppe 16–17 einen Zustimmungs-Hinweis', () => {
    const prompt = buildFuerMichClaraPrompt({
      lifeEvents: ['mobility'],
      profile: { ...EMPTY_FUER_MICH_PROFILE, altersgruppe: '16_17' },
      ergebnisse: matchLeistungen(['mobility']),
    });
    expect(prompt).toContain(FUER_MICH_AGE_HINT_16_17);
    expect(prompt).toContain('Zustimmung der Sorgeberechtigten');
  });

  it('aktiviert den sensiblen Modus bei Pflege/Todesfall', () => {
    const prompt = buildFuerMichClaraPrompt({
      lifeEvents: ['bereavement'],
      profile: EMPTY_FUER_MICH_PROFILE,
      ergebnisse: matchLeistungen(['bereavement']),
    });
    expect(prompt).toContain('Sensibler Modus aktiv');
    expect(prompt).toContain(FUER_MICH_SENSITIVE_OPENER);
    expect(prompt).toContain('keine Gamification');
  });

  it('übergibt grobe Altersgruppe und Nutzungsrolle, aber kein Geburtsdatum', () => {
    const prompt = buildFuerMichClaraPrompt({
      lifeEvents: ['mobility'],
      profile: { ...EMPTY_FUER_MICH_PROFILE, altersgruppe: '18_plus', nutzungsrolle: 'self' },
      ergebnisse: matchLeistungen(['mobility']),
    });
    expect(prompt).toContain('Altersgruppe (grob): 18+');
    expect(prompt).toContain('Nutzungsrolle:');
  });
});

describe('getFuerMichAgeHint', () => {
  it('liefert exakte Hinweise je Altersgruppe und null ohne Angabe', () => {
    expect(getFuerMichAgeHint('under_16')).toBe(FUER_MICH_AGE_HINT_UNDER_16);
    expect(getFuerMichAgeHint('16_17')).toBe(FUER_MICH_AGE_HINT_16_17);
    expect(getFuerMichAgeHint('18_plus')).toContain('selbst vorbereitet');
    expect(getFuerMichAgeHint('')).toBeNull();
    expect(getFuerMichAgeHint(undefined)).toBeNull();
  });
});

describe('isFuerMichSensitiveContext', () => {
  it('erkennt Pflege/Todesfall und minderjährige Nutzung als sensibel', () => {
    expect(
      isFuerMichSensitiveContext({
        lifeEvents: ['caregiving'],
        profile: { altersgruppe: '', nutzungsrolle: '' },
      }),
    ).toBe(true);
    expect(
      isFuerMichSensitiveContext({
        lifeEvents: ['mobility'],
        profile: { altersgruppe: 'under_16', nutzungsrolle: '' },
      }),
    ).toBe(true);
    expect(
      isFuerMichSensitiveContext({
        lifeEvents: ['mobility'],
        profile: { altersgruppe: '18_plus', nutzungsrolle: 'self' },
      }),
    ).toBe(false);
  });
});

describe('isSensitiveLifeEvent', () => {
  it('markiert Pflege und Todesfall als sensibel', () => {
    expect(isSensitiveLifeEvent('caregiving')).toBe(true);
    expect(isSensitiveLifeEvent('bereavement')).toBe(true);
  });

  it('markiert neutrale Lebenslagen nicht als sensibel', () => {
    expect(isSensitiveLifeEvent('moving')).toBe(false);
    expect(isSensitiveLifeEvent('education')).toBe(false);
  });
});
