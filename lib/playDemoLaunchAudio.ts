/**
 * Kurze Launch-/Welcome-Audio (optional). Keine speechSynthesis — nur Assets unter /audio/.
 * Muss aus derselben User-Geste wie der UI-Start aufgerufen werden (Mobile Safari).
 */
function playOne(src: string, volume = 0.38): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    try {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.addEventListener('ended', finish, { once: true });
      audio.addEventListener('error', finish, { once: true });
      const p = audio.play();
      if (p !== undefined && typeof (p as Promise<void>).catch === 'function') {
        (p as Promise<void>).catch(finish);
      }
    } catch {
      finish();
    }
  });
}

export function playDemoLaunchAudio(): void {
  if (typeof window === 'undefined') return;

  void (async () => {
    try {
      await playOne('/audio/hookai-launch.mp3', 0.32);
      const lang = (navigator.language || 'de').toLowerCase();
      const welcome = /^de\b/i.test(lang) ? '/audio/hookai-welcome-de.mp3' : '/audio/hookai-welcome-en.mp3';
      await playOne(welcome, 0.42);
    } catch {
      /* absichtlich still */
    }
  })();
}
