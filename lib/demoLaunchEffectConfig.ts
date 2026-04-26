/**
 * Optionaler Demo-/Pitch-Launch beim Übergang Walkthrough → Haupt-App.
 * Aktiv nur, wenn NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT=true (Build-Zeit).
 */
export function isDemoLaunchEffectEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEMO_LAUNCH_EFFECT === 'true';
}

/** sessionStorage: höchstens ein Launch pro Browser-Tab-Sitzung. */
export const DEMO_LAUNCH_SESSION_STORAGE_KEY = 'hookai_demo_launch_shown_v1';
