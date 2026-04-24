/**
 * Abstand für die schwebende Clara-Pille: `bottom` in ClaraDock =
 * `calc(1rem + <extra> + env(safe-area-inset-bottom))`.
 * Großzügig (auch kleine Geräte / Home-Indicator), damit nie mit Fuß-CTAs kollidiert.
 *
 * Wichtig: `min(…vh, …rem)` allein kollabiert auf kurzen Viewports (Demo-iframe, kleines Fenster)
 * → Pille landet auf „Weiter“. Darum `max(<Mindestabstand>, …)` als untere Schranke.
 */
/** vh statt svh: breitere Browser-Unterstützung (invalides CSS wäre harmlos, aber konservativ). */
export const CLARA_DOCK_EXTRA_BOTTOM_ANREDE_ENTRY = 'max(17rem, min(24rem, 62vh))';
export const CLARA_DOCK_EXTRA_BOTTOM_EID = 'max(13rem, min(20rem, 52vh))';
