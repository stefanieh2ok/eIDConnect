/**
 * Official external link safety layer — verified vs demo/mock links.
 */
import type { GovService, GovServiceSourceSystem } from '@/lib/govdata/serviceTypes';
import { pvogLiveAccessAvailable } from '@/lib/govdata/pvogClient';

export type ExternalLinkStatus = 'verified_official' | 'demo_unverified' | 'missing' | 'unknown';

export const DEMO_LINK_LABEL = 'Demo-Link — noch nicht live verifiziert';
export const VERIFIED_OFFICIAL_LABEL = 'Offizielle Quelle';
export const EXTERNAL_HANDOVER_NOTICE = 'Antrag erfolgt extern — HookAI Civic reicht nichts ein.';
export const EXTERNAL_HANDOVER_MICROCOPY = 'Externer offizieller Weg — Clara bereitet nur vor.';

export function resolveExternalLinkStatus(
  service: Pick<GovService, 'sourceSystem' | 'officialSourceUrl' | 'onlineServiceUrl' | 'formUrl'>,
): ExternalLinkStatus {
  const hasUrl = Boolean(service.officialSourceUrl || service.onlineServiceUrl || service.formUrl);
  if (!hasUrl) return 'missing';

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

export function externalLinkBadgeLabel(status: ExternalLinkStatus): string {
  switch (status) {
    case 'verified_official':
      return VERIFIED_OFFICIAL_LABEL;
    case 'demo_unverified':
      return DEMO_LINK_LABEL;
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
      if (kind === 'online' || kind === 'handover') return 'Antrag extern starten';
      return 'Offizielle Informationen ansehen';
    case 'demo_unverified':
      return 'Demo-Link öffnen (nicht live verifiziert)';
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
    return DEMO_LINK_LABEL;
  }
  if (status !== 'verified_official') {
    return kind === 'authority' ? 'Antrag über zuständige Stelle' : externalLinkBadgeLabel(status);
  }
  switch (kind) {
    case 'source':
      return VERIFIED_OFFICIAL_LABEL;
    case 'online':
      return 'Antrag über zuständige Stelle';
    case 'form':
      return 'Externes offizielles System';
    case 'authority':
    default:
      return 'Antrag über zuständige Stelle';
  }
}

export function sourceSystemLinkStatus(source: GovServiceSourceSystem): ExternalLinkStatus {
  if (source === 'ManualDemo' || source === 'Unknown') return 'demo_unverified';
  if (source === 'PVOG' && !pvogLiveAccessAvailable()) return 'demo_unverified';
  if (source === 'PVOG' || source === 'Bundesportal') return 'verified_official';
  return 'unknown';
}
