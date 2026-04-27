/** Pre-Login Voice-Overlay: gleiche Texte wie ClaraVoiceInterface (eine Quelle). */
export const ANREDE_VOICE_PROMPT =
  'Hallo, ich bin Clara. Bitte sagen Sie „Du“ oder „Sie“, damit ich Sie passend anspreche. Alternativ können Sie die Schaltflächen im Fenster nutzen.';

export const ENTRY_VOICE_PROMPT_DU =
  'Hallo, ich bin Clara. Möchtest du die Einführung starten oder direkt in die App? Sag einfach „Einführung starten“ oder „Direkt zur App“.';

export const ENTRY_VOICE_PROMPT_SIE =
  'Hallo, ich bin Clara. Möchten Sie die Einführung starten oder direkt in die App? Sagen Sie einfach „Einführung starten“ oder „Direkt zur App“.';

export const EID_VOICE_PROMPT_DU =
  'Hallo, ich bin Clara. Du kannst hier direkt per Stimme fragen, zum Beispiel zur eID, zur EU Wallet, zu Abstimmungen, Wahlen oder zum Politikbarometer. Ich antworte neutral und Schritt für Schritt.';

export const EID_VOICE_PROMPT_SIE =
  'Hallo, ich bin Clara. Sie können hier direkt per Stimme fragen, zum Beispiel zur eID, zur EU Wallet, zu Abstimmungen, Wahlen oder zum Politikbarometer. Ich antworte neutral und Schritt für Schritt.';

/**
 * Eingeloggter Produkt-Walkthrough: nur Anzeige im Voice-Panel — **kein** TTS beim Öffnen
 * (Nutzung: Mic aktivieren, Nutzer spricht; keine zusätzliche Clara-Ansage).
 */
export const WALKTHROUGH_VOICE_OPEN_LINE_DU =
  'Stelle jetzt eine kurze Frage zu diesem Einführungsschritt. Die Steuerung oben bleibt parallel nutzbar.';

export const WALKTHROUGH_VOICE_OPEN_LINE_SIE =
  'Stellen Sie jetzt eine kurze Frage zu diesem Einführungsschritt. Die Steuerung oben bleibt parallel nutzbar.';

export function getVoiceOpenPromptAndDisplay(params: {
  preLoginVoicePhase: 'anrede' | 'entry' | 'eid' | null;
  addressMode: 'du' | 'sie';
  /** Nur bei eingeloggter App (phase null): Plaintext für speak + UI. */
  loggedInGreetingPlain: string;
}): { speakText: string; conversationLine: string } {
  const { preLoginVoicePhase, addressMode, loggedInGreetingPlain } = params;
  if (preLoginVoicePhase === 'anrede') {
    return { speakText: ANREDE_VOICE_PROMPT, conversationLine: `Clara: ${ANREDE_VOICE_PROMPT}` };
  }
  if (preLoginVoicePhase === 'entry') {
    const p = addressMode === 'sie' ? ENTRY_VOICE_PROMPT_SIE : ENTRY_VOICE_PROMPT_DU;
    return { speakText: p, conversationLine: `Clara: ${p}` };
  }
  if (preLoginVoicePhase === 'eid') {
    const p = addressMode === 'sie' ? EID_VOICE_PROMPT_SIE : EID_VOICE_PROMPT_DU;
    return { speakText: p, conversationLine: `Clara: ${p}` };
  }
  const g = loggedInGreetingPlain.trim();
  return { speakText: g, conversationLine: g };
}
