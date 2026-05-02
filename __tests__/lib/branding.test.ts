import { APP_DISPLAY_NAME, APP_TAGLINE, normalizeAppDisplayName } from '@/lib/branding';

describe('APP_DISPLAY_NAME', () => {
  it('ist immer die vollständige Civic-Produktmarke (unabhängig von Legacy-Env)', () => {
    expect(APP_DISPLAY_NAME).toBe('HookAI Civic');
    expect(APP_TAGLINE).toBe('Informieren. Verstehen. Mitwirken.');
  });
});

describe('normalizeAppDisplayName', () => {
  it('liefert HookAI Civic ohne oder leerem Namen', () => {
    expect(normalizeAppDisplayName(undefined)).toBe('HookAI Civic');
    expect(normalizeAppDisplayName('')).toBe('HookAI Civic');
    expect(normalizeAppDisplayName('   ')).toBe('HookAI Civic');
  });

  it('mappt gängige Legacy-Schreibweisen der eID-Demo', () => {
    expect(normalizeAppDisplayName('eID Demo')).toBe('HookAI Civic');
    expect(normalizeAppDisplayName('eID‑Demo‑Connect')).toBe('HookAI Civic');
    expect(normalizeAppDisplayName('eIDConnect')).toBe('HookAI Civic');
    expect(normalizeAppDisplayName('eID Connect Demo')).toBe('HookAI Civic');
    expect(normalizeAppDisplayName('eidconnect')).toBe('HookAI Civic');
  });

  it('mappt früheren Projekt-Arbeitstitel Bürger App', () => {
    expect(normalizeAppDisplayName('Bürger App')).toBe('HookAI Civic');
    expect(normalizeAppDisplayName('BürgerApp')).toBe('HookAI Civic');
    expect(normalizeAppDisplayName('Bürger-App')).toBe('HookAI Civic');
    expect(normalizeAppDisplayName('Buerger App')).toBe('HookAI Civic');
  });

  it('lässt bewusst gesetzte Nicht-Legacy-Namen unverändert', () => {
    expect(normalizeAppDisplayName('Mein Pilot')).toBe('Mein Pilot');
    expect(normalizeAppDisplayName('HookAI Civic')).toBe('HookAI Civic');
  });
});
