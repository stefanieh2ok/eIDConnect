/** Portal target for in-app modals/sheets (inside civic-app-shell / iPhone frame). */
export const CIVIC_APP_MODAL_ROOT_ID = 'civic-app-modal-root';

export function getCivicAppModalRoot(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.getElementById(CIVIC_APP_MODAL_ROOT_ID);
}
