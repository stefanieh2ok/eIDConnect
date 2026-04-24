/** Pre-Login Voice-Overlay: gleiche Texte wie ClaraVoiceInterface (eine Quelle). */
export const ANREDE_VOICE_PROMPT =
  'Sag klar „Du" oder „Sie", je nachdem, wie du angesprochen werden möchtest. Oder wähle die Buttons im Fenster.';

export const ENTRY_VOICE_PROMPT_DU =
  'Möchtest du die Einführung starten, oder direkt in die App? Sag zum Beispiel: Einführung starten, oder: direkt zur App. Oder nutz die Tasten oben.';

export const ENTRY_VOICE_PROMPT_SIE =
  'Möchten Sie die Einführung starten, oder direkt in die App? Sagen Sie zum Beispiel: Einführung starten, oder: direkt zur App. Oder nutzen Sie die Tasten oben.';

export const EID_VOICE_PROMPT_DU =
  'Im eID-Schritt kannst du Fragen dazu stellen, oder im Fenster mit dem Button fortfahren. Die ausführliche eID-Erläuterung findest du in der laufenden Einführung oben.';

export const EID_VOICE_PROMPT_SIE =
  'Im eID-Schritt können Sie Fragen dazu stellen, oder im Fenster mit dem Button fortfahren. Die ausführliche eID-Erläuterung finden Sie in der laufenden Einführung oben.';

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
