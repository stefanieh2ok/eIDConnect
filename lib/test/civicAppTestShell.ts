/** Minimal civic app shell DOM for Wegweiser / Clara sheet tests. */
export function mountCivicAppTestDocument() {
  document.body.innerHTML = `
    <div class="civic-app-shell relative" data-testid="civic-app-shell">
      <main id="main-content"></main>
      <nav class="app-bottom-nav" data-testid="app-bottom-nav" aria-label="Hauptnavigation"></nav>
      <button type="button" class="app-scroll-top-btn" data-testid="app-scroll-top-btn" hidden>Nach oben</button>
      <div id="civic-app-modal-root" class="civic-app-modal-root" aria-hidden="true"></div>
      <div id="clara-portal-root"></div>
    </div>
  `;
}

export function getCivicAppModalRootEl(): HTMLElement {
  const el = document.getElementById('civic-app-modal-root');
  if (!el) throw new Error('civic-app-modal-root missing — call mountCivicAppTestDocument()');
  return el;
}
