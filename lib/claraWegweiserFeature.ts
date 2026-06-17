/**
 * Optional Clara Wegweiser pilot module — feature flag.
 * Default: enabled in local/demo when unset.
 */
export function isClaraWegweiserEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_ENABLE_CLARA_WEGWEISER;
  if (raw == null || raw === '') return true;
  return raw.trim().toLowerCase() === 'true';
}

/** @deprecated Pilot entry lives in the bottom nav pilot zone — card is not shown on core tabs. */
export const CLARA_WEGWEISER_PILOT_ANCHOR_SECTIONS = ['live', 'meldungen', 'wahlen'] as const;

/** Pilot card above content is disabled; Wegweiser is reachable via bottom nav pilot zone. */
export function shouldShowClaraWegweiserPilotCard(_activeSection: string): boolean {
  return false;
}
