/**
 * Official source labels for service cards and handover links.
 */
import { CLARA_CONFIDENCE_LABELS } from '@/lib/claraCaseGuidance';
import type { GovService, GovServiceSourceSystem, OfficialHandoverLink } from '@/lib/govdata/serviceTypes';

export function sourceSystemLabel(source: GovServiceSourceSystem): string {
  switch (source) {
    case 'PVOG':
      return 'PVOG / Portalverbund';
    case 'Bundesportal':
      return 'Bundesportal';
    case 'ManualDemo':
      return 'Demo-Daten (ManualDemo)';
    case 'Unknown':
    default:
      return 'Quelle unbekannt';
  }
}

export function isDemoSource(source: GovServiceSourceSystem): boolean {
  return source === 'ManualDemo' || source === 'Unknown';
}

export function confidenceLabel(confidence: GovService['confidence']): string {
  switch (confidence) {
    case 'high':
      return CLARA_CONFIDENCE_LABELS.high;
    case 'medium':
      return CLARA_CONFIDENCE_LABELS.medium;
    case 'low':
    default:
      return CLARA_CONFIDENCE_LABELS.low;
  }
}

export function formatOfficialHandover(service: GovService): OfficialHandoverLink[] {
  const links: OfficialHandoverLink[] = [];
  if (service.officialSourceUrl) {
    links.push({
      id: `${service.serviceId}-source`,
      title: service.title,
      url: service.officialSourceUrl,
      label: 'Offizielle Quelle',
      authority: service.responsibleAuthority,
    });
  }
  if (service.onlineServiceUrl) {
    links.push({
      id: `${service.serviceId}-online`,
      title: 'Online-Dienst',
      url: service.onlineServiceUrl,
      label: 'Antrag über zuständige Stelle',
      authority: service.responsibleAuthority,
    });
  }
  if (service.formUrl) {
    links.push({
      id: `${service.serviceId}-form`,
      title: 'Offizielles Formular',
      url: service.formUrl,
      label: 'Externes offizielles System',
      authority: service.responsibleAuthority,
    });
  }
  if (links.length === 0 && service.responsibleAuthority) {
    links.push({
      id: `${service.serviceId}-authority`,
      title: service.responsibleAuthority,
      label: 'Antrag über zuständige Stelle',
      authority: service.responsibleAuthority,
    });
  }
  return links;
}

export const EXTERNAL_LINK_NOTICE = 'Antrag erfolgt extern — HookAI Civic reicht nichts ein.';
