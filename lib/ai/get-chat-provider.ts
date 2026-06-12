import type { AiChatProvider } from '@/lib/ai/provider-types';
import { openAiChatProvider } from '@/lib/ai/providers/openai-chat-provider';

/**
 * Wechselpunkt für Modell-Exit: CLARA_AI_PROVIDER=openai (Default).
 * Weitere Provider: eigene Implementierung von AiChatProvider + Eintrag hier.
 */
export function getChatProvider(): AiChatProvider {
  const id = (process.env.CLARA_AI_PROVIDER ?? 'openai').trim().toLowerCase();
  if (id === 'openai') return openAiChatProvider;
  throw new Error(`Unbekannter CLARA_AI_PROVIDER: ${id}`);
}
