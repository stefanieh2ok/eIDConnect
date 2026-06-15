import { DEFAULT_AI_PROVIDER_CONFIG, type AiProviderConfig } from '@/lib/ai/aiProvider.types';

/** Runtime provider config — LLM optional, rules fallback always available. */
export function getProviderConfig(): AiProviderConfig {
  return { ...DEFAULT_AI_PROVIDER_CONFIG };
}
