/**
 * PVOG/XZuFi access feasibility — no live calls in MVP.
 *
 * PVOG/XZuFi access must be verified before production.
 * The MVP uses a mock adapter with the same normalized schema
 * so the UI can later switch to official data without redesign.
 */
import type { GovService } from '@/lib/govdata/serviceTypes';
import { MOCK_GOV_SERVICES } from '@/lib/govdata/mockGovServices';

export type PvogAccessStatus =
  | 'not_configured'
  | 'credentials_required'
  | 'feasibility_pending'
  | 'mock_fallback';

export type PvogClientResult = {
  status: PvogAccessStatus;
  services: GovService[];
  message: string;
};

/**
 * Stub client — returns mock data until official PVOG/XZuFi agreement exists.
 * TODO: Replace with authenticated feed when PVOG_API_KEY and endpoint are verified.
 */
export async function fetchPvogServices(_query?: string): Promise<PvogClientResult> {
  return {
    status: 'mock_fallback',
    services: MOCK_GOV_SERVICES,
    message:
      'Live PVOG/XZuFi nicht angebunden. Demo-Daten (ManualDemo) mit normalisiertem Schema.',
  };
}

export function pvogLiveAccessAvailable(): boolean {
  return false;
}
