/**
 * Einheitlich nach hartem Redirect (z. B. NDA → Demo): kein ererbter Fenster-Scroll,
 * kein Browser-Scroll-Restore-Sprung.
 */
export function resetViewportScroll(): void {
  if (typeof window === 'undefined') return;
  try {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  } catch {
    /* ignore */
  }
  try {
    window.scrollTo(0, 0);
  } catch {
    /* jsdom */
  }
  try {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  } catch {
    /* ignore */
  }
}
