/**
 * Optional Clara Wegweiser pilot module — feature flag.
 * Default: enabled in local/demo when unset.
 */
export function isClaraWegweiserEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
  if (raw == null || raw === '') return true;
  return raw.trim().toLowerCase() === 'true';
}

/** Core civic sections where the optional pilot card may appear. */
export const CLARA_WEGWEISER_PILOT_ANCHOR_SECTIONS = ['live', 'meldungen', 'wahlen'] as const;

export function shouldShowClaraWegweiserPilotCard(activeSection: string): boolean {
  if (!isClaraWegweiserEnabled()) return false;
  if (activeSection === 'fuermich') return false;
  return (CLARA_WEGWEISER_PILOT_ANCHOR_SECTIONS as readonly string[]).includes(activeSection);
}
