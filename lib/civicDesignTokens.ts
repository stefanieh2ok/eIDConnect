/**
 * Civic design token names — values live in app/globals.css (:root).
 * Use for documentation, tests, and typed references in TS.
 */
export const civicDesignTokens = {
  color: {
    civicNavy: '--color-civic-navy',
    civicBlue: '--color-civic-blue',
    civicMint: '--color-civic-mint',
    surface: '--color-surface',
    surfaceMuted: '--color-surface-muted',
    textPrimary: '--color-text-primary',
    textSecondary: '--color-text-secondary',
    border: '--color-border',
    warning: '--color-warning',
    success: '--color-success',
    danger: '--color-danger',
    claraPurple: '--color-clara-purple',
  },
  radius: {
    card: '--radius-card',
    sheet: '--radius-sheet',
  },
  zIndex: {
    header: '--z-header',
    bottomNav: '--z-bottom-nav',
    claraPill: '--z-clara-pill',
    claraOverlay: '--z-clara-overlay',
    claraSheet: '--z-clara-sheet',
    modal: '--z-modal',
  },
  shell: {
    headerHeight: '--app-header-height',
    bottomNavHeight: '--app-bottom-nav-height',
    contentPadBottom: '--app-content-pad-bottom',
  },
} as const;
