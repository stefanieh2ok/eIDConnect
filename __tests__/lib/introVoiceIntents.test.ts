import {
  matchAnredeFromSpeech,
  matchIntroEntryBranchFromSpeech,
  matchIntroVoiceIntent,
} from '@/lib/introVoiceIntents';

describe('matchAnredeFromSpeech', () => {
  it('erkennt Ein-Wort „Du“ / „Sie“', () => {
    expect(matchAnredeFromSpeech('du')).toBe('du');
    expect(matchAnredeFromSpeech('Sie')).toBe('sie');
  });

  it('erkennt typische Formulierungen', () => {
    expect(matchAnredeFromSpeech('ich möchte per du angesprochen werden')).toBe('du');
    expect(matchAnredeFromSpeech('bitte förmlich mit sie')).toBe('sie');
    expect(matchAnredeFromSpeech('per du bitte')).toBe('du');
  });

  it('liefert null bei leerem oder widersprüchlichem Input', () => {
    expect(matchAnredeFromSpeech('')).toBeNull();
    expect(matchAnredeFromSpeech('   ')).toBeNull();
  });
});

describe('matchIntroEntryBranchFromSpeech', () => {
  it('erkennt Start / Direkt', () => {
    expect(matchIntroEntryBranchFromSpeech('Einführung starten')).toBe('start');
    expect(matchIntroEntryBranchFromSpeech('direkt zur app')).toBe('direct');
    expect(matchIntroEntryBranchFromSpeech('ja')).toBe('start');
  });
});

describe('matchIntroVoiceIntent', () => {
  it('erkennt Zurück', () => {
    expect(matchIntroVoiceIntent('bitte zurück').type).toBe('back');
  });
});
