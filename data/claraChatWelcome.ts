/**
 * Erste Systemnachricht im Clara-Chat (Du/Sie, konsistent mit Anrede).
 */
export const CLARA_CHAT_WELCOME_LINES_DU = [
  'Ich unterstütze dich mit Informationen zu den einzelnen Bereichen der App.',
  'Meine Antworten sind neutral und basieren auf verfügbaren Quellen.',
  'Ich gebe keine Wahlempfehlungen.',
  'Bitte prüfe bei wichtigen Entscheidungen zusätzlich offizielle Informationen.',
] as const;

export const CLARA_CHAT_WELCOME_LINES_SIE = [
  'Ich unterstütze Sie mit Informationen zu den einzelnen Bereichen der App.',
  'Meine Antworten sind neutral und basieren auf verfügbaren Quellen.',
  'Ich gebe keine Wahlempfehlungen.',
  'Bitte prüfen Sie bei wichtigen Entscheidungen zusätzlich offizielle Informationen.',
] as const;

export function claraChatWelcomeContent(isFormal: boolean): string {
  return (isFormal ? CLARA_CHAT_WELCOME_LINES_SIE : CLARA_CHAT_WELCOME_LINES_DU).join('\n\n');
}
