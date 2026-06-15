import {
  sanitizeClaraOutput,
  CLARA_OUTPUT_SANITIZER_FALLBACK,
  containsPreservedDisclaimer,
} from '@/lib/ai/claraOutputSanitizer';
import { CLARA_CASE_DISCLAIMER } from '@/lib/claraCaseGuidance';

describe('claraOutputSanitizer', () => {
  it('detects forbidden entitlement language', () => {
    const result = sanitizeClaraOutput('Du hast Anspruch auf Wohngeld in Kirkel.');
    expect(result.isSafe).toBe(false);
    expect(result.flaggedPhrases).toContain('du hast Anspruch auf');
    expect(result.fallbackNotice).toBe(CLARA_OUTPUT_SANITIZER_FALLBACK);
    expect(result.safeText).toContain(CLARA_OUTPUT_SANITIZER_FALLBACK);
    expect(result.safeText).toContain('Du hast Anspruch auf');
  });

  it('detects forbidden submission claims', () => {
    const result = sanitizeClaraOutput('Wir reichen Ihren Antrag ein beim Bürgerbüro.');
    expect(result.isSafe).toBe(false);
    expect(result.flaggedPhrases).toContain('wir reichen Ihren Antrag ein');
  });

  it('passes safe cautious wording', () => {
    const safe =
      'Wohngeld könnte relevant sein — bitte final bei der zuständigen Stelle prüfen. Clara unterstützt bei Orientierung und Vorbereitung.';
    const result = sanitizeClaraOutput(safe);
    expect(result.isSafe).toBe(true);
    expect(result.flaggedPhrases).toEqual([]);
    expect(result.safeText).toBe(safe);
    expect(result.fallbackNotice).toBeUndefined();
  });

  it('preserves disclaimer text in safe output', () => {
    const withDisclaimer = `${CLARA_CASE_DISCLAIMER} Möglicherweise relevante Wege.`;
    const result = sanitizeClaraOutput(withDisclaimer);
    expect(result.isSafe).toBe(true);
    expect(containsPreservedDisclaimer(result.safeText)).toBe(true);
  });
});
