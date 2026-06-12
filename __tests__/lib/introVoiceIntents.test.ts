import {
  matchAnredeFromSpeech,
  matchIntroEntryBranchFromSpeech,
  matchIntroVoiceIntent,
  parseClaraVoiceIntent,
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
    expect(matchIntroEntryBranchFromSpeech('ich bin bereit')).toBe('start');
    expect(matchIntroEntryBranchFromSpeech('na klar')).toBe('start');
  });
});

describe('matchIntroVoiceIntent', () => {
  it('erkennt Zurück', () => {
    expect(matchIntroVoiceIntent('bitte zurück').type).toBe('back');
  });
});

describe('parseClaraVoiceIntent', () => {
  const walkthroughCtx = { inAnredeGate: false, hasAddress: true } as const;

  it('erkennt Navigation und Start', () => {
    expect(parseClaraVoiceIntent('weiter', walkthroughCtx).type).toBe('NEXT_STEP');
    expect(parseClaraVoiceIntent('weiter bitte', walkthroughCtx).type).toBe('NEXT_STEP');
    expect(parseClaraVoiceIntent('mach weiter', walkthroughCtx).type).toBe('NEXT_STEP');
    expect(parseClaraVoiceIntent('zurück', walkthroughCtx).type).toBe('PREVIOUS_STEP');
    expect(parseClaraVoiceIntent('bitte starten', walkthroughCtx).type).toBe('START_INTRO');
    expect(parseClaraVoiceIntent('Einführung', walkthroughCtx).type).toBe('START_INTRO');
    expect(parseClaraVoiceIntent('erklär mir die App', walkthroughCtx).type).toBe('START_INTRO');
  });

  it('erkennt App-Öffnen', () => {
    expect(parseClaraVoiceIntent('zur App', walkthroughCtx).type).toBe('OPEN_APP');
    expect(parseClaraVoiceIntent('App öffnen', walkthroughCtx).type).toBe('OPEN_APP');
    expect(parseClaraVoiceIntent('Demo öffnen', walkthroughCtx).type).toBe('OPEN_APP');
    expect(parseClaraVoiceIntent('App', walkthroughCtx).type).toBe('OPEN_APP');
  });

  it('erkennt stop, repeat, help', () => {
    expect(parseClaraVoiceIntent('stopp', walkthroughCtx).type).toBe('STOP_SPEECH');
    expect(parseClaraVoiceIntent('Clara stoppen', walkthroughCtx).type).toBe('STOP_SPEECH');
    expect(parseClaraVoiceIntent('nochmal', walkthroughCtx).type).toBe('REPEAT_CURRENT');
    expect(parseClaraVoiceIntent('wiederholen', walkthroughCtx).type).toBe('REPEAT_CURRENT');
    expect(parseClaraVoiceIntent('Hilfe', walkthroughCtx).type).toBe('HELP');
  });

  it('erkennt Du/Sie', () => {
    expect(parseClaraVoiceIntent('Du', walkthroughCtx).type).toBe('SET_ADDRESS_DU');
    expect(parseClaraVoiceIntent('per Du', walkthroughCtx).type).toBe('SET_ADDRESS_DU');
    expect(parseClaraVoiceIntent('Sie', walkthroughCtx).type).toBe('SET_ADDRESS_SIE');
    expect(parseClaraVoiceIntent('per Sie', walkthroughCtx).type).toBe('SET_ADDRESS_SIE');
  });

  it('setzt im Anrede-Kontext bei neutralen Antworten default auf Du', () => {
    const anredeCtx = { inAnredeGate: true, hasAddress: false } as const;
    expect(parseClaraVoiceIntent('ist egal', anredeCtx).type).toBe('SET_ADDRESS_DU');
    expect(parseClaraVoiceIntent('mir egal', anredeCtx).type).toBe('SET_ADDRESS_DU');
    expect(parseClaraVoiceIntent('such du aus', anredeCtx).type).toBe('SET_ADDRESS_DU');
    expect(parseClaraVoiceIntent('entscheide du', anredeCtx).type).toBe('SET_ADDRESS_DU');
    expect(parseClaraVoiceIntent('mach einfach', anredeCtx).type).toBe('SET_ADDRESS_DU');
    expect(parseClaraVoiceIntent('okay', anredeCtx).type).toBe('SET_ADDRESS_DU');
    expect(parseClaraVoiceIntent('ja', anredeCtx).type).toBe('SET_ADDRESS_DU');
    expect(parseClaraVoiceIntent('weiter', anredeCtx).type).toBe('SET_ADDRESS_DU');
  });

  it('interpretiert „weiter“ nach gesetzter Anrede als NEXT_STEP', () => {
    const afterAddressCtx = { inAnredeGate: false, hasAddress: true } as const;
    expect(parseClaraVoiceIntent('weiter', afterAddressCtx).type).toBe('NEXT_STEP');
  });
});
