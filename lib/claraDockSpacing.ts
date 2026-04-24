/**
 * Abstand für die schwebende Clara-Pille: `bottom` in ClaraDock =
 * `calc(1rem + <extra> + env(safe-area-inset-bottom))`.
 * Großzügig (auch kleine Geräte / Home-Indicator), damit nie mit Fuß-CTAs kollidiert.
 */
/** vh statt svh: breitere Browser-Unterstützung (invalides CSS wäre harmlos, aber konservativ). */
export const CLARA_DOCK_EXTRA_BOTTOM_ANREDE_ENTRY = 'min(22.5rem, 52vh)';
export const CLARA_DOCK_EXTRA_BOTTOM_EID = 'min(18.5rem, 46vh)';
