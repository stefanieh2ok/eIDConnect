/**
 * Erste Systemnachricht im Clara-Chat (Du/Sie, konsistent mit Anrede).
 */
export const CLARA_CHAT_WELCOME_LINES_DU = [
  'Hallo, ich bin Clara.',
  'Frag mich gern etwas zu den Bereichen der App.',
] as const;

export const CLARA_CHAT_WELCOME_LINES_SIE = [
  'Hallo, ich bin Clara.',
  'Fragen Sie mich gern etwas zu den Bereichen der App.',
] as const;

export function claraChatWelcomeContent(isFormal: boolean): string {
  return (isFormal ? CLARA_CHAT_WELCOME_LINES_SIE : CLARA_CHAT_WELCOME_LINES_DU).join('\n\n');
}

/** Chat aus der Clara-Pille während des Produkt-Walkthroughs — keine erneute Vorstellung. */
export function claraChatIntroWalkthroughWelcome(isFormal: boolean, stepLabel: string): string {
  return isFormal
    ? `Ich bin gerade im Bereich: ${stepLabel}. Was möchten Sie dazu wissen?`
    : `Ich bin gerade im Bereich: ${stepLabel}. Was möchtest du dazu wissen?`;
}
