/**
 * Intro v2 Phase 3 — real app film stills (Playwright crops).
 * Assets live under public/intro/trailer/ (token-free, no secrets).
 */
export const INTRO_TRAILER_ASSETS = {
  citizenAccess: '/intro/trailer/citizen-access-context.webp',
  meldenDrachenspielplatz: '/intro/trailer/melden-drachenspielplatz-input.webp',
  postfachDrachenspielplatz: '/intro/trailer/postfach-status-drachenspielplatz.webp',
  beteiligenKirkel: '/intro/trailer/beteiligen-kirkel-action.webp',
  praemienNaturfreibadWallet: '/intro/trailer/praemien-naturfreibad-wallet.webp',
  wahlenBundestagswahl: '/intro/trailer/wahlen-bundestagswahl-stimmzettel.webp',
  wegweiserKuendigungFahrplan: '/intro/trailer/wegweiser-kuendigung-fahrplan.webp',
  finalAppOverviewTrust: '/intro/trailer/final-app-overview-trust.webp',
} as const;

export type IntroTrailerAssetKey = keyof typeof INTRO_TRAILER_ASSETS;

/** Montage tiles on cold-open screen 0 */
export const INTRO_TRAILER_MONTAGE_TILES = [
  { src: INTRO_TRAILER_ASSETS.citizenAccess, label: 'Bürgerzugang' },
  { src: INTRO_TRAILER_ASSETS.meldenDrachenspielplatz, label: 'Melden' },
  { src: INTRO_TRAILER_ASSETS.postfachDrachenspielplatz, label: 'Postfach' },
  { src: INTRO_TRAILER_ASSETS.beteiligenKirkel, label: 'Beteiligen' },
  { src: INTRO_TRAILER_ASSETS.wahlenBundestagswahl, label: 'Wahlen' },
  { src: INTRO_TRAILER_ASSETS.praemienNaturfreibadWallet, label: 'Wallet' },
] as const;
