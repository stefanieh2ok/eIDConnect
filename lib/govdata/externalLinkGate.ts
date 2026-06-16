/**
 * Official external link safety layer — verified vs demo/mock links.
 */
import type { GovService, GovServiceSourceSystem } from '@/lib/govdata/serviceTypes';
import { pvogLiveAccessAvailable } from '@/lib/govdata/pvogClient';
import { DEMO_SERVICE_SOURCE_LABEL } from '@/lib/govdata/sourceStatus';
import { VERIFIED_CATALOG_SOURCE_LABEL } from '@/lib/govdata/verifiedOfficialSources';

export type ExternalLinkStatus =
  | 'verified_official'
  | 'verified_official_manual'
  | 'demo_unverified'
  | 'missing'
  | 'unknown';

export const DEMO_LINK_LABEL = 'Demo-Link — noch nicht live verifiziert';
export const VERIFIED_OFFICIAL_LABEL = 'Offizielle Quelle';
export const VERIFIED_OFFICIAL_MANUAL_LABEL = VERIFIED_CATALOG_SOURCE_LABEL;
export const DEMO_SOURCE_PENDING_LABEL = 'Offizieller Link folgt';
export const EXTERNAL_HANDOVER_NOTICE = 'Antrag erfolgt extern — HookAI Civic reicht nichts ein.';
export const EXTERNAL_HANDOVER_MICROCOPY = 'Externer offizieller Weg — Clara bereitet nur vor.';

function isVerifiedCatalogService(
  service: Pick<
    GovService,
    'sourceSystem' | 'officialSourceUrl' | 'onlineServiceUrl' | 'formUrl' | 'sourceVerifiedAt' | 'sourceLabel'
  >,
): boolean {
  return (
    service.sourceSystem === 'VerifiedCatalog' &&
    Boolean(service.sourceVerifiedAt && service.sourceLabel && service.officialSourceUrl)
  );
}

export function officialLinkDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function resolveExternalLinkStatus(
  service: Pick<
    GovService,
    | 'sourceSystem'
    | 'officialSourceUrl'
    | 'onlineServiceUrl'
    | 'formUrl'
    | 'sourceVerifiedAt'
    | 'sourceLabel'
  >,
): ExternalLinkStatus {
  const hasUrl = Boolean(service.officialSourceUrl || service.onlineServiceUrl || service.formUrl);
  if (!hasUrl) return 'missing';

  if (isVerifiedCatalogService(service)) {
    return 'verified_official_manual';
  }

  if (service.sourceSystem === 'ManualDemo' || service.sourceSystem === 'Unknown') {
    return 'demo_unverified';
  }

  if (service.sourceSystem === 'PVOG' && !pvogLiveAccessAvailable()) {
    return 'demo_unverified';
  }

  if (service.sourceSystem === 'PVOG' || service.sourceSystem === 'Bundesportal') {
    return 'verified_official';
  }

  return 'unknown';
}

export function resolvePvogFallbackLinkStatus(): ExternalLinkStatus {
  return 'demo_unverified';
}

export function isVerifiedOfficialLink(status: ExternalLinkStatus): boolean {
  return status === 'verified_official';
}

export function isVerifiedManualOfficialLink(status: ExternalLinkStatus): boolean {
  return status === 'verified_official_manual';
}

export function isRenderableOfficialLink(status: ExternalLinkStatus): boolean {
  return status === 'verified_official' || status === 'verified_official_manual';
}

export function shouldRenderExternalLink(status: ExternalLinkStatus): boolean {
  return isRenderableOfficialLink(status);
}

export function externalLinkBadgeLabel(status: ExternalLinkStatus): string {
  switch (status) {
    case 'verified_official':
      return VERIFIED_OFFICIAL_LABEL;
    case 'verified_official_manual':
      return VERIFIED_OFFICIAL_MANUAL_LABEL;
    case 'demo_unverified':
      return DEMO_SERVICE_SOURCE_LABEL;
    case 'missing':
      return 'Kein verifizierter Link';
    default:
      return 'Quelle unbekannt';
  }
}

export function externalLinkButtonLabel(
  status: ExternalLinkStatus,
  _du = true,
  kind: 'source' | 'online' | 'handover' = 'source',
): string {
  switch (status) {
    case 'verified_official':
    case 'verified_official_manual':
      if (kind === 'online' || kind === 'handover') return 'Antrag extern starten';
      return 'Offizielle Informationen öffnen';
    case 'demo_unverified':
      return DEMO_SOURCE_PENDING_LABEL;
    case 'missing':
      return 'Offizielle Stelle öffnen';
    default:
      return 'Extern prüfen';
  }
}

export function handoverLinkLabel(
  status: ExternalLinkStatus,
  kind: 'source' | 'online' | 'form' | 'authority',
): string {
  if (status === 'demo_unverified') {
    return DEMO_SERVICE_SOURCE_LABEL;
  }
  if (!isRenderableOfficialLink(status)) {
    return kind === 'authority' ? 'Antrag über zuständige Stelle' : externalLinkBadgeLabel(status);
  }
  switch (kind) {
    case 'source':
      return status === 'verified_official_manual' ? VERIFIED_OFFICIAL_MANUAL_LABEL : VERIFIED_OFFICIAL_LABEL;
    case 'online':
      return 'Antrag extern starten';
    case 'form':
      return 'Externes offizielles System';
    case 'authority':
    default:
      return 'Antrag über zuständige Stelle';
  }
}

export function sourceSystemLinkStatus(source: GovServiceSourceSystem): ExternalLinkStatus {
  if (source === 'VerifiedCatalog') return 'verified_official_manual';
  if (source === 'ManualDemo' || source === 'Unknown') return 'demo_unverified';
  if (source === 'PVOG' && !pvogLiveAccessAvailable()) return 'demo_unverified';
  if (source === 'PVOG' || source === 'Bundesportal') return 'verified_official';
  return 'unknown';
}
