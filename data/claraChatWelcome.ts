/**
 * Erste Systemnachricht im Clara-Chat (Du/Sie, konsistent mit Anrede).
 */
export const CLARA_CHAT_WELCOME_LINES_DU = [
  'Hallo, ich bin Clara, deine digitale Assistentin in der HookAI Civic Demo.',
  'Ich unterstütze dich mit Informationen zu den einzelnen Bereichen der App.',
  'Meine Antworten sind neutral und basieren auf verfügbaren Quellen.',
  'Ich gebe keine Wahlempfehlungen.',
  'Bitte prüfe bei wichtigen Entscheidungen zusätzlich offizielle Informationen.',
] as const;

export const CLARA_CHAT_WELCOME_LINES_SIE = [
  'Hallo, ich bin Clara, Ihre digitale Assistentin in der HookAI Civic Demo.',
  'Ich unterstütze Sie mit Informationen zu den einzelnen Bereichen der App.',
  'Meine Antworten sind neutral und basieren auf verfügbaren Quellen.',
  'Ich gebe keine Wahlempfehlungen.',
  'Bitte prüfen Sie bei wichtigen Entscheidungen zusätzlich offizielle Informationen.',
] as const;

export function claraChatWelcomeContent(isFormal: boolean): string {
  return (isFormal ? CLARA_CHAT_WELCOME_LINES_SIE : CLARA_CHAT_WELCOME_LINES_DU).join('\n\n');
}

/** Chat aus der Clara-Pille während des Produkt-Walkthroughs — keine erneute Vorstellung. */
export function claraChatIntroWalkthroughWelcome(isFormal: boolean, stepLabel: string): string {
  return isFormal
    ? `Frag mich etwas zu „${stepLabel}" in dieser Einführung. Kurze, neutrale Antworten zu Funktion und Bedienung — ohne erneute Vorstellung und ohne Wahlempfehlung.`
    : `Frag mich etwas zu „${stepLabel}" in dieser Einführung. Kurze, neutrale Antworten zu Funktion und Bedienung — ohne erneute Vorstellung und ohne Wahlempfehlung.`;
}
