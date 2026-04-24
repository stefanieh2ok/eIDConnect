const KEY = 'eidconnect_prelogin_v2';
const LEGACY_ANREDE = 'eidconnect_anrede_confirmed_session_v1';
export const INTRO_WANTS_WALKTHROUGH_KEY = 'eidconnect_wants_walkthrough_v1';

export type PreLoginPhase = 'anrede' | 'entry' | 'ok';

export function readPreLoginPhase(): PreLoginPhase {
  if (typeof window === 'undefined') return 'anrede';
  try {
    const v = sessionStorage.getItem(KEY);
    if (v === 'entry' || v === 'ok') return v;
    const legacy = sessionStorage.getItem(LEGACY_ANREDE);
    if (legacy === 'true' && !v) {
      try {
        sessionStorage.setItem(KEY, 'ok');
        if (sessionStorage.getItem(INTRO_WANTS_WALKTHROUGH_KEY) == null) {
          sessionStorage.setItem(INTRO_WANTS_WALKTHROUGH_KEY, '1');
        }
      } catch {
        // ignore
      }
      return 'ok';
    }
  } catch {
    // ignore
  }
  return 'anrede';
}

export function writePreLoginPhase(p: PreLoginPhase) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(KEY, p);
  } catch {
    // ignore
  }
}

export function readWantsWalkthrough(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return sessionStorage.getItem(INTRO_WANTS_WALKTHROUGH_KEY) !== '0';
  } catch {
    return true;
  }
}

export function writeWantsWalkthrough(walkthrough: boolean) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(INTRO_WANTS_WALKTHROUGH_KEY, walkthrough ? '1' : '0');
  } catch {
    // ignore
  }
}

export function clearIntroSessionKeys() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem(INTRO_WANTS_WALKTHROUGH_KEY);
    sessionStorage.removeItem(LEGACY_ANREDE);
  } catch {
    // ignore
  }
}
