/**
 * Austauschbare KI-Anbindung (OpenAI heute, EU-/Souverän-Provider später).
 */

export type ChatCompletionRequest = {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
};

export type ChatCompletionResult = {
  content: string;
  model: string;
  providerId: string;
};

export interface AiChatProvider {
  readonly id: string;
  completeChat(request: ChatCompletionRequest): Promise<ChatCompletionResult>;
}
