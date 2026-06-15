/**
 * AI provider types — model-agnostic Clara architecture.
 *
 * Public-sector buyers may require sovereign deployment, EU hosting,
 * auditability and provider switching. Clara must remain model-agnostic.
 */
export type AiProviderId = 'local-rules' | 'openai' | 'azure-openai' | 'mistral' | 'sovereign-eu' | 'none';

export type AiProviderConfig = {
  activeProvider: AiProviderId;
  llmEnabled: boolean;
  fallbackToRules: boolean;
};

export const DEFAULT_AI_PROVIDER_CONFIG: AiProviderConfig = {
  activeProvider: 'local-rules',
  llmEnabled: false,
  fallbackToRules: true,
};
