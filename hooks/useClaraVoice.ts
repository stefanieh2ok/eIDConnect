'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ClaraVoiceState } from '@/types/clara';
import {
  categorizeClaraTtsFailure,
  claraAudioDebugEnabled,
  claraAudioDevLog,
  claraAudioPreview,
} from '@/lib/claraAudioDevLog';

type PendingTtsPlayback = {
  objectUrl: string;
  requestId: number;
  playbackRate: number;
};

const CLARA_TTS_FAILED_EVENT = 'eidconnect:clara-tts-failed';

function emitClaraTtsFailed(): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(CLARA_TTS_FAILED_EVENT));
  } catch {
    /* ignore */
  }
}

export const useClaraVoice = () => {
  const [voiceState, setVoiceState] = useState<ClaraVoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    error: null
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  /** TTS fertig geladen, aber `play()` wegen Autoplay-Policy blockiert (v. a. iOS Safari) — Start nach Nutzer-Geste. */
  const pendingTtsRef = useRef<PendingTtsPlayback | null>(null);
  const playRequestIdRef = useRef(0);
  /** Einmal pro Sitzung: kurzer Silent-Play im User-Gesture (iOS Safari Autoplay-Gate). */
  const iosAudioUnlockedRef = useRef(false);
  const [speechRate, setSpeechRateState] = useState<number>(() => {
    if (typeof window === 'undefined') return 1.05;
    try {
      const raw = window.sessionStorage.getItem('clara_speech_rate_v1');
      if (raw === '1' || raw === '1.15') return Number(raw);
    } catch {
      // ignore
    }
    return 1.05;
  });

  useEffect(() => {
    claraAudioDevLog('ClaraVoice engine mounted (TTS via /api/tts)');
  }, []);

  useEffect(() => {
    // Initialize speech recognition (iOS 14.5+ oft `SpeechRecognition`, Desktop meist `webkitSpeechRecognition`)
    if (typeof window === 'undefined') return;
    const RecognitionCtor =
      'webkitSpeechRecognition' in window
        ? (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition
        : 'SpeechRecognition' in window
          ? (window as unknown as { SpeechRecognition: new () => SpeechRecognition }).SpeechRecognition
          : null;
    if (RecognitionCtor) {
      const recognition = new RecognitionCtor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'de-DE';

      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setVoiceState(prev => ({ ...prev, transcript: finalTranscript }));
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setVoiceState(prev => ({
          ...prev,
          isListening: false,
          error: `Spracherkennung Fehler: ${event.error}`
        }));
      };

      recognition.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !voiceState.isListening) {
      recognitionRef.current.start();
    }
  }, [voiceState.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop();
    }
  }, [voiceState.isListening]);

  const clearPendingTts = useCallback(() => {
    const p = pendingTtsRef.current;
    if (p) {
      URL.revokeObjectURL(p.objectUrl);
      pendingTtsRef.current = null;
    }
  }, []);

  const stopSpeaking = useCallback((reason?: string) => {
    const prev = playRequestIdRef.current;
    playRequestIdRef.current += 1;
    claraAudioDevLog('stopSpeaking called', 'reason=', reason ?? 'none', 'requestId', prev, '→', playRequestIdRef.current);
    clearPendingTts();
    const currentAudio = audioRef.current;
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch {
        // ignore
      }
      currentAudio.src = '';
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
  }, [clearPendingTts]);

  /** Hörbare Wiedergabe: `playing` auf dem Audio-Element (+ optional Timing-Event bei Debug). */
  const attachClaraAudibleDevLog = useCallback((audio: HTMLAudioElement, requestId: number) => {
    audio.addEventListener(
      'playing',
      () => {
        if (requestId !== playRequestIdRef.current) return;
        claraAudioDevLog('audio playing event fired');
        if (!claraAudioDebugEnabled()) return;
        const at = typeof performance !== 'undefined' ? performance.now() : Date.now();
        try {
          window.dispatchEvent(new CustomEvent('eidconnect:clara-audible-start', { detail: { at } }));
        } catch {
          /* ignore */
        }
      },
      { once: true },
    );
  }, []);

  /**
   * iOS/Safari: einmaliger „Media-Gate“-Unlock im echten User-Gesture (Tap).
   * Ohne das schlägt später `audio.play()` aus async/TTS oft mit NotAllowed fehl.
   */
  const unlockAudioFromUserGesture = useCallback(() => {
    if (typeof window === 'undefined' || iosAudioUnlockedRef.current) {
      if (iosAudioUnlockedRef.current) claraAudioDevLog('user gesture received (unlock already done)');
      return;
    }
    claraAudioDevLog('user gesture received');
    claraAudioDevLog('audio unlock attempted');
    /**
     * Sofort markieren: TTS-`fetch` endet oft *nach* dem Tap-Stack — ohne dieses Flag
     * wäre `iosAudioUnlockedRef` erst im `.then()` des Silent-Wavs true und `audio.play()`
     * läuft noch mit „nicht freigeschaltet“ (iOS/Safari, teils striktes Desktop-Chrome).
     */
    iosAudioUnlockedRef.current = true;
    claraAudioDevLog('audio unlock success (optimistic in user gesture)');
    const silent =
      'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAE=';
    const a = new window.Audio(silent);
    a.volume = 0.0001;
    void a
      .play()
      .then(() => {
        claraAudioDevLog('audio unlock confirmed (silent buffer played)');
        try {
          a.pause();
        } catch {
          /* ignore */
        }
      })
      .catch((err: unknown) => {
        const name =
          err instanceof DOMException
            ? err.name
            : err instanceof Error
              ? err.name
              : 'Error';
        const message = err instanceof Error ? err.message : String(err);
        claraAudioDevLog('audio unlock failed:', `${name} ${message}`);
        try {
          const Ctx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (Ctx) {
            const ctx = new Ctx();
            void ctx.resume().then(() => {
              const buf = ctx.createBuffer(1, 1, 22050);
              const src = ctx.createBufferSource();
              src.buffer = buf;
              src.connect(ctx.destination);
              src.start(0);
              claraAudioDevLog('audio unlock success (WebAudio fallback)');
              void ctx.close?.().catch(() => {});
            });
          }
        } catch (e2) {
          claraAudioDevLog('audio unlock WebAudio fallback failed:', e2 instanceof Error ? e2.message : e2);
        }
      });
  }, []);

  const tryResumePendingAudioFromUserGesture = useCallback(() => {
    unlockAudioFromUserGesture();
    const p = pendingTtsRef.current;
    if (!p) {
      claraAudioDevLog('tryResume: no pending TTS');
      return false;
    }
    if (p.requestId !== playRequestIdRef.current) {
      claraAudioDevLog(
        'stale request ignored',
        'requestId=',
        p.requestId,
        'current=',
        playRequestIdRef.current,
      );
      URL.revokeObjectURL(p.objectUrl);
      pendingTtsRef.current = null;
      return false;
    }
    const { objectUrl, requestId, playbackRate } = p;
    pendingTtsRef.current = null;
    const audio = new Audio(objectUrl);
    audio.playbackRate = playbackRate;
    audioUrlRef.current = objectUrl;
    audioRef.current = audio;

    audio.onended = () => {
      if (requestId !== playRequestIdRef.current) return;
      setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
    };
    audio.onerror = () => {
      if (requestId !== playRequestIdRef.current) return;
      setVoiceState((prev) => ({
        ...prev,
        isSpeaking: false,
        error: 'Audio konnte nicht abgespielt werden.',
      }));
    };

    setVoiceState((prev) => ({ ...prev, isSpeaking: true, error: null }));
    attachClaraAudibleDevLog(audio, requestId);
    claraAudioDevLog('audio.play called (tryResume pending TTS)');
    void audio.play().catch((err: unknown) => {
      if (requestId !== playRequestIdRef.current) return;
      const name =
        err instanceof DOMException ? err.name : err instanceof Error ? err.name : 'Error';
      const message = err instanceof Error ? err.message : String(err);
      claraAudioDevLog('audio play failed', 'name=', name, 'message=', message);
      pendingTtsRef.current = { objectUrl, requestId, playbackRate };
      audioRef.current = null;
      setVoiceState((prev) => ({ ...prev, isSpeaking: false, error: null }));
    });
    return true;
  }, [attachClaraAudibleDevLog, unlockAudioFromUserGesture]);

  const playTts = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text) {
        claraAudioDevLog('playTts skipped: empty text');
        return;
      }

      claraAudioDevLog('playTts called', 'textLength=', text.length);
      stopSpeaking('playTts:cancel-prior');
      const requestId = ++playRequestIdRef.current;
      claraAudioDevLog('playTts new requestId=', requestId);
      setVoiceState((prev) => ({ ...prev, isSpeaking: true, error: null }));

      const finishTtsUnavailable = (httpStatus: number, rawDetail: string, logPreview: boolean) => {
        if (requestId !== playRequestIdRef.current) return;
        const safeReason = categorizeClaraTtsFailure(httpStatus, rawDetail);
        claraAudioDevLog(`tts unavailable status=${httpStatus} reason=${safeReason}`);
        if (logPreview) claraAudioDevLog('tts upstream preview (dev)=', claraAudioPreview(rawDetail, 100));
        claraAudioDevLog('falling back to text-only mode');
        claraAudioDevLog('TTS nicht verfügbar – Textmodus aktiv');
        emitClaraTtsFailed();
        setVoiceState((prev) => ({
          ...prev,
          isSpeaking: false,
          error: process.env.NODE_ENV === 'production' ? null : `TTS: ${safeReason}`,
        }));
        claraAudioDevLog('isIntroSpeaking reset after tts error');
      };

      try {
        claraAudioDevLog('tts request started', 'POST /api/tts');
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, speed: speechRate }),
        });

        const contentType = res.headers.get('content-type') ?? '';
        claraAudioDevLog('tts response status=', res.status, 'contentType=', contentType);

        if (!res.ok) {
          let rawDetail = `http_${res.status}`;
          try {
            const text = await res.text();
            if (text.trim()) {
              try {
                const json = JSON.parse(text) as { error?: string };
                if (typeof json?.error === 'string' && json.error.trim()) rawDetail = json.error.trim();
                else rawDetail = text.trim().slice(0, 500);
              } catch {
                rawDetail = text.trim().slice(0, 500);
              }
            }
          } catch {
            /* ignore */
          }
          finishTtsUnavailable(res.status, rawDetail, true);
          return;
        }

        const blob = await res.blob();
        if (requestId !== playRequestIdRef.current) {
          claraAudioDevLog('stale request ignored after blob', 'requestId=', requestId, 'current=', playRequestIdRef.current);
          return;
        }
        if (contentType.includes('application/json')) {
          let rawDetail = 'unexpected_json_body';
          try {
            rawDetail = (await blob.text()).slice(0, 500);
          } catch {
            /* ignore */
          }
          finishTtsUnavailable(res.status, rawDetail, true);
          return;
        }
        if (blob.size < 1) {
          claraAudioDevLog('tts response empty body — aborting playback');
          finishTtsUnavailable(0, 'TTS-Antwort leer', false);
          return;
        }
        claraAudioDevLog('audio blob size=', blob.size, 'bytes');

        const objectUrl = URL.createObjectURL(blob);
        claraAudioDevLog('audio objectUrl created');
        audioUrlRef.current = objectUrl;
        const audio = new Audio(objectUrl);
        audio.playbackRate = speechRate;
        audioRef.current = audio;

        audio.onended = () => {
          if (requestId !== playRequestIdRef.current) return;
          claraAudioDevLog('audio ended');
          setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
        };
        audio.onerror = () => {
          if (requestId !== playRequestIdRef.current) return;
          emitClaraTtsFailed();
          setVoiceState((prev) => ({
            ...prev,
            isSpeaking: false,
            error: 'Audio konnte nicht abgespielt werden.',
          }));
        };

        attachClaraAudibleDevLog(audio, requestId);
        try {
          claraAudioDevLog('audio.play called', 'muted=', audio.muted, 'volume=', audio.volume);
          await audio.play();
          claraAudioDevLog('audio.play promise resolved (may still buffer)');
        } catch (playErr: unknown) {
          if (requestId !== playRequestIdRef.current) return;
          const name =
            playErr instanceof DOMException
              ? playErr.name
              : typeof playErr === 'object' &&
                  playErr !== null &&
                  'name' in playErr &&
                  typeof (playErr as { name: unknown }).name === 'string'
                ? (playErr as { name: string }).name
                : '';
          const msg = playErr instanceof Error ? playErr.message : String(playErr);
          claraAudioDevLog('audio play failed', 'name=', name, 'message=', msg);
          if (name === 'NotAllowedError') {
            try {
              audio.pause();
            } catch {
              // ignore
            }
            audio.src = '';
            audioRef.current = null;
            audioUrlRef.current = null;
            pendingTtsRef.current = { objectUrl, requestId, playbackRate: speechRate };
            claraAudioDevLog('NotAllowedError — pending TTS stored for gesture resume');
            setVoiceState((prev) => ({ ...prev, isSpeaking: false, error: null }));
            return;
          }
          throw playErr;
        }
      } catch (e) {
        if (requestId !== playRequestIdRef.current) return;
        const raw = e instanceof Error ? e.message : String(e);
        claraAudioDevLog('playTts catch:', e instanceof Error ? `${e.name} ${e.message}` : e);
        finishTtsUnavailable(0, raw, true);
      }
    },
    [stopSpeaking, speechRate, attachClaraAudibleDevLog],
  );

  const speak = useCallback((text: string) => {
    void playTts(text);
  }, [playTts]);

  /**
   * Mehrere kurze Äußerungen nacheinander (Browser queue), damit Pausen zwischen
   * Sinnabschnitten entstehen — klingt natürlicher als ein langer Monolog.
   */
  const speakParts = useCallback((parts: string[]) => {
    const cleaned = parts
      .map((p) => p.replace(/\s+/g, ' ').replace(/[*#_`]/g, '').trim())
      .filter((p) => p.length >= 2);
    if (!cleaned.length) {
      claraAudioDevLog('speakParts skipped: all segments empty after filter', 'incoming=', parts.length);
      return;
    }
    void playTts(cleaned.join('\n\n'));
  }, [playTts]);

  /** Nach Verarbeitung leeren, damit `useEffect` bei gleichem Text erneut feuern kann und keine Doppel-Läufe entstehen. */
  const clearTranscript = useCallback(() => {
    setVoiceState((prev) => ({ ...prev, transcript: '' }));
  }, []);

  const setSpeechRate = useCallback((rate: 1 | 1.15) => {
    setSpeechRateState(rate);
    try {
      window.sessionStorage.setItem('clara_speech_rate_v1', String(rate));
    } catch {
      // ignore
    }
  }, []);

  return {
    voiceState,
    startListening,
    stopListening,
    speak,
    speakParts,
    stopSpeaking,
    tryResumePendingAudioFromUserGesture,
    unlockAudioFromUserGesture,
    clearTranscript,
    speechRate,
    setSpeechRate,
  };
};
