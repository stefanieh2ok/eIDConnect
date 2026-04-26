import { APP_DISPLAY_NAME, APP_TAGLINE, normalizeAppDisplayName } from '@/lib/branding';

describe('APP_DISPLAY_NAME', () => {
  it('ist immer die vollständige Civic-Demo-Marke (unabhängig von Legacy-Env)', () => {
    expect(APP_DISPLAY_NAME).toBe('HookAI Civic Demo');
    expect(APP_TAGLINE).toBe('Informieren. Verstehen. Mitwirken.');
  });
});

describe('normalizeAppDisplayName', () => {
  it('liefert HookAI Civic Demo ohne oder leerem Namen', () => {
    expect(normalizeAppDisplayName(undefined)).toBe('HookAI Civic Demo');
    expect(normalizeAppDisplayName('')).toBe('HookAI Civic Demo');
    expect(normalizeAppDisplayName('   ')).toBe('HookAI Civic Demo');
  });

  it('mappt gängige Legacy-Schreibweisen der eID-Demo', () => {
    expect(normalizeAppDisplayName('eID Demo')).toBe('HookAI Civic Demo');
    expect(normalizeAppDisplayName('eID‑Demo‑Connect')).toBe('HookAI Civic Demo');
    expect(normalizeAppDisplayName('eIDConnect')).toBe('HookAI Civic Demo');
    expect(normalizeAppDisplayName('eID Connect Demo')).toBe('HookAI Civic Demo');
    expect(normalizeAppDisplayName('eidconnect')).toBe('HookAI Civic Demo');
  });

  it('mappt früheren Projekt-Arbeitstitel Bürger App', () => {
    expect(normalizeAppDisplayName('Bürger App')).toBe('HookAI Civic Demo');
    expect(normalizeAppDisplayName('BürgerApp')).toBe('HookAI Civic Demo');
    expect(normalizeAppDisplayName('Bürger-App')).toBe('HookAI Civic Demo');
    expect(normalizeAppDisplayName('Buerger App')).toBe('HookAI Civic Demo');
  });

  it('lässt bewusst gesetzte Nicht-Legacy-Namen unverändert', () => {
    expect(normalizeAppDisplayName('Mein Pilot')).toBe('Mein Pilot');
    expect(normalizeAppDisplayName('HookAI Civic Demo')).toBe('HookAI Civic Demo');
  });
});
