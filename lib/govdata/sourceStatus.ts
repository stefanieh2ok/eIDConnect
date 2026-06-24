/**
 * Gov-data source mode and user-facing source notices (single banner model).
 */
import type { GovService } from '@/lib/govdata/serviceTypes';

export type GovDataSourceMode =
  | 'demo'
  | 'verified_catalog'
  | 'pvog_search'
  | 'pvog_bereitstelldienst';

export type GovDataResolutionStatus =
  | 'demo'
  | 'verified_catalog'
  | 'verified_catalog_no_match'
  | 'live'
  | 'credentials_required'
  | 'unavailable'
  | 'error';

export type GovDataResolution = {
  mode: GovDataSourceMode;
  status: GovDataResolutionStatus;
  services: GovService[];
  isDemoData: boolean;
  /** One calm notice at plan top — null when live PVOG data is active. */
  sourceNotice: string | null;
  message?: string;
  fallbackUsed?: boolean;
};

export const SOURCE_NOTICE_DEMO =
  'Offizielle Datenquelle noch nicht verbunden. Dieser Behördenfahrplan basiert aktuell auf vorbereiteter Demonstrationslogik.';

export const SOURCE_NOTICE_VERIFIED_CATALOG =
  'Clara nutzt für diese Demo einen kuratierten offiziellen Quellenkatalog. Die direkte PVOG/XZuFi-Live-Anbindung ist vorbereitet, erfordert aber entsprechende Zugangsberechtigungen.';

export const SOURCE_NOTICE_TEMPLATE_ONLY =
  'Für diesen Fall ist noch keine kuratierte Online-Quelle hinterlegt. Der Fahrplan folgt dem passenden Wegweiser-Template.';

export const SOURCE_NOTICE_VERIFIED_CATALOG_NO_MATCH =
  'Für diesen Fall ist noch keine kuratierte Quelle hinterlegt. Clara kann weiterhin einen vorbereitenden Behördenfahrplan erstellen. Die direkte PVOG/XZuFi-Live-Anbindung ist vorbereitet, erfordert aber entsprechende Zugangsberechtigungen.';

export const SOURCE_NOTICE_PVOG_SEARCH_UNAVAILABLE =
  'PVOG-Suchdienst derzeit nicht erreichbar. Dieser Behördenfahrplan basiert vorübergehend auf vorbereiteter Demonstrationslogik.';

export const SOURCE_NOTICE_PVOG_CREDENTIALS_MISSING =
  'PVOG Bereitstelldienst: Zugangsdaten fehlen. Dieser Behördenfahrplan basiert aktuell auf vorbereiteter Demonstrationslogik.';

export const SOURCE_NOTICE_PVOG_BEREITSTELL_UNAVAILABLE =
  'PVOG Bereitstelldienst derzeit nicht erreichbar. Dieser Behördenfahrplan basiert vorübergehend auf vorbereiteter Demonstrationslogik.';

export const DEMO_SERVICE_SOURCE_LABEL = 'Vorbereitete Demo-Logik';

export function readGovDataSourceMode(): GovDataSourceMode {
  const raw =
    (typeof process !== 'undefined' &&
      (process.env.NEXT_PUBLIC_GOVDATA_SOURCE_MODE || process.env.GOVDATA_SOURCE_MODE)) ||
    'demo';
  if (raw === 'verified_catalog') return 'verified_catalog';
  if (raw === 'pvog_search' || raw === 'pvog_bereitstelldienst') return raw;
  return 'demo';
}

export function hasPvogClientCredentials(): boolean {
  return Boolean(
    process.env.PVOG_CLIENT_ID?.trim() &&
      process.env.PVOG_CLIENT_SECRET?.trim() &&
      process.env.PVOG_TOKEN_URL?.trim(),
  );
}
