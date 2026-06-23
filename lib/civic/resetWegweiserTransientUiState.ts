/**
 * Clears transient Wegweiser UI locks (clarification overlay attrs, scroll lock).
 */
export function resetWegweiserTransientUiState(): void {
  if (typeof document === 'undefined') return;

  document.documentElement.removeAttribute('data-clara-clarification-open');
  delete document.documentElement.dataset.claraWegweiserClarifying;

  const shell = document.querySelector('.civic-app-shell');
  shell?.removeAttribute('data-clara-clarification-open');

  const scrollEl = document.getElementById('main-content');
  if (scrollEl) {
    scrollEl.style.overflow = '';
  }

  const modalRoot = document.getElementById('civic-app-modal-root');
  if (modalRoot) {
    modalRoot.setAttribute('aria-hidden', 'true');
    modalRoot.replaceChildren();
  }
}
