/**
 * PVOG/XZuFi client — feature-flagged official data access.
 *
 * Modes (via NEXT_PUBLIC_GOVDATA_SOURCE_MODE / GOVDATA_SOURCE_MODE):
 * - demo: ManualDemo only (handled in govDataResolver)
 * - pvog_search: PVOG Suchdienst API
 * - pvog_bereitstelldienst: OAuth2 client credentials
 */
import { MOCK_GOV_SERVICES } from '@/lib/govdata/mockGovServices';
import { normalizePvogRecord, type RawPvogRecord } from '@/lib/govdata/serviceNormalizer';
import type { GovService } from '@/lib/govdata/serviceTypes';

export type PvogAccessStatus =
  | 'not_configured'
  | 'credentials_required'
  | 'unavailable'
  | 'live'
  | 'mock_fallback';

export type PvogClientResult = {
  status: PvogAccessStatus;
  services: GovService[];
  message: string;
};

let pvogLiveVerifiedFlag = false;

export function markPvogLiveVerified(value: boolean): void {
  pvogLiveVerifiedFlag = value;
}

export function resetPvogLiveVerified(): void {
  pvogLiveVerifiedFlag = false;
}

/** True only after a successful live PVOG response in the current resolution cycle. */
export function pvogLiveAccessAvailable(): boolean {
  return pvogLiveVerifiedFlag;
}

export function getPvogSearchBaseUrl(): string {
  return (
    process.env.PVOG_SEARCH_BASE_URL?.replace(/\/$/, '') ||
    'https://pvog.fitko.net/suchdienst/api'
  );
}

export function getPvogBereitstelldienstBaseUrl(): string {
  return process.env.PVOG_BEREITSTELLDIENST_BASE_URL?.replace(/\/$/, '') || 'https://pvog.fitko.net';
}

function searchBaseUrl(): string {
  return getPvogSearchBaseUrl();
}

function bereitstellBaseUrl(): string {
  return getPvogBereitstelldienstBaseUrl();
}

function parsePvogPayload(payload: unknown): GovService[] {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as Record<string, unknown>;
  const items = (Array.isArray(root.results)
    ? root.results
    : Array.isArray(root.items)
      ? root.items
      : Array.isArray(root.leistungen)
        ? root.leistungen
        : Array.isArray(root)
          ? root
          : []) as RawPvogRecord[];

  return items
    .slice(0, 12)
    .map((raw) => normalizePvogRecord(raw, 'PVOG'))
    .filter((s) => s.title && s.title !== 'Verwaltungsleistung');
}

async function fetchOAuthToken(): Promise<string | null> {
  const clientId = process.env.PVOG_CLIENT_ID?.trim();
  const clientSecret = process.env.PVOG_CLIENT_SECRET?.trim();
  const tokenUrl = process.env.PVOG_TOKEN_URL?.trim();
  if (!clientId || !clientSecret || !tokenUrl) return null;

  try {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    });
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

export async function fetchPvogSearchServices(query: string): Promise<PvogClientResult> {
  const q = query.trim();
  if (!q) {
    return { status: 'unavailable', services: [], message: 'Leere Suchanfrage.' };
  }

  try {
    const url = `${searchBaseUrl()}/search?query=${encodeURIComponent(q)}&limit=12`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return {
        status: 'unavailable',
        services: [],
        message: `PVOG Suchdienst HTTP ${res.status}.`,
      };
    }
    const payload = await res.json();
    const services = parsePvogPayload(payload);
    if (services.length === 0) {
      return {
        status: 'unavailable',
        services: [],
        message: 'PVOG Suchdienst lieferte keine Treffer.',
      };
    }
    return {
      status: 'live',
      services,
      message: 'Live PVOG Suchdienst.',
    };
  } catch (error) {
    return {
      status: 'unavailable',
      services: [],
      message: error instanceof Error ? error.message : 'PVOG Suchdienst nicht erreichbar.',
    };
  }
}

export async function fetchPvogBereitstelldienstServices(query: string): Promise<PvogClientResult> {
  const token = await fetchOAuthToken();
  if (!token) {
    return {
      status: 'credentials_required',
      services: [],
      message: 'PVOG OAuth-Token konnte nicht abgerufen werden.',
    };
  }

  try {
    const url = `${bereitstellBaseUrl()}/api/leistungen?search=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return {
        status: 'unavailable',
        services: [],
        message: `PVOG Bereitstelldienst HTTP ${res.status}.`,
      };
    }
    const payload = await res.json();
    const services = parsePvogPayload(payload);
    if (services.length === 0) {
      return {
        status: 'unavailable',
        services: [],
        message: 'PVOG Bereitstelldienst lieferte keine Treffer.',
      };
    }
    return {
      status: 'live',
      services,
      message: 'Live PVOG Bereitstelldienst.',
    };
  } catch (error) {
    return {
      status: 'unavailable',
      services: [],
      message: error instanceof Error ? error.message : 'PVOG Bereitstelldienst nicht erreichbar.',
    };
  }
}

/** Legacy stub — tests and older imports. */
export async function fetchPvogServices(_query?: string): Promise<PvogClientResult> {
  return {
    status: 'mock_fallback',
    services: MOCK_GOV_SERVICES,
    message:
      'Live PVOG/XZuFi nicht angebunden. Demo-Daten (ManualDemo) mit normalisiertem Schema.',
  };
}
