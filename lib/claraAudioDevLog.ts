/**
 * Clara-Audio-Diagnose: in Development immer aktiv; in Production nur wenn
 * `localStorage.setItem('clara_audio_debug','1')` (z. B. Safari am iPhone).
 */
export function claraAudioDebugEnabled(): boolean {
  if (typeof window === 'undefined') return process.env.NODE_ENV !== 'production';
  try {
    if (window.localStorage?.getItem('clara_audio_debug') === '1') return true;
  } catch {
    /* ignore */
  }
  return process.env.NODE_ENV !== 'production';
}

export function claraAudioDevLog(...args: unknown[]): void {
  if (!claraAudioDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.log('[ClaraAudio]', ...args);
}

/** Kurzpreview für Logs (keine langen privaten Texte). */
export function claraAudioPreview(text: string, max = 80): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

/**
 * Sichere Fehler-Kategorie für Logs / Dev-only `voiceState.error` — kein Rohtext
 * von OpenAI oder internen URLs.
 */
export function categorizeClaraTtsFailure(status: number, rawMessage?: string): string {
  const t = (rawMessage ?? '').toLowerCase();
  if (status === 503) return 'tts_not_configured';
  if (status === 401 || status === 403) return 'unauthorized';
  if (status === 429) return 'quota_or_billing';
  if (/quota|billing|exceeded your current|insufficient/i.test(t)) return 'quota_or_billing';
  if (/antwort leer|^empty|empty body/i.test(t)) return 'empty_response';
  if (status === 502 || status === 504 || (status >= 500 && status < 600)) return 'upstream_error';
  if (status === 400) return 'bad_request';
  if (status === 0 || /failed to fetch|networkerror|load failed|econnrefused/i.test(t)) return 'network';
  return 'unknown';
}
