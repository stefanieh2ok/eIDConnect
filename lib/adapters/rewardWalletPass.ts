import type { CivicExternalAdapterDefinition } from '@/lib/adapters/types';

/** Reward Wallet Pass — QR-/Wallet-Mock für Prämien. */
export const REWARD_WALLET_PASS_ADAPTER: CivicExternalAdapterDefinition = {
  id: 'reward_wallet_pass',
  name: 'Reward Wallet Pass',
  purpose: 'QR- und Wallet-Mock für lokale Prämien (z. B. Naturfreibad Kirkel) — freiwillige Anerkennung.',
  currentStatus: 'mock_ready',
  demoBoundary:
    'Mock-Voucher-Codes und Demo-QR in LeaderboardSection — keine echte Wallet-Integration, keine Zahlungsabwicklung.',
  futureIntegrationNotes:
    'Wallet-Pass-Provider und Mandanten-Branding vor Käufergespräch offiziell verifizieren; Prämien bleiben unabhängig von Stimme/Partei.',
  noLiveCalls: true,
};
