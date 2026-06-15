/**
 * Runtime output sanitizer for Clara-generated user-facing text.
 * Complements prompt guardrails — does not silently rewrite meaning.
 */
import { CLARA_CASE_DISCLAIMER, CLARA_FORBIDDEN_PHRASES } from '@/lib/claraCaseGuidance';

export const CLARA_OUTPUT_SANITIZER_FALLBACK =
  'Clara kann diesen Abschnitt nicht sicher formulieren. Bitte nutze die Angaben nur als Orientierung und prüfe die offiziellen Informationen der zuständigen Stelle.';

export type ClaraOutputSanitizeResult = {
  isSafe: boolean;
  flaggedPhrases: string[];
  safeText: string;
  fallbackNotice?: string;
};

function findForbiddenPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const phrase of CLARA_FORBIDDEN_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      found.push(phrase);
    }
  }
  return found;
}

/**
 * Checks Clara output for forbidden entitlement/submission language.
 * When unsafe: prepends fallback notice — original text preserved for transparency.
 */
export function sanitizeClaraOutput(text: string): ClaraOutputSanitizeResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      isSafe: true,
      flaggedPhrases: [],
      safeText: trimmed,
    };
  }

  const flaggedPhrases = findForbiddenPhrases(trimmed);
  if (flaggedPhrases.length === 0) {
    return {
      isSafe: true,
      flaggedPhrases: [],
      safeText: trimmed,
    };
  }

  return {
    isSafe: false,
    flaggedPhrases,
    safeText: `${CLARA_OUTPUT_SANITIZER_FALLBACK}\n\n${trimmed}`,
    fallbackNotice: CLARA_OUTPUT_SANITIZER_FALLBACK,
  };
}

/** Preserves mandatory disclaimer even when surrounding text is flagged. */
export function containsPreservedDisclaimer(text: string): boolean {
  return text.includes(CLARA_CASE_DISCLAIMER);
}
