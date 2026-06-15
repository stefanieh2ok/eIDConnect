import { buildClaraSystemPrompt, buildClaraAnalyzePrompt } from '@/lib/clara-system-prompt';
import { CLARA_SOURCE_LOCK_VERSION } from '@/lib/ai/clara-ai-audit';
import {
  CLARA_CASE_DISCLAIMER,
  CLARA_DEMO_DATA_NOTICE,
  CLARA_FORBIDDEN_PHRASES,
  CLARA_OFFICIAL_SOURCE_NOTICE,
  CLARA_PRODUCT_FRAMING,
} from '@/lib/claraCaseGuidance';

describe('buildClaraSystemPrompt v7', () => {
  const baseOpts = {
    addressMode: 'du' as const,
    personalizationEnabled: false,
  };

  it('locks audit version to clara-system-prompt-v7', () => {
    expect(CLARA_SOURCE_LOCK_VERSION).toBe('clara-system-prompt-v7');
  });

  it('frames Clara as case preparation navigator, not authority', () => {
    const prompt = buildClaraSystemPrompt(baseOpts);
    expect(prompt).toContain('v7');
    expect(prompt).toContain('CASE PREPARATION MODE');
    expect(prompt).toContain(CLARA_PRODUCT_FRAMING);
    expect(prompt).toContain('keine zweite Verwaltung');
    expect(prompt).toMatch(/keine.*Anträge ein/i);
  });

  it('includes mandatory notices and forbidden wording guardrails', () => {
    const prompt = buildClaraSystemPrompt(baseOpts);
    expect(prompt).toContain(CLARA_CASE_DISCLAIMER);
    expect(prompt).toContain(CLARA_OFFICIAL_SOURCE_NOTICE);
    expect(prompt).toContain(CLARA_DEMO_DATA_NOTICE);
    for (const phrase of CLARA_FORBIDDEN_PHRASES.slice(0, 4)) {
      expect(prompt).toContain(phrase);
    }
  });

  it('uses proper German umlauts in case-preparation sections', () => {
    const prompt = buildClaraSystemPrompt(baseOpts);
    expect(prompt).toContain('Bürger');
    expect(prompt).toContain('behördliche');
    expect(prompt).toContain('Anträge');
    expect(prompt).toContain('zuständige');
    expect(prompt).not.toMatch(/Buergerzugang|behoerdliche|Antraege ein/);
  });

  it('preserves analyze prompt extension and lists forbidden submission phrases', () => {
    const prompt = buildClaraAnalyzePrompt(baseOpts);
    expect(prompt).toContain('ABSTIMMUNGSANALYSE');
    expect(prompt).toContain('wir reichen Ihren Antrag ein');
    expect(prompt).toContain(CLARA_CASE_DISCLAIMER);
  });
});
