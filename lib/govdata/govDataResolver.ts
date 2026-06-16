/**
 * Resolves GovService list for a case based on configured source mode.
 * Server-side safe — used by API route and tests.
 */
import { planCivicCaseServicesFromPool, type MatchInput } from '@/lib/govdata/serviceMatcher';
import {
  hasPvogClientCredentials,
  readGovDataSourceMode,
  SOURCE_NOTICE_DEMO,
  SOURCE_NOTICE_PVOG_BEREITSTELL_UNAVAILABLE,
  SOURCE_NOTICE_PVOG_CREDENTIALS_MISSING,
  SOURCE_NOTICE_PVOG_SEARCH_UNAVAILABLE,
  type GovDataResolution,
} from '@/lib/govdata/sourceStatus';
import {
  fetchPvogBereitstelldienstServices,
  fetchPvogSearchServices,
  markPvogLiveVerified,
  resetPvogLiveVerified,
} from '@/lib/govdata/pvogClient';

function demoResolution(input: MatchInput, notice: string | null = SOURCE_NOTICE_DEMO): GovDataResolution {
  return {
    mode: 'demo',
    status: 'demo',
    services: planCivicCaseServicesFromPool(input),
    isDemoData: true,
    sourceNotice: notice,
  };
}

function filterResolvedServices(services: ReturnType<typeof planCivicCaseServicesFromPool>, input: MatchInput) {
  if (services.length === 0) {
    return planCivicCaseServicesFromPool(input);
  }
  return services;
}

export async function resolveGovDataForCase(input: MatchInput): Promise<GovDataResolution> {
  const mode = readGovDataSourceMode();

  if (mode === 'demo') {
    return demoResolution(input);
  }

  if (mode === 'pvog_search') {
    resetPvogLiveVerified();
    const pvog = await fetchPvogSearchServices(input.text);
    if (pvog.status === 'live' && pvog.services.length > 0) {
      markPvogLiveVerified(true);
      return {
        mode: 'pvog_search',
        status: 'live',
        services: filterResolvedServices(pvog.services, input),
        isDemoData: false,
        sourceNotice: null,
        message: pvog.message,
      };
    }
    markPvogLiveVerified(false);
    return {
      mode: 'pvog_search',
      status: pvog.status === 'credentials_required' ? 'credentials_required' : 'unavailable',
      services: planCivicCaseServicesFromPool(input),
      isDemoData: true,
      sourceNotice: SOURCE_NOTICE_PVOG_SEARCH_UNAVAILABLE,
      message: pvog.message,
    };
  }

  // pvog_bereitstelldienst
  resetPvogLiveVerified();
  if (!hasPvogClientCredentials()) {
    return {
      mode: 'pvog_bereitstelldienst',
      status: 'credentials_required',
      services: planCivicCaseServicesFromPool(input),
      isDemoData: true,
      sourceNotice: SOURCE_NOTICE_PVOG_CREDENTIALS_MISSING,
      message: 'PVOG_CLIENT_ID / PVOG_CLIENT_SECRET / PVOG_TOKEN_URL fehlen.',
    };
  }

  const pvog = await fetchPvogBereitstelldienstServices(input.text);
  if (pvog.status === 'live' && pvog.services.length > 0) {
    markPvogLiveVerified(true);
    return {
      mode: 'pvog_bereitstelldienst',
      status: 'live',
      services: filterResolvedServices(pvog.services, input),
      isDemoData: false,
      sourceNotice: null,
      message: pvog.message,
    };
  }

  markPvogLiveVerified(false);
  return {
    mode: 'pvog_bereitstelldienst',
    status: 'unavailable',
    services: planCivicCaseServicesFromPool(input),
    isDemoData: true,
    sourceNotice: SOURCE_NOTICE_PVOG_BEREITSTELL_UNAVAILABLE,
    message: pvog.message,
  };
}
