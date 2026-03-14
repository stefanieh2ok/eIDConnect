export interface ClaraMessage {
  id: string;
  type: 'user' | 'clara';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  suggestions?: string[];
}

export interface ClaraAnalysis {
  cardId: string;
  personalMatch: number;
  reasoning: string;
  pros: string[];
  cons: string[];
  recommendation: 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no';
  confidence: number;
  alternativePerspectives: string[];
}

export interface ClaraPreferences {
  umwelt: number;
  finanzen: number;
  bildung: number;
  digital: number;
  soziales: number;
  sicherheit: number;
}

export interface ClaraVoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  error: string | null;
}

export interface ClaraChatState {
  messages: ClaraMessage[];
  isOpen: boolean;
  isLoading: boolean;
}

export type ClaraInteractionMode = 'voice' | 'chat' | 'info_box';
export type ClaraPersonality = 'helpful' | 'analytical' | 'conversational';
