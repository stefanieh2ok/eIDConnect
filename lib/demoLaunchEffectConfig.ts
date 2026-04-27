/**
 * Optionaler Demo-/Pitch-Launch beim Übergang Walkthrough → Haupt-App.
 * Standard: aktiv, wenn keine ENV gesetzt ist.
 * Explizit deaktivierbar mit NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT=false.
 */
export function isDemoLaunchEffectEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT;
  if (raw == null || raw === '') return true;
  return raw.trim().toLowerCase() === 'true';
}

export type DemoLaunchStyle = 'identity-seal' | 'classic';

/**
 * Aktuell primär: identity-seal.
 * Bei ungültigem/fehlendem Wert fällt es stabil auf identity-seal zurück.
 */
export function getDemoLaunchStyle(): DemoLaunchStyle {
  const raw = (process.env.NEXT_PUBLIC_DEMO_LAUNCH_STYLE || '').trim().toLowerCase();
  if (raw === 'classic') return 'classic';
  return 'identity-seal';
}

/** sessionStorage: höchstens ein Launch pro Browser-Tab-Sitzung. */
export const DEMO_LAUNCH_SESSION_STORAGE_KEY = 'hookai_demo_launch_shown_v1';
