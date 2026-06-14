import { createAPIHeaders, getAPIConfig } from '@/lib/api-config';
import type { AiChatProvider, ChatCompletionRequest, ChatCompletionResult } from '@/lib/ai/provider-types';

async function completeOpenAIChat(request: ChatCompletionRequest): Promise<ChatCompletionResult> {
  const config = getAPIConfig();
  const headers = createAPIHeaders(config.openai.apiKey);

  const response = await fetch(`${config.openai.baseURL}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.openai.model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userMessage },
      ],
      max_tokens: request.maxTokens ?? 500,
      temperature: request.temperature ?? 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API Fehler: ${response.status}`);
  }

  const data = await response.json();
  const content =
    data.choices?.[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';

  return {
    content,
    model: config.openai.model,
    providerId: 'openai',
  };
}

export const openAiChatProvider: AiChatProvider = {
  id: 'openai',
  completeChat: completeOpenAIChat,
};
