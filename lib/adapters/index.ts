/**
 * Externe GovTech-Adapter-Registry — Mock/Interface-Layer, keine Live-Integration.
 * Abgleich: docs/CONNECTOR-READINESS-MATRIX.md, lib/civicModuleStatus.ts
 */
import { BUNDID_EID_ADAPTER } from '@/lib/adapters/identity';
import { EUDI_WALLET_ADAPTER } from '@/lib/adapters/eudiWallet';
import { FIM_LEIKA_ADAPTER } from '@/lib/adapters/fimLeika';
import { FIT_CONNECT_ADAPTER } from '@/lib/adapters/fitConnect';
import { OPARL_ADAPTER } from '@/lib/adapters/oparl';
import { PVOG_ADAPTER } from '@/lib/adapters/pvog';
import { REWARD_WALLET_PASS_ADAPTER } from '@/lib/adapters/rewardWalletPass';
import type { CivicExternalAdapterDefinition } from '@/lib/adapters/types';

export type { CivicExternalAdapterDefinition } from '@/lib/adapters/types';

export const CIVIC_EXTERNAL_ADAPTERS: CivicExternalAdapterDefinition[] = [
  PVOG_ADAPTER,
  FIM_LEIKA_ADAPTER,
  FIT_CONNECT_ADAPTER,
  OPARL_ADAPTER,
  BUNDID_EID_ADAPTER,
  EUDI_WALLET_ADAPTER,
  REWARD_WALLET_PASS_ADAPTER,
];

export function getExternalAdapter(id: string): CivicExternalAdapterDefinition | undefined {
  return CIVIC_EXTERNAL_ADAPTERS.find((a) => a.id === id);
}

export {
  PVOG_ADAPTER,
  FIM_LEIKA_ADAPTER,
  FIT_CONNECT_ADAPTER,
  OPARL_ADAPTER,
  BUNDID_EID_ADAPTER,
  EUDI_WALLET_ADAPTER,
  REWARD_WALLET_PASS_ADAPTER,
};
