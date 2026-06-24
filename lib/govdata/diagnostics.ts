/**
 * Dev-only gov-data source diagnostics — safe metadata, no secrets.
 */
import { resolveExternalLinkStatus } from '@/lib/govdata/externalLinkGate';
import { resolveGovDataForCase } from '@/lib/govdata/govDataResolver';
import {
  getPvogBereitstelldienstBaseUrl,
  getPvogSearchBaseUrl,
} from '@/lib/govdata/pvogClient';
import type { GovService } from '@/lib/govdata/serviceTypes';
import {
  hasPvogClientCredentials,
  readGovDataSourceMode,
  type GovDataResolutionStatus,
  type GovDataSourceMode,
} from '@/lib/govdata/sourceStatus';

export type GovDataProbeStatus =
  | 'ok'
  | 'unauthorized'
  | 'credentials_required'
  | 'unavailable'
  | 'error';

export type GovDataLastProbe = {
  status: GovDataProbeStatus;
  httpStatus: number | null;
  serviceCount: number;
  verifiedOfficialCount: number;
  verifiedManualCount: number;
  verifiedPvogCount: number;
  fallbackUsed: boolean;
  sourceStatus: GovDataResolutionStatus;
  sourceNotice: string | null;
  sampleTitles: string[];
  sampleOfficialUrls: string[];
};

export type GovDataDiagnostics = {
  sourceMode: GovDataSourceMode;
  pvogSearchBaseUrl: string;
  bereitstelldienstBaseUrl: string;
  hasPvogClientId: boolean;
  hasPvogClientSecret: boolean;
  hasPvogTokenUrl: boolean;
  lastProbe: GovDataLastProbe;
};

const PROBE_QUERY =
  'Ich bekomme ein Kind und brauche Elterngeld, Kindergeld, Kita und Krankenversicherung.';

export function isGovDataDiagnosticsEnabled(): boolean {
  return (
    process.env.NODE_ENV !== 'production' || process.env.GOVDATA_DIAGNOSTICS_ENABLED === 'true'
  );
}

function countLinkStatuses(services: GovService[]) {
  let verifiedOfficialCount = 0;
  let verifiedManualCount = 0;
  let verifiedPvogCount = 0;

  for (const service of services) {
    const status = resolveExternalLinkStatus(service);
    if (status === 'verified_official') {
      verifiedOfficialCount += 1;
      if (service.sourceSystem === 'PVOG') verifiedPvogCount += 1;
    }
    if (status === 'verified_official_manual') {
      verifiedManualCount += 1;
    }
  }

  return { verifiedOfficialCount, verifiedManualCount, verifiedPvogCount };
}

function sampleFromServices(
  services: Awaited<ReturnType<typeof resolveGovDataForCase>>['services'],
): Pick<GovDataLastProbe, 'sampleTitles' | 'sampleOfficialUrls'> {
  return {
    sampleTitles: services.slice(0, 5).map((service) => service.title),
    sampleOfficialUrls: services
      .slice(0, 5)
      .map((service) => service.officialSourceUrl || service.onlineServiceUrl || service.formUrl)
      .filter((url): url is string => Boolean(url)),
  };
}

async function probePvogSearchHttp(): Promise<{ httpStatus: number | null; status: GovDataProbeStatus }> {
  try {
    const url = `${getPvogSearchBaseUrl()}/search?query=${encodeURIComponent(PROBE_QUERY)}&limit=3`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (res.status === 401 || res.status === 403) {
      return { httpStatus: res.status, status: 'unauthorized' };
    }
    if (!res.ok) {
      return { httpStatus: res.status, status: 'unavailable' };
    }
    return { httpStatus: res.status, status: 'ok' };
  } catch {
    return { httpStatus: null, status: 'error' };
  }
}

function mapResolutionProbeStatus(
  mode: GovDataSourceMode,
  resolution: Awaited<ReturnType<typeof resolveGovDataForCase>>,
  httpStatus: number | null,
  httpProbeStatus: GovDataProbeStatus | null,
): GovDataProbeStatus {
  if (mode === 'demo') {
    return resolution.status === 'demo' ? 'ok' : 'error';
  }

  if (mode === 'verified_catalog') {
    return resolution.status === 'verified_catalog' || resolution.status === 'verified_catalog_no_match'
      ? 'ok'
      : 'error';
  }

  if (resolution.status === 'credentials_required') {
    return 'credentials_required';
  }

  if (resolution.status === 'live' && !resolution.isDemoData) {
    return 'ok';
  }

  if (httpProbeStatus === 'unauthorized') {
    return 'unauthorized';
  }

  if (httpProbeStatus === 'error') {
    return 'error';
  }

  return 'unavailable';
}

export async function buildGovDataDiagnostics(): Promise<GovDataDiagnostics> {
  const sourceMode = readGovDataSourceMode();
  const resolution = await resolveGovDataForCase({
    text: PROBE_QUERY,
    mode: 'private',
  });

  let httpStatus: number | null = null;
  let httpProbeStatus: GovDataProbeStatus | null = null;

  if (sourceMode === 'pvog_search') {
    const httpProbe = await probePvogSearchHttp();
    httpStatus = httpProbe.httpStatus;
    httpProbeStatus = httpProbe.status;
  } else if (sourceMode === 'pvog_bereitstelldienst' && hasPvogClientCredentials()) {
    httpStatus = null;
    httpProbeStatus = resolution.status === 'live' ? 'ok' : 'unavailable';
  }

  const samples = sampleFromServices(resolution.services);
  const counts = countLinkStatuses(resolution.services);

  return {
    sourceMode,
    pvogSearchBaseUrl: getPvogSearchBaseUrl(),
    bereitstelldienstBaseUrl: getPvogBereitstelldienstBaseUrl(),
    hasPvogClientId: Boolean(process.env.PVOG_CLIENT_ID?.trim()),
    hasPvogClientSecret: Boolean(process.env.PVOG_CLIENT_SECRET?.trim()),
    hasPvogTokenUrl: Boolean(process.env.PVOG_TOKEN_URL?.trim()),
    lastProbe: {
      status: mapResolutionProbeStatus(sourceMode, resolution, httpStatus, httpProbeStatus),
      httpStatus,
      serviceCount: resolution.services.length,
      sourceStatus: resolution.status,
      sourceNotice: resolution.sourceNotice,
      fallbackUsed: Boolean(resolution.fallbackUsed),
      ...counts,
      ...samples,
    },
  };
}
