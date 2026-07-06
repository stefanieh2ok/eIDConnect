/**
 * Intro v3 — real app film stills (Playwright crops).
 * Assets live under public/intro/trailer/ (token-free, no secrets).
 */
import { regionalPraemienForCity } from '@/data/demoVoting2026';

export const INTRO_TRAILER_ASSETS = {
  calmAppEntry: '/intro/trailer/citizen-access-context.webp',
  meldenDrachenspielplatz: '/intro/trailer/melden-drachenspielplatz-input.webp',
  postfachDrachenspielplatz: '/intro/trailer/postfach-status-drachenspielplatz.webp',
  beteiligenKirkel: '/intro/trailer/beteiligen-kirkel-action.webp',
  praemienOverview: '/intro/trailer/praemien-naturfreibad-wallet.webp',
  praemienDetailQr: '/intro/trailer/praemien-naturfreibad-wallet.webp',
  wegweiserKuendigungFahrplan: '/intro/trailer/wegweiser-kuendigung-fahrplan.webp',
  identityTrust: '/intro/trailer/final-app-overview-trust.webp',
  finaleApp: '/intro/trailer/final-app-overview-trust.webp',
} as const;

export type IntroTrailerAssetKey = keyof typeof INTRO_TRAILER_ASSETS;

/** Demo photo for Melden scene (Drachenspielplatz / Ratten). */
export const INTRO_MELDEN_DEMO_PHOTO = '/demo-rat-playground.jpg';

/** Kirkel Prämien — same source as LeaderboardSection / App. */
export const INTRO_KIRKEL_PRAEMIEN = regionalPraemienForCity('Kirkel');

/** Showcase selection in intro scene 6–7 (Naturfreibad). */
export const INTRO_SHOWCASE_PRAEMIE_ID = 'rk1';

export function introShowcasePraemie() {
  return (
    INTRO_KIRKEL_PRAEMIEN.find((b) => b.id === INTRO_SHOWCASE_PRAEMIE_ID) ??
    INTRO_KIRKEL_PRAEMIEN[0]
  );
}
