/** Client-safe helpers for scroll / motion respecting user preferences. */

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function scrollBehaviorPreference(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

export function scrollIntoViewNearest(el: Element | null | undefined): void {
  if (!el) return;
  el.scrollIntoView({
    block: 'nearest',
    behavior: scrollBehaviorPreference(),
  });
}
